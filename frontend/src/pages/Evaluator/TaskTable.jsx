// // frontend/src/pages/Evaluator/TaskTable.jsx
// import { useEffect, useState, useCallback } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { toast } from "react-toastify";

// import {
//   getTasksByProject,
//   createTask,
//   updateTask,
//   deleteTask,
// } from "@/services/tasksService";
// import { getMyProjects } from "@/services/projectService";

// import DataTable from "@/components/table/DataTable";
// import CreateTaskModal from "@/components/modals/CreateTaskModal";
// import ConfirmModal from "@/components/modals/ConfirmModal";
// import { Button } from "@/components/ui/button";
// import FilterDropdown from "@/components/FilterDropdown";

// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";

// import {
//   Plus,
//   Loader2,
//   Edit,
//   Trash2,
//   FolderOpen,
// } from "lucide-react";

// import { getStatusConfig } from "@/config/taskStatusConfig";

// export default function TaskTable() {
//   const { projectId } = useParams();
//   const navigate = useNavigate();

//   const [tasks, setTasks] = useState([]);
//   const [projects, setProjects] = useState([]);
//   const [selectedProjectId, setSelectedProjectId] = useState("");
//   const [loadingTasks, setLoadingTasks] = useState(false);
//   const [loadingProjects, setLoadingProjects] = useState(true);

//   const [modal, setModal] = useState({ open: false, task: null });
//   const [confirmOpen, setConfirmOpen] = useState(false);
//   const [selectedTask, setSelectedTask] = useState(null);

//   const [filters, setFilters] = useState([]);

//   // -------------------------------------------------------------
//   // Load Projects
//   // -------------------------------------------------------------
//   useEffect(() => {
//     (async () => {
//       try {
//         const data = await getMyProjects();
//         setProjects(data);

//         if (projectId && data.some((p) => p.id === projectId)) {
//           setSelectedProjectId(projectId);
//         } else if (data.length > 0) {
//           const first = data[0].id;
//           setSelectedProjectId(first);
//           navigate(`/evaluator/project/${first}/tasks`, { replace: true });
//         }
//       } catch {
//         toast.error("Failed to load projects");
//       } finally {
//         setLoadingProjects(false);
//       }
//     })();
//   }, [projectId, navigate]);

//   // -------------------------------------------------------------
//   // Load Tasks
//   // -------------------------------------------------------------
//   const fetchTasks = useCallback(async () => {
//     if (!selectedProjectId) return;
//     try {
//       setLoadingTasks(true);
//       const data = await getTasksByProject(selectedProjectId);
//       setTasks(data ?? []);
//     } catch {
//       toast.error("Failed to load tasks");
//       setTasks([]);
//     } finally {
//       setLoadingTasks(false);
//     }
//   }, [selectedProjectId]);

//   useEffect(() => {
//     fetchTasks();
//   }, [fetchTasks]);

//   const handleProjectChange = (id) => {
//     setSelectedProjectId(id);
//     navigate(`/evaluator/project/${id}/tasks`);
//   };

//   // -------------------------------------------------------------
//   // Save Task
//   // -------------------------------------------------------------
//   const handleSave = async (formData, isEdit) => {
//     try {
//       if (isEdit && modal.task?.id) {
//         await updateTask(modal.task.id, formData);
//       } else {
//         await createTask({ ...formData, projectId: selectedProjectId });
//       }

//       setModal({ open: false, task: null });
//       await fetchTasks();
//       toast.success(`Task ${isEdit ? "updated" : "created"}`);
//     } catch {
//       toast.error("Failed to save task");
//     }
//   };

//   // -------------------------------------------------------------
//   // Delete Task
//   // -------------------------------------------------------------
//   const handleDelete = async () => {
//     if (!selectedTask?.id) return;
//     try {
//       await deleteTask(selectedTask.id);
//       setConfirmOpen(false);
//       await fetchTasks();
//       toast.success("Task deleted");
//     } catch {
//       toast.error("Failed to delete task");
//     }
//   };

//   // -------------------------------------------------------------
//   // Table Columns
//   // -------------------------------------------------------------
//   const columns = [
//     { key: "title", label: "Task Title" },
//     { key: "description", label: "Description" },
//     { key: "status", label: "Status" },
//   ];

//   // -------------------------------------------------------------
//   // Filtering Logic
//   // -------------------------------------------------------------
//   const filteredTasks =
//     filters.length === 0
//       ? tasks
//       : tasks.filter((task) =>
//           filters.includes(task.status?.toLowerCase())
//         );

//   return (
//     <div className="p-8 bg-gradient-to-br from-[#F8FBFF] to-[#E9F4FF] rounded-2xl shadow-inner min-h-screen">
//       <div className="flex justify-between items-center mb-8">
//         <div className="flex items-center space-x-4">
//           <FolderOpen className="h-10 w-10 text-[#0A66B3]" />
//           <div>
//             <h1 className="text-4xl font-bold text-[#0A66B3]">Task Management</h1>
//             <p className="text-gray-600">Track progress and deadlines</p>
//           </div>
//         </div>

//         <div className="flex items-center gap-4">
//           {/* Status Filter */}
//           <FilterDropdown onChange={setFilters} />

//           {/* Project Selector */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1 ml-1">
//               Select Project
//             </label>

//             <Select
//               value={selectedProjectId}
//               onValueChange={handleProjectChange}
//               disabled={loadingProjects}
//             >
//               <SelectTrigger className="w-64 border border-gray-300 rounded-xl bg-white">
//                 <SelectValue
//                   placeholder={
//                     loadingProjects ? "Loading projects..." : "Choose a project..."
//                   }
//                 />
//               </SelectTrigger>

//               <SelectContent>
//                 {loadingProjects ? (
//                   <SelectItem value="loading" disabled>
//                     <div className="flex items-center gap-2">
//                       <Loader2 className="h-4 w-4 animate-spin" /> Loading...
//                     </div>
//                   </SelectItem>
//                 ) : projects.length === 0 ? (
//                   <SelectItem value="none" disabled>
//                     No projects available
//                   </SelectItem>
//                 ) : (
//                   projects.map((p) => (
//                     <SelectItem key={p.id} value={p.id}>
//                       <div className="flex items-center gap-2">
//                         <FolderOpen className="h-4 w-4 text-[#0A66B3]" />
//                         {p.name}
//                       </div>
//                     </SelectItem>
//                   ))
//                 )}
//               </SelectContent>
//             </Select>
//           </div>

//           {/* Create Task */}
//           <Button
//             onClick={() => setModal({ open: true, task: null })}
//             className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl flex items-center gap-3 shadow-lg text-lg px-6 py-3"
//           >
//             <Plus className="h-6 w-6" />
//             New Task
//           </Button>
//         </div>
//       </div>

//       {/* Table Content */}
//       {loadingTasks ? (
//         <div className="text-center py-20 text-gray-500 text-lg animate-pulse">
//           Loading tasks...
//         </div>
//       ) : filteredTasks.length === 0 ? (
//         <div className="text-center py-20">
//           <FolderOpen className="h-20 w-20 text-gray-300 mx-auto mb-4" />
//           <p className="text-xl text-gray-500">No tasks yet. Create your first one!</p>
//         </div>
//       ) : (
//         <DataTable
//           title="Project Tasks"
//           columns={columns}
//           data={filteredTasks.map((task) => {
//             const statusConfig = getStatusConfig(task.status);
//             const StatusIcon = statusConfig.icon;

//             return {
//               ...task,
//               status: (
//                 <span
//                   className={`inline-flex items-center text-xs font-semibold ${statusConfig.color.replace(
//                     "bg-",
//                     "text-"
//                   )}`}
//                 >
//                   <StatusIcon className="w-4 h-4 mr-1" />
//                   {statusConfig.label}
//                 </span>
//               ),
//             };
//           })}
//           actions={(task) => (
//             <div className="flex justify-center gap-2">
//               <button
//                 onClick={() => setModal({ open: true, task })}
//                 className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
//               >
//                 <Edit className="h-5 w-5" />
//               </button>

//               <button
//                 onClick={() => {
//                   setSelectedTask(task);
//                   setConfirmOpen(true);
//                 }}
//                 className="p-2.5 text-red-600 hover:bg-red-50 rounded-lg transition"
//               >
//                 <Trash2 className="h-5 w-5" />
//               </button>
//             </div>
//           )}
//         />
//       )}

//       {/* Modals */}
//       <CreateTaskModal
//         open={modal.open}
//         onClose={() => setModal({ open: false, task: null })}
//         task={modal.task}
//         projectId={selectedProjectId}
//         onSave={handleSave}
//       />

//       <ConfirmModal
//         open={confirmOpen}
//         title="Delete Task"
//         message={`Are you sure you want to delete "${selectedTask?.title}"?`}
//         type="error"
//         onConfirm={handleDelete}
//         onCancel={() => setConfirmOpen(false)}
//       />
//     </div>
//   );
// }
// frontend/src/pages/Evaluator/TaskTable.jsx
// frontend\src\pages\Evaluator\TaskTable.jsx (Updated)
import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  getTasksByProject,
  createTask,
  updateTask,
  deleteTask,
} from "@/services/tasksService";
import { getMyProjects } from "@/services/projectService";
import DataTable from "@/components/table/DataTable";
import CreateTaskModal from "@/components/modals/CreateTaskModal";
import ConfirmModal from "@/components/modals/ConfirmModal";
import { Button } from "@/components/ui/button";
import FilterDropdown from "@/components/FilterDropdown";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Loader2,
  Edit,
  Trash2,
  FolderOpen,
} from "lucide-react";
import { getStatusConfig } from "@/config/taskStatusConfig";
export default function TaskTable() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [modal, setModal] = useState({ open: false, task: null });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [filters, setFilters] = useState([]);
  // -------------------------------------------------------------
  // Load Projects
  // -------------------------------------------------------------
  useEffect(() => {
    (async () => {
      try {
        const data = await getMyProjects();
        setProjects(data);
        if (projectId && data.some((p) => p.id === projectId)) {
          setSelectedProjectId(projectId);
        } else if (data.length > 0) {
          const first = data[0].id;
          setSelectedProjectId(first);
          navigate(`/evaluator/project/${first}/tasks`, { replace: true });
        }
      } catch {
        toast.error("Failed to load projects");
      } finally {
        setLoadingProjects(false);
      }
    })();
  }, [projectId, navigate]);
  // -------------------------------------------------------------
  // Load Tasks
  // -------------------------------------------------------------
  const fetchTasks = useCallback(async () => {
    if (!selectedProjectId) return;
    try {
      setLoadingTasks(true);
      const data = await getTasksByProject(selectedProjectId);
      setTasks(data ?? []);
    } catch {
      toast.error("Failed to load tasks");
      setTasks([]);
    } finally {
      setLoadingTasks(false);
    }
  }, [selectedProjectId]);
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);
  const handleProjectChange = (id) => {
    setSelectedProjectId(id);
    navigate(`/evaluator/project/${id}/tasks`);
  };
  // -------------------------------------------------------------
  // Save Task
  // -------------------------------------------------------------
  const handleSave = async (formData, isEdit) => {
    try {
      if (isEdit && modal.task?.id) {
        await updateTask(modal.task.id, formData);
      } else {
        await createTask({ ...formData, projectId: selectedProjectId });
      }
      setModal({ open: false, task: null });
      await fetchTasks();
      toast.success(`Task ${isEdit ? "updated" : "created"}`);
    } catch {
      toast.error("Failed to save task");
    }
  };
  // -------------------------------------------------------------
  // Delete Task
  // -------------------------------------------------------------
  const handleDelete = async () => {
    if (!selectedTask?.id) return;
    try {
      await deleteTask(selectedTask.id);
      setConfirmOpen(false);
      await fetchTasks();
      toast.success("Task deleted");
    } catch {
      toast.error("Failed to delete task");
    }
  };
  // -------------------------------------------------------------
  // Table Columns (UPDATED: Added Deadline column)
  // -------------------------------------------------------------
  const columns = [
    { key: "title", label: "Task Title" },
    { key: "description", label: "Description" },
    { key: "status", label: "Status" },
    { key: "deadline", label: "Deadline" }, // ← NEW
  ];
  // -------------------------------------------------------------
  // Filtering Logic
  // -------------------------------------------------------------
  const filteredTasks =
    filters.length === 0
      ? tasks
      : tasks.filter((task) =>
          filters.includes(task.status?.toLowerCase())
        );
  return (
    <div className="p-8 bg-gradient-to-br from-[#F8FBFF] to-[#E9F4FF] rounded-2xl shadow-inner min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center space-x-4">
          <FolderOpen className="h-10 w-10 text-[#0A66B3]" />
          <div>
            <h1 className="text-4xl font-bold text-[#0A66B3]">Task Management</h1>
            <p className="text-gray-600">Track progress and deadlines</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {/* Status Filter */}
          <FilterDropdown onChange={setFilters} />
          {/* Project Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 ml-1">
              Select Project
            </label>
            <Select
              value={selectedProjectId}
              onValueChange={handleProjectChange}
              disabled={loadingProjects}
            >
              <SelectTrigger className="w-64 border border-gray-300 rounded-xl bg-white">
                <SelectValue
                  placeholder={
                    loadingProjects ? "Loading projects..." : "Choose a project..."
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {loadingProjects ? (
                  <SelectItem value="loading" disabled>
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" /> Loading...
                    </div>
                  </SelectItem>
                ) : projects.length === 0 ? (
                  <SelectItem value="none" disabled>
                    No projects available
                  </SelectItem>
                ) : (
                  projects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      <div className="flex items-center gap-2">
                        <FolderOpen className="h-4 w-4 text-[#0A66B3]" />
                        {p.name}
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          {/* Create Task */}
          <Button
            onClick={() => setModal({ open: true, task: null })}
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl flex items-center gap-3 shadow-lg text-lg px-6 py-3"
          >
            <Plus className="h-6 w-6" />
            New Task
          </Button>
        </div>
      </div>
      {/* Table Content */}
      {loadingTasks ? (
        <div className="text-center py-20 text-gray-500 text-lg animate-pulse">
          Loading tasks...
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="text-center py-20">
          <FolderOpen className="h-20 w-20 text-gray-300 mx-auto mb-4" />
          <p className="text-xl text-gray-500">No tasks yet. Create your first one!</p>
        </div>
      ) : (
        <DataTable
          title="Project Tasks"
          columns={columns}
          data={filteredTasks.map((task) => {
            const statusConfig = getStatusConfig(task.status);
            const StatusIcon = statusConfig.icon;
            return {
              ...task,
              status: (
                <span
                  className={`inline-flex items-center text-xs font-semibold ${statusConfig.color.replace(
                    "bg-",
                    "text-"
                  )}`}
                >
                  <StatusIcon className="w-4 h-4 mr-1" />
                  {statusConfig.label}
                </span>
              ),
              deadline: task.deadline ? new Date(task.deadline).toLocaleDateString() : "N/A", // ← NEW: Format deadline
            };
          })}
          actions={(task) => (
            <div className="flex justify-center gap-2">
              <button
                onClick={() => setModal({ open: true, task })}
                className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
              >
                <Edit className="h-5 w-5" />
              </button>
              <button
                onClick={() => {
                  setSelectedTask(task);
                  setConfirmOpen(true);
                }}
                className="p-2.5 text-red-600 hover:bg-red-50 rounded-lg transition"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          )}
        />
      )}
      {/* Modals */}
      <CreateTaskModal
        open={modal.open}
        onClose={() => setModal({ open: false, task: null })}
        task={modal.task}
        projectId={selectedProjectId}
        onSave={handleSave}
      />
      <ConfirmModal
        open={confirmOpen}
        title="Delete Task"
        message={`Are you sure you want to delete "${selectedTask?.title}"?`}
        type="error"
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}