// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import CreateTask from "./pages/admin/CreateTask";
import { Toaster } from "@/components/ui/toaster";
import { Protected, AdminOnly } from "./components/RouteGuards";  // ← Moved guards here
import useAuthCheck from "./hooks/useAuthCheck";  // ← Added custom hook

export default function App() {
  useAuthCheck();  // ← Runs token expiration check on mount

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