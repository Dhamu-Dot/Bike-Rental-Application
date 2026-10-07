package com.bikerental.service;

import com.bikerental.entity.Notification;
import com.bikerental.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

// One place that creates notifications, so controllers stay short
@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepo;

    public void notifyUser(Long userId, String message, String details) {
        Notification n = new Notification();
        n.setUserId(userId);
        n.setMessage(message);
        n.setDetails(details);
        notificationRepo.save(n);
    }
}
