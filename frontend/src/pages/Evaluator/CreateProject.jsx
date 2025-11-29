import React, { useState } from "react";
import { toast } from "react-toastify";
import api from "@/api/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export default function CreateProject() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState(null); // ← NEW
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  if (loading) return <div className="p-8 text-gray-100">Loading...</div>;
  if (!user) return <div className="p-8 text-red-200">Please log in first.</div>;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Project name is required");
      return;
    }

    try {
      const payload = {
        name: name.trim(),
        description: description.trim() || null,
        evaluatorId: user.id,
        deadline: deadline ? deadline.toISOString() : null, // ← SEND ISO STRING
      };

      console.log("Creating project:", payload);
      await api.post("/projects", payload);

      toast.success(`Project "${name}" created successfully!`);
      navigate("/evaluator/dashboard");
    } catch (err) {
      console.error("Project creation failed:", err);
      toast.error(err.response?.data?.message || "Failed to create project");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 border border-white/30 z-10">
        <h1 className="text-4xl font-bold text-center text-[#003366] mb-8">
          Create New Project
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Project Name */}
          <div>
            <Label className="text-[#003366] font-semibold">Project Name</Label>
            <Input
              placeholder="e.g. Mobile App Redesign"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="mt-2 border-[#99CCFF] focus:border-[#0066CC] focus:ring-[#0066CC]"
            />
          </div>

          {/* Description */}
          <div>
            <Label className="text-[#003366] font-semibold">Description (Optional)</Label>
            <Input
              placeholder="Brief overview of the project"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-2 border-[#99CCFF] focus:border-[#0066CC] focus:ring-[#0066CC]"
            />
          </div>

          {/* Deadline Picker — BEAUTIFUL */}
          <div>
            <Label className="text-[#003366] font-semibold">Deadline (Optional)</Label>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal mt-2 border-[#99CCFF] hover:border-[#0066CC]",
                    !deadline && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {deadline ? format(deadline, "PPP") : "Pick a deadline"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={deadline}
                  onSelect={(date) => {
                    setDeadline(date);
                    setOpen(false);
                  }}
                  disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            className="w-full bg-[#0066CC] hover:bg-[#004C99] text-white font-bold text-lg py-6 rounded-xl shadow-lg transition duration-200"
          >
            Create Project
          </Button>
        </form>
      </div>
    </div>
  );
}