// frontend/src/pages/Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "@/services/authService";
import logo from "@/assets/logo.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "react-toastify";
import { Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await authService.login(email, password);
      const user = authService.getCurrentUser();
      toast.success("Login successful! Welcome back.");
      setTimeout(() => {
        if (user?.role === "Admin") navigate("/admin/dashboard");
        else if (user?.role === "Evaluator") navigate("/evaluator/dashboard");
        else if (user?.role === "Employee") navigate("/employee/dashboard");
        else navigate("/login");
      }, 400);
    } catch (err) {
      toast.error(
        "Login failed: " + (err.message || "Invalid email or password")
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#003366] via-[#0066CC] to-[#99CCFF] p-6 relative overflow-hidden">
      {/* Glow Orbs for ambiance */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400/30 blur-3xl rounded-full animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-sky-300/40 blur-3xl rounded-full animate-pulse"></div>

      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <Card className="w-[360px] sm:w-[420px] shadow-2xl border border-white/20 bg-white/90 dark:bg-gray-900/80 backdrop-blur-2xl rounded-3xl relative z-10">
          <CardHeader className="text-center pb-4">
            <img
              src={logo}
              alt="Logo"
              className="mx-auto h-16 mb-2 drop-shadow-md"
            />
            <CardTitle className="text-3xl font-extrabold text-sky-900 dark:text-white tracking-tight">
              Welcome Back 👋
            </CardTitle>
            <p className="text-sm text-sky-700/80 dark:text-gray-300 mt-1">
              Please sign in to your account
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label
                  htmlFor="email"
                  className="text-sm font-semibold text-sky-900 dark:text-gray-200"
                >
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="mt-1 bg-white/70 dark:bg-gray-800 border-sky-200 dark:border-gray-700 focus:ring-2 focus:ring-sky-400 focus:outline-none text-sky-900 dark:text-white placeholder-sky-400 dark:placeholder-gray-500"
                />
              </div>

              <div>
                <Label
                  htmlFor="password"
                  className="text-sm font-semibold text-sky-900 dark:text-gray-200"
                >
                  Password
                </Label>
                <div className="relative mt-1">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="pr-10 bg-white/70 dark:bg-gray-800 border-sky-200 dark:border-gray-700 focus:ring-2 focus:ring-sky-400 text-sky-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-sky-500 hover:text-sky-700 dark:hover:text-sky-300"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-sky-500 via-blue-500 to-blue-700 hover:from-blue-600 hover:to-sky-600 text-white font-semibold py-2.5 rounded-xl shadow-lg hover:shadow-blue-300/40 transition-all"
              >
                Sign In
              </Button>

              <p className="text-center text-sm text-sky-800/80 dark:text-gray-300 pt-2">
                Forgot your password?{" "}
                <a
                  href="#"
                  className="text-blue-600 dark:text-sky-400 hover:underline"
                >
                  Reset here
                </a>
              </p>
            </form>
          </CardContent>
        </Card>

        <p className="text-center mt-5 text-sm text-sky-800/80 dark:text-gray-300">
          Invited by your admin?{" "}
          <Link
            to="/verify-invite"
            className="text-blue-600 dark:text-sky-400 hover:underline font-medium"
          >
            Verify your account
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
