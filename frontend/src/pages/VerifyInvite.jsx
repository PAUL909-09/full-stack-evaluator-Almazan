// frontend/src/pages/VerifyInvite.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { authService } from "@/api/authService";
import logo from "@/assets/logo.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff } from "lucide-react";

export default function VerifyInvite() {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const invitedEmail = searchParams.get("email");
    if (invitedEmail) setEmail(invitedEmail);
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await authService.verifyInvite({ email, otp, password });
      toast({
        title: "Account Verified!",
        description: "Your password is set. You can now log in.",
      });
      navigate("/login");
    } catch (err) {
      toast({
        title: "Verification Failed",
        description: err.message || "Invalid OTP or expired link.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#003366] via-[#0066CC] to-[#99CCFF] p-6">
      <Card className="w-full max-w-md shadow-2xl bg-white/90 backdrop-blur-xl border border-white/20 rounded-3xl">
        <CardHeader className="text-center pb-4">
          <img src={logo} alt="Logo" className="mx-auto h-16 mb-2" />
          <CardTitle className="text-2xl font-bold text-sky-900">
            Verify Your Account
          </CardTitle>
          <p className="text-sm text-sky-700 mt-1">Enter the OTP sent to your email</p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="email" className="text-sm font-semibold text-sky-900">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                disabled
                className="mt-1 bg-gray-100 text-sky-900"
              />
            </div>

            <div>
              <Label htmlFor="otp" className="text-sm font-semibold text-sky-900">
                One-Time Passcode (OTP)
              </Label>
              <Input
                id="otp"
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter the 6-digit code"
                required
                className="mt-1 bg-white/80 border-sky-200 focus:ring-2 focus:ring-sky-400"
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-sm font-semibold text-sky-900">
                Set Password
              </Label>
              <div className="relative mt-1">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
                  required
                  className="pr-10 bg-white/80 border-sky-200 focus:ring-2 focus:ring-sky-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-sky-500 hover:text-sky-700"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-sky-500 via-blue-500 to-blue-700 text-white hover:from-blue-600 hover:to-sky-600 font-semibold py-2.5 rounded-xl shadow-lg transition-all"
            >
              Verify & Activate
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
