package com.ecommerce.backend.controller;

import com.ecommerce.backend.entity.CartItem;
import com.ecommerce.backend.service.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/cart")
public class CartController {

    @Autowired
    private CartService cartService;

    @PostMapping("/add/{productId}")
    public String addToCart(@PathVariable Long productId,
                            Authentication authentication){

        String email = authentication.getName();

        return cartService.addToCart(email, productId);
    }

    @DeleteMapping("/remove/{cartItemId}")
    public String removeFromCart(@PathVariable Long cartItemId){

        return cartService.removeFromCart(cartItemId);
    }

    @PutMapping("/update/{cartItemId}")
    public String updateQuantity(@PathVariable Long cartItemId,
                                 @RequestParam int quantity) {

        return cartService.updateQuantity(cartItemId, quantity);
    }

    @GetMapping
    public List<CartItem> getCart(Authentication authentication) {

        String email = authentication.getName();

        return cartService.getCartItems(email);
    }
}
