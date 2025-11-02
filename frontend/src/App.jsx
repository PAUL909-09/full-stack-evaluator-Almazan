// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import CreateTask from "./pages/admin/CreateTask";
import { authService } from "./api/authService";
import { Toaster } from "@/components/ui/toaster"; // ← ADD THIS
export default function App() {
  const user = authService.getCurrentUser();

  const Protected = ({ children }) =>
    user ? children : <Navigate to="/login" replace />;
  const AdminOnly = ({ children }) =>
    user && user.role === "Admin" ? children : <Navigate to="/login" replace />;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={
            <Protected>
              <Dashboard />
            </Protected>
          }
        />
        <Route
          path="/admin/tasks/create"
          element={
            <AdminOnly>
              <CreateTask />
            </AdminOnly>
          }
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}
