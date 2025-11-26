import React, { useState } from "react";
import { toast } from "react-toastify";
import api from "@/api/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export default function CreateProject() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  if (loading) return <div className="p-8 text-gray-100">Loading...</div>;
  if (!user) return <div className="p-8 text-red-200">Please log in first.</div>;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name,
        description,
        evaluatorId: user.id,
      };

      console.log("Submitting project data:", payload); // ✅ Log payload

      const response = await api.post("/projects", payload);

      console.log("Project created successfully:", response.data); // ✅ Log success response

      toast.success(`Project "${name}" was successfully created.`);

      navigate("/evaluator/dashboard");
    } catch (err) {
      // ✅ Detailed error logging
      console.error("❌ Error creating project:");
      console.error("Message:", err.message);
      console.error("Status:", err.response?.status);
      console.error("Data:", err.response?.data);
      console.error("Config:", err.config);

      toast.error(
        err.response?.data?.message ||
          "Something went wrong while creating the project."
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>

      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 border border-white/30 z-10">
        <h1 className="text-4xl font-bold text-center text-[#003366] mb-6">
          Create Project
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Label className="text-[#003366] font-semibold">Project Name</Label>
            <Input
              placeholder="Enter project name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="mt-2 border-[#99CCFF] focus:border-[#0066CC] focus:ring-[#0066CC]"
            />
          </div>

          <div>
            <Label className="text-[#003366] font-semibold">Description</Label>
            <Input
              placeholder="Brief project description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-2 border-[#99CCFF] focus:border-[#0066CC] focus:ring-[#0066CC]"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-[#0066CC] hover:bg-[#004C99] text-white font-semibold rounded-lg py-2 shadow-md transition duration-150"
          >
            Create Project
          </Button>
        </form>
      </div>
    </div>
  );
}
