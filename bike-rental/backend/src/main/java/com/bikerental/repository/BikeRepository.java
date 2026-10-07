package com.bikerental.repository;

import com.bikerental.entity.Bike;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface BikeRepository extends JpaRepository<Bike, Long> {

    List<Bike> findByOwnerId(Long ownerId);

    List<Bike> findByStatus(String status);

    long countByStatus(String status);
    long countByOwnerId(Long ownerId);

    // Catalog: only bikes that are AVAILABLE and have no pending/approved booking in the date window
    @Query("SELECT b FROM Bike b WHERE b.status = 'AVAILABLE' AND NOT EXISTS (" +
           "SELECT 1 FROM Booking bk " +
           "WHERE bk.bikeId = b.id " +
           "AND bk.bookingStatus IN ('PENDING_OWNER_APPROVAL', 'APPROVED') " +
           "AND bk.startDate < :endDate AND bk.endDate > :startDate)")
    List<Bike> findAvailable(@Param("startDate") LocalDate startDate,
                             @Param("endDate") LocalDate endDate);

    @Query("SELECT DISTINCT b.category FROM Bike b WHERE b.category IS NOT NULL ORDER BY b.category")
    List<String> findDistinctCategories();

    @Query("SELECT DISTINCT b.city FROM Bike b WHERE b.city IS NOT NULL ORDER BY b.city")
    List<String> findDistinctCities();
}
