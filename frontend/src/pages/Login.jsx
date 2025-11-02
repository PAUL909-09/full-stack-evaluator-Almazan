// frontend\src\pages\Login.jsx (updated)
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authService } from "@/api/authService";
import logo from "@/assets/logo.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    try {
      await authService.login(email, password);  // ← Calls backend /api/auth/login
      const user = authService.getCurrentUser();
      if (!user) return navigate("/login");
      navigate("/dashboard");  // Single dashboard for all roles
    } catch (err) {
      setError(err.message);  // ← Shows backend error like "Invalid credentials"
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 to-gray-700">
      <Card className="w-[420px]">
        <CardHeader className="text-center">
          <img src={logo} alt="logo" className="mx-auto h-16 " />
          <CardTitle>Sign in</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Email</Label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
            </div>
            <div>
              <Label>Password</Label>
              <Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
            </div>
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <Button type="submit" className="w-full">Login</Button>
          </form>
          <p className="text-center mt-3 text-sm">
            Don’t have an account? <Link className="text-blue-600" to="/register">Register</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}