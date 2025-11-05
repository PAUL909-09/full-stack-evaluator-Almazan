import { useEffect, useState } from "react";
import EvaluatorService from "@/services/EvaluatorService";
import { toast } from "react-toastify";
import { Loader2, ClipboardCheck, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function PendingEvaluations() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await EvaluatorService.getPendingTasks();
        setTasks(data);
      } catch {
        toast.error("Failed to load tasks for evaluation");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center h-64 text-gray-600">
        <Loader2 className="animate-spin mr-2" /> Loading pending tasks...
      </div>
    );

  if (tasks.length === 0)
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <AlertCircle className="w-8 h-8 mb-2" />
        <p>No tasks need evaluation right now.</p>
      </div>
    );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Tasks Needing Evaluation</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="border p-4 rounded-xl shadow-sm bg-white hover:shadow-md transition"
          >
            <h2 className="font-medium text-lg text-gray-800">
              {task.title}
            </h2>
            <p className="text-sm text-gray-500 mb-2">
              Assigned to: {task.assignedTo?.firstname} {task.assignedTo?.lastname}
            </p>
            <p className="text-xs text-gray-400 mb-4">
              Status: {task.status}
            </p>
            <button
              onClick={() => navigate(`/evaluator/tasks/${task.id}/evaluate`)}
              className="w-full flex items-center justify-center bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
            >
              <ClipboardCheck className="w-4 h-4 mr-2" />
              Evaluate
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
