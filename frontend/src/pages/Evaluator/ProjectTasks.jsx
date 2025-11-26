// src/pages/Evaluator/ProjectTasks.jsx
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useParams, useNavigate } from "react-router-dom";
import { tasksService } from "@/services/tasksService";
import { authService } from "@/services/authService";

// shadcn/ui components (JSX versions)
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import Badge from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const statusColors = {
  Todo: "todo",
  InProgress: "inprogress",
  Done: "done",
  Submitted: "submitted",
  Approved: "approved",
  NeedsRevision: "revision",
  Rejected: "destructive",
};

export default function ProjectTasks() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const user = authService.getCurrentUser();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load all tasks for this project
  useEffect(() => {
    (async () => {
      try {
        const data = await tasksService.getTasksByProject(projectId);
        setTasks(data);
      } catch (err) {
        toast.error("Failed to load tasks");
      } finally {
        setLoading(false);
      }
    })();
  }, [projectId]);

  const updateStatus = async (taskId, newStatus) => {
    try {
      const updated = await tasksService.updateTaskStatus(taskId, newStatus);
      setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
      toast.success(`Status → ${newStatus}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Project Tasks</h1>
        <Button onClick={() => navigate(-1)} variant="outline">
          ← Back
        </Button>
      </div>

      {/* Empty State */}
      {tasks.length === 0 ? (
        <Card>
          <CardContent className="text-center py-10 text-gray-500">
            No tasks in this project yet.{" "}
            <Button
              onClick={() =>
                navigate(`/evaluator/assign-employees/${projectId}`)
              }
              variant="link"
              className="underline"
            >
              Assign employees
            </Button>
          </CardContent>
        </Card>
      ) : (
        /* Task Table */
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell className="font-medium">{task.title}</TableCell>

                  <TableCell>
                    <Badge variant={statusColors[task.status]}>
                      {task.status}
                    </Badge>
                  </TableCell>

                  <TableCell>{task.assignedTo?.name || "—"}</TableCell>

                  <TableCell className="text-right space-x-1">
                    {/* Employee Flow */}
                    {user.role === "Employee" &&
                      task.assignedToId === user.id && (
                        <>
                          {task.status === "Todo" && (
                            <Button
                              size="sm"
                              onClick={() =>
                                updateStatus(task.id, "InProgress")
                              }
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

                    {/* Evaluator Review */}
                    {user.role === "Evaluator" &&
                      task.status === "Submitted" && (
                        <>
                          <Button
                            size="sm"
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
                            variant="destructive"
                            onClick={() => updateStatus(task.id, "Rejected")}
                          >
                            Reject
                          </Button>
                        </>
                      )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* History Panel (collapsible per task) */}
          {tasks.map((task) => (
            <details
              key={`history-${task.id}`}
              className="border-t bg-gray-50 px-4 py-3 text-sm"
            >
              <summary className="cursor-pointer font-medium text-gray-700">
                History ({task.history?.length || 0} entries)
              </summary>
              <ul className="mt-2 space-y-1 text-xs text-gray-600">
                {task.history?.map((h, i) => (
                  <li key={i}>
                    <strong>{h.action}</strong> by {h.performedBy?.name} @{" "}
                    {new Date(h.performedAt).toLocaleString()}
                  </li>
                ))}
              </ul>
            </details>
          ))}
        </div>
      )}
    </div>
  );
}
