/* eslint-disable no-unused-vars */
// frontend/src/components/modals/CreateProjectModal.jsx
import { useEffect, useState } from "react";
import api from "@/api/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { toast } from "react-toastify";
import { useAuth } from "@/hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";

export default function CreateProjectModal({ 
  open, 
  onClose, 
  project, 
  onSubmit 
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const isEdit = Boolean(project);

  // SAFELY initialize form when modal opens
  useEffect(() => {
    if (open) {
      if (isEdit && project) {
        // Convert any null/undefined to safe strings
        setName(String(project.name ?? "").trim());
        setDescription(String(project.description ?? "").trim());
        setDeadline(project.deadline ? new Date(project.deadline) : null);
      } else {
        // Fresh form
        setName("");
        setDescription("");
        setDeadline(null);
      }
    }
  }, [open, project, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedName = name.trim();
    if (!trimmedName) {
      return toast.error("Project name is required");
    }

    try {
      setLoading(true);

      const payload = {
        name: trimmedName,
        description: description.trim() || null,
        evaluatorId: user.id,
        deadline: deadline ? deadline.toISOString() : null,
      };

      if (isEdit) {
        await api.put(`/projects/${project.id}`, payload);
        toast.success("Project updated successfully!");
      } else {
        await api.post("/projects", payload);
        toast.success("Project created successfully!");
      }

      onSubmit?.();
      onClose();
    } catch (err) {
      const message = err.response?.data?.message || "Failed to save project";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-8"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-500 hover:bg-gray-100 rounded-full p-2 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <h1 className="text-3xl font-bold text-center mb-8 text-emerald-600">
              {isEdit ? "Edit Project" : "Create New Project"}
            </h1>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="name">Project Name *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Mobile App Redesign"
                  required
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief overview..."
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Deadline (Optional)</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal mt-2 h-12",
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
                      onSelect={setDeadline}
                      disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <Button
                type="submit"
                disabled={loading || !name.trim()}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-6 text-lg rounded-xl shadow-lg transition"
              >
                {loading ? "Saving..." : isEdit ? "Update Project" : "Create Project"}
              </Button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}