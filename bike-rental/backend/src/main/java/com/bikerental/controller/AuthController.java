package com.bikerental.controller;

import com.bikerental.entity.PendingUser;
import com.bikerental.entity.User;
import com.bikerental.repository.PendingUserRepository;
import com.bikerental.repository.UserRepository;
import com.bikerental.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired private UserRepository userRepo;
    @Autowired private PendingUserRepository pendingRepo;
    @Autowired private PasswordEncoder encoder;
    @Autowired private JwtUtil jwtUtil;

    // Simple request bodies
    public record RegisterRequest(String name, String email, String password, String role, String phone, String city) {}
    public record LoginRequest(String email, String password) {}
    public record ProfileUpdateRequest(String name, String phone, String city, String avatarUrl) {}

    // ---------- REGISTER ----------
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest req) {

        if (isBlank(req.name()) || isBlank(req.email()) || isBlank(req.password())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Name, email and password are required"));
        }
        if (userRepo.existsByEmail(req.email()) || pendingRepo.existsByEmail(req.email())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email is already registered"));
        }

        String hashedPassword = encoder.encode(req.password());

        if ("BIKE_OWNER".equals(req.role()) || "ROLE_BIKE_OWNER".equals(req.role())) {
            // Bike owner -> goes to the waiting list (pending_user table)
            PendingUser p = new PendingUser();
            p.setName(req.name());
            p.setEmail(req.email());
            p.setPassword(hashedPassword);
            p.setRole("ROLE_BIKE_OWNER");
            p.setPhone(req.phone());
            p.setCity(req.city() != null && !req.city().isBlank() ? req.city() : "Bangalore");
            pendingRepo.save(p);
            return ResponseEntity.ok(Map.of("message", "Owner account registered! Please wait for Super Admin verification."));
        }

        // Customer -> saved directly in users table, can log in immediately
        User u = new User();
        u.setName(req.name());
        u.setEmail(req.email());
        u.setPassword(hashedPassword);
        u.setRole("ROLE_USER");
        u.setStatus("GRANTED");
        u.setPhone(req.phone());
        u.setCity(req.city() != null && !req.city().isBlank() ? req.city() : "Bangalore");
        userRepo.save(u);
        return ResponseEntity.ok(Map.of("message", "Registration successful! You can now log in."));
    }

    // ---------- LOGIN ----------
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req) {

        Optional<User> found = userRepo.findByEmail(req.email());

        if (found.isEmpty()) {
            if (pendingRepo.existsByEmail(req.email())) {
                return ResponseEntity.status(403)
                        .body(Map.of("message", "Your Bike Owner account is pending approval by Super Admin."));
            }
            return ResponseEntity.status(401).body(Map.of("message", "Invalid email or password"));
        }

        User user = found.get();

        if (!encoder.matches(req.password(), user.getPassword())) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid email or password"));
        }
        if (!"GRANTED".equals(user.getStatus())) {
            return ResponseEntity.status(403).body(Map.of("message", "Your account has not been activated."));
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole());
        Map<String, Object> resp = new HashMap<>();
        resp.put("token", token);
        resp.put("role", user.getRole());
        resp.put("name", user.getName());
        resp.put("email", user.getEmail());
        resp.put("id", user.getId());
        resp.put("phone", user.getPhone());
        resp.put("city", user.getCity());
        resp.put("avatarUrl", user.getAvatarUrl());
        return ResponseEntity.ok(resp);
    }

    // ---------- CURRENT USER PROFILE ----------
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(Authentication auth) {
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
        }
        Optional<User> found = userRepo.findByEmail(auth.getName());
        if (found.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("message", "User not found"));
        }
        User u = found.get();
        Map<String, Object> resp = new HashMap<>();
        resp.put("id", u.getId());
        resp.put("name", u.getName());
        resp.put("email", u.getEmail());
        resp.put("role", u.getRole());
        resp.put("phone", u.getPhone());
        resp.put("city", u.getCity());
        resp.put("avatarUrl", u.getAvatarUrl());
        resp.put("createdAt", u.getCreatedAt());
        return ResponseEntity.ok(resp);
    }

    // ---------- UPDATE PROFILE ----------
    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody ProfileUpdateRequest req, Authentication auth) {
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
        }
        Optional<User> found = userRepo.findByEmail(auth.getName());
        if (found.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("message", "User not found"));
        }
        User u = found.get();
        if (req.name() != null && !req.name().isBlank()) u.setName(req.name());
        if (req.phone() != null) u.setPhone(req.phone());
        if (req.city() != null) u.setCity(req.city());
        if (req.avatarUrl() != null) u.setAvatarUrl(req.avatarUrl());
        userRepo.save(u);
        return ResponseEntity.ok(Map.of("message", "Profile updated successfully"));
    }

    private boolean isBlank(String s) {
        return s == null || s.trim().isEmpty();
    }
}
