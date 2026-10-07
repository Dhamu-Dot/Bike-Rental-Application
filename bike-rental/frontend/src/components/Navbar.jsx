import React from "react";
import { Link, useNavigate } from "react-router-dom";
import NotificationBell from "./NotificationBell.jsx";
import Icon from "./Icon.jsx";
import { roleLabel } from "../utils.js";

export function Logo() {
  const role = localStorage.getItem("role");
  const homePath =
    role === "ROLE_ADMIN"
      ? "/admin"
      : role === "ROLE_BIKE_OWNER"
      ? "/owner"
      : role === "ROLE_USER"
      ? "/home"
      : "/catalog";

  return (
    <Link to={homePath} className="logo" title="MotoRental">
      <div className="logo-badge">
        <Icon name="bike" size={22} />
      </div>
      <span className="logo-text">MotoRental</span>
    </Link>
  );
}

export default function Navbar({ activeSection = "" }) {
  const navigate = useNavigate();
  const name = localStorage.getItem("name") || "User";
  const role = localStorage.getItem("role");

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const getDashboardPath = () => {
    if (role === "ROLE_ADMIN") return "/admin";
    if (role === "ROLE_BIKE_OWNER") return "/owner";
    return "/home";
  };

  return (
    <header className="navbar">
      <div className="navbar-in">
        <Logo />

        <nav className="nav-links">
          <Link
            to={getDashboardPath()}
            className={`nav-link ${
              activeSection === "customer" ||
              activeSection === "owner" ||
              activeSection === "admin"
                ? "active"
                : ""
            }`}
          >
            {role === "ROLE_ADMIN"
              ? "Admin"
              : role === "ROLE_BIKE_OWNER"
              ? "Dashboard"
              : "Dashboard"}
          </Link>
          <Link
            to={role === "ROLE_USER" ? "/home" : "/catalog"}
            className={`nav-link ${activeSection === "catalog" ? "active" : ""}`}
          >
            Bikes
          </Link>
        </nav>

        <div className="nav-right">
          <NotificationBell />

          <div className="user-profile-badge">
            <span className="user-name">{name}</span>
            <span className="user-role-chip">{roleLabel[role] || "Member"}</span>
          </div>

          <button className="btn-ghost small" onClick={logout} title="Sign Out">
            <Icon name="logout" size={15} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
