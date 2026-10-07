package com.bikerental.repository;

import com.bikerental.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByUserIdOrderByIdDesc(Long userId);
    List<Booking> findByOwnerIdOrderByIdDesc(Long ownerId);

    Optional<Booking> findByBookingRef(String bookingRef);

    long countByBookingStatus(String status);
    long countByOwnerIdAndBookingStatus(Long ownerId, String status);

    @Query("SELECT COALESCE(SUM(b.totalPrice), 0.0) FROM Booking b WHERE b.bookingStatus IN ('APPROVED', 'COMPLETED')")
    Double sumApprovedTotalRevenue();

    @Query("SELECT COALESCE(SUM(b.totalPrice), 0.0) FROM Booking b WHERE b.ownerId = :ownerId AND b.bookingStatus IN ('APPROVED', 'COMPLETED')")
    Double sumOwnerRevenue(@Param("ownerId") Long ownerId);

    // Is this bike already taken (pending or approved) in the date window?
    // Two date ranges overlap when: existingStart < newEnd AND existingEnd > newStart
    @Query("SELECT COUNT(b) > 0 FROM Booking b WHERE b.bikeId = :bikeId " +
           "AND b.bookingStatus IN ('PENDING_OWNER_APPROVAL', 'APPROVED') " +
           "AND b.startDate < :endDate AND b.endDate > :startDate")
    boolean isBikeBooked(@Param("bikeId") Long bikeId,
                         @Param("startDate") LocalDate startDate,
                         @Param("endDate") LocalDate endDate);
}
