// src/components/RouteGuards.jsx
import { Navigate } from "react-router-dom";
import { authService } from "../api/authService";

export const Protected = ({ children }) => {
  const user = authService.getCurrentUser();
  return user ? children : <Navigate to="/login" replace />;
};

export const AdminOnly = ({ children }) => {
  const user = authService.getCurrentUser();
  return user && user.role === "Admin" ? children : <Navigate to="/login" replace />;
};