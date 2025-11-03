import React, { useEffect, useState } from "react";
import api from "@/api/axios";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export default function AdminVerifyUsers() {
  const [pending, setPending] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const { toast } = useToast();

  // 🧠 Load pending invites
  useEffect(() => {
    api
      .get("/admin/pending-invites")
      .then((res) => setPending(res.data))
      .catch((err) =>
        toast({
          title: "Failed to load invites",
          description: err.message || "Please try again later.",
          variant: "destructive",
        })
      );
  }, [toast]);

  // 📨 Send Invite
  const sendInvite = async () => {
    if (!name || !email || !role) {
      toast({
        title: "Missing fields",
        description: "Please enter name, email, and role.",
        variant: "destructive",
      });
      return;
    }

    try {
      await api.post("/admin/invite", { name, email, role });
      toast({
        title: "Invite Sent!",
        description: `An OTP was sent to ${email}`,
      });

      setPending((prev) => [...prev, { name, email, role, isVerified: false }]);
      setName("");
      setEmail("");
      setRole("");
    } catch (err) {
      console.log("Full error:", err);
      console.log("Response data:", err.response?.data);
      toast({
        title: "Invite failed",
        description: err.response?.data?.message || err.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-8 text-gray-800">
        Manage Invitations
      </h1>

      {/* 🎯 Invite Form */}
      <Card className="mb-10 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl text-gray-700">
            Send an Invite
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-4 flex-wrap">
          <Input
            type="text"
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1"
          />

          <Input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1"
          />

          <Select value={role} onValueChange={setRole}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Evaluator">Evaluator</SelectItem>
              <SelectItem value="Employee">Employee</SelectItem>
            </SelectContent>
          </Select>

          <Button
            className="bg-blue-600 hover:bg-blue-700"
            onClick={sendInvite}
          >
            Send Invite
          </Button>
        </CardContent>
      </Card>

      {/* 🧾 Pending Invites */}
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">
        Pending Invites
      </h2>

      {pending.length === 0 ? (
        <div className="bg-green-50 border border-green-200 text-green-700 p-6 rounded-lg text-center">
          <p className="text-lg font-medium">No pending invites 🎉</p>
        </div>
      ) : (
        <div className="space-y-6">
          {pending.map((user, idx) => (
            <Card
              key={idx}
              className="hover:shadow-lg transition-shadow border-l-4 border-l-blue-500"
            >
              <CardHeader>
                <CardTitle className="text-lg text-gray-800">
                  {user.name} — {user.email}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex justify-between items-center">
                <span
                  className={`inline-block px-2 py-1 text-xs font-bold rounded-full
                    ${
                      user.role === "Evaluator"
                        ? "bg-purple-100 text-purple-800"
                        : "bg-orange-100 text-orange-800"
                    }`}
                >
                  {user.role}
                </span>
                <span
                  className={`text-sm font-semibold ${
                    user.isVerified ? "text-green-600" : "text-yellow-600"
                  }`}
                >
                  {user.isVerified ? "Verified" : "Pending Verification"}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
