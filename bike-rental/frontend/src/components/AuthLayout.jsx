import React from "react";
import { Logo } from "./Navbar.jsx";

export default function AuthLayout({ children }) {
  return (
    <div className="auth">
      <main className="auth-main">
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
          <Logo />
        </div>
        <div className="auth-form-card">{children}</div>
      </main>
    </div>
  );
}
