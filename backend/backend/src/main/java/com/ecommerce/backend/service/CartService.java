package com.ecommerce.backend.service;

import com.ecommerce.backend.entity.Cart;
import com.ecommerce.backend.entity.CartItem;
import com.ecommerce.backend.entity.Product;
import com.ecommerce.backend.entity.User;
import com.ecommerce.backend.repository.CartItemRepository;
import com.ecommerce.backend.repository.CartRepository;
import com.ecommerce.backend.repository.ProductRepository;
import com.ecommerce.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CartService {

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    public String addToCart(String email, Long productId){

        User user = userRepository.findByEmail(email);

        Product product = productRepository.findById(productId).orElse(null);

        if(user == null){
            return "User not found";
        }

        if(product == null){
            return "Product not found";
        }

        Cart cart = cartRepository.findByUserId(user.getId());

        if(cart == null){
            cart = new Cart();
            cart.setUserId(user.getId());
            cart = cartRepository.save(cart);
        }

        CartItem cartItem =
                cartItemRepository.findByCartIdAndProductId(cart.getId(), productId);

        if (cartItem == null){
            cartItem = new CartItem();
            cartItem.setCartId(cart.getId());
            cartItem.setProductId(productId);
            cartItem.setQuantity(1);
        }else{
            cartItem.setQuantity((cartItem.getQuantity() + 1));
        }

        cartItemRepository.save(cartItem);

        return "Product added to cart";
    }

    public String removeFromCart(Long cartItemId) {

        cartItemRepository.deleteById(cartItemId);

        return "Item remove from cart";
    }

    public String updateQuantity(Long cartItemId, int quantity){

        CartItem cartItem =
                cartItemRepository.findById(cartItemId).orElse(null);

        if(cartItem == null) {
            return "Cart item not found";
        }

        cartItem.setQuantity(quantity);

        cartItemRepository.save(cartItem);

        return "Quantity update";
    }

    public List<CartItem> getCartItems(String email) {

        User user = userRepository.findByEmail(email);

        if (user == null) {
            return List.of();
        }

        Cart cart = cartRepository.findByUserId(user.getId());

        if (cart == null) {
            return List.of();
        }

        return cartItemRepository.findByCartId(cart.getId());
    }
}
