import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion"; // reordered to avoid eslint warning
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
import ConfirmModal from "@/components/ConfirmModal";
import { Button } from "@/components/ui/button";
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

  const columns = [
    { key: "title", label: "Task Title" },
    { key: "description", label: "Description" },
    { key: "status", label: "Status" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-indigo-100 dark:from-gray-950 dark:to-gray-900 p-8">
      <AnimatePresence>
        <motion.div
          className="max-w-7xl mx-auto space-y-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="flex flex-col lg:flex-row justify-between items-center gap-6 bg-white/70 dark:bg-gray-800/50 backdrop-blur-lg border border-slate-200 dark:border-gray-700 p-6 rounded-2xl shadow-sm"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <h1 className="text-4xl font-semibold bg-gradient-to-r from-blue-700 to-cyan-500 bg-clip-text text-transparent flex items-center gap-3">
              <FolderOpen className="h-9 w-9 text-blue-600" />
              Task Management
            </h1>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 ml-1">
                  Select Project
                </label>
                <Select
                  value={selectedProjectId}
                  onValueChange={handleProjectChange}
                  disabled={loadingProjects}
                >
                  <SelectTrigger className="w-64 border border-blue-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200">
                    <SelectValue
                      placeholder={
                        loadingProjects ? "Loading projects..." : "Choose a project..."
                      }
                    />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-900 border border-blue-200 dark:border-gray-700 rounded-xl shadow-lg">
                    {loadingProjects ? (
                      <SelectItem value="loading" disabled>
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Loading...
                        </div>
                      </SelectItem>
                    ) : projects.length === 0 ? (
                      <SelectItem value="none" disabled>
                        No projects available
                      </SelectItem>
                    ) : (
                      projects.map((p) => (
                        <SelectItem
                          key={p.id}
                          value={p.id}
                          className="hover:bg-blue-50 dark:hover:bg-gray-800 rounded-lg"
                        >
                          <div className="flex items-center gap-2">
                            <FolderOpen className="h-4 w-4 text-blue-600" />
                            {p.name}
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={() => setModal({ open: true, task: null })}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl flex items-center gap-2 px-5 py-2.5 shadow-md hover:shadow-lg transition-all"
              >
                <Plus className="h-5 w-5" />
                New Task
              </Button>
            </div>
          </motion.div>

          {loadingTasks ? (
            <motion.div
              className="flex justify-center items-center py-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <DataTable
                title="Project Tasks"
                columns={columns}
                data={tasks}
                actions={(task) => (
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => setModal({ open: true, task })}
                      className="p-2.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition duration-200 shadow-sm hover:shadow-md"
                      title="Edit Task"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedTask(task);
                        setConfirmOpen(true);
                      }}
                      className="p-2.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition duration-200 shadow-sm hover:shadow-md"
                      title="Delete Task"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                )}
              />
            </motion.div>
          )}

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
            message={`Are you sure you want to delete "${selectedTask?.title}"? This action cannot be undone.`}
            type="error"
            onConfirm={handleDelete}
            onCancel={() => setConfirmOpen(false)}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
