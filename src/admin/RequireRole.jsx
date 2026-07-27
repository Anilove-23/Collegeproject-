import React from "react";
import { Navigate } from "react-router-dom";

export default function RequireRole({ allowedRoles, children }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token || !role || !allowedRoles.includes(role)) {
    return <Navigate to="/signin" replace />;
  }

  return children;
}
