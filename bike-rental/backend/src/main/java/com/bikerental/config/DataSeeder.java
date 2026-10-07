package com.bikerental.config;

import com.bikerental.entity.Bike;
import com.bikerental.entity.Booking;
import com.bikerental.entity.Notification;
import com.bikerental.entity.PendingUser;
import com.bikerental.entity.User;
import com.bikerental.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired private UserRepository userRepo;
    @Autowired private PendingUserRepository pendingRepo;
    @Autowired private BikeRepository bikeRepo;
    @Autowired private BookingRepository bookingRepo;
    @Autowired private NotificationRepository notificationRepo;
    @Autowired private PasswordEncoder encoder;

    @Override
    public void run(String... args) {
        // 1. Seed Super Admin
        if (!userRepo.existsByRole("ROLE_ADMIN")) {
            User admin = new User();
            admin.setName("Super Admin");
            admin.setEmail("admin@bike.com");
            admin.setPassword(encoder.encode("admin123"));
            admin.setRole("ROLE_ADMIN");
            admin.setStatus("GRANTED");
            admin.setPhone("+91 98765 43210");
            admin.setCity("Bangalore");
            userRepo.save(admin);
            System.out.println(">>> Super Admin seeded: admin@bike.com / admin123");
        }

        // 2. Seed Bike Owners
        User owner1 = userRepo.findByEmail("owner@bike.com").orElse(null);
        if (owner1 == null) {
            owner1 = new User();
            owner1.setName("Rajesh Motors & Rentals");
            owner1.setEmail("owner@bike.com");
            owner1.setPassword(encoder.encode("owner123"));
            owner1.setRole("ROLE_BIKE_OWNER");
            owner1.setStatus("GRANTED");
            owner1.setPhone("+91 98220 12345");
            owner1.setCity("Bangalore");
            owner1 = userRepo.save(owner1);
            System.out.println(">>> Bike Owner 1 seeded: owner@bike.com / owner123");
        }

        User owner2 = userRepo.findByEmail("goa.rides@bike.com").orElse(null);
        if (owner2 == null) {
            owner2 = new User();
            owner2.setName("Goa Coastal Cruise Co.");
            owner2.setEmail("goa.rides@bike.com");
            owner2.setPassword(encoder.encode("owner123"));
            owner2.setRole("ROLE_BIKE_OWNER");
            owner2.setStatus("GRANTED");
            owner2.setPhone("+91 97654 32109");
            owner2.setCity("Goa");
            owner2 = userRepo.save(owner2);
            System.out.println(">>> Bike Owner 2 seeded: goa.rides@bike.com / owner123");
        }

        // 3. Seed Customer
        User customer = userRepo.findByEmail("customer@bike.com").orElse(null);
        if (customer == null) {
            customer = new User();
            customer.setName("Alex Sharma");
            customer.setEmail("customer@bike.com");
            customer.setPassword(encoder.encode("customer123"));
            customer.setRole("ROLE_USER");
            customer.setStatus("GRANTED");
            customer.setPhone("+91 91234 56789");
            customer.setCity("Bangalore");
            customer = userRepo.save(customer);
            System.out.println(">>> Customer seeded: customer@bike.com / customer123");
        }

        // 4. Seed Pending Owner application
        if (pendingRepo.count() == 0) {
            PendingUser pending = new PendingUser();
            pending.setName("Speedway Moto Hub");
            pending.setEmail("speedway@bike.com");
            pending.setPassword(encoder.encode("owner123"));
            pending.setRole("ROLE_BIKE_OWNER");
            pending.setPhone("+91 99112 23344");
            pending.setCity("Mumbai");
            pendingRepo.save(pending);
        }

        // Backfill any existing records with missing metadata
        for (Bike b : bikeRepo.findAll()) {
            boolean changed = false;
            if (b.getCategory() == null || b.getCategory().isBlank()) { b.setCategory("Commuter"); changed = true; }
            if (b.getCity() == null || b.getCity().isBlank()) { b.setCity("Madurai"); changed = true; }
            if (b.getRating() == null) { b.setRating(4.8); changed = true; }
            if (b.getReviewCount() == null) { b.setReviewCount(14); changed = true; }
            if (b.getFuelType() == null || b.getFuelType().isBlank()) { b.setFuelType("Petrol"); changed = true; }
            if (changed) bikeRepo.save(b);
        }

        for (Booking bk : bookingRepo.findAll()) {
            boolean changed = false;
            if (bk.getBookingRef() == null || bk.getBookingRef().isBlank()) {
                bk.setBookingRef("BK-2026-" + (100000 + bk.getId()));
                changed = true;
            }
            if (bk.getPaymentStatus() == null || bk.getPaymentStatus().isBlank()) {
                bk.setPaymentStatus("PAID");
                changed = true;
            }
            if (changed) bookingRepo.save(bk);
        }

        // 5. Seed Fleet of Bikes if count < 10
        if (bikeRepo.count() < 10) {
            createBike(owner1.getId(), "Royal Enfield", "Classic 350", "Cruiser", 349, "KA-01-EQ-4421",
                    1100.0, 2000.0, "Koramangala 5th Block", "Bangalore",
                    "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80",
                    "Iconic cruiser with timeless thump. Perfect for city cruising and long weekend highways.",
                    2024, "Petrol", "36 kmpl", 4.9, 38,
                    "Helmet Included, Dual ABS, Mobile Mount, USB Charger");

            createBike(owner1.getId(), "Royal Enfield", "Himalayan 450", "Adventure", 452, "KA-03-HM-9012",
                    1650.0, 3000.0, "Indiranagar 100ft Road", "Bangalore",
                    "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=800&q=80",
                    "Liquid-cooled Sherpa engine, long-travel suspension, and navigation tripper. Built for mountain terrain.",
                    2024, "Petrol", "30 kmpl", 4.8, 42,
                    "Dual Channel ABS, Touring Panniers, Free DOT Helmet, Offroad Guard");

            createBike(owner1.getId(), "KTM", "Duke 390", "Sport", 399, "MH-02-DK-3900",
                    1800.0, 3500.0, "Bandra West, Linking Road", "Mumbai",
                    "https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?auto=format&fit=crop&w=800&q=80",
                    "The corner rocket. 45 horsepower with supermoto ABS, launch control and TFT display.",
                    2023, "Petrol", "28 kmpl", 4.9, 29,
                    "Quickshifter+, Ride Modes, Full Face Helmet, WP Apex Suspension");

            createBike(owner1.getId(), "Harley-Davidson", "X440", "Cruiser", 440, "MH-01-HD-8899",
                    2200.0, 4500.0, "Lower Parel", "Mumbai",
                    "https://images.unsplash.com/photo-1609630875171-b1321377ee65?auto=format&fit=crop&w=800&q=80",
                    "American pedigree meets Indian roads. Deep exhaust growl with wide handlebar comfort.",
                    2024, "Petrol", "32 kmpl", 4.9, 19,
                    "Bluetooth Navigation, Dual ABS, Free Helmet, Roadside Assistance");

            createBike(owner1.getId(), "BMW", "G 310 GS", "Adventure", 313, "DL-04-BM-3101",
                    2400.0, 5000.0, "Connaught Place", "Delhi",
                    "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=800&q=80",
                    "German engineered dual-sport adventure bike. High ground clearance and plush ergonomics.",
                    2023, "Petrol", "31 kmpl", 4.8, 26,
                    "Ride-by-Wire, Luggage Rack, LED Headlamps, Roadside Assist");

            createBike(owner1.getId(), "Yamaha", "YZF R15 V4", "Sport", 155, "MH-12-YR-1540",
                    950.0, 1500.0, "FC Road, Shivajinagar", "Pune",
                    "https://images.unsplash.com/photo-1568772585472-886864459892?auto=format&fit=crop&w=800&q=80",
                    "Aerodynamic track-bred machine with Variable Valve Actuation and upside-down front forks.",
                    2024, "Petrol", "45 kmpl", 4.7, 34,
                    "VVA Engine, Traction Control, Dual ABS, Aerodynamic Visor");

            createBike(owner1.getId(), "Ather", "450X Gen 3", "Electric", 150, "KA-05-EV-4501",
                    650.0, 1200.0, "HSR Layout Sector 3", "Bangalore",
                    "https://images.unsplash.com/photo-1620802051782-725fa33db067?auto=format&fit=crop&w=800&q=80",
                    "Top-tier smart electric scooter. Instant warp-mode torque and Google Maps onboard.",
                    2024, "Electric", "110 km/charge", 4.9, 51,
                    "110km TrueRange, Fast Home Charger, Google Maps, Reverse Assist");

            createBike(owner2.getId(), "Vespa", "SXL 150", "Scooter", 149, "GA-03-VS-8080",
                    750.0, 1000.0, "Calangute Beach Road", "Goa",
                    "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80",
                    "Classic Italian styling with monocoque steel body. Perfect for sun, sand and coastal cruising.",
                    2023, "Petrol", "40 kmpl", 4.9, 64,
                    "Monocoque Steel Body, Premium Helmet, Underseat Storage, Beach Cruiser Style");

            createBike(owner2.getId(), "Honda", "CB350 H'ness", "Cruiser", 348, "GA-07-HN-3502",
                    1250.0, 2000.0, "Panjim City Center", "Goa",
                    "https://images.unsplash.com/photo-1558980664-769d59546b3d?auto=format&fit=crop&w=800&q=80",
                    "Refined retro roadster. Smooth 350cc engine with assist & slipper clutch and voice control.",
                    2024, "Petrol", "38 kmpl", 4.8, 22,
                    "Voice Control, Slip & Assist Clutch, Retro Styling, Helmet Included");

            createBike(owner1.getId(), "Kawasaki", "Ninja 300", "Sport", 296, "MH-14-KN-3009",
                    2600.0, 5000.0, "Koregaon Park", "Pune",
                    "https://images.unsplash.com/photo-1568772585408-39e144a2432a?auto=format&fit=crop&w=800&q=80",
                    "Parallel twin sports motorcycle. Unmatched high-RPM thrill with heat management system.",
                    2023, "Petrol", "25 kmpl", 4.9, 17,
                    "Twin Cylinder Engine, Assist Clutch, Racing Helmet, Track DNA");

            createBike(owner1.getId(), "TVS", "Apache RR 310", "Sport", 312, "DL-08-AP-3105",
                    1450.0, 2500.0, "South Extension", "Delhi",
                    "https://images.unsplash.com/photo-1558981408-db0ecd8a1ee4?auto=format&fit=crop&w=800&q=80",
                    "Co-developed with BMW Motorrad. Bi-LED projector lamps and dynamic riding telemetry.",
                    2024, "Petrol", "30 kmpl", 4.7, 21,
                    "Bi-LED Projector, Michelin Tires, Track Telemetry, ABS");

            System.out.println(">>> 11 premium bikes seeded across Bangalore, Mumbai, Delhi, Goa, and Pune!");
        }

        // 6. Seed sample booking & notifications for customer if none exist
        if (bookingRepo.count() == 0 && customer != null && owner1 != null) {
            Bike b1 = bikeRepo.findAll().stream().filter(b -> "Classic 350".equals(b.getModel())).findFirst().orElse(null);
            if (b1 != null) {
                Booking bk1 = new Booking();
                bk1.setBookingRef("BK-2026-104921");
                bk1.setUserId(customer.getId());
                bk1.setBikeId(b1.getId());
                bk1.setOwnerId(owner1.getId());
                bk1.setCustomerName(customer.getName());
                bk1.setCustomerEmail(customer.getEmail());
                bk1.setCustomerPhone(customer.getPhone());
                bk1.setBikeName(b1.getBrand() + " " + b1.getModel());
                bk1.setStartDate(LocalDate.now().minusDays(5));
                bk1.setEndDate(LocalDate.now().minusDays(2));
                bk1.setDays(3);
                bk1.setDailyRate(b1.getDailyRate());
                bk1.setSecurityDeposit(b1.getSecurityDeposit());
                bk1.setTotalPrice(3 * b1.getDailyRate() + b1.getSecurityDeposit());
                bk1.setPickupLocation(b1.getLocation() + ", " + b1.getCity());
                bk1.setNotes("Self-pickup at station");
                bk1.setBookingStatus("COMPLETED");
                bk1.setPaymentStatus("PAID");
                bk1.setPaymentMethod("ONLINE_UPI");
                bookingRepo.save(bk1);

                Booking bk2 = new Booking();
                bk2.setBookingRef("BK-2026-928104");
                bk2.setUserId(customer.getId());
                bk2.setBikeId(b1.getId());
                bk2.setOwnerId(owner1.getId());
                bk2.setCustomerName(customer.getName());
                bk2.setCustomerEmail(customer.getEmail());
                bk2.setCustomerPhone(customer.getPhone());
                bk2.setBikeName(b1.getBrand() + " " + b1.getModel());
                bk2.setStartDate(LocalDate.now().plusDays(2));
                bk2.setEndDate(LocalDate.now().plusDays(5));
                bk2.setDays(3);
                bk2.setDailyRate(b1.getDailyRate());
                bk2.setSecurityDeposit(b1.getSecurityDeposit());
                bk2.setTotalPrice(3 * b1.getDailyRate() + b1.getSecurityDeposit());
                bk2.setPickupLocation(b1.getLocation() + ", " + b1.getCity());
                bk2.setNotes("Please provide two helmets if possible");
                bk2.setBookingStatus("APPROVED");
                bk2.setPaymentStatus("PAID");
                bk2.setPaymentMethod("CARD");
                bookingRepo.save(bk2);
            }

            // Seed notifications
            Notification n1 = new Notification();
            n1.setUserId(customer.getId());
            n1.setMessage("Booking APPROVED for Royal Enfield Classic 350 (BK-2026-928104)");
            n1.setDetails("Pickup at Koramangala 5th Block, Bangalore. Please bring original Driving License and wear shoes.");
            n1.setSeen(false);
            notificationRepo.save(n1);

            Notification n2 = new Notification();
            n2.setUserId(owner1.getId());
            n2.setMessage("Upcoming booking for Royal Enfield Classic 350");
            n2.setDetails("Customer Alex Sharma is scheduled for pickup in 2 days.");
            n2.setSeen(false);
            notificationRepo.save(n2);
        }
    }

    private void createBike(Long ownerId, String brand, String model, String category, int engineCc,
                            String regNumber, double dailyRate, double deposit, String location, String city,
                            String imageUrl, String description, int year, String fuelType, String mileage,
                            double rating, int reviewCount, String features) {
        Bike b = new Bike();
        b.setOwnerId(ownerId);
        b.setBrand(brand);
        b.setModel(model);
        b.setCategory(category);
        b.setEngineCc(engineCc);
        b.setRegistrationNumber(regNumber);
        b.setDailyRate(dailyRate);
        b.setSecurityDeposit(deposit);
        b.setLocation(location);
        b.setCity(city);
        b.setImageUrl(imageUrl);
        b.setDescription(description);
        b.setModelYear(year);
        b.setFuelType(fuelType);
        b.setMileage(mileage);
        b.setRating(rating);
        b.setReviewCount(reviewCount);
        b.setFeatures(features);
        b.setStatus("AVAILABLE");
        bikeRepo.save(b);
    }
}
