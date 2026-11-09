import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

// Only logged-in users get through. With `admin`, only admins do.
export default function ProtectedRoute({ admin = false, children }) {
  const { user, ready } = useAuth();
  const location = useLocation();

  if (!ready) return <div className="text-center text-muted py-5">Loading…</div>;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (admin && user.role !== "admin") {
    return (
      <div className="alert alert-warning mt-4">
        This page is for shop admins only.
      </div>
    );
  }
  return children;
}
