// frontend/src/routes/AdminRoutes.jsx
import { Route } from "react-router-dom";
import { AdminOnly } from "@/components/RouteGuards";
import AdminDashboard from "@/pages/Admin/AdminDashboard";
import AdminVerifyUsers from "@/pages/Admin/AdminVerifyUsers";

export default [
  <Route key="admin-dashboard" path="/admin/dashboard" element={<AdminOnly><AdminDashboard /></AdminOnly>} />,
  <Route key="admin-verify" path="/admin/verify-users" element={<AdminOnly><AdminVerifyUsers /></AdminOnly>} />,
];
