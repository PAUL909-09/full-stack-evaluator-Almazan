// // frontend/src/routes/AdminRoutes.jsx
// import { Route } from "react-router-dom";
// import { AdminOnly } from "@/components/RouteGuards";
// import AdminDashboard from "@/pages/Admin/AdminDashboard";
// import AdminVerifyUsers from "@/pages/Admin/AdminVerifyUsers";

// export default [
//   <Route key="admin-dashboard" path="/admin/dashboard" element={<AdminOnly><AdminDashboard /></AdminOnly>} />,
//   <Route key="admin-verify" path="/admin/verify-users" element={<AdminOnly><AdminVerifyUsers /></AdminOnly>} />,
// ];
// frontend/src/routes/AdminRoutes.jsx
// frontend/src/routes/AdminRoutes.jsx
import { Route } from "react-router-dom";
import { AdminOnly } from "@/components/RouteGuards";
import AdminDashboard from "@/pages/Admin/AdminDashboard";
import AdminVerifyUsers from "@/pages/Admin/AdminVerifyUsers";

// 🆕 Import your new pages
import UserAnalytics from "@/pages/Admin/Users/UserAnalytics";
import UserDetails from "@/pages/Admin/Users/UserDetails";
import UserProjects from "@/pages/Admin/Users/UserProjects";
import ProjectEmployees from "@/pages/Admin/Users/ProjectEmployees";

export default [
  <Route
    key="admin-dashboard"
    path="/admin/dashboard"
    element={
      <AdminOnly>
        <AdminDashboard />
      </AdminOnly>
    }
  />,
  <Route
    key="admin-verify"
    path="/admin/verify-users"
    element={
      <AdminOnly>
        <AdminVerifyUsers />
      </AdminOnly>
    }
  />,

  // 🆕 New routes
  <Route
    key="user-analytics"
    path="/admin/users/analytics"
    element={
      <AdminOnly>
        <UserAnalytics />
      </AdminOnly>
    }
  />,
  <Route
    key="user-details"
    path="/admin/users/details/:id"
    element={
      <AdminOnly>
        <UserDetails />
      </AdminOnly>
    }
  />,
  <Route
    key="user-projects"
    path="/admin/users/projects/:id"
    element={
      <AdminOnly>
        <UserProjects />
      </AdminOnly>
    }
  />,
  <Route
    key="project-employees"
    path="/admin/projects/:projectId/employees"
    element={
      <AdminOnly>
        <ProjectEmployees />
      </AdminOnly>
    }
  />,
];
