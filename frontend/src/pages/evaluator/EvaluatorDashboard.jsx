import React, { useEffect, useState } from "react";
import api from "@/api/axios";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import ConfirmModal from "@/components/ConfirmModal";

export default function EvaluatorDashboard() {
  const [tasks, setTasks] = useState([]);
  const [evaluations, setEvaluations] = useState({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedEval, setSelectedEval] = useState(null);
  const { toast } = useToast();

  // Load tasks assigned to evaluator
  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const res = await api.get("/tasks");
      setTasks(res.data);
    } catch (err) {
      toast({
        title: "Failed to load tasks",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  // Load evaluation per task
  const fetchEvaluation = async (taskId) => {
    try {
      const res = await api.get(`/tasks/${taskId}/evaluations`);
      setEvaluations((prev) => ({ ...prev, [taskId]: res.data }));
    } catch {
      // Ignore if not yet evaluated
    }
  };

  // When evaluator clicks “Evaluate” button
  const handleEvaluateClick = (taskId) => {
    setSelectedEval({ taskId, score: "", comments: "" });
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    const { taskId, score, comments } = selectedEval;
    try {
      await api.post(`/tasks/${taskId}/evaluations`, {
        evaluatorId: getEvaluatorId(),
        score: parseFloat(score),
        comments,
      });
      toast({ title: "Evaluation submitted successfully!" });
      setConfirmOpen(false);
      await fetchEvaluation(taskId);
      await loadTasks();
    } catch (err) {
      toast({
        title: "Failed to submit evaluation",
        description: err.response?.data || err.message,
        variant: "destructive",
      });
    }
  };

  const getEvaluatorId = () => {
    // decode from localStorage (if token stored)
    const token = localStorage.getItem("token");
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.nameid;
    } catch {
      return null;
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold mb-8 text-gray-800">
        Evaluator Dashboard
      </h1>

      {tasks.length === 0 ? (
        <p className="text-gray-500 text-lg">
          No tasks available for evaluation.
        </p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition"
            >
              <h3 className="text-xl font-semibold text-blue-700">
                {task.title}
              </h3>
              <p className="text-gray-600 mt-2">
                {task.description || "No description available"}
              </p>

              <div className="mt-4">
                <p className="text-sm text-gray-500">
                  <span className="font-medium">Status:</span> {task.status}
                </p>
              </div>

              {evaluations[task.id] ? (
                <div className="mt-4 border-t pt-3">
                  <p className="text-green-700 font-medium">
                    ✅ Already evaluated
                  </p>
                  <p className="text-sm text-gray-600">
                    Score: {evaluations[task.id].score}
                  </p>
                  <p className="text-sm text-gray-600">
                    Comments: {evaluations[task.id].comments}
                  </p>
                </div>
              ) : (
                <div className="mt-5 flex justify-end">
                  <Button
                    onClick={() => handleEvaluateClick(task.id)}
                    className="bg-gradient-to-r from-[#0A66B3] to-[#3FA9F5] text-white hover:opacity-90"
                  >
                    Evaluate
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Confirm Modal for submission */}
      <ConfirmModal
        open={confirmOpen}
        title="Submit Evaluation"
        message={
          <div className="space-y-4 text-left">
            <label className="block">
              <span className="text-sm text-gray-700">Score:</span>
              <input
                type="number"
                min="0"
                max="100"
                step="1"
                value={selectedEval?.score || ""}
                onChange={(e) =>
                  setSelectedEval((prev) => ({
                    ...prev,
                    score: e.target.value,
                  }))
                }
                className="w-full mt-1 border rounded-md px-3 py-2 text-sm"
              />
            </label>
            <label className="block">
              <span className="text-sm text-gray-700">Comments:</span>
              <textarea
                rows="3"
                value={selectedEval?.comments || ""}
                onChange={(e) =>
                  setSelectedEval((prev) => ({
                    ...prev,
                    comments: e.target.value,
                  }))
                }
                className="w-full mt-1 border rounded-md px-3 py-2 text-sm"
              />
            </label>
          </div>
        }
        onConfirm={handleConfirm}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
