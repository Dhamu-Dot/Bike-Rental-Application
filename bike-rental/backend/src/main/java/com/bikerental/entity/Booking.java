package com.bikerental.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "bookings")
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String bookingRef;

    private Long userId;      // the customer
    private Long bikeId;
    private Long ownerId;     // owner of the bike

    // Copied at booking time for fast lookup
    private String customerName;
    private String customerEmail;
    private String customerPhone;
    private String bikeName;

    private LocalDate startDate;
    private LocalDate endDate;   // return date
    private Integer days;
    private Double dailyRate;
    private Double securityDeposit;
    private Double totalPrice;
    private Double advanceAmount = 0.0;
    private Double paidAmount = 0.0;
    private Double balanceAmount = 0.0;
    private String paymentType = "FULL"; // ADVANCE, FULL

    private String pickupLocation;
    
    @Column(length = 500)
    private String notes;

    // PENDING_OWNER_APPROVAL, APPROVED, REJECTED, CANCELLED, COMPLETED
    private String bookingStatus;

    // UNPAID, ADVANCE_PAID, PAID, REFUNDED
    private String paymentStatus = "UNPAID";
    private String paymentMethod = "PAY_ON_PICKUP";

    private LocalDateTime createdAt = LocalDateTime.now();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getBookingRef() { return bookingRef; }
    public void setBookingRef(String bookingRef) { this.bookingRef = bookingRef; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public Long getBikeId() { return bikeId; }
    public void setBikeId(Long bikeId) { this.bikeId = bikeId; }
    public Long getOwnerId() { return ownerId; }
    public void setOwnerId(Long ownerId) { this.ownerId = ownerId; }
    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }
    public String getCustomerEmail() { return customerEmail; }
    public void setCustomerEmail(String customerEmail) { this.customerEmail = customerEmail; }
    public String getCustomerPhone() { return customerPhone; }
    public void setCustomerPhone(String customerPhone) { this.customerPhone = customerPhone; }
    public String getBikeName() { return bikeName; }
    public void setBikeName(String bikeName) { this.bikeName = bikeName; }
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
    public Integer getDays() { return days; }
    public void setDays(Integer days) { this.days = days; }
    public Double getDailyRate() { return dailyRate; }
    public void setDailyRate(Double dailyRate) { this.dailyRate = dailyRate; }
    public Double getSecurityDeposit() { return securityDeposit; }
    public void setSecurityDeposit(Double securityDeposit) { this.securityDeposit = securityDeposit; }
    public Double getTotalPrice() { return totalPrice; }
    public void setTotalPrice(Double totalPrice) { this.totalPrice = totalPrice; }
    public Double getAdvanceAmount() { return advanceAmount; }
    public void setAdvanceAmount(Double advanceAmount) { this.advanceAmount = advanceAmount; }
    public Double getPaidAmount() { return paidAmount; }
    public void setPaidAmount(Double paidAmount) { this.paidAmount = paidAmount; }
    public Double getBalanceAmount() { return balanceAmount; }
    public void setBalanceAmount(Double balanceAmount) { this.balanceAmount = balanceAmount; }
    public String getPaymentType() { return paymentType; }
    public void setPaymentType(String paymentType) { this.paymentType = paymentType; }
    public String getPickupLocation() { return pickupLocation; }
    public void setPickupLocation(String pickupLocation) { this.pickupLocation = pickupLocation; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public String getBookingStatus() { return bookingStatus; }
    public void setBookingStatus(String bookingStatus) { this.bookingStatus = bookingStatus; }
    public String getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }
    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
