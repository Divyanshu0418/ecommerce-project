package com.ecommerce.backend.controller;

import com.ecommerce.backend.entity.User;
import com.ecommerce.backend.repository.UserRepository;
import com.ecommerce.backend.security.JwtUtil;
import com.ecommerce.backend.service.EmailService;
import com.ecommerce.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private EmailService emailService;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user){
        try {
            User registeredUser = userService.registerUser(user);
            return ResponseEntity.ok(registeredUser);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public String login(@RequestBody User user) {

        User loggedInUser = userService.loginUser(user.getEmail(), user.getPassword());

        if (loggedInUser != null) {
            return jwtUtil.generateToken(loggedInUser.getEmail());
        }

        return "Invalid email or password";
    }

    @PostMapping("/send-otp")
    public String sendOtp(@RequestParam String email){

        User user = userRepository.findByEmail(email);

        if(user == null){
            return "User not found";
        }

        String otp = String.valueOf((int)(Math.random() * 900000) + 100000);

        user.setOtp(otp);
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(5));

        userRepository.save(user);

        emailService.sendEmail(
                email,
                "OTP Verification",
                "Your OTP is: " + otp
        );

        return "OTP sent successfully";
    }

    @PostMapping("/verify-otp")
    public String verifyOtp(
            @RequestParam String email,
            @RequestParam String otp
    ){

        User user = userRepository.findByEmail(email);

        if(user == null){
            return "User not found";
        }

        if (user.getOtp() == null){
            return "OTP not generated";
        }

        if (user.getOtpExpiry().isBefore(LocalDateTime.now())){
            return "Invalid OTP";
        }

        user.setOtp(null);
        user.setOtpExpiry(null);

        userRepository.save(user);

        return "OTP verified successfully";
    }
}
