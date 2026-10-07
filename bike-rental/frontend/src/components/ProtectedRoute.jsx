import { Navigate } from "react-router-dom";

// Route guard: blocks the page if not logged in or if the role is wrong
export default function ProtectedRoute({ role, children }) {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role");

  if (!token || userRole !== role) {
    return <Navigate to="/login" />;
  }
  return children;
}
