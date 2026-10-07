package com.bikerental.repository;

import com.bikerental.entity.PendingUser;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PendingUserRepository extends JpaRepository<PendingUser, Long> {
    boolean existsByEmail(String email);
}
