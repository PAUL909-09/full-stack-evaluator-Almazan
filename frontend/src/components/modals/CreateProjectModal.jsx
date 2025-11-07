// frontend/src/components/modals/CreateProjectModal.jsx
import { useEffect, useState } from "react";  // ✅ Removed unused React import
import api from "@/api/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "react-toastify";  // ✅ Added for consistency
import { useAuth } from "@/hooks/useAuth";
import { X } from "lucide-react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";

export default function CreateProjectModal({ open, onClose, onSuccess, project }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const isEdit = Boolean(project);

  // 🔹 Pre-fill form when editing
  useEffect(() => {
    if (isEdit) {
      setName(project?.name || "");
      setDescription(project?.description || "");
    } else {
      setName("");
      setDescription("");
    }
  }, [project, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    try {
      setLoading(true);

      const payload = {
        name,
        description,
        evaluatorId: user.id,
      };

      if (isEdit) {
        // 🔹 Update project
        await api.put(`/projects/${project.id}`, payload);
        toast.success(`Project "${name}" was successfully updated.`);  // ✅ Replaced custom toast
      } else {
        // 🔹 Create project
        const res = await api.post("/projects", payload);
        toast.success(`Project "${name}" was successfully created.`);  // ✅ Replaced custom toast
      }

      onSuccess?.();
      onClose();
    } catch (err) {
      console.error("Error saving project:", err);
      toast.error(
        err.response?.data?.message ||
        "Something went wrong while saving the project."
      );  // ✅ Replaced custom toast
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-[#A0DCFC]/40 p-8"
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ duration: 0.25 }}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Title */}
            <h1 className="text-2xl font-bold text-center mb-6 bg-gradient-to-r from-blue-600 to-sky-400 bg-clip-text text-transparent">
              {isEdit ? "Edit Project" : "Create New Project"}
            </h1>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <Label className="text-gray-700 dark:text-gray-300 font-medium">
                  Project Name
                </Label>
                <Input
                  placeholder="Enter project name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="mt-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <Label className="text-gray-700 dark:text-gray-300 font-medium">
                  Description
                </Label>
                <Input
                  placeholder="Brief project description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className={`w-full text-white font-semibold py-2 rounded-lg shadow-md transition duration-200 ${
                  isEdit
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-emerald-600 hover:bg-emerald-700"
                }`}
              >
                {loading
                  ? isEdit
                    ? "Updating..."
                    : "Creating..."
                  : isEdit
                    ? "Update Project"
                    : "Create Project"}
              </Button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}