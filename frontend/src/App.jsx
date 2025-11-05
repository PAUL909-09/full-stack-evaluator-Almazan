// frontend/src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import useAuthCheck from "@/hooks/useAuthCheck";

import { Protected } from "@/components/RouteGuards";
import MainLayout from "@/components/layout/MainLayout";
import Login from "@/pages/Login";
import VerifyInvite from "@/pages/VerifyInvite";

import AdminRoutes from "@/routes/AdminRoutes";
import EvaluatorRoutes from "@/routes/EvaluatorRoutes";
import EmployeeRoutes from "@/routes/EmployeeRoutes";

// 🧩 Import react-toastify
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function App() {
  useAuthCheck();

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/verify-invite" element={<VerifyInvite />} />

        {/* Protected routes under MainLayout */}
        <Route
          element={
            <Protected>
              <MainLayout />
            </Protected>
          }
        >
          {AdminRoutes}
          {EvaluatorRoutes}
          {EmployeeRoutes}
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>

      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false} // ✅ Ensures the progress bar (countdown) is visible
        newestOnTop={true}
        closeOnClick={true}
        pauseOnHover={true} // ✅ Pauses the countdown on hover for better UX
        draggable={true}
        theme="light"
        progressClassName="custom-progress-bar" // ✅ Custom class for styling the countdown bar
      />

      <Toaster />
    </BrowserRouter>
  );
}
