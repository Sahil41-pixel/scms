import React from "react";
import { Navigate } from "react-router-dom";

// ─── Blocks unauthenticated / wrong-role access ────────────
const ProtectedRoute = ({ children, allowedRoles }) => {
  const stored = localStorage.getItem("scms");

  if (!stored) return <Navigate to="/login" replace />;

  const { user } = JSON.parse(stored);

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
