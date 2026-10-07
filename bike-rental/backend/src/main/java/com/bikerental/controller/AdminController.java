package com.bikerental.controller;

import com.bikerental.entity.Bike;
import com.bikerental.entity.Booking;
import com.bikerental.entity.PendingUser;
import com.bikerental.entity.User;
import com.bikerental.entity.Notification;
import com.bikerental.repository.BikeRepository;
import com.bikerental.repository.BookingRepository;
import com.bikerental.repository.NotificationRepository;
import com.bikerental.repository.PendingUserRepository;
import com.bikerental.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

// Only ROLE_ADMIN can reach these URLs
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired private UserRepository userRepo;
    @Autowired private PendingUserRepository pendingRepo;
    @Autowired private BikeRepository bikeRepo;
    @Autowired private BookingRepository bookingRepo;
    @Autowired private NotificationRepository notificationRepo;

    // Platform KPI and Overview Statistics
    @GetMapping("/stats")
    public ResponseEntity<?> stats() {
        long totalUsers = userRepo.count();
        long owners = userRepo.countByRole("ROLE_BIKE_OWNER");
        long customers = userRepo.countByRole("ROLE_USER");
        long pendingOwners = pendingRepo.count();
        long totalBikes = bikeRepo.count();
        long activeBikes = bikeRepo.countByStatus("AVAILABLE");
        long totalBookings = bookingRepo.count();
        Double totalRevenue = bookingRepo.sumApprovedTotalRevenue();

        Map<String, Object> map = new HashMap<>();
        map.put("totalUsers", totalUsers);
        map.put("totalOwners", owners);
        map.put("totalCustomers", customers);
        map.put("pendingOwners", pendingOwners);
        map.put("totalBikes", totalBikes);
        map.put("activeBikes", activeBikes);
        map.put("totalBookings", totalBookings);
        map.put("totalRevenue", totalRevenue != null ? totalRevenue : 0.0);

        return ResponseEntity.ok(map);
    }

    // Waiting bike owners
    @GetMapping("/pending-owners")
    public List<PendingUser> pendingOwners() {
        return pendingRepo.findAll();
    }

    // APPROVE: move from pending_user -> users (status GRANTED), then delete the pending row
    @PostMapping("/pending-owners/{id}/approve")
    @Transactional
    public ResponseEntity<?> approve(@PathVariable Long id) {
        Optional<PendingUser> found = pendingRepo.findById(id);
        if (found.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("message", "Request not found"));
        }
        PendingUser p = found.get();

        User u = new User();
        u.setName(p.getName());
        u.setEmail(p.getEmail());
        u.setPassword(p.getPassword()); // already hashed at registration
        u.setRole(p.getRole());
        u.setStatus("GRANTED");
        u.setPhone(p.getPhone());
        u.setCity(p.getCity());
        userRepo.save(u);

        pendingRepo.delete(p);
        return ResponseEntity.ok(Map.of("message", p.getName() + " approved successfully"));
    }

    // REJECT: just delete the pending row
    @DeleteMapping("/pending-owners/{id}/reject")
    public ResponseEntity<?> reject(@PathVariable Long id) {
        if (!pendingRepo.existsById(id)) {
            return ResponseEntity.status(404).body(Map.of("message", "Request not found"));
        }
        pendingRepo.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Request rejected"));
    }

    // Oversight lists
    @GetMapping("/users")
    public List<User> allUsers() {
        return userRepo.findAll();
    }

    @GetMapping("/bikes")
    public List<Bike> allBikes() {
        return bikeRepo.findAll();
    }

    @GetMapping("/bookings")
    public List<Booking> allBookings() {
        return bookingRepo.findAll();
    }

    // DELETE: Admin can remove any customer or bike owner
    @DeleteMapping("/users/{id}")
    @Transactional
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        Optional<User> found = userRepo.findById(id);
        if (found.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("message", "User not found"));
        }
        User u = found.get();
        if ("ROLE_ADMIN".equals(u.getRole())) {
            return ResponseEntity.status(400).body(Map.of("message", "Cannot delete an Admin account"));
        }

        // If bike owner, remove all their bikes and owner bookings
        if ("ROLE_BIKE_OWNER".equals(u.getRole())) {
            List<Bike> ownerBikes = bikeRepo.findByOwnerId(id);
            bikeRepo.deleteAll(ownerBikes);
            List<Booking> ownerBookings = bookingRepo.findByOwnerIdOrderByIdDesc(id);
            bookingRepo.deleteAll(ownerBookings);
        }

        // If customer, remove their bookings
        if ("ROLE_USER".equals(u.getRole())) {
            List<Booking> userBookings = bookingRepo.findByUserIdOrderByIdDesc(id);
            bookingRepo.deleteAll(userBookings);
        }

        // Clean up notifications for this user
        List<Notification> notes = notificationRepo.findByUserIdOrderByIdDesc(id);
        notificationRepo.deleteAll(notes);

        userRepo.delete(u);
        return ResponseEntity.ok(Map.of("message", "User \"" + u.getName() + "\" removed successfully"));
    }

    // DELETE: Admin can remove a motorcycle from Platform Fleet
    @DeleteMapping("/bikes/{id}")
    @Transactional
    public ResponseEntity<?> deleteBike(@PathVariable Long id) {
        if (!bikeRepo.existsById(id)) {
            return ResponseEntity.status(404).body(Map.of("message", "Motorcycle not found"));
        }
        bikeRepo.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Motorcycle removed from fleet"));
    }
}
