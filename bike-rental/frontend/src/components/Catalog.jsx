import React, { useEffect, useState } from "react";
import api from "../api.js";
import BookingModal from "./BookingModal.jsx";
import Icon from "./Icon.jsx";
import {
  money,
  todayISO,
  addDaysISO,
  categoriesList,
  citiesList,
} from "../utils.js";

export default function Catalog({ canBook, onViewBookings }) {
  const today = todayISO();
  const [bikes, setBikes] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [city, setCity] = useState("All Cities");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sortBy, setSortBy] = useState("recommended");
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const loadBikes = async () => {
    setError("");
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (category && category !== "all") params.category = category;
      if (city && city !== "All Cities") params.city = city;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (sortBy && sortBy !== "recommended") params.sortBy = sortBy;

      const res = await api.get("/bikes", { params });
      setBikes(res.data);
    } catch (err) {
      setBikes([]);
      setError(err.response?.data?.message || "Failed to load bike catalog.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBikes();
  }, [category, city, sortBy, startDate, endDate]);

  useEffect(() => {
    const handler = setTimeout(() => {
      loadBikes();
    }, 250);
    return () => clearTimeout(handler);
  }, [search]);

  const clearFilters = () => {
    setSearch("");
    setCategory("all");
    setCity("All Cities");
    setStartDate("");
    setEndDate("");
    setSortBy("recommended");
  };

  const hasActiveFilters = Boolean(
    search || startDate || endDate || category !== "all" || city !== "All Cities" || sortBy !== "recommended"
  );

  return (
    <>
      {/* Simple, Clean Header */}
      <section className="hero">
        <div className="container">
          <h1>Rent a Motorcycle</h1>
          <p>Book verified bikes from local owners. Simple, transparent, and hassle-free.</p>
        </div>
      </section>

      <div className="container">
        {/* Simple Search Bar */}
        <div className="search-widget">
          <div className="search-grid-clean">
            <div className="field">
              <label htmlFor="search-bike">Search</label>
              <input
                id="search-bike"
                type="text"
                placeholder="Model, brand, or area..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="field">
              <label htmlFor="search-city">City</label>
              <select
                id="search-city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              >
                {citiesList.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="search-start">Pickup Date</label>
              <input
                id="search-start"
                type="date"
                min={today}
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  if (endDate && e.target.value > endDate) {
                    setEndDate(addDaysISO(e.target.value, 1));
                  }
                }}
              />
            </div>

            <div className="field">
              <label htmlFor="search-end">Return Date</label>
              <input
                id="search-end"
                type="date"
                min={startDate || today}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            <div className="field">
              <label htmlFor="search-sort">Sort</label>
              <select id="search-sort" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="recommended">Featured</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>

            {hasActiveFilters && (
              <div className="field" style={{ display: "flex", justifyContent: "flex-end" }}>
                <button
                  className="btn-ghost"
                  onClick={clearFilters}
                  type="button"
                  style={{ width: "100%" }}
                >
                  Reset
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Clean Category Pills */}
        <div className="categories-bar">
          {categoriesList.map((cat) => (
            <button
              key={cat.id}
              className={`cat-pill ${category === cat.id ? "active" : ""}`}
              onClick={() => setCategory(cat.id)}
            >
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {error && <div className="notice error">{error}</div>}

        {/* Results Counter */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <span style={{ fontSize: 13, color: "var(--muted)", fontWeight: 500 }}>
            {loading ? "Loading motorcycles..." : `${bikes.length} bikes available`}
          </span>
        </div>

        {/* Empty State */}
        {bikes.length === 0 && !loading && !error && (
          <div className="empty">
            <Icon name="bike" size={40} style={{ color: "var(--muted-light)" }} />
            <b>No bikes found</b>
            <p>Try adjusting your search criteria or clearing filters.</p>
            <button className="btn-primary" onClick={clearFilters} style={{ marginTop: 12 }}>
              Reset Filters
            </button>
          </div>
        )}

        {/* Bike Cards Grid */}
        <div className="bike-grid">
          {bikes.map((b) => (
            <article className="bike-card" key={b.id}>
              <div className="media-wrap">
                {b.imageUrl ? (
                  <img src={b.imageUrl} alt={`${b.brand} ${b.model}`} loading="lazy" />
                ) : (
                  <div className="ph">{(b.brand || "?")[0]}</div>
                )}
                <div className="card-top-badges">
                  <span className="category-tag">{b.category || "Cruiser"}</span>
                  <span className="rating-badge">
                    <Icon name="star" size={12} /> {b.rating || "4.8"}
                  </span>
                </div>
              </div>

              <div className="bike-body">
                <div className="bike-title-row">
                  <div>
                    <span className="bike-brand">{b.brand}</span>
                    <h3>{b.model}</h3>
                  </div>
                  <span className="plate">{b.registrationNumber}</span>
                </div>

                <div className="bike-specs-pills">
                  <span className="spec-pill">{b.engineCc} cc</span>
                  <span className="spec-pill">{b.fuelType || "Petrol"}</span>
                  <span className="spec-pill">{b.city || "Available locally"}</span>
                </div>

                {b.location && (
                  <div className="bike-owner-location-box">
                    <Icon name="map-pin" size={13} style={{ color: "var(--muted)" }} />
                    <span className="owner-loc-address">
                      <b>{b.location}</b>
                    </span>
                  </div>
                )}
              </div>

              <div className="bike-foot">
                <div className="price-block">
                  <span className="daily">{money(b.dailyRate)}</span>
                  <small>/ day</small>
                </div>
                <button
                  className="btn-primary btn-sm"
                  onClick={() => setSelected(b)}
                >
                  Book Now
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Simple How It Works Section */}
      <section className="section-features">
        <div className="container">
          <div className="section-head">
            <h2>How It Works</h2>
            <p>Three simple steps to hit the road.</p>
          </div>

          <div className="timeline-grid">
            <div className="step-card">
              <div className="step-num">1</div>
              <h3>Choose a Bike</h3>
              <p>Browse our catalog and pick the motorcycle that fits your journey.</p>
            </div>
            <div className="step-card">
              <div className="step-num">2</div>
              <h3>Reserve Online</h3>
              <p>Select your dates and pickup point. Fast approval by the owner.</p>
            </div>
            <div className="step-card">
              <div className="step-num">3</div>
              <h3>Pick Up & Ride</h3>
              <p>Show your driving license, collect keys, and enjoy the ride.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Simple Footer */}
      <footer className="site-footer">
        <div className="container">
          <div className="footer-bottom">
            <span>© {new Date().getFullYear()} MotoRental. All rights reserved.</span>
            <div style={{ display: "flex", gap: 16 }}>
              <a href="/catalog" style={{ color: "var(--muted)", fontSize: 12 }}>Bikes</a>
              <a href="/login" style={{ color: "var(--muted)", fontSize: 12 }}>Log In</a>
              <a href="/register" style={{ color: "var(--muted)", fontSize: 12 }}>Sign Up</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Booking Modal */}
      {selected && (
        <BookingModal
          bike={selected}
          startDate={startDate}
          endDate={endDate}
          canBook={canBook}
          onClose={() => setSelected(null)}
          onBooked={loadBikes}
          onViewBookings={onViewBookings}
        />
      )}
    </>
  );
}
