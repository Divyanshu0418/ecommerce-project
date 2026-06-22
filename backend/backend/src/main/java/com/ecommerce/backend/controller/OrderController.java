package com.ecommerce.backend.controller;

import com.ecommerce.backend.entity.Order;
import com.ecommerce.backend.security.JwtUtil;
import com.ecommerce.backend.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/test")
    public String test() {
        return "Order API Working";
    }

    @PostMapping("/checkout")
    public String placeOrder(@RequestHeader("Authorization") String authHeader) {

        String token = authHeader.substring(7);

        String email = jwtUtil.extractEmail(token);

        return orderService.placeOrder(email);
    }

    @GetMapping("/my")
    public List<Order> getMyOrders(Authentication authentication) {

        String email = authentication.getName();

        return orderService.getMyOrders(email);
    }
}