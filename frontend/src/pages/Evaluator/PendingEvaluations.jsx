// frontend/src/pages/Evaluator/PendingEvaluations.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import evaluationService from "@/services/evaluationService";
import { authService } from "@/services/authService";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Badge from "@/components/ui/badge";
import ConfirmModal from "@/components/ConfirmModal";
import { toast } from "react-toastify";

const statusColors = {
  Todo: "bg-gray-500",
  InProgress: "bg-yellow-500",
  Done: "bg-green-500",
  Submitted: "bg-blue-500",
  Approved: "bg-emerald-600",
  NeedsRevision: "bg-orange-500",
  Rejected: "bg-red-600",
};

const evaluationStatuses = ["Approved", "NeedsRevision", "Rejected"];

export default function PendingEvaluations() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [evaluations, setEvaluations] = useState({});
  const [loading, setLoading] = useState(true);
  const [evaluationsLoading, setEvaluationsLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedEval, setSelectedEval] = useState(null);
  const apiBase = import.meta.env.VITE_API_URL.replace("/api", ""); // Remove /api

  // Load Pending Tasks
  useEffect(() => {
    const loadPendingTasks = async () => {
      try {
        const data = await evaluationService.getPendingTasks();
        setTasks(data);
        await loadEvaluations(data);
      } catch (error) {
        toast.error(error.message || "Failed to load pending tasks");
      } finally {
        setLoading(false);
      }
    };
    loadPendingTasks();
  }, []);

  // Load evaluations for all tasks
  const loadEvaluations = async (taskList) => {
    setEvaluationsLoading(true);
    try {
      const evaluationPromises = taskList.map(async (task) => {
        try {
          const evalData = await evaluationService.getEvaluation(task.id);
          return { taskId: task.id, evaluation: evalData };
        } catch (err) {
          if (err.response?.status === 404)
            return { taskId: task.id, evaluation: null };
          throw err;
        }
      });
      const results = await Promise.all(evaluationPromises);
      const evalMap = {};
      results.forEach(({ taskId, evaluation }) => {
        evalMap[taskId] = evaluation;
      });
      setEvaluations(evalMap);
    } catch (error) {
      toast.error("Failed to load some evaluations");
    } finally {
      setEvaluationsLoading(false);
    }
  };

  const handleEvaluateClick = (taskId) => {
    const existingEval = evaluations[taskId];
    setSelectedEval({
      taskId,
      status: existingEval?.status || "Approved",
      comments: existingEval?.comments || "",
      isUpdate: !!existingEval,
    });
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    const { taskId, status, comments, isUpdate } = selectedEval;
    try {
      const data = { status, comments };
      if (isUpdate) {
        await evaluationService.updateEvaluation(taskId, data);
        toast.success("Evaluation updated successfully!");
      } else {
        await evaluationService.createEvaluation({ taskId, ...data });
        toast.success("Evaluation submitted successfully!");
      }
      setConfirmOpen(false);
      setLoading(true);
      const dataTasks = await evaluationService.getPendingTasks();
      setTasks(dataTasks);
      await loadEvaluations(dataTasks);
      setLoading(false);
    } catch (error) {
      toast.error(error.message || "Failed to submit evaluation");
    }
  };

  if (loading || evaluationsLoading) {
    return <div className="p-8">Loading evaluations…</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Evaluations</h1>
        <Button onClick={() => navigate(-1)} variant="outline">
          ← Back
        </Button>
      </div>

      {/* No tasks */}
      {tasks.length === 0 ? (
        <p className="text-gray-500">No tasks requiring evaluation.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tasks.map((task) => {
            const evaluation = evaluations[task.id];
            return (
              <Card key={task.id} className="shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg">{task.title}</CardTitle>
                  <Badge className={`${statusColors[task.status]} text-white`}>
                    {task.status}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-gray-600">{task.description}</p>
                  <p className="text-xs">
                    Assigned to: <strong>{task.assignedTo?.name}</strong>
                  </p>

                  {/* ✅ NEW: Proof File and Submission Details */}
                  {task.proofFilePath ? (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Proof File:</p>
                    
                      {/* <a
                        href={`http://localhost:5000${task.proofFilePath}`} // ✅ Use root URL for static files
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 underline text-sm"
                      >
                        View/Download Proof
                      </a> */}
                      <a
                        href={`${apiBase}${task.proofFilePath}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 underline text-sm"
                      >
                        View/Download Proof
                      </a>
                      {task.submittedAt && (
                        <p className="text-xs text-gray-500">
                          Submitted on:{" "}
                          {new Date(task.submittedAt).toLocaleString()}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">
                      No proof file submitted.
                    </p>
                  )}

                  {/* Evaluation Section */}
                  {evaluation ? (
                    <div className="space-y-2">
                      <p className="text-sm">
                        <strong>Evaluation Status:</strong>{" "}
                        <Badge
                          className={`${
                            statusColors[evaluation.status]
                          } text-white`}
                        >
                          {evaluation.status}
                        </Badge>
                      </p>
                      {evaluation.comments && (
                        <p className="text-sm">
                          <strong>Comments:</strong> {evaluation.comments}
                        </p>
                      )}
                      <p className="text-xs text-gray-500">
                        Evaluated by: {evaluation.evaluator?.name} on{" "}
                        {new Date(evaluation.evaluatedAt).toLocaleDateString()}
                      </p>
                      <Button
                        size="sm"
                        onClick={() => handleEvaluateClick(task.id)}
                        className="w-full"
                      >
                        Update Evaluation
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => handleEvaluateClick(task.id)}
                      className="w-full"
                    >
                      Evaluate
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Evaluation Modal */}
      <ConfirmModal
        open={confirmOpen}
        title={
          selectedEval?.isUpdate ? "Update Evaluation" : "Submit Evaluation"
        }
        message={
          <div className="space-y-4 text-left">
            <label className="block">
              <span className="text-sm text-gray-700">Status:</span>
              <select
                value={selectedEval?.status || ""}
                onChange={(e) =>
                  setSelectedEval((prev) => ({
                    ...prev,
                    status: e.target.value,
                  }))
                }
                className="w-full mt-1 border rounded-md px-3 py-2 text-sm"
              >
                {evaluationStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
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
