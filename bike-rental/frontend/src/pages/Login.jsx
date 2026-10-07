import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api.js";
import AuthLayout from "../components/AuthLayout.jsx";
import Icon from "../components/Icon.jsx";
import { useToast } from "../components/Toast.jsx";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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

  const doLogin = async (loginEmail, loginPass) => {
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/auth/login", { email: loginEmail, password: loginPass });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("name", res.data.name);
      localStorage.setItem("email", res.data.email || loginEmail);
      if (res.data.phone) localStorage.setItem("phone", res.data.phone);
      if (res.data.city) localStorage.setItem("city", res.data.city);

      addToast(`Welcome back, ${res.data.name}!`, "success");

      if (res.data.role === "ROLE_ADMIN") navigate("/admin");
      else if (res.data.role === "ROLE_BIKE_OWNER") navigate("/owner");
      else navigate("/home");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials or server unavailable.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    doLogin(email, password);
  };

  return (
    <AuthLayout>
      <div style={{ textAlign: "center", marginBottom: 6 }}>
        <h2>Sign In</h2>
        <p style={{ color: "var(--muted)", fontSize: 13, marginTop: 4 }}>
          Enter your email and password to continue.
        </p>
      </div>

      <form onSubmit={handleLogin}>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="field">
          <label htmlFor="password">Password</label>
          <div className="password-field">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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

        {error && <div className="notice error">{error}</div>}

        <button type="submit" className="btn-primary block" disabled={loading} style={{ marginTop: 4 }}>
          {loading ? "Signing In..." : "Sign In"}
        </button>
      </form>

      <div className="auth-links">
        <span>
          Don't have an account? <Link to="/register" style={{ fontWeight: 600 }}>Create one</Link>
        </span>
        <span>
          <Link to="/catalog">Browse bikes as guest</Link>
        </span>
      </div>
    </AuthLayout>
  );
}
