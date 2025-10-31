import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authService } from "@/api/authService";
import logo from "@/assets/logo.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export default function Register() {
  const [name,setName]=useState("");
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [role,setRole]=useState("Employee");
  const [error,setError]=useState(null);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    try {
      await authService.register(name,email,password,role);
      navigate("/login");
    } catch (err) {
      setError(err?.message || String(err));
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 to-white">
      <Card className="w-[420px]">
        <CardHeader className="text-center">
          <img src={logo} alt="logo" className="mx-auto h-16" />
          <CardTitle>Create account</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Full name</Label>
              <Input value={name} onChange={(e)=>setName(e.target.value)} required />
            </div>
            <div>
              <Label>Email</Label>
              <Input value={email} onChange={(e)=>setEmail(e.target.value)} type="email" required />
            </div>
            <div>
              <Label>Password</Label>
              <Input value={password} onChange={(e)=>setPassword(e.target.value)} type="password" required />
            </div>
            <div>
              <Label>Role</Label>
              <select value={role} onChange={e=>setRole(e.target.value)} className="w-full border rounded px-3 py-2">
                <option value="Employee">Employee</option>
                <option value="Evaluator">Evaluator</option>
              </select>
            </div>
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <Button type="submit" className="w-full">Register</Button>
          </form>
          <p className="text-center mt-3 text-sm">
            Already have an account? <Link className="text-blue-600" to="/login">Login</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
