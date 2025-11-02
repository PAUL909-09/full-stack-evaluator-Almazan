// src/pages/Dashboard.jsx
import React from "react";
import { authService } from "@/api/authService";
import AdminDashboard from "./admin/AdminDashboard";
import EvaluatorDashboard from "./evaluator/EvaluatorDashboard";
import EmployeeDashboard from "./employee/EmployeeDashboard";

export default function Dashboard() {
  const user = authService.getCurrentUser();
  if (!user) return <div>Unauthorized</div>;

  if (user.role === "Admin") return <AdminDashboard />;
  if (user.role === "Evaluator") return <EvaluatorDashboard />;
  return <EmployeeDashboard />;
}