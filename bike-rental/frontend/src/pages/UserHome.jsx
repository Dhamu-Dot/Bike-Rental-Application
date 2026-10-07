import React, { useEffect, useState } from "react";
import api from "../api.js";
import Navbar from "../components/Navbar.jsx";
import Catalog from "../components/Catalog.jsx";
import StatusChip from "../components/StatusChip.jsx";
import Icon from "../components/Icon.jsx";
import { useToast } from "../components/Toast.jsx";
import { formatDate, money } from "../utils.js";

export default function UserHome() {
  const [tab, setTab] = useState("browse");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeVoucher, setActiveVoucher] = useState(null);

  // Payment Modal State
  const [payModalBooking, setPayModalBooking] = useState(null);
  const [payPlan, setPayPlan] = useState("ADVANCE"); // ADVANCE, FULL, BALANCE
  const [payMethod, setPayMethod] = useState("ONLINE_UPI");
  const [paying, setPaying] = useState(false);

  // Profile state
  const [profile, setProfile] = useState({
    name: localStorage.getItem("name") || "",
    email: localStorage.getItem("email") || "",
    phone: localStorage.getItem("phone") || "",
    city: localStorage.getItem("city") || "Bangalore",
  });
  const [profileSaved, setProfileSaved] = useState(false);

  const { addToast } = useToast();

  const loadBookings = async () => {
    setLoading(true);
    try {
      const res = await api.get("/user/bookings");
      setBookings(res.data);
    } catch (err) {
      // error handling
    } finally {
      setLoading(false);
    }
  };

  const loadProfile = async () => {
    try {
      const res = await api.get("/auth/me");
      setProfile({
        name: res.data.name || "",
        email: res.data.email || "",
        phone: res.data.phone || "",
        city: res.data.city || "Bangalore",
      });
      if (res.data.phone) localStorage.setItem("phone", res.data.phone);
    } catch (e) {}
  };

  useEffect(() => {
    loadBookings();
    loadProfile();
  }, [tab]);

  const cancel = async (id) => {
    if (window.confirm("Are you sure you want to cancel this booking request?")) {
      try {
        await api.put(`/user/bookings/${id}/cancel`);
        addToast("Booking request cancelled.", "info");
        loadBookings();
      } catch (err) {
        addToast(err.response?.data?.message || "Cancellation failed.", "error");
      }
    }
  };

  const handleOpenPayModal = (booking, defaultPlan = "ADVANCE") => {
    setPayModalBooking(booking);
    if (booking.paymentStatus === "ADVANCE_PAID") {
      setPayPlan("BALANCE");
    } else {
      setPayPlan(defaultPlan);
    }
  };

  const executePayment = async (e) => {
    if (e) e.preventDefault();
    if (!payModalBooking) return;
    setPaying(true);
    try {
      await api.put(`/user/bookings/${payModalBooking.id}/pay`, {
        paymentType: payPlan,
        paymentMethod: payMethod,
      });

      const total = payModalBooking.totalPrice || 0;
      const adv = payModalBooking.advanceAmount || Math.round(total * 0.3);
      const paidMsg =
        payPlan === "ADVANCE"
          ? `Advance payment of ${money(adv)} received! Balance payable at pickup.`
          : payPlan === "BALANCE"
          ? `Balance payment of ${money(payModalBooking.balanceAmount || total - adv)} received! Booking fully paid.`
          : `Full payment of ${money(total)} received! Ride is fully confirmed.`;

      addToast(paidMsg, "success");
      setPayModalBooking(null);
      loadBookings();
    } catch (err) {
      addToast(err.response?.data?.message || "Payment processing failed.", "error");
    } finally {
      setPaying(false);
    }
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    try {
      await api.put("/auth/profile", profile);
      localStorage.setItem("name", profile.name);
      localStorage.setItem("phone", profile.phone);
      localStorage.setItem("city", profile.city);
      setProfileSaved(true);
      addToast("Profile information saved successfully!", "success");
      setTimeout(() => setProfileSaved(false), 3000);
    } catch (err) {
      addToast("Failed to update profile.", "error");
    }
  };

  const waiting = bookings.filter((b) => b.bookingStatus === "PENDING_OWNER_APPROVAL").length;
  const approvedCount = bookings.filter((b) => b.bookingStatus === "APPROVED").length;
  const totalSpent = bookings
    .filter((b) => b.bookingStatus === "APPROVED" || b.bookingStatus === "COMPLETED")
    .reduce((sum, b) => sum + (b.totalPrice || 0), 0);

  return (
    <div>
      <Navbar activeSection="customer" />

      {/* Subnav Navigation */}
      <nav className="subnav" aria-label="Customer Sections">
        <div className="subnav-in">
          <button
            className={`tab ${tab === "browse" ? "active" : ""}`}
            onClick={() => setTab("browse")}
          >
            <Icon name="bike" size={16} />
            <span style={{ marginLeft: 6 }}>Browse Fleet</span>
          </button>
          <button
            className={`tab ${tab === "bookings" ? "active" : ""}`}
            onClick={() => setTab("bookings")}
          >
            <Icon name="calendar" size={16} />
            <span style={{ marginLeft: 6 }}>My Bookings</span>
            {waiting > 0 && <span className="count">{waiting}</span>}
          </button>
          <button
            className={`tab ${tab === "profile" ? "active" : ""}`}
            onClick={() => setTab("profile")}
          >
            <Icon name="user" size={16} />
            <span style={{ marginLeft: 6 }}>Profile & Preferences</span>
          </button>
        </div>
      </nav>

      {/* Browse Tab */}
      {tab === "browse" && <Catalog canBook={true} onViewBookings={() => setTab("bookings")} />}

      {/* My Bookings Tab */}
      {tab === "bookings" && (
        <div className="container page">
          <div className="page-head">
            <div>
              <h2>My Rental Bookings</h2>
              <p>Track your past and upcoming reservations in one place.</p>
            </div>
            <button className="btn-primary small" onClick={() => setTab("browse")}>
              <Icon name="plus" size={16} />
              <span>Book Another Ride</span>
            </button>
          </div>

          {/* Quick Stats Grid */}
          <div className="stats">
            <div className="stat-card">
              <div className="stat-icon">
                <Icon name="calendar" size={24} />
              </div>
              <div className="stat-content">
                <b>{bookings.length}</b>
                <span>Total Bookings</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon green">
                <Icon name="check" size={24} />
              </div>
              <div className="stat-content">
                <b>{approvedCount}</b>
                <span>Active & Confirmed</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <Icon name="clock" size={24} />
              </div>
              <div className="stat-content">
                <b>{waiting}</b>
                <span>Waiting for Approval</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon blue">
                <Icon name="credit-card" size={24} />
              </div>
              <div className="stat-content">
                <b>{money(totalSpent)}</b>
                <span>Total Spent</span>
              </div>
            </div>
          </div>

          {/* Bookings Table Panel */}
          <div className="panel">
            <h3>Booking History</h3>

            {loading ? (
              <p className="muted" style={{ padding: 24, textAlign: "center" }}>
                Loading your bookings...
              </p>
            ) : bookings.length === 0 ? (
              <div className="empty">
                <Icon name="calendar" size={48} style={{ color: "var(--muted)", marginBottom: 12 }} />
                <b>No bookings yet</b>
                <p>Find your favorite motorcycle, pick your dates, and send your first booking request.</p>
                <button className="btn-primary" onClick={() => setTab("browse")} style={{ marginTop: 14 }}>
                  Explore Fleet
                </button>
              </div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Ref & Bike</th>
                      <th>Rental Window</th>
                      <th>Days</th>
                      <th>Total & Deposit</th>
                      <th>Pickup Location</th>
                      <th>Payment</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((b) => (
                      <tr key={b.id}>
                        <td>
                          <b>{b.bikeName}</b>
                          <small style={{ color: "var(--muted)", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 12 }}>
                            {b.bookingRef || `#BK-${b.id}`}
                          </small>
                        </td>
                        <td>
                          <div>
                            {formatDate(b.startDate)} to {formatDate(b.endDate)}
                          </div>
                        </td>
                        <td>
                          <span style={{ fontWeight: 600 }}>{b.days} d</span>
                        </td>
                        <td>
                          <b style={{ color: "var(--ink-900)" }}>{money(b.totalPrice)}</b>
                          <small style={{ color: "var(--muted)" }}>Includes {money(b.securityDeposit)} dep</small>
                        </td>
                        <td style={{ maxWidth: 200, fontSize: 13 }}>
                          {b.pickupLocation}
                        </td>
                        <td>
                          {b.paymentStatus === "PAID" ? (
                            <span
                              className="chip"
                              style={{ background: "#ecfdf5", color: "#065f46", borderColor: "#a7f3d0" }}
                            >
                              PAID (FULL)
                            </span>
                          ) : b.paymentStatus === "ADVANCE_PAID" ? (
                            <div>
                              <span
                                className="chip"
                                style={{ background: "#eff6ff", color: "#1d4ed8", borderColor: "#bfdbfe" }}
                              >
                                ADVANCE PAID
                              </span>
                              <small style={{ color: "#d97706", display: "block", fontSize: 11, fontWeight: 700, marginTop: 2 }}>
                                Bal Due: {money(b.balanceAmount || 0)}
                              </small>
                            </div>
                          ) : (
                            <span
                              className="chip"
                              style={{ background: "#fffbeb", color: "#92400e", borderColor: "#fde68a" }}
                            >
                              UNPAID
                            </span>
                          )}
                        </td>
                        <td>
                          <StatusChip status={b.bookingStatus} />
                        </td>
                        <td>
                          <div className="actions">
                            <button
                              className="btn-ghost small"
                              onClick={() => setActiveVoucher(b)}
                              title="View Voucher"
                            >
                              Voucher
                            </button>

                            {b.bookingStatus === "PENDING_OWNER_APPROVAL" && (
                              <button
                                className="btn-danger small"
                                onClick={() => cancel(b.id)}
                              >
                                Cancel
                              </button>
                            )}

                            {b.bookingStatus === "APPROVED" && b.paymentStatus === "UNPAID" && (
                              <button
                                className="btn-primary small"
                                onClick={() => handleOpenPayModal(b, "ADVANCE")}
                              >
                                Pay (Advance/Full)
                              </button>
                            )}

                            {b.bookingStatus === "APPROVED" && b.paymentStatus === "ADVANCE_PAID" && (
                              <button
                                className="btn-primary small"
                                style={{ background: "#2563eb", borderColor: "#1d4ed8" }}
                                onClick={() => handleOpenPayModal(b, "BALANCE")}
                              >
                                Pay Balance
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Profile & Settings Tab */}
      {tab === "profile" && (
        <div className="container page">
          <div className="page-head">
            <div>
              <h2>Customer Profile & Preferences</h2>
              <p>Manage your contact phone number and home pickup city.</p>
            </div>
          </div>

          <div className="panel" style={{ maxWidth: 640 }}>
            <h3>Account Information</h3>
            <form onSubmit={saveProfile} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div className="field">
                <label>Full Name</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  required
                />
              </div>

              <div className="field">
                <label>Registered Email Address</label>
                <input type="email" value={profile.email} disabled />
                <small style={{ color: "var(--muted)" }}>Email is used for account logins and cannot be modified.</small>
              </div>

              <div className="field">
                <label>Contact Phone Number (Used for Pickup Coordination)</label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  required
                />
              </div>

              <div className="field">
                <label>Preferred Home City</label>
                <input
                  type="text"
                  placeholder="e.g. Bangalore, Mumbai"
                  value={profile.city}
                  onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                />
              </div>

              {profileSaved && (
                <div className="notice success">
                  <Icon name="check" size={16} /> Changes saved successfully!
                </div>
              )}

              <div style={{ marginTop: 10 }}>
                <button type="submit" className="btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Voucher Modal */}
      {activeVoucher && (
        <div className="overlay" onClick={() => setActiveVoucher(null)}>
          <div
            className="modal"
            style={{ maxWidth: 580, gridTemplateColumns: "1fr" }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={() => setActiveVoucher(null)}
              aria-label="Close"
            >
              <Icon name="x" size={18} />
            </button>

            <div style={{ padding: 28 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <div className="logo-badge" style={{ width: 32, height: 32 }}>
                  <Icon name="bike" size={20} />
                </div>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.6rem" }}>
                  MotoRental Voucher
                </h3>
              </div>

              <div className="voucher-card">
                <div className="voucher-header">
                  <div>
                    <span style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", fontWeight: 700 }}>
                      Booking Reference
                    </span>
                    <div className="voucher-ref">{activeVoucher.bookingRef || `#BK-${activeVoucher.id}`}</div>
                  </div>
                  <StatusChip status={activeVoucher.bookingStatus} />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, fontSize: 13.5 }}>
                  <div>
                    <span style={{ color: "var(--muted)", display: "block" }}>Rider</span>
                    <b>{activeVoucher.customerName}</b>
                    <small style={{ color: "var(--muted)", display: "block" }}>{activeVoucher.customerPhone || "Phone registered"}</small>
                  </div>

                  <div>
                    <span style={{ color: "var(--muted)", display: "block" }}>Motorcycle</span>
                    <b>{activeVoucher.bikeName}</b>
                  </div>

                  <div>
                    <span style={{ color: "var(--muted)", display: "block" }}>Rental Duration</span>
                    <b>{activeVoucher.days} Days</b>
                    <small style={{ color: "var(--muted)", display: "block" }}>
                      {formatDate(activeVoucher.startDate)} to {formatDate(activeVoucher.endDate)}
                    </small>
                  </div>

                  <div>
                    <span style={{ color: "var(--muted)", display: "block" }}>Pickup Location</span>
                    <b>{activeVoucher.pickupLocation}</b>
                  </div>

                  <div>
                    <span style={{ color: "var(--muted)", display: "block" }}>Payment Status</span>
                    <b>{activeVoucher.paymentStatus || "UNPAID"}</b>
                  </div>

                  <div>
                    <span style={{ color: "var(--muted)", display: "block" }}>Grand Total</span>
                    <b style={{ color: "var(--ink-900)", fontSize: 16 }}>
                      {money(activeVoucher.totalPrice)}
                    </b>
                  </div>

                  <div>
                    <span style={{ color: "var(--muted)", display: "block" }}>Paid Amount</span>
                    <b style={{ color: "#10b981", fontSize: 15 }}>
                      {money(activeVoucher.paidAmount || (activeVoucher.paymentStatus === "PAID" ? activeVoucher.totalPrice : 0))}
                    </b>
                  </div>

                  <div>
                    <span style={{ color: "var(--muted)", display: "block" }}>Balance at Pickup</span>
                    <b style={{ color: activeVoucher.paymentStatus === "PAID" ? "#10b981" : "#b45309", fontSize: 15 }}>
                      {money(activeVoucher.balanceAmount || 0)}
                    </b>
                  </div>
                </div>
              </div>

              <div style={{ background: "#f8fafc", padding: 12, borderRadius: "var(--radius-sm)", fontSize: 12.5, color: "var(--muted)" }}>
                <strong>Important Instructions:</strong>
                <ul style={{ paddingLeft: 18, marginTop: 4 }}>
                  <li>Carry original Driving License & Govt Photo ID during vehicle pickup.</li>
                  <li>Security deposit will be credited back within 24 hours of safe return.</li>
                  <li>In case of road emergency, call 24/7 helpline: +91 1800-200-MOTO.</li>
                </ul>
              </div>

              <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                <button
                  className="btn-primary block"
                  onClick={() => window.print()}
                >
                  Print Voucher
                </button>
                <button
                  className="btn-ghost block"
                  onClick={() => setActiveVoucher(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Split Modal */}
      {payModalBooking && (
        <div className="overlay" onClick={() => setPayModalBooking(null)}>
          <div
            className="modal"
            style={{ maxWidth: 540, gridTemplateColumns: "1fr" }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={() => setPayModalBooking(null)}
              aria-label="Close"
            >
              <Icon name="x" size={18} />
            </button>

            <div style={{ padding: 28 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <div className="logo-badge" style={{ width: 34, height: 34 }}>
                  <Icon name="credit-card" size={18} />
                </div>
                <div>
                  <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem" }}>
                    Select Payment Plan
                  </h3>
                  <p style={{ color: "var(--muted)", fontSize: 13 }}>
                    {payModalBooking.bikeName} • Ref: {payModalBooking.bookingRef}
                  </p>
                </div>
              </div>

              {payModalBooking.paymentStatus === "ADVANCE_PAID" ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div className="notice success">
                    <Icon name="check" size={18} />
                    <div>
                      <b>Advance Already Paid: {money(payModalBooking.paidAmount || (payModalBooking.totalPrice * 0.3))}</b>
                      <div style={{ fontSize: 13, marginTop: 2 }}>
                        You only need to clear the remaining balance.
                      </div>
                    </div>
                  </div>

                  <div className="pay-plan-card active">
                    <div className="pay-plan-radio">
                      <input type="radio" checked readOnly />
                      <b>Remaining Balance Payment</b>
                    </div>
                    <div className="pay-plan-price">
                      {money(payModalBooking.balanceAmount || (payModalBooking.totalPrice - (payModalBooking.paidAmount || 0)))}
                    </div>
                    <div className="pay-plan-desc">
                      Pay remaining balance to complete 100% of your booking payment.
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <label style={{ fontSize: 13, fontWeight: 700, color: "var(--ink-700)" }}>
                    Choose How You Want to Pay:
                  </label>

                  <div className="pay-plan-cards">
                    {/* Advance 30% Option */}
                    <div
                      className={`pay-plan-card ${payPlan === "ADVANCE" ? "active" : ""}`}
                      onClick={() => setPayPlan("ADVANCE")}
                      role="button"
                      tabIndex={0}
                    >
                      <div className="pay-plan-badge">Recommended</div>
                      <div className="pay-plan-radio">
                        <input
                          type="radio"
                          name="userPayPlan"
                          checked={payPlan === "ADVANCE"}
                          onChange={() => setPayPlan("ADVANCE")}
                        />
                        <b>Advance Amount (30%)</b>
                      </div>
                      <div className="pay-plan-price">
                        {money(payModalBooking.advanceAmount || Math.round(payModalBooking.totalPrice * 0.3))}
                      </div>
                      <div className="pay-plan-desc">
                        Pay advance now to confirm ride. Balance of{" "}
                        {money(
                          payModalBooking.totalPrice -
                            (payModalBooking.advanceAmount || Math.round(payModalBooking.totalPrice * 0.3))
                        )}{" "}
                        due at vehicle pickup.
                      </div>
                    </div>

                    {/* Full 100% Option */}
                    <div
                      className={`pay-plan-card ${payPlan === "FULL" ? "active" : ""}`}
                      onClick={() => setPayPlan("FULL")}
                      role="button"
                      tabIndex={0}
                    >
                      <div className="pay-plan-radio">
                        <input
                          type="radio"
                          name="userPayPlan"
                          checked={payPlan === "FULL"}
                          onChange={() => setPayPlan("FULL")}
                        />
                        <b>Full Amount (100%)</b>
                      </div>
                      <div className="pay-plan-price">
                        {money(payModalBooking.totalPrice)}
                      </div>
                      <div className="pay-plan-desc">
                        Pay complete total amount now. Zero balance remaining at vehicle pickup.
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Method Selector */}
              <div style={{ marginTop: 16 }}>
                <label style={{ fontSize: 13, fontWeight: 700, color: "var(--ink-700)", display: "block", marginBottom: 8 }}>
                  Select Payment Method:
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <label
                    style={{
                      border: `1.5px solid ${payMethod === "ONLINE_UPI" ? "var(--primary)" : "var(--border-card)"}`,
                      background: payMethod === "ONLINE_UPI" ? "var(--primary-light)" : "#fff",
                      borderRadius: "var(--radius-md)",
                      padding: "10px 14px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      fontSize: 13.5,
                      fontWeight: 600,
                    }}
                  >
                    <input
                      type="radio"
                      name="userPayMethod"
                      value="ONLINE_UPI"
                      checked={payMethod === "ONLINE_UPI"}
                      onChange={() => setPayMethod("ONLINE_UPI")}
                    />
                    <span>⚡ UPI / GPay / Card</span>
                  </label>

                  <label
                    style={{
                      border: `1.5px solid ${payMethod === "CARD" ? "var(--primary)" : "var(--border-card)"}`,
                      background: payMethod === "CARD" ? "var(--primary-light)" : "#fff",
                      borderRadius: "var(--radius-md)",
                      padding: "10px 14px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      fontSize: 13.5,
                      fontWeight: 600,
                    }}
                  >
                    <input
                      type="radio"
                      name="userPayMethod"
                      value="CARD"
                      checked={payMethod === "CARD"}
                      onChange={() => setPayMethod("CARD")}
                    />
                    <span>💳 Debit / Credit Card</span>
                  </label>
                </div>
              </div>

              {/* Summary of what will be charged */}
              <div style={{ marginTop: 18, background: "#f8fafc", padding: 14, borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 600 }}>
                  <span>Amount to Charge Now:</span>
                  <span style={{ color: "var(--primary-hover)", fontSize: 18, fontWeight: 800 }}>
                    {money(
                      payModalBooking.paymentStatus === "ADVANCE_PAID"
                        ? (payModalBooking.balanceAmount || (payModalBooking.totalPrice - (payModalBooking.paidAmount || 0)))
                        : payPlan === "ADVANCE"
                        ? (payModalBooking.advanceAmount || Math.round(payModalBooking.totalPrice * 0.3))
                        : payModalBooking.totalPrice
                    )}
                  </span>
                </div>
                {payModalBooking.paymentStatus !== "ADVANCE_PAID" && payPlan === "ADVANCE" && (
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, color: "var(--muted)", marginTop: 4 }}>
                    <span>Remaining Balance on Pickup:</span>
                    <span>
                      {money(
                        payModalBooking.totalPrice -
                          (payModalBooking.advanceAmount || Math.round(payModalBooking.totalPrice * 0.3))
                      )}
                    </span>
                  </div>
                )}
              </div>

              <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                <button
                  type="button"
                  className="btn-primary block"
                  onClick={executePayment}
                  disabled={paying}
                >
                  {paying ? "Processing..." : "Confirm & Pay Now"}
                </button>
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => setPayModalBooking(null)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
