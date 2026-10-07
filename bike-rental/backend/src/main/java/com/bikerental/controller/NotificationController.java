package com.bikerental.controller;

import com.bikerental.entity.Notification;
import com.bikerental.entity.User;
import com.bikerental.repository.NotificationRepository;
import com.bikerental.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

// Module 6: any logged-in user reads their own notifications
@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired private NotificationRepository notificationRepo;
    @Autowired private UserRepository userRepo;

    private Long currentUserId(Authentication auth) {
        return userRepo.findByEmail(auth.getName()).orElseThrow().getId();
    }

    @GetMapping
    public List<Notification> myNotifications(Authentication auth) {
        return notificationRepo.findByUserIdOrderByIdDesc(currentUserId(auth));
    }

    @GetMapping("/unread-count")
    public Map<String, Long> unreadCount(Authentication auth) {
        return Map.of("count", notificationRepo.countByUserIdAndSeenFalse(currentUserId(auth)));
    }

    @PutMapping("/read-all")
    public ResponseEntity<?> markAllRead(Authentication auth) {
        List<Notification> list = notificationRepo.findByUserIdOrderByIdDesc(currentUserId(auth));
        for (Notification n : list) {
            n.setSeen(true);
        }
        notificationRepo.saveAll(list);
        return ResponseEntity.ok(Map.of("message", "All marked as read"));
    }
}
