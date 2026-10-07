import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api.js";
import AuthLayout from "../components/AuthLayout.jsx";
import Icon from "../components/Icon.jsx";
import { useToast } from "../components/Toast.jsx";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "USER",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { addToast } = useToast();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    if (token) {
      if (role === "ROLE_ADMIN") navigate("/admin", { replace: true });
      else if (role === "ROLE_BIKE_OWNER") navigate("/owner", { replace: true });
      else navigate("/home", { replace: true });
    }
  }, [navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/auth/register", form);
      setMessage(res.data.message);
      addToast(res.data.message, "success");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div style={{ textAlign: "center", marginBottom: 6 }}>
        <h2>Create Account</h2>
        <p style={{ color: "var(--muted)", fontSize: 13, marginTop: 4 }}>
          Join as a rider or apply to list your bikes.
        </p>
      </div>

      {message ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="notice success">
            <Icon name="check" size={18} />
            <div>
              <b>Registration Successful!</b>
              <div style={{ fontSize: 12.5, marginTop: 2 }}>{message}</div>
            </div>
          </div>
          <Link to="/login" className="btn-primary block">
            Sign In Now
          </Link>
        </div>
      ) : (
        <form onSubmit={handleRegister}>
          <div className="field">
            <label htmlFor="reg-name">Full Name</label>
            <input
              id="reg-name"
              name="name"
              type="text"
              autoComplete="name"
              placeholder="John Doe"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="reg-email">Email Address</label>
            <input
              id="reg-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="name@example.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="reg-phone">Phone Number</label>
            <input
              id="reg-phone"
              name="phone"
              type="tel"
              placeholder="+91 98765 43210"
              value={form.phone}
              onChange={handleChange}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="reg-password">Password</label>
            <div className="password-field">
              <input
                id="reg-password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                <Icon name={showPassword ? "eye-off" : "eye"} size={16} />
              </button>
            </div>
          </div>

          <div className="field">
            <label>I want to:</label>
            <div className="choices">
              <label className="choice">
                <input
                  type="radio"
                  name="role"
                  value="USER"
                  checked={form.role === "USER"}
                  onChange={handleChange}
                />
                <b>Rent Bikes</b>
                <span>Rider customer</span>
              </label>

              <label className="choice">
                <input
                  type="radio"
                  name="role"
                  value="BIKE_OWNER"
                  checked={form.role === "BIKE_OWNER"}
                  onChange={handleChange}
                />
                <b>List My Bikes</b>
                <span>Fleet owner</span>
              </label>
            </div>
          </div>

          {error && <div className="notice error">{error}</div>}

          <button type="submit" className="btn-primary block" disabled={loading} style={{ marginTop: 4 }}>
            {loading ? "Registering..." : "Create Account"}
          </button>
        </form>
      )}

      <div className="auth-links">
        <span>
          Already have an account? <Link to="/login" style={{ fontWeight: 600 }}>Sign in</Link>
        </span>
        <span>
          <Link to="/catalog">Browse bikes</Link>
        </span>
      </div>
    </AuthLayout>
  );
}
