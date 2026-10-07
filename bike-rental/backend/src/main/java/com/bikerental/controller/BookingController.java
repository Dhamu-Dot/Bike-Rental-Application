package com.bikerental.controller;

import com.bikerental.entity.Bike;
import com.bikerental.entity.Booking;
import com.bikerental.entity.User;
import com.bikerental.repository.BikeRepository;
import com.bikerental.repository.BookingRepository;
import com.bikerental.repository.UserRepository;
import com.bikerental.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ThreadLocalRandom;

// Module 5: only ROLE_USER (customers) can reach these URLs
@RestController
@RequestMapping("/api/user")
public class BookingController {

    @Autowired private BookingRepository bookingRepo;
    @Autowired private BikeRepository bikeRepo;
    @Autowired private UserRepository userRepo;
    @Autowired private NotificationService notificationService;

    public record BookingRequest(
            Long bikeId,
            LocalDate startDate,
            LocalDate endDate,
            String pickupLocation,
            String customerPhone,
            String notes,
            String paymentMethod,
            String paymentType,
            Double advanceAmount
    ) {}

    // ---------- PLACE A BOOKING ----------
    @PostMapping("/bookings")
    @Transactional
    public ResponseEntity<?> placeBooking(@RequestBody BookingRequest req, Authentication auth) {

        if (req.bikeId() == null || req.startDate() == null || req.endDate() == null) {
            return error(400, "Bike and dates are required");
        }
        if (req.startDate().isBefore(LocalDate.now())) {
            return error(400, "Start date cannot be in the past");
        }
        if (!req.endDate().isAfter(req.startDate())) {
            return error(400, "Return date must be after start date");
        }

        Bike bike = bikeRepo.findById(req.bikeId()).orElse(null);
        if (bike == null || !"AVAILABLE".equals(bike.getStatus())) {
            return error(400, "This bike is currently not available for rent");
        }

        // Inventory lock: stop double booking
        if (bookingRepo.isBikeBooked(bike.getId(), req.startDate(), req.endDate())) {
            return error(400, "Sorry, this bike is already reserved for the selected dates");
        }

        User customer = userRepo.findByEmail(auth.getName()).orElseThrow();

        // Total = (Daily Rate x Days) + Security Deposit
        int days = (int) ChronoUnit.DAYS.between(req.startDate(), req.endDate());
        double deposit = bike.getSecurityDeposit() == null ? 0 : bike.getSecurityDeposit();
        double total = (bike.getDailyRate() * days) + deposit;

        double advance = req.advanceAmount() != null && req.advanceAmount() > 0
                ? req.advanceAmount()
                : Math.round(total * 0.30);
        if (advance > total) advance = total;
        String payType = req.paymentType() != null && !req.paymentType().isBlank() ? req.paymentType() : "ADVANCE";

        String pickup = (req.pickupLocation() == null || req.pickupLocation().isBlank())
                ? (bike.getLocation() + ", " + bike.getCity()) : req.pickupLocation().trim();

        String ref = "BK-" + LocalDate.now().getYear() + "-" + ThreadLocalRandom.current().nextInt(100000, 999999);

        Booking booking = new Booking();
        booking.setBookingRef(ref);
        booking.setUserId(customer.getId());
        booking.setBikeId(bike.getId());
        booking.setOwnerId(bike.getOwnerId());
        booking.setCustomerName(customer.getName());
        booking.setCustomerEmail(customer.getEmail());
        booking.setCustomerPhone(req.customerPhone() != null && !req.customerPhone().isBlank() ? req.customerPhone() : customer.getPhone());
        booking.setBikeName(bike.getBrand() + " " + bike.getModel());
        booking.setStartDate(req.startDate());
        booking.setEndDate(req.endDate());
        booking.setDays(days);
        booking.setDailyRate(bike.getDailyRate());
        booking.setSecurityDeposit(deposit);
        booking.setTotalPrice(total);
        booking.setAdvanceAmount(advance);
        booking.setPaidAmount(0.0);
        booking.setBalanceAmount(total);
        booking.setPaymentType(payType);
        booking.setPickupLocation(pickup);
        booking.setNotes(req.notes());
        booking.setBookingStatus("PENDING_OWNER_APPROVAL");
        booking.setPaymentStatus("UNPAID");
        booking.setPaymentMethod(req.paymentMethod() != null && !req.paymentMethod().isBlank() ? req.paymentMethod() : "PAY_ON_PICKUP");

        Booking saved = bookingRepo.save(booking);

        // Tell the bike owner right away
        String details = "Ref: " + ref + " | Customer: " + customer.getName() + " (" + customer.getEmail() + ")"
                + " | Dates: " + req.startDate() + " to " + req.endDate()
                + " | Total: Rs. " + total + " (Advance: Rs. " + advance + ")"
                + " | Pickup: " + pickup;
        notificationService.notifyUser(bike.getOwnerId(),
                "New Booking Request (" + ref + ") for " + saved.getBikeName(), details);

        return ResponseEntity.ok(saved);
    }

    // ---------- MY BOOKINGS ----------
    @GetMapping("/bookings")
    public List<Booking> myBookings(Authentication auth) {
        User customer = userRepo.findByEmail(auth.getName()).orElseThrow();
        return bookingRepo.findByUserIdOrderByIdDesc(customer.getId());
    }

    // ---------- SINGLE BOOKING DETAILS ----------
    @GetMapping("/bookings/{id}")
    public ResponseEntity<?> bookingDetail(@PathVariable Long id, Authentication auth) {
        User customer = userRepo.findByEmail(auth.getName()).orElseThrow();
        Booking booking = bookingRepo.findById(id).orElse(null);
        if (booking == null || !booking.getUserId().equals(customer.getId())) {
            return error(404, "Booking not found");
        }
        return ResponseEntity.ok(booking);
    }

    // ---------- SIMULATE PAYMENT ----------
    @PutMapping("/bookings/{id}/pay")
    public ResponseEntity<?> payBooking(@PathVariable Long id, @RequestBody(required = false) Map<String, Object> body, Authentication auth) {
        User customer = userRepo.findByEmail(auth.getName()).orElseThrow();
        Booking booking = bookingRepo.findById(id).orElse(null);

        if (booking == null || !booking.getUserId().equals(customer.getId())) {
            return error(404, "Booking not found");
        }
        if ("PAID".equals(booking.getPaymentStatus())) {
            return error(400, "Booking is already fully paid");
        }
        if (!"APPROVED".equals(booking.getBookingStatus()) && !"COMPLETED".equals(booking.getBookingStatus())) {
            return error(400, "Payment can only be processed after the owner approves your booking");
        }

        String payType = body != null && body.containsKey("paymentType")
                ? String.valueOf(body.get("paymentType"))
                : "FULL";
        String method = body != null && body.containsKey("paymentMethod")
                ? String.valueOf(body.get("paymentMethod"))
                : "ONLINE_UPI";

        double total = booking.getTotalPrice() != null ? booking.getTotalPrice() : 0.0;
        double advance = booking.getAdvanceAmount() != null && booking.getAdvanceAmount() > 0
                ? booking.getAdvanceAmount()
                : Math.round(total * 0.30);
        double alreadyPaid = booking.getPaidAmount() != null ? booking.getPaidAmount() : 0.0;
        double paidNow = 0.0;

        if ("ADVANCE".equalsIgnoreCase(payType)) {
            paidNow = advance;
            booking.setPaidAmount(advance);
            booking.setBalanceAmount(total - advance);
            booking.setPaymentStatus("ADVANCE_PAID");
            booking.setPaymentType("ADVANCE");
        } else if ("BALANCE".equalsIgnoreCase(payType)) {
            paidNow = (total - alreadyPaid);
            booking.setPaidAmount(total);
            booking.setBalanceAmount(0.0);
            booking.setPaymentStatus("PAID");
            booking.setPaymentType("FULL");
        } else {
            // FULL
            paidNow = total - alreadyPaid;
            booking.setPaidAmount(total);
            booking.setBalanceAmount(0.0);
            booking.setPaymentStatus("PAID");
            booking.setPaymentType("FULL");
        }

        booking.setPaymentMethod(method);
        bookingRepo.save(booking);

        notificationService.notifyUser(booking.getOwnerId(),
                "Payment received for " + booking.getBikeName() + " (" + booking.getBookingRef() + ")",
                "Customer " + customer.getName() + " paid " + ("ADVANCE".equalsIgnoreCase(payType) ? "Advance" : "Full Payment")
                        + " of Rs. " + paidNow + " via " + method + ". Remaining balance: Rs. " + booking.getBalanceAmount());

        notificationService.notifyUser(customer.getId(),
                "Payment Confirmation (" + booking.getBookingRef() + ")",
                "Your payment of Rs. " + paidNow + " (" + ("ADVANCE".equalsIgnoreCase(payType) ? "Advance payment" : "Full payment")
                        + ") was processed successfully. Balance due at pickup: Rs. " + booking.getBalanceAmount());

        return ResponseEntity.ok(booking);
    }

    // ---------- CANCEL (only while still waiting for the owner) ----------
    @PutMapping("/bookings/{id}/cancel")
    public ResponseEntity<?> cancel(@PathVariable Long id, Authentication auth) {
        User customer = userRepo.findByEmail(auth.getName()).orElseThrow();
        Booking booking = bookingRepo.findById(id).orElse(null);

        if (booking == null || !booking.getUserId().equals(customer.getId())) {
            return error(404, "Booking not found");
        }
        if (!"PENDING_OWNER_APPROVAL".equals(booking.getBookingStatus())) {
            return error(400, "Only pending bookings can be cancelled");
        }
        booking.setBookingStatus("CANCELLED");
        bookingRepo.save(booking);

        notificationService.notifyUser(booking.getOwnerId(),
                "Booking cancelled for " + booking.getBikeName() + " (" + booking.getBookingRef() + ")",
                "Customer " + booking.getCustomerName() + " cancelled the request for "
                        + booking.getStartDate() + " to " + booking.getEndDate());
        return ResponseEntity.ok(booking);
    }

    private ResponseEntity<?> error(int status, String message) {
        return ResponseEntity.status(status).body(Map.of("message", message));
    }
}
