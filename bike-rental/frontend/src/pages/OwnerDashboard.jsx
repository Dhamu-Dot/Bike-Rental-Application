import React, { useEffect, useState } from "react";
import api from "../api.js";
import Navbar from "../components/Navbar.jsx";
import StatusChip from "../components/StatusChip.jsx";
import Icon from "../components/Icon.jsx";
import { useToast } from "../components/Toast.jsx";
import { formatDate, money, bikePresets, categoriesList, citiesList } from "../utils.js";

const emptyForm = {
  brand: "",
  model: "",
  category: "Cruiser",
  engineCc: "",
  registrationNumber: "",
  dailyRate: "",
  securityDeposit: "",
  city: "Bangalore",
  location: "",
  imageUrl: "",
  description: "",
  modelYear: 2024,
  fuelType: "Petrol",
  mileage: "35 kmpl",
  features: "Helmet Included, ABS Brakes, Mobile Holder, USB Charger",
};

export default function OwnerDashboard() {
  const [bikes, setBikes] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [tab, setTab] = useState("requests");
  const [loading, setLoading] = useState(false);

  const { addToast } = useToast();

  const loadBikes = async () => {
    try {
      const res = await api.get("/owner/bikes");
      setBikes(res.data);
    } catch (e) {}
  };

  const loadBookings = async () => {
    try {
      const res = await api.get("/owner/bookings");
      setBookings(res.data);
    } catch (e) {}
  };

  const loadStats = async () => {
    try {
      const res = await api.get("/owner/stats");
      setStats(res.data);
    } catch (e) {}
  };

  useEffect(() => {
    loadBikes();
    loadBookings();
    loadStats();
    const timer = setInterval(() => {
      loadBookings();
      loadStats();
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const applyPreset = (preset) => {
    setForm({
      ...form,
      brand: preset.brand,
      model: preset.model,
      category: preset.category,
      engineCc: preset.engineCc,
      registrationNumber: `KA-0${Math.floor(Math.random() * 9 + 1)}-AB-${Math.floor(Math.random() * 8999 + 1000)}`,
      dailyRate: preset.dailyRate,
      securityDeposit: preset.securityDeposit,
      city: preset.city,
      location: preset.location,
      imageUrl: preset.imageUrl,
      description: preset.description,
      modelYear: preset.modelYear,
      fuelType: preset.fuelType,
      mileage: preset.mileage,
      features: preset.features,
    });
    addToast(`Template "${preset.name}" applied!`, "info");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingId) {
        await api.put(`/owner/bikes/${editingId}`, form);
        addToast("Motorcycle details updated!", "success");
      } else {
        await api.post("/owner/bikes", form);
        addToast("New motorcycle added to fleet!", "success");
      }
      closeForm();
      loadBikes();
      loadStats();
    } catch (err) {
      addToast(err.response?.data?.message || "Error saving motorcycle.", "error");
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const startEdit = (bike) => {
    setEditingId(bike.id);
    setForm({
      brand: bike.brand || "",
      model: bike.model || "",
      category: bike.category || "Cruiser",
      engineCc: bike.engineCc || "",
      registrationNumber: bike.registrationNumber || "",
      dailyRate: bike.dailyRate || "",
      securityDeposit: bike.securityDeposit || 0,
      city: bike.city || "Bangalore",
      location: bike.location || "",
      imageUrl: bike.imageUrl || "",
      description: bike.description || "",
      modelYear: bike.modelYear || 2024,
      fuelType: bike.fuelType || "Petrol",
      mileage: bike.mileage || "35 kmpl",
      features: bike.features || "",
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const deleteBike = async (id) => {
    if (window.confirm("Permanently delete this motorcycle from your fleet?")) {
      try {
        await api.delete(`/owner/bikes/${id}`);
        addToast("Motorcycle deleted from fleet.", "info");
        loadBikes();
        loadStats();
      } catch (err) {
        addToast("Error deleting bike.", "error");
      }
    }
  };

  const toggleMaintenance = async (id) => {
    try {
      await api.put(`/owner/bikes/${id}/maintenance`);
      addToast("Motorcycle status toggled.", "info");
      loadBikes();
      loadStats();
    } catch (err) {
      addToast("Failed to change status.", "error");
    }
  };

  const decide = async (id, action) => {
    try {
      await api.put(`/owner/bookings/${id}/${action}`);
      addToast(`Booking request ${action}ed.`, action === "approve" ? "success" : "info");
      loadBookings();
      loadStats();
    } catch (err) {
      addToast(err.response?.data?.message || `Failed to ${action} request.`, "error");
    }
  };

  const completeTrip = async (id) => {
    if (window.confirm("Confirm motorcycle return? This marks the trip as completed and notifies the customer.")) {
      try {
        await api.put(`/owner/bookings/${id}/complete`);
        addToast("Trip completed! Security deposit return initiated.", "success");
        loadBookings();
        loadStats();
      } catch (err) {
        addToast(err.response?.data?.message || "Failed to complete booking.", "error");
      }
    }
  };

  const pendingCount = bookings.filter((b) => b.bookingStatus === "PENDING_OWNER_APPROVAL").length;
  const approvedCount = bookings.filter((b) => b.bookingStatus === "APPROVED").length;
  const maintenanceCount = bikes.filter((b) => b.status === "MAINTENANCE").length;

  return (
    <div>
      <Navbar activeSection="owner" />

      {/* Subnav Navigation */}
      <nav className="subnav" aria-label="Owner Sections">
        <div className="subnav-in">
          <button
            className={`tab ${tab === "requests" ? "active" : ""}`}
            onClick={() => setTab("requests")}
          >
            <Icon name="calendar" size={16} />
            <span style={{ marginLeft: 6 }}>Booking Requests</span>
            {pendingCount > 0 && <span className="count">{pendingCount}</span>}
          </button>
          <button
            className={`tab ${tab === "bikes" ? "active" : ""}`}
            onClick={() => setTab("bikes")}
          >
            <Icon name="bike" size={16} />
            <span style={{ marginLeft: 6 }}>Fleet Inventory ({bikes.length})</span>
          </button>
        </div>
      </nav>

      <div className="container page">
        {/* KPI Summary Cards */}
        <div className="stats">
          <div className="stat-card">
            <div className="stat-icon">
              <Icon name="clock" size={24} />
            </div>
            <div className="stat-content">
              <b>{pendingCount}</b>
              <span>Pending Requests</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon green">
              <Icon name="check" size={24} />
            </div>
            <div className="stat-content">
              <b>{approvedCount}</b>
              <span>Active Approved</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon blue">
              <Icon name="bike" size={24} />
            </div>
            <div className="stat-content">
              <b>{bikes.length}</b>
              <span>Fleet Vehicles</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <Icon name="credit-card" size={24} />
            </div>
            <div className="stat-content">
              <b>{money(stats?.totalRevenue || 0)}</b>
              <span>Total Fleet Revenue</span>
            </div>
          </div>
        </div>

        {/* Tab 1: Booking Requests */}
        {tab === "requests" && (
          <div className="panel">
            <h3>Incoming Booking Requests</h3>

            {bookings.length === 0 ? (
              <div className="empty">
                <Icon name="calendar" size={48} style={{ color: "var(--muted)", marginBottom: 12 }} />
                <b>No requests right now</b>
                <p>When riders reserve any of your motorcycles, their requests will appear here instantly.</p>
              </div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Ref & Bike</th>
                      <th>Customer Details</th>
                      <th>Dates</th>
                      <th>Days</th>
                      <th>Total & Deposit</th>
                      <th>Pickup Location & Notes</th>
                      <th>Status</th>
                      <th>Action</th>
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
                          <b>{b.customerName}</b>
                          <small style={{ color: "var(--muted)" }}>{b.customerEmail}</small>
                          {b.customerPhone && (
                            <small style={{ color: "var(--primary-hover)", fontWeight: 600 }}>
                              {b.customerPhone}
                            </small>
                          )}
                        </td>
                        <td>
                          <div>
                            {formatDate(b.startDate)} to {formatDate(b.endDate)}
                          </div>
                        </td>
                        <td>
                          <b>{b.days} d</b>
                        </td>
                        <td>
                          <b style={{ color: "var(--ink-900)" }}>{money(b.totalPrice)}</b>
                          {b.paymentStatus === "ADVANCE_PAID" ? (
                            <small style={{ color: "#2563eb", fontWeight: 700, display: "block" }}>
                              Advance Paid ({money(b.paidAmount || (b.totalPrice * 0.3))})
                              <span style={{ color: "#d97706", display: "block" }}>Bal Due: {money(b.balanceAmount || 0)}</span>
                            </small>
                          ) : b.paymentStatus === "PAID" ? (
                            <small style={{ color: "#10b981", fontWeight: 700, display: "block" }}>
                              Fully Paid
                            </small>
                          ) : (
                            <small style={{ color: "var(--muted)", display: "block" }}>
                              Deposit: {money(b.securityDeposit)}
                            </small>
                          )}
                        </td>
                        <td style={{ maxWidth: 220, fontSize: 13 }}>
                          <div>{b.pickupLocation}</div>
                          {b.notes && (
                            <div style={{ color: "var(--muted)", fontStyle: "italic", marginTop: 2, fontSize: 12 }}>
                              "{b.notes}"
                            </div>
                          )}
                        </td>
                        <td>
                          <StatusChip status={b.bookingStatus} />
                        </td>
                        <td>
                          {b.bookingStatus === "PENDING_OWNER_APPROVAL" && (
                            <div className="actions">
                              <button
                                className="btn-primary small"
                                onClick={() => decide(b.id, "approve")}
                              >
                                Approve
                              </button>
                              <button
                                className="btn-danger small"
                                onClick={() => decide(b.id, "reject")}
                              >
                                Reject
                              </button>
                            </div>
                          )}
                          {b.bookingStatus === "APPROVED" && (
                            <button
                              className="btn-ghost small"
                              onClick={() => completeTrip(b.id)}
                              title="Mark bike returned by customer"
                            >
                              Mark Returned
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Fleet Inventory */}
        {tab === "bikes" && (
          <>
            {showForm && (
              <div className="panel" style={{ border: "2px solid var(--primary-border)" }}>
                <h3>{editingId ? "Edit Motorcycle Details" : "Add New Motorcycle to Fleet"}</h3>

                {/* Quick Presets for New Bikes */}
                {!editingId && (
                  <div style={{ background: "#f8fafc", padding: 14, borderRadius: "var(--radius-md)", marginBottom: 16 }}>
                    <small style={{ fontWeight: 700, textTransform: "uppercase", color: "var(--muted)", display: "block", marginBottom: 8 }}>
                      Quick Fill from Popular Motorcycle Templates:
                    </small>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {bikePresets.map((preset) => (
                        <button
                          key={preset.name}
                          type="button"
                          className="preset-chip"
                          onClick={() => applyPreset(preset)}
                        >
                          + {preset.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="form-grid">
                  <div className="field">
                    <label htmlFor="brand">Brand</label>
                    <input
                      id="brand"
                      name="brand"
                      type="text"
                      placeholder="Royal Enfield, KTM, BMW..."
                      value={form.brand}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="field">
                    <label htmlFor="model">Model</label>
                    <input
                      id="model"
                      name="model"
                      type="text"
                      placeholder="Classic 350, Himalayan, Duke 390..."
                      value={form.model}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="field">
                    <label htmlFor="category">Category</label>
                    <select
                      id="category"
                      name="category"
                      value={form.category}
                      onChange={handleChange}
                      required
                    >
                      <option value="Cruiser">Cruiser</option>
                      <option value="Sport">Sport</option>
                      <option value="Adventure">Adventure</option>
                      <option value="Electric">Electric EV</option>
                      <option value="Scooter">Scooter</option>
                      <option value="Commuter">Commuter</option>
                    </select>
                  </div>

                  <div className="field">
                    <label htmlFor="engineCc">Engine Capacity (cc)</label>
                    <input
                      id="engineCc"
                      name="engineCc"
                      type="number"
                      min="0"
                      placeholder="350"
                      value={form.engineCc}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="field">
                    <label htmlFor="registrationNumber">Registration Plate</label>
                    <input
                      id="registrationNumber"
                      name="registrationNumber"
                      type="text"
                      placeholder="KA-01-EQ-4421"
                      value={form.registrationNumber}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="field">
                    <label htmlFor="dailyRate">Daily Rate (₹)</label>
                    <input
                      id="dailyRate"
                      name="dailyRate"
                      type="number"
                      min="0"
                      placeholder="1200"
                      value={form.dailyRate}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="field">
                    <label htmlFor="securityDeposit">Security Deposit (₹)</label>
                    <input
                      id="securityDeposit"
                      name="securityDeposit"
                      type="number"
                      min="0"
                      placeholder="2000"
                      value={form.securityDeposit}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="field">
                    <label htmlFor="city">City</label>
                    <select
                      id="city"
                      name="city"
                      value={form.city}
                      onChange={handleChange}
                      required
                    >
                      {citiesList
                        .filter((c) => c !== "All Cities")
                        .map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div className="field full">
                    <label htmlFor="location">Station Pickup Address</label>
                    <input
                      id="location"
                      name="location"
                      type="text"
                      placeholder="e.g. Koramangala 5th Block, near Metro"
                      value={form.location}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="field full">
                    <label htmlFor="imageUrl">Photo URL</label>
                    <input
                      id="imageUrl"
                      name="imageUrl"
                      type="text"
                      placeholder="https://images.unsplash.com/..."
                      value={form.imageUrl}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="field full">
                    <label htmlFor="description">Short Description & Features</label>
                    <textarea
                      id="description"
                      name="description"
                      placeholder="Touring seat, luggage rack, dual channel ABS..."
                      value={form.description}
                      onChange={handleChange}
                      rows={2}
                    />
                  </div>

                  <div className="full actions" style={{ marginTop: 8 }}>
                    <button type="submit" className="btn-primary" disabled={loading}>
                      {loading ? "Saving..." : editingId ? "Save Changes" : "Publish Motorcycle to Fleet"}
                    </button>
                    <button type="button" className="btn-ghost" onClick={closeForm}>
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="panel">
              <div className="page-head" style={{ marginBottom: 16 }}>
                <div>
                  <h3>Fleet Inventory</h3>
                  <p>Manage your motorcycle listings, status, and rates.</p>
                </div>
                {!showForm && (
                  <button className="btn-primary small" onClick={openAdd}>
                    <Icon name="plus" size={16} />
                    <span>Add Motorcycle</span>
                  </button>
                )}
              </div>

              {bikes.length === 0 ? (
                <div className="empty">
                  <Icon name="bike" size={48} style={{ color: "var(--muted)", marginBottom: 12 }} />
                  <b>Your fleet is empty</b>
                  <p>Add your first motorcycle so riders in your city can book it.</p>
                  <button className="btn-primary" onClick={openAdd} style={{ marginTop: 14 }}>
                    Add Motorcycle
                  </button>
                </div>
              ) : (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th style={{ width: 70 }}>Photo</th>
                        <th>Motorcycle</th>
                        <th>Category</th>
                        <th>Registration</th>
                        <th>Daily Rate</th>
                        <th>Deposit</th>
                        <th>Location</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bikes.map((b) => (
                        <tr key={b.id}>
                          <td style={{ width: 70 }}>
                            {b.imageUrl ? (
                              <img
                                className="thumb"
                                src={b.imageUrl}
                                alt=""
                                style={{ width: 56, height: 40, objectFit: "cover", borderRadius: 6 }}
                              />
                            ) : (
                              <div className="thumb" style={{ width: 56, height: 40, borderRadius: 6 }} />
                            )}
                          </td>
                          <td>
                            <b>{b.brand} {b.model}</b>
                            <small style={{ color: "var(--muted)" }}>{b.engineCc} cc • {b.fuelType || "Petrol"}</small>
                          </td>
                          <td>
                            <span className="spec-pill">{b.category || "Cruiser"}</span>
                          </td>
                          <td>
                            <span className="plate">{b.registrationNumber}</span>
                          </td>
                          <td>
                            <b>{money(b.dailyRate)}</b>
                          </td>
                          <td>{money(b.securityDeposit)}</td>
                          <td>
                            <div>{b.location}</div>
                            <small style={{ color: "var(--muted)" }}>{b.city}</small>
                          </td>
                          <td>
                            <span className={`chip ${b.status === "AVAILABLE" ? "chip-ok" : "chip-wait"}`}>
                              {b.status === "AVAILABLE" ? "Available" : "Maintenance"}
                            </span>
                          </td>
                          <td>
                            <div className="actions">
                              <button className="btn-ghost small" onClick={() => startEdit(b)}>
                                Edit
                              </button>
                              <button className="btn-ghost small" onClick={() => toggleMaintenance(b.id)}>
                                {b.status === "MAINTENANCE" ? "Activate" : "Maintenance"}
                              </button>
                              <button className="btn-danger small" onClick={() => deleteBike(b.id)}>
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
