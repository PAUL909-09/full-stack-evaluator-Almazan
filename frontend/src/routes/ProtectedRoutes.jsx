// frontend/src/routes/ProtectedRoutes.jsx
import { Routes, Route } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import {
  Protected,
  AdminOnly,
  EvaluatorOnly,
  EmployeeOnly,
} from "@/components/RouteGuards";

// Admin pages
import AdminDashboard from "@/pages/Admin/AdminDashboard";
import AdminVerifyUsers from "@/pages/Admin/AdminVerifyUsers";

// Evaluator pages
import EvaluatorDashboard from "@/pages/Evaluator/EvaluatorDashboard";
import CreateProject from "@/pages/Evaluator/CreateProject";
import CreateTask from "@/pages/Evaluator/CreateTask";

// Employee pages
import EmployeeDashboard from "@/pages/Employee/EmployeeDashboard";

// Shared pages
import TaskDetails from "@/pages/TaskDetails";

export default function ProtectedRoutes() {
  return (
    <Routes>
      <Route
        element={
          <Protected>
            <MainLayout />
          </Protected>
        }
      >
        {/* Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <AdminOnly>
              <AdminDashboard />
            </AdminOnly>
          }
        />
        <Route
          path="/admin/verify-users"
          element={
            <AdminOnly>
              <AdminVerifyUsers />
            </AdminOnly>
          }
        />

        {/* Evaluator Routes */}
        <Route
          path="/evaluator/dashboard"
          element={
            <EvaluatorOnly>
              <EvaluatorDashboard />
            </EvaluatorOnly>
          }
        />
        <Route
          path="/projects/create"
          element={
            <EvaluatorOnly>
              <CreateProject />
            </EvaluatorOnly>
          }
        />
        <Route
          path="/tasks/create"
          element={
            <EvaluatorOnly>
              <CreateTask />
            </EvaluatorOnly>
          }
        />

        {/* Employee Routes */}
        <Route
          path="/employee/dashboard"
          element={
            <EmployeeOnly>
              <EmployeeDashboard />
            </EmployeeOnly>
          }
        />

        {/* Shared Routes */}
        <Route path="/tasks/:id" element={<TaskDetails />} />
      </Route>
    </Routes>
  );
}
