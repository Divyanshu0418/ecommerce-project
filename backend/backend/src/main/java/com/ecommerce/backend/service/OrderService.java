package com.ecommerce.backend.service;

import com.ecommerce.backend.entity.*;
import com.ecommerce.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class OrderService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private EmailService emailService;

    public String placeOrder(String email){

        User user = userRepository.findByEmail(email);

        if(user == null) {
            return "User not found";
        }

        Cart cart = cartRepository.findByUserId(user.getId());

        if(cart == null) {
            return "Cart is empty";
        }

        List<CartItem> cartItems =
                cartItemRepository.findByCartId(cart.getId());

        if(cartItems.isEmpty()) {
            return "Cart is empty";
        }

        double totalAmount = 0;

        for(CartItem item : cartItems) {

            Product product =
                    productRepository.findById(item.getProductId()).orElse(null);

            if (product == null) {
                return "Product not found";
            }

            totalAmount += product.getPrice() * item.getQuantity();
        }

        Order order = new Order();
        order.setUserId(user.getId());
        order.setTotalAmount(totalAmount);
        order.setStatus("PLACED");
        order.setPaymentStatus("PENDING");
        order.setPaymentMethod("COD");
        order.setCreatedAt(LocalDateTime.now());

        order = orderRepository.save(order);

        for(CartItem item : cartItems) {

            Product product =
                    productRepository.findById(item.getProductId()).orElse(null);

            if (product == null) {
                return "Product not found";
            }

            OrderItem orderItem = new OrderItem();
            orderItem.setOrderId(order.getId());
            orderItem.setProductId(item.getProductId());
            orderItem.setQuantity(item.getQuantity());
            orderItem.setPrice(product.getPrice());

            orderItemRepository.save(orderItem);
        }

        cartItemRepository.deleteAll(cartItems);

        try{
            emailService.sendEmail(
                    user.getEmail(),
                    "Order Confirmation",
                    "Your order has been placed successfully."
            );
        }catch (Exception e) {
            System.out.println("Email failed: " + e.getMessage());
        }

        return "Order placed successfully";
    }

    public List<Order> getMyOrders(String email) {

        User user = userRepository.findByEmail(email);

        if (user == null) {
            return List.of();
        }

        return orderRepository.findByUserId(user.getId());
    }
}
