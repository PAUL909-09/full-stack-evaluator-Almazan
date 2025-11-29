// frontend/src/routes/PublicRoutes.jsx
import { Routes, Route } from "react-router-dom";
import Login from "@/pages/Login";
import VerifyInvite from "@/pages/VerifyInvite";

export default function PublicRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/verify-invite" element={<VerifyInvite />} />
    </Routes>
  );
}
