package com.bikerental.controller;

import com.bikerental.entity.Bike;
import com.bikerental.entity.Booking;
import com.bikerental.repository.BikeRepository;
import com.bikerental.repository.BookingRepository;
import com.bikerental.repository.UserRepository;
import com.bikerental.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

// Only ROLE_BIKE_OWNER can reach these URLs
@RestController
@RequestMapping("/api/owner")
public class OwnerController {

    @Autowired private BikeRepository bikeRepo;
    @Autowired private UserRepository userRepo;
    @Autowired private BookingRepository bookingRepo;
    @Autowired private NotificationService notificationService;

    // "auth.getName()" is the email stored inside the JWT token
    private Long currentOwnerId(Authentication auth) {
        return userRepo.findByEmail(auth.getName()).orElseThrow().getId();
    }

    // Returns the bike only if it belongs to the logged-in owner
    private Bike findOwnBike(Long bikeId, Authentication auth) {
        Bike bike = bikeRepo.findById(bikeId).orElse(null);
        if (bike == null || !bike.getOwnerId().equals(currentOwnerId(auth))) {
            return null;
        }
        return bike;
    }

    // Owner summary statistics
    @GetMapping("/stats")
    public ResponseEntity<?> stats(Authentication auth) {
        Long ownerId = currentOwnerId(auth);
        List<Bike> ownerBikes = bikeRepo.findByOwnerId(ownerId);
        List<Booking> ownerBookings = bookingRepo.findByOwnerIdOrderByIdDesc(ownerId);

        long activeBikes = ownerBikes.stream().filter(b -> "AVAILABLE".equals(b.getStatus())).count();
        long maintBikes = ownerBikes.stream().filter(b -> "MAINTENANCE".equals(b.getStatus())).count();
        long pending = ownerBookings.stream().filter(b -> "PENDING_OWNER_APPROVAL".equals(b.getBookingStatus())).count();
        long approved = ownerBookings.stream().filter(b -> "APPROVED".equals(b.getBookingStatus())).count();
        long completed = ownerBookings.stream().filter(b -> "COMPLETED".equals(b.getBookingStatus())).count();

        Double revenue = bookingRepo.sumOwnerRevenue(ownerId);

        Map<String, Object> map = new HashMap<>();
        map.put("totalBikes", ownerBikes.size());
        map.put("activeBikes", activeBikes);
        map.put("maintenanceBikes", maintBikes);
        map.put("pendingRequests", pending);
        map.put("approvedBookings", approved);
        map.put("completedBookings", completed);
        map.put("totalRevenue", revenue != null ? revenue : 0.0);

        return ResponseEntity.ok(map);
    }

    // List my bikes
    @GetMapping("/bikes")
    public List<Bike> myBikes(Authentication auth) {
        return bikeRepo.findByOwnerId(currentOwnerId(auth));
    }

    // Add a bike
    @PostMapping("/bikes")
    public Bike addBike(@RequestBody Bike bike, Authentication auth) {
        bike.setId(null);
        bike.setOwnerId(currentOwnerId(auth));
        if (bike.getStatus() == null) bike.setStatus("AVAILABLE");
        if (bike.getRating() == null) bike.setRating(5.0);
        if (bike.getReviewCount() == null) bike.setReviewCount(1);
        if (bike.getCategory() == null || bike.getCategory().isBlank()) bike.setCategory("Cruiser");
        if (bike.getCity() == null || bike.getCity().isBlank()) bike.setCity("Bangalore");
        if (bike.getFuelType() == null || bike.getFuelType().isBlank()) bike.setFuelType("Petrol");
        return bikeRepo.save(bike);
    }

    // Update a bike
    @PutMapping("/bikes/{id}")
    public ResponseEntity<?> updateBike(@PathVariable Long id, @RequestBody Bike data, Authentication auth) {
        Bike bike = findOwnBike(id, auth);
        if (bike == null) {
            return ResponseEntity.status(404).body(Map.of("message", "Bike not found"));
        }
        bike.setBrand(data.getBrand());
        bike.setModel(data.getModel());
        bike.setCategory(data.getCategory());
        bike.setEngineCc(data.getEngineCc());
        bike.setRegistrationNumber(data.getRegistrationNumber());
        bike.setDailyRate(data.getDailyRate());
        bike.setSecurityDeposit(data.getSecurityDeposit());
        bike.setLocation(data.getLocation());
        bike.setCity(data.getCity());
        bike.setImageUrl(data.getImageUrl());
        bike.setDescription(data.getDescription());
        bike.setModelYear(data.getModelYear());
        bike.setFuelType(data.getFuelType());
        bike.setMileage(data.getMileage());
        bike.setFeatures(data.getFeatures());
        return ResponseEntity.ok(bikeRepo.save(bike));
    }

    // Delete (decommission) a bike
    @DeleteMapping("/bikes/{id}")
    public ResponseEntity<?> deleteBike(@PathVariable Long id, Authentication auth) {
        Bike bike = findOwnBike(id, auth);
        if (bike == null) {
            return ResponseEntity.status(404).body(Map.of("message", "Bike not found"));
        }
        bikeRepo.delete(bike);
        return ResponseEntity.ok(Map.of("message", "Bike deleted successfully"));
    }

    // Switch between AVAILABLE and MAINTENANCE
    @PutMapping("/bikes/{id}/maintenance")
    public ResponseEntity<?> toggleMaintenance(@PathVariable Long id, Authentication auth) {
        Bike bike = findOwnBike(id, auth);
        if (bike == null) {
            return ResponseEntity.status(404).body(Map.of("message", "Bike not found"));
        }
        bike.setStatus("MAINTENANCE".equals(bike.getStatus()) ? "AVAILABLE" : "MAINTENANCE");
        return ResponseEntity.ok(bikeRepo.save(bike));
    }

    // ---------- BOOKING REQUESTS ----------

    // All booking requests for my bikes
    @GetMapping("/bookings")
    public List<Booking> myBookingRequests(Authentication auth) {
        return bookingRepo.findByOwnerIdOrderByIdDesc(currentOwnerId(auth));
    }

    @PutMapping("/bookings/{id}/approve")
    public ResponseEntity<?> approveBooking(@PathVariable Long id, Authentication auth) {
        return decide(id, auth, true);
    }

    @PutMapping("/bookings/{id}/reject")
    public ResponseEntity<?> rejectBooking(@PathVariable Long id, Authentication auth) {
        return decide(id, auth, false);
    }

    // Mark as completed when customer returns the bike
    @PutMapping("/bookings/{id}/complete")
    public ResponseEntity<?> completeBooking(@PathVariable Long id, Authentication auth) {
        Booking booking = bookingRepo.findById(id).orElse(null);
        if (booking == null || !booking.getOwnerId().equals(currentOwnerId(auth))) {
            return ResponseEntity.status(404).body(Map.of("message", "Booking not found"));
        }
        if (!"APPROVED".equals(booking.getBookingStatus())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Only approved bookings can be marked as completed"));
        }

        booking.setBookingStatus("COMPLETED");
        bookingRepo.save(booking);

        notificationService.notifyUser(booking.getUserId(),
                "Trip Completed for " + booking.getBikeName() + " (" + booking.getBookingRef() + ")",
                "Thank you for riding with us! The bike return has been verified and your security deposit of Rs. "
                        + booking.getSecurityDeposit() + " is being released according to policy.");

        return ResponseEntity.ok(booking);
    }

    // Approve or reject one request, then notify the customer
    private ResponseEntity<?> decide(Long id, Authentication auth, boolean approve) {
        Booking booking = bookingRepo.findById(id).orElse(null);
        if (booking == null || !booking.getOwnerId().equals(currentOwnerId(auth))) {
            return ResponseEntity.status(404).body(Map.of("message", "Booking not found"));
        }
        if (!"PENDING_OWNER_APPROVAL".equals(booking.getBookingStatus())) {
            return ResponseEntity.badRequest().body(Map.of("message", "This request was already handled"));
        }

        booking.setBookingStatus(approve ? "APPROVED" : "REJECTED");
        bookingRepo.save(booking);

        String ref = booking.getBookingRef() != null ? " (" + booking.getBookingRef() + ")" : "";
        String details = "Dates: " + booking.getStartDate() + " to " + booking.getEndDate()
                + " | Pickup: " + booking.getPickupLocation()
                + " | Total: Rs. " + booking.getTotalPrice()
                + (approve ? " | Status: APPROVED! Please bring valid Driving License on pickup." : " | Status: REJECTED by owner.");

        notificationService.notifyUser(booking.getUserId(),
                "Your booking for " + booking.getBikeName() + ref + " was "
                        + (approve ? "APPROVED" : "REJECTED"),
                details);

        return ResponseEntity.ok(booking);
    }
}
