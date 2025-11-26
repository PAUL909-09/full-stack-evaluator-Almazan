import React, { useEffect, useState } from "react";
import api from "@/api/axios";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "react-toastify";

export default function AdminVerifyUsers() {
  const [pending, setPending] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [query, setQuery] = useState("");
  const [form, setForm] = useState({ name: "", email: "", role: "" });

  const fetchInvites = async () => {
    try {
      const res = await api.get("/admin/pending-invites");
      setPending(res.data);
      setFiltered(res.data);
    } catch (err) {
      toast.error("Failed to load invites: " + (err.message || "Please try again later."));
    }
  };

  useEffect(() => {
    fetchInvites();
    const interval = setInterval(fetchInvites, 30000); // auto refresh
    return () => clearInterval(interval);
  }, []);

  // Search filter
  useEffect(() => {
    setFiltered(
      pending.filter(
        (u) =>
          u.name.toLowerCase().includes(query.toLowerCase()) ||
          u.email.toLowerCase().includes(query.toLowerCase())
      )
    );
  }, [query, pending]);

  const sendInvite = async () => {
    if (!form.name || !form.email || !form.role) {
      toast.error("Missing fields: Please fill out all fields.");
      return;
    }

    try {
      await api.post("/admin/invite", form);
      toast.success("Invite sent! An invite has been sent to " + form.email + ".");
      fetchInvites();
      setForm({ name: "", email: "", role: "" });
    } catch (err) {
      toast.error("Invite failed: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <h1 className="text-4xl font-bold text-gray-800">Manage Invitations</h1>

      {/* Invite Form */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Send a New Invite</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <Input placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <select
            className="border rounded-md p-2"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            <option value="">Select role</option>
            <option value="Evaluator">Evaluator</option>
            <option value="Employee">Employee</option>
          </select>
          <Button onClick={sendInvite} className="bg-blue-600 hover:bg-blue-700">
            Send Invite
          </Button>
        </CardContent>
      </Card>

      {/* Search Bar */}
      <Input
        placeholder="Search by name or email..."
        className="max-w-md"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {/* Table */}
      <div className="overflow-x-auto border rounded-lg shadow-md bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="text-left py-3 px-4">Name</th>
              <th className="text-left py-3 px-4">Email</th>
              <th className="text-left py-3 px-4">Role</th>
              <th className="text-left py-3 px-4">Status</th>
              <th className="text-left py-3 px-4">Expires At</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((user, idx) => (
              <tr key={idx} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4">{user.name}</td>
                <td className="py-3 px-4">{user.email}</td>
                <td className="py-3 px-4">{user.role}</td>
                <td className="py-3 px-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-bold ${
                      user.isEmailVerified ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {user.isEmailVerified ? "Verified" : "Pending"}
                  </span>
                </td>
                <td className="py-3 px-4">{new Date(user.otpExpiresAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
