package com.bikerental.repository;

import com.bikerental.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserIdOrderByIdDesc(Long userId);
    long countByUserIdAndSeenFalse(Long userId);
}
