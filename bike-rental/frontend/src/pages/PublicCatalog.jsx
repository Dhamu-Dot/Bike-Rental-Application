import React from "react";
import { Link, useNavigate } from "react-router-dom";
import Catalog from "../components/Catalog.jsx";
import Navbar, { Logo } from "../components/Navbar.jsx";

export default function PublicCatalog() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const isCustomer = role === "ROLE_USER";

  return (
    <div>
      {token ? (
        <Navbar activeSection="catalog" />
      ) : (
        <header className="navbar">
          <div className="navbar-in">
            <Logo />

            <nav className="nav-links">
              <Link to="/catalog" className="nav-link active">
                Bikes
              </Link>
            </nav>

            <div className="nav-right">
              <Link to="/login" className="btn-ghost small">
                Log In
              </Link>
              <Link to="/register" className="btn-primary small">
                Sign Up
              </Link>
            </div>
          </div>
        </header>
      )}

      <Catalog
        canBook={isCustomer}
        onViewBookings={() => {
          if (isCustomer) navigate("/home");
        }}
      />
    </div>
  );
}
