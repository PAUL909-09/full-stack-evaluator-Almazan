// frontend/src/pages/Evaluator/TaskList.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { tasksService } from "@/services/tasksService";
import { authService } from "@/api/authService";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Badge from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const statusColors = {
  Todo: "bg-gray-500",
  InProgress: "bg-yellow-500",
  Done: "bg-green-500",
  Submitted: "bg-blue-500",
  Approved: "bg-emerald-600",
  NeedsRevision: "bg-orange-500",
  Rejected: "bg-red-600",
};

export default function TaskList() {
  const { projectId } = useParams(); // <-- will be undefined on /evaluator/tasks
  const navigate = useNavigate();
  const { toast } = useToast();
  const user = authService.getCurrentUser();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // -----------------------------------------------------------------
  // Load tasks – if projectId exists → per-project, else → all evaluator tasks
  // -----------------------------------------------------------------
  useEffect(() => {
    (async () => {
      try {
        const data = projectId
          ? await tasksService.getTasksByProject(projectId)
          : (await tasksService.getAllEvaluatorTasks?.()) ?? []; // fallback if you add a service later
        setTasks(data);
      } catch {
        toast({
          title: "Error",
          description: "Failed to load tasks",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    })();
  }, [projectId, toast]);

  const updateStatus = async (taskId, newStatus) => {
    try {
      const updated = await tasksService.updateTaskStatus(taskId, newStatus);
      setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
      toast({ title: "Status updated", description: `→ ${newStatus}` });
    } catch (err) {
      toast({
        title: "Failed",
        description: err.response?.data?.message || "Update error",
        variant: "destructive",
      });
    }
  };

  if (loading) return <div className="p-8">Loading tasks…</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          {projectId ? "Project Tasks" : "All My Tasks"}
        </h1>
        <Button onClick={() => navigate(-1)} variant="outline">
          ← Back
        </Button>
      </div>

      {tasks.length === 0 ? (
        <p className="text-gray-500">
          {projectId
            ? "No tasks in this project yet. Assign employees first."
            : "You have no tasks yet."}
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tasks.map((task) => (
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

                {/* ---------- STATUS BUTTONS (role-aware) ---------- */}
                <div className="flex flex-wrap gap-2">
                  {/* Employee flow */}
                  {user.role === "Employee" &&
                    task.assignedToId === user.id && (
                      <>
                        {task.status === "Todo" && (
                          <Button
                            size="sm"
                            onClick={() => updateStatus(task.id, "InProgress")}
                          >
                            Start
                          </Button>
                        )}
                        {task.status === "InProgress" && (
                          <Button
                            size="sm"
                            onClick={() => updateStatus(task.id, "Done")}
                          >
                            Finish
                          </Button>
                        )}
                        {task.status === "Done" && (
                          <Button
                            size="sm"
                            onClick={() => updateStatus(task.id, "Submitted")}
                          >
                            Submit
                          </Button>
                        )}
                      </>
                    )}

                  {/* Evaluator review */}
                  {user.role === "Evaluator" &&
                    [
                      "Submitted",
                      "NeedsRevision",
                      "Approved",
                      "Rejected",
                    ].includes(task.status) && (
                      <>
                        {task.status === "Submitted" && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateStatus(task.id, "Approved")}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                updateStatus(task.id, "NeedsRevision")
                              }
                            >
                              Revise
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateStatus(task.id, "Rejected")}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                      </>
                    )}
                </div>

                {/* ---------- HISTORY PREVIEW ---------- */}
                {task.history?.length > 0 && (
                  <details className="text-xs mt-2">
                    <summary className="cursor-pointer font-medium">
                      History
                    </summary>
                    <ul className="mt-1 space-y-1">
                      {task.history.map((h, i) => (
                        <li key={i}>
                          <strong>{h.action}</strong> by {h.performedBy?.name} @{" "}
                          {new Date(h.performedAt).toLocaleString()}
                        </li>
                      ))}
                    </ul>
                  </details>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
