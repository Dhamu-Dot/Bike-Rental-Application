import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api.js";
import Icon from "./Icon.jsx";
import { useToast } from "./Toast.jsx";
import { daysBetween, money, todayISO, addDaysISO } from "../utils.js";

export default function BookingModal({
  bike,
  startDate,
  endDate,
  canBook,
  onClose,
  onBooked,
  onViewBookings,
}) {
  const role = localStorage.getItem("role");
  const today = todayISO();
  const [start, setStart] = useState(startDate || today);
  const [end, setEnd] = useState(endDate || addDaysISO(startDate || today, 1));
  const [pickup, setPickup] = useState(
    bike.location
      ? `${bike.location}, ${bike.city || ""}`
      : bike.city || ""
  );
  const [phone, setPhone] = useState(localStorage.getItem("phone") || "");
  const [notes, setNotes] = useState("");
  const [paymentType, setPaymentType] = useState("ADVANCE");
  const [paymentMethod, setPaymentMethod] = useState("ONLINE_UPI");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [bookedData, setBookedData] = useState(null);

  const { addToast } = useToast();

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const days = daysBetween(start, end);
  const rent = days > 0 ? (bike.dailyRate || 0) * days : 0;
  const deposit = bike.securityDeposit || 0;
  const total = days > 0 ? rent + deposit : 0;
  const advanceAmount = Math.round(total * 0.3);
  const balanceAmount = total - advanceAmount;

  const submit = async (e) => {
    e.preventDefault();
    if (days <= 0) {
      setError("Please select a return date after the pickup date.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/user/bookings", {
        bikeId: bike.id,
        startDate: start,
        endDate: end,
        pickupLocation: pickup,
        customerPhone: phone,
        notes,
        paymentMethod,
        paymentType,
        advanceAmount,
      });

      setBookedData(res.data);
      addToast(`Booking request sent! Reference: ${res.data.bookingRef}`, "success");
      if (onBooked) onBooked();
    } catch (err) {
      setError(err.response?.data?.message || "Booking submission failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 640 }}
      >
        <button className="modal-close" onClick={onClose} aria-label="Close">
          <Icon name="x" size={16} />
        </button>

        {/* Left Side: Summary of Bike */}
        <div className="modal-media">
          <div className="media">
            {bike.imageUrl ? (
              <img src={bike.imageUrl} alt={`${bike.brand} ${bike.model}`} />
            ) : (
              <div className="ph">{(bike.brand || "?")[0]}</div>
            )}
          </div>

          <div className="modal-specs">
            <span className="category-tag">{bike.category || "Cruiser"}</span>
            <h2 style={{ marginTop: 6 }}>
              {bike.brand} {bike.model}
            </h2>
            <div style={{ fontSize: 13, color: "var(--muted)", margin: "4px 0 10px" }}>
              {bike.engineCc} cc • {bike.city || "Available locally"}
            </div>

            <dl className="specs">
              <div className="spec-item">
                <dt>Daily Rate</dt>
                <dd>{money(bike.dailyRate)}</dd>
              </div>
              <div className="spec-item">
                <dt>Security Deposit</dt>
                <dd>{money(deposit)}</dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Right Side: Simple Booking Form */}
        <div className="modal-body">
          {bookedData ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div className="notice success">
                <Icon name="check" size={18} />
                <div>
                  <b>Booking Sent!</b>
                  <div style={{ fontSize: 12.5, marginTop: 2 }}>
                    Ref: <strong>{bookedData.bookingRef}</strong>
                  </div>
                </div>
              </div>

              <div className="voucher-card">
                <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 13 }}>
                  <div>
                    <span style={{ color: "var(--muted)" }}>Duration: </span>
                    <b>
                      {bookedData.days} days ({bookedData.startDate} to {bookedData.endDate})
                    </b>
                  </div>
                  <div>
                    <span style={{ color: "var(--muted)" }}>Total Price: </span>
                    <b>{money(bookedData.totalPrice)}</b>
                  </div>
                  <div>
                    <span style={{ color: "var(--muted)" }}>Payment: </span>
                    <b>{bookedData.paymentType === "ADVANCE" ? `Advance (${money(bookedData.advanceAmount)})` : `Full (${money(bookedData.totalPrice)})`}</b>
                  </div>
                </div>
              </div>

              <p style={{ fontSize: 12.5, color: "var(--muted)" }}>
                The bike owner will review your request. You can track this in <strong>My Bookings</strong>.
              </p>

              <button
                className="btn-primary block"
                onClick={() => {
                  onClose();
                  if (onViewBookings) onViewBookings();
                }}
              >
                View My Bookings
              </button>
            </div>
          ) : canBook ? (
            <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <h3 style={{ fontSize: 15 }}>Book This Bike</h3>

              <div className="date-pair">
                <div className="field">
                  <label htmlFor="modal-start">Pickup Date</label>
                  <input
                    id="modal-start"
                    type="date"
                    min={today}
                    value={start}
                    onChange={(e) => setStart(e.target.value)}
                    required
                  />
                </div>
                <div className="field">
                  <label htmlFor="modal-end">Return Date</label>
                  <input
                    id="modal-end"
                    type="date"
                    min={start || today}
                    value={end}
                    onChange={(e) => setEnd(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="field">
                <label htmlFor="modal-pickup">Pickup Location</label>
                <input
                  id="modal-pickup"
                  type="text"
                  value={pickup}
                  onChange={(e) => setPickup(e.target.value)}
                  placeholder="e.g. Indiranagar, Bangalore"
                  required
                />
              </div>

              <div className="field">
                <label htmlFor="modal-phone">Phone Number</label>
                <input
                  id="modal-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  required
                />
              </div>

              {/* Simple Payment Plan */}
              <div className="field">
                <label>Payment Option</label>
                <div className="choices">
                  <label className={`choice ${paymentType === "ADVANCE" ? "active" : ""}`}>
                    <input
                      type="radio"
                      name="paymentType"
                      value="ADVANCE"
                      checked={paymentType === "ADVANCE"}
                      onChange={() => setPaymentType("ADVANCE")}
                    />
                    <b>Advance 30%</b>
                    <span>{money(advanceAmount)} now</span>
                  </label>

                  <label className={`choice ${paymentType === "FULL" ? "active" : ""}`}>
                    <input
                      type="radio"
                      name="paymentType"
                      value="FULL"
                      checked={paymentType === "FULL"}
                      onChange={() => setPaymentType("FULL")}
                    />
                    <b>Full Amount</b>
                    <span>{money(total)} now</span>
                  </label>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="breakdown">
                <div className="row">
                  <span>
                    Rent ({days > 0 ? days : 0} day{days === 1 ? "" : "s"} × {money(bike.dailyRate)})
                  </span>
                  <b>{money(rent)}</b>
                </div>
                <div className="row">
                  <span>Security Deposit</span>
                  <b>{money(deposit)}</b>
                </div>
                <div className="row total">
                  <span>Total</span>
                  <span>{money(total)}</span>
                </div>
                {paymentType === "ADVANCE" && (
                  <div className="row" style={{ color: "var(--primary)", fontWeight: 600 }}>
                    <span>Pay now:</span>
                    <span>{money(advanceAmount)}</span>
                  </div>
                )}
              </div>

              {error && <div className="notice error">{error}</div>}

              <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                <button
                  type="submit"
                  className="btn-primary block"
                  disabled={days <= 0 || loading}
                >
                  {loading ? "Sending..." : "Confirm Booking"}
                </button>
                <button type="button" className="btn-ghost" onClick={onClose}>
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div style={{ textAlign: "center", padding: "24px 10px" }}>
              <h3 style={{ marginBottom: 8 }}>Customer Account Required</h3>
              <p style={{ color: "var(--muted)", fontSize: 13, marginBottom: 16 }}>
                {role === "ROLE_BIKE_OWNER"
                  ? "You are logged in as a Fleet Owner. Sign in with a Customer account to rent bikes."
                  : role === "ROLE_ADMIN"
                  ? "You are logged in as Admin. Sign in with a Customer account to rent bikes."
                  : "Please sign in or create an account to book this motorcycle."}
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <Link to="/login" className="btn btn-primary block" onClick={onClose}>
                  Sign In to Book
                </Link>
                {!role && (
                  <Link to="/register" className="btn btn-ghost block" onClick={onClose}>
                    Create Account
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
