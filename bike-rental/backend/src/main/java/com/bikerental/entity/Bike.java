package com.bikerental.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "bikes")
public class Bike {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long ownerId;            // id of the bike owner (users table)
    private String brand;
    private String model;
    private String category = "Cruiser"; // Cruiser, Sport, Adventure, Scooter, Electric, Commuter
    private Integer engineCc;
    private String registrationNumber;
    private Double dailyRate;
    private Double securityDeposit = 0.0;   // refundable deposit added to every booking
    private String location;        // pickup / return branch address
    private String city = "Bangalore";
    private String imageUrl;
    
    @Column(length = 1000)
    private String description;
    private Integer modelYear = 2024;
    private String fuelType = "Petrol";     // Petrol, Electric
    private String mileage = "35 kmpl";
    private Double rating = 4.8;
    private Integer reviewCount = 18;
    private String features = "Helmet Included, ABS, Mobile Holder, USB Charger";
    
    private String status = "AVAILABLE";   // AVAILABLE or MAINTENANCE

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getOwnerId() { return ownerId; }
    public void setOwnerId(Long ownerId) { this.ownerId = ownerId; }
    public String getBrand() { return brand; }
    public void setBrand(String brand) { this.brand = brand; }
    public String getModel() { return model; }
    public void setModel(String model) { this.model = model; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public Integer getEngineCc() { return engineCc; }
    public void setEngineCc(Integer engineCc) { this.engineCc = engineCc; }
    public String getRegistrationNumber() { return registrationNumber; }
    public void setRegistrationNumber(String registrationNumber) { this.registrationNumber = registrationNumber; }
    public Double getDailyRate() { return dailyRate; }
    public void setDailyRate(Double dailyRate) { this.dailyRate = dailyRate; }
    public Double getSecurityDeposit() { return securityDeposit; }
    public void setSecurityDeposit(Double securityDeposit) { this.securityDeposit = securityDeposit; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Integer getModelYear() { return modelYear; }
    public void setModelYear(Integer modelYear) { this.modelYear = modelYear; }
    public String getFuelType() { return fuelType; }
    public void setFuelType(String fuelType) { this.fuelType = fuelType; }
    public String getMileage() { return mileage; }
    public void setMileage(String mileage) { this.mileage = mileage; }
    public Double getRating() { return rating; }
    public void setRating(Double rating) { this.rating = rating; }
    public Integer getReviewCount() { return reviewCount; }
    public void setReviewCount(Integer reviewCount) { this.reviewCount = reviewCount; }
    public String getFeatures() { return features; }
    public void setFeatures(String features) { this.features = features; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
