import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import OwnerDashboard from "./pages/OwnerDashboard.jsx";
import UserHome from "./pages/UserHome.jsx";
import PublicCatalog from "./pages/PublicCatalog.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

// Smart root redirect: sends guests to catalog and logged-in users to their role dashboard
function HomeRedirect() {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token) return <Navigate to="/catalog" replace />;
  if (role === "ROLE_ADMIN") return <Navigate to="/admin" replace />;
  if (role === "ROLE_BIKE_OWNER") return <Navigate to="/owner" replace />;
  return <Navigate to="/home" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/catalog" element={<PublicCatalog />} />

      {/* Role-Protected Portals */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute role="ROLE_ADMIN">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/owner"
        element={
          <ProtectedRoute role="ROLE_BIKE_OWNER">
            <OwnerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/home"
        element={
          <ProtectedRoute role="ROLE_USER">
            <UserHome />
          </ProtectedRoute>
        }
      />

      {/* Catch-all unknown routes */}
      <Route path="*" element={<HomeRedirect />} />
    </Routes>
  );
}
