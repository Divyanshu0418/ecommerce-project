package com.ecommerce.backend.controller;

import com.ecommerce.backend.entity.Order;
import com.ecommerce.backend.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/payment")
public class PaymentController {

    @Autowired
    private OrderRepository orderRepository;

    @PostMapping("/pay/{orderId}")
    public String makePayment(@PathVariable Long orderId) {

        Order order =
                orderRepository.findById(orderId).orElse(null);

        if(order == null) {
            return "Order not found";
        }

        order.setPaymentStatus("PAID");

        orderRepository.save(order);

        return "Payment Successful";
    }
}
