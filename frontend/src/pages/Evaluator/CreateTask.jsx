// // frontend/src/pages/Evaluator/CreateTask.jsx
// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import api from "@/api/axios";
// import { authService } from "@/api/authService";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
// import { useToast } from "@/hooks/use-toast";
// import { getEvaluatorProjects, getEmployeesByProject } from "@/services/projectService";  // ✅ Import service functions

// export default function CreateTask() {
//   const [title, setTitle] = useState("");
//   const [description, setDescription] = useState("");
//   const [projectId, setProjectId] = useState("");
//   const [assignedToId, setAssignedToId] = useState("");
//   const [projects, setProjects] = useState([]);
//   const [employees, setEmployees] = useState([]);
//   const [error, setError] = useState(null);
//   const [loadingEmployees, setLoadingEmployees] = useState(false);  // ✅ Track loading state for employees
//   const { toast } = useToast();
//   const navigate = useNavigate();
//   const user = authService.getCurrentUser();

//   // ✅ FIXED: Fetch only the evaluator's projects on mount
//   useEffect(() => {
//     const fetchProjects = async () => {
//       try {
//         const projData = await getEvaluatorProjects();  // ✅ Use service to get evaluator's projects
//         setProjects(projData);
//       } catch (err) {
//         toast({
//           title: "Failed to load projects",
//           description: err.message || "Please refresh the page.",
//           variant: "destructive"
//         });
//       }
//     };

//     fetchProjects();
//   }, [toast]);  // Keep toast for consistency

//   // ✅ FIXED: Fetch employees when a project is selected
//   useEffect(() => {
//     if (!projectId) {
//       setEmployees([]);  // Clear employees if no project selected
//       return;
//     }

//     const fetchEmployees = async () => {
//       setLoadingEmployees(true);
//       try {
//         const empData = await getEmployeesByProject(projectId);  // ✅ Use service to get employees for the selected project
//         setEmployees(empData);
//       } catch (err) {
//         toast({
//           title: "Failed to load employees",
//           description: err.message || "Please select a different project.",
//           variant: "destructive"
//         });
//         setEmployees([]);
//       } finally {
//         setLoadingEmployees(false);
//       }
//     };

//     fetchEmployees();
//   }, [projectId, toast]);  // ✅ Re-fetch when projectId changes

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError(null);

//     // ✅ Basic validation: Ensure project and employee are selected
//     if (!projectId || !assignedToId) {
//       const message = "Please select a project and an employee.";
//       setError(message);
//       toast({ title: "Validation Error", description: message, variant: "destructive" });
//       return;
//     }

//     try {
//       await api.post("/tasks", {
//         title,
//         description,
//         projectId,
//         createdById: user.id,
//         assignedToId,
//       });
//       toast({ title: "Task Created!", description: "Your task has been added." });
//       navigate("/evaluator/dashboard");
//     } catch (err) {
//       const message = err.response?.data?.message || err.message || "Failed to create task";
//       setError(message);
//       toast({ title: "Error", description: message, variant: "destructive" });
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 to-white p-4">
//       <Card className="w-full max-w-md shadow-xl">
//         <CardHeader className="text-center pb-6">
//           <CardTitle className="text-2xl font-bold text-gray-800">Create New Task</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <form onSubmit={handleSubmit} className="space-y-5">
//             <div>
//               <Label htmlFor="title" className="text-sm font-medium">Title</Label>
//               <Input
//                 id="title"
//                 value={title}
//                 onChange={(e) => setTitle(e.target.value)}
//                 placeholder="Enter task title"
//                 required
//                 className="mt-1"
//               />
//             </div>

//             <div>
//               <Label htmlFor="description" className="text-sm font-medium">Description</Label>
//               <Input
//                 id="description"
//                 value={description}
//                 onChange={(e) => setDescription(e.target.value)}
//                 placeholder="Optional description"
//                 className="mt-1"
//               />
//             </div>

//             <div>
//               <Label htmlFor="project" className="text-sm font-medium">Project</Label>
//               <Select value={projectId} onValueChange={(value) => { setProjectId(value); setAssignedToId(""); }}>  {/* ✅ Reset employee on project change */}
//                 <SelectTrigger id="project" className="mt-1">
//                   <SelectValue placeholder="Select a project" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {projects.length === 0 ? (
//                     <SelectItem value="none" disabled>No projects available</SelectItem>
//                   ) : (
//                     projects.map(project => (
//                       <SelectItem key={project.id} value={project.id}>
//                         {project.name}
//                       </SelectItem>
//                     ))
//                   )}
//                 </SelectContent>
//               </Select>
//             </div>

//             <div>
//               <Label htmlFor="employee" className="text-sm font-medium">Assign To</Label>
//               <Select value={assignedToId} onValueChange={setAssignedToId} disabled={!projectId || loadingEmployees}>
//                 <SelectTrigger id="employee" className="mt-1">
//                   <SelectValue placeholder={loadingEmployees ? "Loading employees..." : "Select an employee"} />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {employees.length === 0 ? (
//                     <SelectItem value="none" disabled>No employees available for this project</SelectItem>
//                   ) : (
//                     employees.map(emp => (
//                       <SelectItem key={emp.id} value={emp.id}>
//                         {emp.name} ({emp.email}) - {emp.taskTitle} ({emp.status})
//                       </SelectItem>
//                     ))
//                   )}
//                 </SelectContent>
//               </Select>
//             </div>

//             {error && (
//               <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md text-sm">
//                 {error}
//               </div>
//             )}

//             <Button
//               type="submit"
//               className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5"
//               disabled={!projectId || !assignedToId}  // ✅ Disable if selections are incomplete
//             >
//               Create Task
//             </Button>
//           </form>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }
// frontend/src/pages/Evaluator/CreateTask.jsx
// frontend/src/pages/Evaluator/CreateTask.jsx
// frontend/src/pages/Evaluator/CreateTask.jsx
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
import "react-toastify/dist/ReactToastify.css";

// Services
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

  // Load all projects
  useEffect(() => {
    const load = async () => {
      try {
        const projs = await tasksService.getTasksByProject(""); // or use getAllProjects if exists
        // If you have a getAllProjects in tasksService, use that
        // For now, assuming you have a way to get projects
        // Replace with actual call:
        const response = await fetch("/api/projects");
        const data = await response.json();
        setProjects(data);
      } catch (_) {
        toast.error("Failed to load projects.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Load assigned employees when project changes
  useEffect(() => {
    if (!selectedProjectId) {
      setAssignedEmployees([]);
      setSelectedEmployeeId("");
      return;
    }

    const load = async () => {
      try {
        const emps = await tasksService.getEmployeesByProject(selectedProjectId);
        setAssignedEmployees(emps);
        setSelectedEmployeeId("");
      } catch (_) {
        toast.error("Failed to load assigned employees.");
        setAssignedEmployees([]);
      }
    };
    load();
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
      toast.success("Task created successfully!");
      navigate("/evaluator/tasks");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not create task.");
    } finally {
      setSaving(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <>
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
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
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
                      selectedProjectId
                        ? assignedEmployees.length === 0
                          ? "No employees assigned"
                          : "Select an employee..."
                        : "Select a project first"
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
              {!selectedProjectId && (
                <p className="text-xs text-gray-500 mt-1">
                  Select a project to see assigned employees
                </p>
              )}
              {selectedProjectId && assignedEmployees.length === 0 && (
                <p className="text-xs text-amber-600 mt-1">
                  No employees assigned. Use <strong>Assign Employees</strong> first.
                </p>
              )}
            </div>

            {/* Task Title */}
            <div>
              <label className="block text-sm font-medium mb-2">Task Title</label>
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
                placeholder="Provide details about the task..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <Button
                onClick={handleSubmit}
                disabled={saving || !title || !selectedProjectId || !selectedEmployeeId}
                className="w-full sm:w-auto"
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

        {/* Shortcut to Assign Employees */}
        {selectedProjectId && assignedEmployees.length === 0 && (
          <div className="mt-6 text-center">
            <Button
              variant="outline"
              onClick={() =>
                navigate(`/evaluator/assign-employees/${selectedProjectId}`)
              }
            >
              <Users className="mr-2 h-4 w-4" />
              Assign Employees to This Project
            </Button>
          </div>
        )}
      </div>
    </>
  );
}