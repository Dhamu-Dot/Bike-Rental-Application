import React, { useEffect, useState } from "react";
import api from "../api.js";
import Navbar from "../components/Navbar.jsx";
import StatusChip from "../components/StatusChip.jsx";
import Icon from "../components/Icon.jsx";
import { useToast } from "../components/Toast.jsx";
import { formatDateTime, formatDate, money, roleLabel } from "../utils.js";

export default function AdminDashboard() {
  const [pending, setPending] = useState([]);
  const [users, setUsers] = useState([]);
  const [bikes, setBikes] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState(null);
  const [tab, setTab] = useState("requests");
  const [userSearch, setUserSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const { addToast } = useToast();

  const loadData = async () => {
    setLoading(true);
    try {
      const [pRes, uRes, bRes, sRes, bkRes] = await Promise.all([
        api.get("/admin/pending-owners"),
        api.get("/admin/users"),
        api.get("/admin/bikes"),
        api.get("/admin/stats"),
        api.get("/admin/bookings"),
      ]);
      setPending(pRes.data);
      setUsers(uRes.data);
      setBikes(bRes.data);
      setStats(sRes.data);
      setBookings(bkRes.data);
    } catch (e) {
      // error handling
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const approve = async (id, name) => {
    try {
      await api.post(`/admin/pending-owners/${id}/approve`);
      addToast(`Owner "${name}" approved successfully!`, "success");
      loadData();
    } catch (e) {
      addToast("Failed to approve owner.", "error");
    }
  };

  const reject = async (id, name) => {
    if (window.confirm(`Reject owner registration for "${name}"?`)) {
      try {
        await api.delete(`/admin/pending-owners/${id}/reject`);
        addToast(`Registration for "${name}" rejected.`, "info");
        loadData();
      } catch (e) {
        addToast("Failed to reject request.", "error");
      }
    }
  };

  const deleteUser = async (id, name) => {
    if (window.confirm(`Are you sure you want to permanently remove "${name}"? If they are a bike owner, their motorcycles and bookings will also be deleted.`)) {
      try {
        const res = await api.delete(`/admin/users/${id}`);
        addToast(res.data?.message || `User "${name}" removed.`, "info");
        loadData();
      } catch (e) {
        addToast(e.response?.data?.message || "Failed to remove user.", "error");
      }
    }
  };

  const deleteBike = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete motorcycle "${name}" from the fleet?`)) {
      try {
        const res = await api.delete(`/admin/bikes/${id}`);
        addToast(res.data?.message || `Motorcycle "${name}" removed.`, "info");
        loadData();
      } catch (e) {
        addToast(e.response?.data?.message || "Failed to delete motorcycle.", "error");
      }
    }
  };

  const filteredUsers = users.filter((u) => {
    if (!userSearch) return true;
    const q = userSearch.toLowerCase();
    return (
      (u.name && u.name.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.role && u.role.toLowerCase().includes(q))
    );
  });

  const ownersCount = users.filter((u) => u.role === "ROLE_BIKE_OWNER").length;
  const customersCount = users.filter((u) => u.role === "ROLE_USER").length;

  return (
    <div>
      <Navbar activeSection="admin" />

      {/* Subnav Navigation */}
      <nav className="subnav" aria-label="Admin Sections">
        <div className="subnav-in">
          <button
            className={`tab ${tab === "requests" ? "active" : ""}`}
            onClick={() => setTab("requests")}
          >
            <Icon name="clock" size={16} />
            <span style={{ marginLeft: 6 }}>Owner Applications</span>
            {pending.length > 0 && <span className="count">{pending.length}</span>}
          </button>
          <button
            className={`tab ${tab === "users" ? "active" : ""}`}
            onClick={() => setTab("users")}
          >
            <Icon name="user" size={16} />
            <span style={{ marginLeft: 6 }}>Users Directory ({users.length})</span>
          </button>
          <button
            className={`tab ${tab === "bikes" ? "active" : ""}`}
            onClick={() => setTab("bikes")}
          >
            <Icon name="bike" size={16} />
            <span style={{ marginLeft: 6 }}>Platform Fleet ({bikes.length})</span>
          </button>
          <button
            className={`tab ${tab === "bookings" ? "active" : ""}`}
            onClick={() => setTab("bookings")}
          >
            <Icon name="calendar" size={16} />
            <span style={{ marginLeft: 6 }}>All Bookings ({bookings.length})</span>
          </button>
        </div>
      </nav>

      <div className="container page">
        {/* Platform KPI Grid */}
        <div className="stats">
          <div className="stat-card">
            <div className="stat-icon">
              <Icon name="clock" size={24} />
            </div>
            <div className="stat-content">
              <b>{pending.length}</b>
              <span>Pending Approvals</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon green">
              <Icon name="shield" size={24} />
            </div>
            <div className="stat-content">
              <b>{ownersCount}</b>
              <span>Verified Fleet Owners</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon blue">
              <Icon name="bike" size={24} />
            </div>
            <div className="stat-content">
              <b>{bikes.length}</b>
              <span>Active Fleet Bikes</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <Icon name="credit-card" size={24} />
            </div>
            <div className="stat-content">
              <b>{money(stats?.totalRevenue || 0)}</b>
              <span>Platform Volume</span>
            </div>
          </div>
        </div>

        {/* Tab 1: Owner Applications */}
        {tab === "requests" && (
          <div className="panel">
            <h3>Bike Owner Verification Requests</h3>
            {pending.length === 0 ? (
              <div className="empty">
                <Icon name="check" size={48} style={{ color: "var(--success)", marginBottom: 12 }} />
                <b>All Caught Up!</b>
                <p>There are no pending bike owner registration requests requiring approval.</p>
              </div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Applicant Name</th>
                      <th>Email Address</th>
                      <th>Contact Phone</th>
                      <th>City</th>
                      <th>Application Date</th>
                      <th>Decision</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pending.map((p) => (
                      <tr key={p.id}>
                        <td>
                          <b>{p.name}</b>
                        </td>
                        <td>{p.email}</td>
                        <td>{p.phone || "—"}</td>
                        <td>{p.city || "Bangalore"}</td>
                        <td>{formatDateTime(p.requestedAt)}</td>
                        <td>
                          <div className="actions">
                            <button
                              className="btn-primary small"
                              onClick={() => approve(p.id, p.name)}
                            >
                              Approve
                            </button>
                            <button
                              className="btn-danger small"
                              onClick={() => reject(p.id, p.name)}
                            >
                              Reject
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
        )}

        {/* Tab 2: User Directory */}
        {tab === "users" && (
          <div className="panel">
            <div className="page-head" style={{ marginBottom: 16 }}>
              <div>
                <h3>Registered User Directory</h3>
                <p>{customersCount} Customers • {ownersCount} Fleet Owners</p>
              </div>
              <div style={{ maxWidth: 300, width: "100%" }}>
                <input
                  type="text"
                  placeholder="Filter users by name or email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>User ID</th>
                    <th>Name</th>
                    <th>Email Address</th>
                    <th>Phone</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr key={u.id}>
                      <td>#{u.id}</td>
                      <td>
                        <b>{u.name}</b>
                      </td>
                      <td>{u.email}</td>
                      <td>{u.phone || "—"}</td>
                      <td>
                        <span className="spec-pill">{roleLabel[u.role] || u.role}</span>
                      </td>
                      <td>
                        <span className={`chip ${u.status === "GRANTED" ? "chip-ok" : "chip-wait"}`}>
                          {u.status === "GRANTED" ? "Active" : u.status}
                        </span>
                      </td>
                      <td>
                        {u.role !== "ROLE_ADMIN" ? (
                          <button
                            className="btn-danger small"
                            onClick={() => deleteUser(u.id, u.name)}
                            title={`Remove ${u.name}`}
                          >
                            Remove
                          </button>
                        ) : (
                          <span style={{ fontSize: 12, color: "var(--muted)" }}>Admin</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Platform Fleet */}
        {tab === "bikes" && (
          <div className="panel">
            <h3>Complete Platform Fleet</h3>
            {bikes.length === 0 ? (
              <div className="empty">
                <b>No motorcycles registered</b>
              </div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th style={{ width: 70 }}>Photo</th>
                      <th>Owner ID</th>
                      <th>Motorcycle</th>
                      <th>Registration</th>
                      <th>Location / City</th>
                      <th>Daily Rate</th>
                      <th>Status</th>
                      <th>Action</th>
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
                        <td>Owner #{b.ownerId}</td>
                        <td>
                          <b>{b.brand} {b.model}</b>
                          <small style={{ color: "var(--muted)" }}>{b.category} • {b.engineCc} cc</small>
                        </td>
                        <td>
                          <span className="plate">{b.registrationNumber}</span>
                        </td>
                        <td>
                          {b.location}
                          <small style={{ color: "var(--muted)" }}>{b.city}</small>
                        </td>
                        <td>
                          <b>{money(b.dailyRate)}</b>
                        </td>
                        <td>
                          <span className={`chip ${b.status === "AVAILABLE" ? "chip-ok" : "chip-wait"}`}>
                            {b.status === "AVAILABLE" ? "Available" : "Maintenance"}
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn-danger small"
                            onClick={() => deleteBike(b.id, `${b.brand} ${b.model}`)}
                            title="Delete motorcycle"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: All Platform Bookings */}
        {tab === "bookings" && (
          <div className="panel">
            <h3>Platform All-Time Bookings</h3>
            {bookings.length === 0 ? (
              <div className="empty">
                <b>No bookings recorded yet</b>
              </div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Ref & Bike</th>
                      <th>Rider Name</th>
                      <th>Rental Window</th>
                      <th>Days</th>
                      <th>Total Value</th>
                      <th>Payment</th>
                      <th>Status</th>
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
                        </td>
                        <td>
                          {formatDate(b.startDate)} to {formatDate(b.endDate)}
                        </td>
                        <td>{b.days} d</td>
                        <td>
                          <b>{money(b.totalPrice)}</b>
                        </td>
                        <td>
                          <span
                            className="chip"
                            style={{
                              background: b.paymentStatus === "PAID" ? "#ecfdf5" : "#fffbeb",
                              color: b.paymentStatus === "PAID" ? "#065f46" : "#92400e",
                            }}
                          >
                            {b.paymentStatus || "UNPAID"}
                          </span>
                        </td>
                        <td>
                          <StatusChip status={b.bookingStatus} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
