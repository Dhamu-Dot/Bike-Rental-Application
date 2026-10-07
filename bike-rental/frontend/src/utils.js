// Small helpers shared across components

export const statusLabel = {
  PENDING_OWNER_APPROVAL: "Waiting for Owner",
  APPROVED: "Approved & Confirmed",
  REJECTED: "Request Declined",
  CANCELLED: "Cancelled by User",
  COMPLETED: "Trip Completed",
};

export const statusClass = {
  PENDING_OWNER_APPROVAL: "chip-wait",
  APPROVED: "chip-ok",
  REJECTED: "chip-bad",
  CANCELLED: "chip-neutral",
  COMPLETED: "chip-done",
};

export const roleLabel = {
  ROLE_ADMIN: "Super Admin",
  ROLE_BIKE_OWNER: "Fleet Owner",
  ROLE_USER: "Customer",
};

export const categoriesList = [
  { id: "all", label: "All Rides", icon: "🏍️" },
  { id: "Cruiser", label: "Cruisers", icon: "🛣️" },
  { id: "Sport", label: "Sports", icon: "🏁" },
  { id: "Adventure", label: "Adventure", icon: "🏔️" },
  { id: "Electric", label: "Electric EV", icon: "⚡" },
  { id: "Scooter", label: "Scooters", icon: "🛵" },
];

export const citiesList = [
  "All Cities",
  "Bangalore",
  "Mumbai",
  "Goa",
  "Delhi",
  "Pune",
];

// Pre-configured popular bike templates for Owner "Quick Add"
export const bikePresets = [
  {
    name: "Royal Enfield Classic 350",
    brand: "Royal Enfield",
    model: "Classic 350",
    category: "Cruiser",
    engineCc: 349,
    dailyRate: 1100,
    securityDeposit: 2000,
    city: "Bangalore",
    location: "Koramangala 5th Block",
    fuelType: "Petrol",
    mileage: "36 kmpl",
    modelYear: 2024,
    imageUrl: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80",
    features: "Helmet Included, Dual ABS, Mobile Mount, USB Charger",
    description: "Iconic cruiser with timeless thump. Perfect for city cruising and long weekend highways.",
  },
  {
    name: "Royal Enfield Himalayan 450",
    brand: "Royal Enfield",
    model: "Himalayan 450",
    category: "Adventure",
    engineCc: 452,
    dailyRate: 1650,
    securityDeposit: 3000,
    city: "Bangalore",
    location: "Indiranagar 100ft Road",
    fuelType: "Petrol",
    mileage: "30 kmpl",
    modelYear: 2024,
    imageUrl: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=800&q=80",
    features: "Dual Channel ABS, Touring Panniers, Free DOT Helmet, Offroad Guard",
    description: "Sherpa 450 engine, long-travel suspension, and navigation tripper. Built for mountain terrain.",
  },
  {
    name: "KTM Duke 390",
    brand: "KTM",
    model: "Duke 390",
    category: "Sport",
    engineCc: 399,
    dailyRate: 1800,
    securityDeposit: 3500,
    city: "Mumbai",
    location: "Bandra West, Linking Road",
    fuelType: "Petrol",
    mileage: "28 kmpl",
    modelYear: 2023,
    imageUrl: "https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?auto=format&fit=crop&w=800&q=80",
    features: "Quickshifter+, Ride Modes, Full Face Helmet, WP Apex Suspension",
    description: "The corner rocket. 45 horsepower with supermoto ABS, launch control and TFT display.",
  },
  {
    name: "Ather 450X Gen 3",
    brand: "Ather",
    model: "450X Gen 3",
    category: "Electric",
    engineCc: 150,
    dailyRate: 650,
    securityDeposit: 1200,
    city: "Bangalore",
    location: "HSR Layout Sector 3",
    fuelType: "Electric",
    mileage: "110 km/charge",
    modelYear: 2024,
    imageUrl: "https://images.unsplash.com/photo-1620802051782-725fa33db067?auto=format&fit=crop&w=800&q=80",
    features: "110km TrueRange, Fast Home Charger, Google Maps, Reverse Assist",
    description: "Top-tier smart electric scooter. Instant warp-mode torque and Google Maps onboard.",
  },
  {
    name: "Vespa SXL 150",
    brand: "Vespa",
    model: "SXL 150",
    category: "Scooter",
    engineCc: 149,
    dailyRate: 750,
    securityDeposit: 1000,
    city: "Goa",
    location: "Calangute Beach Road",
    fuelType: "Petrol",
    mileage: "40 kmpl",
    modelYear: 2023,
    imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80",
    features: "Monocoque Steel Body, Premium Helmet, Underseat Storage, Beach Cruiser Style",
    description: "Classic Italian styling with monocoque steel body. Perfect for coastal cruising.",
  },
];

// "2026-11-12" -> "12 Nov 2026"
export function formatDate(s) {
  if (!s) return "";
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(s) {
  if (!s) return "";
  return new Date(s).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

// 1500 -> "₹1,500"
export function money(n) {
  return "₹" + Number(n || 0).toLocaleString("en-IN");
}

// today as YYYY-MM-DD (local time)
export function todayISO() {
  return new Date().toLocaleDateString("en-CA");
}

// return YYYY-MM-DD for date + N days
export function addDaysISO(baseDateStr, days) {
  const d = baseDateStr ? new Date(baseDateStr) : new Date();
  d.setDate(d.getDate() + days);
  return d.toLocaleDateString("en-CA");
}

// number of days between two YYYY-MM-DD strings
export function daysBetween(start, end) {
  if (!start || !end) return 0;
  return Math.round((new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24));
}
