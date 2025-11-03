// frontend/src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import useAuthCheck from "./hooks/useAuthCheck";
import { Protected, AdminOnly, EvaluatorOnly, EmployeeOnly } from "./components/RouteGuards";

import MainLayout from "./components/layout/MainLayout";
import Login from "./pages/Login";
import Register from "./pages/Register";

// Pages
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminVerifyUsers from "./pages/Admin/AdminVerifyUsers";
import EvaluatorDashboard from "./pages/Evaluator/EvaluatorDashboard";
import EmployeeDashboard from "./pages/Employee/EmployeeDashboard";
import CreateProject from "./pages/CreateProject";
import CreateTask from "./pages/CreateTask";
import TaskDetails from "./pages/TaskDetails";

export default function App() {
  useAuthCheck(); // Keeps token fresh

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Layout (All logged-in users) */}
        <Route element={<Protected><MainLayout /></Protected>}>
          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={<AdminOnly><AdminDashboard /></AdminOnly>} />
          <Route path="/admin/verify-users" element={<AdminOnly><AdminVerifyUsers /></AdminOnly>} />

          {/* Evaluator Routes */}
          <Route path="/evaluator/dashboard" element={<EvaluatorOnly><EvaluatorDashboard /></EvaluatorOnly>} />
          <Route path="/projects/create" element={<EvaluatorOnly><CreateProject /></EvaluatorOnly>} />
          <Route path="/tasks/create" element={<EvaluatorOnly><CreateTask /></EvaluatorOnly>} />

          {/* Employee Routes */}
          <Route path="/employee/dashboard" element={<EmployeeOnly><EmployeeDashboard /></EmployeeOnly>} />

          {/* Shared Routes */}
          <Route path="/tasks/:id" element={<TaskDetails />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>

      <Toaster />
    </BrowserRouter>
  );
}