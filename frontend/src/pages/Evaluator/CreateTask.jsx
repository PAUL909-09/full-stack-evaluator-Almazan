// frontend/src/pages/Evaluator/CreateTask.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, ArrowLeft, FilePlus, Users } from "lucide-react";

// Toast
import { toast } from "react-toastify";

// Services
import { getMyProjects } from "@/services/projectService";
import { tasksService } from "@/services/tasksService";

export default function CreateTask() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [assignedEmployees, setAssignedEmployees] = useState([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load evaluator's projects
  useEffect(() => {
    (async () => {
      try {
        const data = await getMyProjects();
        setProjects(data);
      } catch (err) {
        toast.error("Failed to load projects.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Load assigned employees when project changes
  useEffect(() => {
    if (!selectedProjectId) {
      setAssignedEmployees([]);
      setSelectedEmployeeId("");
      return;
    }

    (async () => {
      try {
        const data = await tasksService.getEmployeesByProject(selectedProjectId);
        setAssignedEmployees(data);
        setSelectedEmployeeId("");
      } catch (err) {
        toast.error("Failed to load employees.");
        setAssignedEmployees([]);
      }
    })();
  }, [selectedProjectId]);

  // Submit task
  const handleSubmit = async () => {
    if (!title.trim() || !selectedProjectId || !selectedEmployeeId) {
      toast.warn("Please fill all required fields.");
      return;
    }

    setSaving(true);
    try {
      await tasksService.createTask({
        title: title.trim(),
        description: description.trim(),
        projectId: selectedProjectId,
        assignedToId: selectedEmployeeId,
      });

      toast.success("Task created!");
      navigate(`/evaluator/project-tasks/${selectedProjectId}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create task.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto p-6">
      {/* Back Button */}
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>

      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <FilePlus className="h-8 w-8 text-blue-600" />
          <h1 className="text-2xl font-bold">Create New Task</h1>
        </div>

        <div className="space-y-6">
          {/* Project Selector */}
          <div>
            <label className="block text-sm font-medium mb-2">Project</label>
            <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a project..." />
              </SelectTrigger>
              <SelectContent>
                {projects.length === 0 ? (
                  <SelectItem value="none" disabled>No projects found</SelectItem>
                ) : (
                  projects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Employee Selector */}
          <div>
            <label className="block text-sm font-medium mb-2">
              <Users className="inline h-4 w-4 mr-1" />
              Assign To
            </label>
            <Select
              value={selectedEmployeeId}
              onValueChange={setSelectedEmployeeId}
              disabled={!selectedProjectId || assignedEmployees.length === 0}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    !selectedProjectId
                      ? "Select a project first"
                      : assignedEmployees.length === 0
                      ? "No employees assigned"
                      : "Select an employee..."
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {assignedEmployees.map((e) => (
                  <SelectItem key={e.id} value={e.id}>
                    {e.name} ({e.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Helper Text */}
            {selectedProjectId && assignedEmployees.length === 0 && (
              <p className="text-xs text-amber-600 mt-1">
                No employees assigned.{" "}
                <button
                  onClick={() =>
                    navigate(`/evaluator/assign-employees/${selectedProjectId}`)
                  }
                  className="underline font-medium"
                >
                  Assign now
                </button>
                .
              </p>
            )}
          </div>

          {/* Task Title */}
          <div>
            <label className="block text-sm font-medium mb-2">Task Title *</label>
            <Input
              placeholder="e.g., Implement login API"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Description (optional)
            </label>
            <textarea
              className="w-full p-3 border rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Provide details about the task..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>

          {/* Submit */}
          <div className="pt-4">
            <Button
              onClick={handleSubmit}
              disabled={saving || !title || !selectedProjectId || !selectedEmployeeId}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Task"
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

