package com.bikerental.controller;

import com.bikerental.entity.Bike;
import com.bikerental.repository.BikeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

// Public catalog with multi-facet search, date availability, filters & sorting
@RestController
@RequestMapping("/api/bikes")
public class CatalogController {

    @Autowired
    private BikeRepository bikeRepo;

    // GET /api/bikes with date range, search query, category, city, price range, and sort
    @GetMapping
    public ResponseEntity<?> catalog(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) Double minRate,
            @RequestParam(required = false) Double maxRate,
            @RequestParam(required = false) String sortBy) {

        List<Bike> list;
        if (startDate != null && endDate != null) {
            if (!endDate.isAfter(startDate)) {
                return ResponseEntity.badRequest().body(Map.of("message", "Return date must be after start date"));
            }
            list = bikeRepo.findAvailable(startDate, endDate);
        } else {
            list = bikeRepo.findByStatus("AVAILABLE");
        }

        // 2. Keyword search filter
        if (search != null && !search.isBlank()) {
            String q = search.trim().toLowerCase();
            list = list.stream().filter(b ->
                    (b.getBrand() != null && b.getBrand().toLowerCase().contains(q)) ||
                    (b.getModel() != null && b.getModel().toLowerCase().contains(q)) ||
                    (b.getCity() != null && b.getCity().toLowerCase().contains(q)) ||
                    (b.getLocation() != null && b.getLocation().toLowerCase().contains(q)) ||
                    (b.getCategory() != null && b.getCategory().toLowerCase().contains(q))
            ).collect(Collectors.toList());
        }

        // 2b. Location filter (owner-added location / area)
        if (location != null && !location.isBlank()) {
            String loc = location.trim().toLowerCase();
            list = list.stream().filter(b ->
                    (b.getLocation() != null && b.getLocation().toLowerCase().contains(loc)) ||
                    (b.getCity() != null && b.getCity().toLowerCase().contains(loc))
            ).collect(Collectors.toList());
        }

        // 3. Category filter
        if (category != null && !category.isBlank() && !"all".equalsIgnoreCase(category)) {
            String cat = category.trim().toLowerCase();
            list = list.stream().filter(b ->
                    b.getCategory() != null && b.getCategory().equalsIgnoreCase(cat)
            ).collect(Collectors.toList());
        }

        // 4. City filter
        if (city != null && !city.isBlank() && !"all".equalsIgnoreCase(city)) {
            String c = city.trim().toLowerCase();
            list = list.stream().filter(b ->
                    b.getCity() != null && b.getCity().equalsIgnoreCase(c)
            ).collect(Collectors.toList());
        }

        // 5. Price range filter
        if (minRate != null) {
            list = list.stream().filter(b -> b.getDailyRate() != null && b.getDailyRate() >= minRate).collect(Collectors.toList());
        }
        if (maxRate != null) {
            list = list.stream().filter(b -> b.getDailyRate() != null && b.getDailyRate() <= maxRate).collect(Collectors.toList());
        }

        // 6. Sorting
        if (sortBy != null) {
            switch (sortBy.toLowerCase()) {
                case "price_asc":
                    list.sort(Comparator.comparingDouble(b -> b.getDailyRate() != null ? b.getDailyRate() : 0.0));
                    break;
                case "price_desc":
                    list.sort((a, b) -> Double.compare(
                            b.getDailyRate() != null ? b.getDailyRate() : 0.0,
                            a.getDailyRate() != null ? a.getDailyRate() : 0.0));
                    break;
                case "rating":
                    list.sort((a, b) -> Double.compare(
                            b.getRating() != null ? b.getRating() : 0.0,
                            a.getRating() != null ? a.getRating() : 0.0));
                    break;
                case "cc_desc":
                    list.sort((a, b) -> Integer.compare(
                            b.getEngineCc() != null ? b.getEngineCc() : 0,
                            a.getEngineCc() != null ? a.getEngineCc() : 0));
                    break;
                case "newest":
                    list.sort((a, b) -> Long.compare(b.getId() != null ? b.getId() : 0L, a.getId() != null ? a.getId() : 0L));
                    break;
                default:
                    break;
            }
        }

        return ResponseEntity.ok(list);
    }

    // Detailed view of one bike
    @GetMapping("/{id}")
    public ResponseEntity<?> details(@PathVariable Long id) {
        Bike bike = bikeRepo.findById(id).orElse(null);
        if (bike == null) {
            return ResponseEntity.status(404).body(Map.of("message", "Bike not found"));
        }
        return ResponseEntity.ok(bike);
    }

    // List of distinct bike categories
    @GetMapping("/categories")
    public List<String> categories() {
        return bikeRepo.findDistinctCategories();
    }

    // List of distinct cities
    @GetMapping("/cities")
    public List<String> cities() {
        return bikeRepo.findDistinctCities();
    }
}
