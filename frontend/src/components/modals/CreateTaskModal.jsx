// // frontend/src/components/modals/CreateTaskModal.jsx
// import { useState, useEffect } from "react";
// import { Link } from "react-router-dom"; // Add this import for navigation
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Loader2, FilePlus, Users, X } from "lucide-react";
// import { toast } from "react-toastify";
// // eslint-disable-next-line no-unused-vars
// import { motion, AnimatePresence } from "framer-motion";

// import { getMyProjects } from "@/services/projectService";
// import { getEmployeesByProject } from "@/services/tasksService";
// import { authService } from "@/services/authService";

// export default function CreateTaskModal({
//   open,
//   onClose,
//   task,
//   projectId,
//   onSave,
// }) {
//   const [projects, setProjects] = useState([]);
//   const [selectedProjectId, setSelectedProjectId] = useState(projectId || "");
//   const [assignedEmployees, setAssignedEmployees] = useState([]);
//   const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
//   const [title, setTitle] = useState("");
//   const [description, setDescription] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);

//   const user = authService.getCurrentUser(); // includes .id

//   // Pre-fill when editing
//   useEffect(() => {
//     if (task) {
//       setTitle(task.title || "");
//       setDescription(task.description || "");
//       setSelectedProjectId(task.projectId || projectId || "");
//       setSelectedEmployeeId(task.assignedToId || "");
//     } else {
//       setTitle("");
//       setDescription("");
//       setSelectedProjectId(projectId || "");
//       setSelectedEmployeeId("");
//     }
//   }, [task, projectId]);

//   // Load evaluator's projects
//   useEffect(() => {
//     (async () => {
//       try {
//         const data = await getMyProjects();
//         setProjects(data);
//       } catch {
//         toast.error("Failed to load projects.");
//       } finally {
//         setLoading(false);
//       }
//     })();
//   }, []);

//   // Load employees when project changes
//   useEffect(() => {
//     if (!selectedProjectId) {
//       setAssignedEmployees([]);
//       setSelectedEmployeeId("");
//       return;
//     }

//     (async () => {
//       try {
//         const data = await getEmployeesByProject(selectedProjectId); // ← direct call
//         setAssignedEmployees(data);
//       } catch {
//         toast.error("Failed to load employees.");
//         setAssignedEmployees([]);
//       }
//     })();
//   }, [selectedProjectId]);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!title.trim() || !selectedProjectId || !selectedEmployeeId) {
//       toast.warn("Please fill all required fields.");
//       return;
//     }

//     if (!user?.id) {
//       toast.error("User not found. Please re-login.");
//       return;
//     }

//     const payload = {
//       title: title.trim(),
//       description: description.trim(),
//       projectId: selectedProjectId,
//       assignedToId: selectedEmployeeId,
//     };

//     // Only add createdById when creating
//     if (!task) {
//       payload.createdById = user.id;
//     }

//     setSaving(true);
//     try {
//       await onSave(payload, !!task);
//       onClose();
//     } catch (err) {
//       console.error("Create Task Error:", err);
//       toast.error(err.response?.data || "Failed to save task.");
//     } finally {
//       setSaving(false);
//     }
//   };

//   const isEdit = Boolean(task);

//   return (
//     <AnimatePresence>
//       {open && (
//         <motion.div
//           className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           exit={{ opacity: 0 }}
//         >
//           <motion.div
//             className="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-[#A0DCFC]/40 p-8"
//             initial={{ scale: 0.95, opacity: 0, y: 20 }}
//             animate={{ scale: 1, opacity: 1, y: 0 }}
//             exit={{ scale: 0.95, opacity: 0, y: 20 }}
//             transition={{ duration: 0.25 }}
//           >
//             {/* Close Button */}
//             <button
//               onClick={onClose}
//               className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
//             >
//               <X className="w-5 h-5" />
//             </button>

//             {/* Title */}
//             <h1 className="text-2xl font-bold text-center mb-6 bg-gradient-to-r from-blue-600 to-sky-400 bg-clip-text text-transparent flex items-center justify-center gap-2">
//               <FilePlus className="h-6 w-6" />
//               {isEdit ? "Edit Task" : "Create New Task"}
//             </h1>

//             {loading ? (
//               <div className="flex items-center justify-center py-10">
//                 <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
//               </div>
//             ) : (
//               /* Form */
//               <form onSubmit={handleSubmit} className="space-y-5">
//                 {/* Project Selector */}
//                 <div>
//                   <Label className="text-gray-700 dark:text-gray-300 font-medium">
//                     Project
//                   </Label>
//                   <Select
//                     value={selectedProjectId}
//                     onValueChange={setSelectedProjectId}
//                   >
//                     <SelectTrigger className="mt-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500">
//                       <SelectValue placeholder="Select a project..." />
//                     </SelectTrigger>
//                     <SelectContent>
//                       {projects.length === 0 ? (
//                         <SelectItem value="none" disabled>
//                           No projects found
//                         </SelectItem>
//                       ) : (
//                         projects.map((p) => (
//                           <SelectItem key={p.id} value={p.id}>
//                             {p.name}
//                           </SelectItem>
//                         ))
//                       )}
//                     </SelectContent>
//                   </Select>
//                 </div>

//                 {/* Employee Selector */}
//                 <div>
//                   <Label className="text-gray-700 dark:text-gray-300 font-medium flex items-center gap-1">
//                     <Users className="h-4 w-4" /> Assign To
//                   </Label>
//                   <Select
//                     value={selectedEmployeeId}
//                     onValueChange={setSelectedEmployeeId}
//                     disabled={
//                       !selectedProjectId || assignedEmployees.length === 0
//                     }
//                   >
//                     <SelectTrigger className="mt-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500">
//                       <SelectValue
//                         placeholder={
//                           !selectedProjectId
//                             ? "Select a project first"
//                             : assignedEmployees.length === 0
//                             ? "No employees assigned"
//                             : "Select an employee..."
//                         }
//                       />
//                     </SelectTrigger>
//                     <SelectContent>
//                       {assignedEmployees.map((e) => (
//                         <SelectItem key={e.id} value={e.id}>
//                           {e.name} ({e.email})
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>

//                   {selectedProjectId && assignedEmployees.length === 0 && (
//                     <p className="text-xs text-amber-600 mt-1">
//                       No employees assigned.{" "}
//                       <Link
//                         to={`/evaluator/manage-assignments/${selectedProjectId}`}
//                         className="text-blue-600 hover:text-blue-800 underline"
//                         title="Manage Assignments"
//                       >
//                         Assign Employee first
//                       </Link>
//                     </p>
//                   )}
//                 </div>

//                 {/* Task Title */}
//                 <div>
//                   <Label className="text-gray-700 dark:text-gray-300 font-medium">
//                     Task Title *
//                   </Label>
//                   <Input
//                     placeholder="e.g., Implement login API"
//                     value={title}
//                     onChange={(e) => setTitle(e.target.value)}
//                     required
//                     className="mt-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500"
//                   />
//                 </div>

//                 {/* Description */}
//                 <div>
//                   <Label className="text-gray-700 dark:text-gray-300 font-medium">
//                     Description
//                   </Label>
//                   <textarea
//                     className="w-full p-3 mt-2 border border-gray-300 dark:border-gray-600 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                     placeholder="Provide details about the task..."
//                     value={description}
//                     onChange={(e) => setDescription(e.target.value)}
//                     rows={4}
//                   />
//                 </div>

//                 {/* Buttons */}
//                 <div className="flex justify-end gap-3 mt-6">
//                   <Button
//                     type="button"
//                     variant="outline"
//                     onClick={onClose}
//                     className="px-4 py-2"
//                   >
//                     Cancel
//                   </Button>
//                   <Button
//                     type="submit"
//                     disabled={
//                       saving ||
//                       !title ||
//                       !selectedProjectId ||
//                       !selectedEmployeeId
//                     }
//                     className={`px-4 py-2 text-white font-semibold rounded-lg shadow-md transition duration-200 ${
//                       isEdit
//                         ? "bg-blue-600 hover:bg-blue-700"
//                         : "bg-emerald-600 hover:bg-emerald-700"
//                     }`}
//                   >
//                     {saving ? (
//                       <>
//                         <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                         Saving...
//                       </>
//                     ) : isEdit ? (
//                       "Update Task"
//                     ) : (
//                       "Create Task"
//                     )}
//                   </Button>
//                 </div>
//               </form>
//             )}
//           </motion.div>
//         </motion.div>
//       )}
//     </AnimatePresence>
//   );
// }
// frontend\src\components\modals\CreateTaskModal.jsx (Updated)
import { useState, useEffect } from "react";
import { Link } from "react-router-dom"; // Add this import for navigation
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, FilePlus, Users, X, Calendar } from "lucide-react";
import { toast } from "react-toastify";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { getMyProjects } from "@/services/projectService";
import { getEmployeesByProject } from "@/services/tasksService";
import { authService } from "@/services/authService";
export default function CreateTaskModal({
  open,
  onClose,
  task,
  projectId,
  onSave,
}) {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(projectId || "");
  const [assignedEmployees, setAssignedEmployees] = useState([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState(""); // ← NEW: State for deadline (yyyy-mm-dd)
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const user = authService.getCurrentUser(); // includes .id
  // Pre-fill when editing
  useEffect(() => {
    if (task) {
      setTitle(task.title || "");
      setDescription(task.description || "");
      setSelectedProjectId(task.projectId || projectId || "");
      setSelectedEmployeeId(task.assignedToId || "");
      setDeadline(task.deadline ? new Date(task.deadline).toISOString().split('T')[0] : ""); // ← NEW: Format for input[type=date]
    } else {
      setTitle("");
      setDescription("");
      setSelectedProjectId(projectId || "");
      setSelectedEmployeeId("");
      setDeadline(""); // ← NEW
    }
  }, [task, projectId]);
  // Load evaluator's projects
  useEffect(() => {
    (async () => {
      try {
        const data = await getMyProjects();
        setProjects(data);
      } catch {
        toast.error("Failed to load projects.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);
  // Load employees when project changes
  useEffect(() => {
    if (!selectedProjectId) {
      setAssignedEmployees([]);
      setSelectedEmployeeId("");
      return;
    }
    (async () => {
      try {
        const data = await getEmployeesByProject(selectedProjectId); // ← direct call
        setAssignedEmployees(data);
      } catch {
        toast.error("Failed to load employees.");
        setAssignedEmployees([]);
      }
    })();
  }, [selectedProjectId]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !selectedProjectId || !selectedEmployeeId) {
      toast.warn("Please fill all required fields.");
      return;
    }
    if (!user?.id) {
      toast.error("User not found. Please re-login.");
      return;
    }
    const payload = {
      title: title.trim(),
      description: description.trim(),
      projectId: selectedProjectId,
      assignedToId: selectedEmployeeId,
      deadline: deadline ? new Date(deadline).toISOString() : null, // ← NEW: Convert to ISO for backend
    };
    // Only add createdById when creating
    if (!task) {
      payload.createdById = user.id;
    }
    setSaving(true);
    try {
      await onSave(payload, !!task);
      onClose();
    } catch (err) {
      console.error("Create Task Error:", err);
      toast.error(err.response?.data || "Failed to save task.");
    } finally {
      setSaving(false);
    }
  };
  const isEdit = Boolean(task);
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
            className="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-[#A0DCFC]/40 p-8"
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
            <h1 className="text-2xl font-bold text-center mb-6 bg-gradient-to-r from-blue-600 to-sky-400 bg-clip-text text-transparent flex items-center justify-center gap-2">
              <FilePlus className="h-6 w-6" />
              {isEdit ? "Edit Task" : "Create New Task"}
            </h1>
            {loading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              </div>
            ) : (
              /* Form */
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Project Selector */}
                <div>
                  <Label className="text-gray-700 dark:text-gray-300 font-medium">
                    Project
                  </Label>
                  <Select
                    value={selectedProjectId}
                    onValueChange={setSelectedProjectId}
                  >
                    <SelectTrigger className="mt-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue placeholder="Select a project..." />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.length === 0 ? (
                        <SelectItem value="none" disabled>
                          No projects found
                        </SelectItem>
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
                  <Label className="text-gray-700 dark:text-gray-300 font-medium flex items-center gap-1">
                    <Users className="h-4 w-4" /> Assign To
                  </Label>
                  <Select
                    value={selectedEmployeeId}
                    onValueChange={setSelectedEmployeeId}
                    disabled={
                      !selectedProjectId || assignedEmployees.length === 0
                    }
                  >
                    <SelectTrigger className="mt-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500">
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
                  {selectedProjectId && assignedEmployees.length === 0 && (
                    <p className="text-xs text-amber-600 mt-1">
                      No employees assigned.{" "}
                      <Link
                        to={`/evaluator/manage-assignments/${selectedProjectId}`}
                        className="text-blue-600 hover:text-blue-800 underline"
                        title="Manage Assignments"
                      >
                        Assign Employee first
                      </Link>
                    </p>
                  )}
                </div>
                {/* Task Title */}
                <div>
                  <Label className="text-gray-700 dark:text-gray-300 font-medium">
                    Task Title *
                  </Label>
                  <Input
                    placeholder="e.g., Implement login API"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="mt-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                {/* Description */}
                <div>
                  <Label className="text-gray-700 dark:text-gray-300 font-medium">
                    Description
                  </Label>
                  <textarea
                    className="w-full p-3 mt-2 border border-gray-300 dark:border-gray-600 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Provide details about the task..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                  />
                </div>
                {/* Deadline (NEW) */}
                <div>
                  <Label className="text-gray-700 dark:text-gray-300 font-medium flex items-center gap-1">
                    <Calendar className="h-4 w-4" /> Deadline (Optional)
                  </Label>
                  <Input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="mt-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                {/* Buttons */}
                <div className="flex justify-end gap-3 mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    className="px-4 py-2"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={
                      saving ||
                      !title ||
                      !selectedProjectId ||
                      !selectedEmployeeId
                    }
                    className={`px-4 py-2 text-white font-semibold rounded-lg shadow-md transition duration-200 ${
                      isEdit
                        ? "bg-blue-600 hover:bg-blue-700"
                        : "bg-emerald-600 hover:bg-emerald-700"
                    }`}
                  >
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : isEdit ? (
                      "Update Task"
                    ) : (
                      "Create Task"
                    )}
                  </Button>
                </div>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}