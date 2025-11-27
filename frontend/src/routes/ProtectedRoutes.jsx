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
import EvaluatorLayout from "@/components/layout/EvaluatorLayout"; // ← Import
// import CreateTask from "@/pages/Evaluator/CreateTask";
import ProjectTable from "@/pages/Evaluator/ProjectTable";
import ProjectTasks from "@/pages/Evaluator/ProjectTasks";
import AssignEmployeesToProject from "@/pages/Evaluator/AssignEmployeesToProject";
import PendingEvaluations from "@/pages/Evaluator/PendingEvaluations";
import ManageAssignments from "@/pages/Evaluator/ManageAssignments";
import TaskTable from "@/pages/Evaluator/TaskTable";
// import TaskReviews from "@/pages/Evaluator/TaskReviews";
import MyTasks from "@/pages/Employee/MyTasks";

// Employee pages
import EmployeeDashboard from "@/pages/Employee/EmployeeDashboard";

// Shared pages
import TaskDetails from "@/pages/TaskDetails";
import EvaluationHistory from "@/pages/Evaluator/EvaluationHistory";

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
        {/* === ADMIN ROUTES === */}
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
        {/* === EVALUATOR ROUTES === */}
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
        {/* <Route
          path="/tasks/create"
          element={
            <EvaluatorOnly>
              <CreateTask />
            </EvaluatorOnly>
          }
        /> */}
        <Route
          path="/evaluator/projects"
          element={
            <EvaluatorOnly>
              <ProjectTable />
            </EvaluatorOnly>
          }
        />
        <Route path="/evaluator/tasks" element={<TaskTable />} />
        <Route
          path="/evaluator/project/:projectId/tasks"
          element={<TaskTable />}
        />
        <Route
          path="/evaluator/pending"
          element={
            <EvaluatorOnly>
              <PendingEvaluations />
            </EvaluatorOnly>
          }
        />
        <Route
          path="/evaluator/project-tasks/:projectId"
          element={
            <EvaluatorOnly>
              <ProjectTasks />
            </EvaluatorOnly>
          }
        />
        <Route
          path="/evaluator/project-tasks/:projectId"
          element={
            <EvaluatorOnly>
              <ProjectTasks />
            </EvaluatorOnly>
          }
        />
        <Route
          path="/evaluator/project-tasks/:projectId"
          element={
            <EvaluatorOnly>
              <ProjectTasks />
            </EvaluatorOnly>
          }
        />
        {/* ── NEW: Bulk-assign employees to a project ── */}
        {/* <Route
          path="/evaluator/assign-employees/:projectId"
          element={
            <EvaluatorOnly>
              <AssignEmployeesToProject />
            </EvaluatorOnly>
          }
        /> */}
        <Route
          path="/evaluator/assign-employees/:projectId?"
          element={
            <EvaluatorOnly>
              <AssignEmployeesToProject />
            </EvaluatorOnly>
          }
        />
        <Route
          path="/evaluator/manage-assignments/:projectId"
          element={
            <EvaluatorOnly>
              <ManageAssignments />
            </EvaluatorOnly>
          }
        />
        <Route
          path="/evaluator/evaluation-history"
          element={
            <EvaluatorOnly>
              <EvaluationHistory />
            </EvaluatorOnly>
          }
        />

        {/* === EMPLOYEE ROUTES === */}
        <Route
          path="/employee/dashboard"
          element={
            <EmployeeOnly>
              <EmployeeDashboard />
            </EmployeeOnly>
          }
        />
        <Route
          path="/employee/tasks"
          element={
            <EmployeeOnly>
              <MyTasks /> {/* Old interactive page moved here */}
            </EmployeeOnly>
          }
        />
        {/* === SHARED ROUTES === */}
        <Route path="/tasks/:id" element={<TaskDetails />} />
      </Route>
    </Routes>
  );
}
