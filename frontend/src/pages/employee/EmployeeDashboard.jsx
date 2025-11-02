import React, { useEffect, useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import api from "@/api/axios";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { authService } from "@/api/authService";

export default function EmployeeDashboard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = authService.getCurrentUser();

  // Fetch employee’s tasks
  useEffect(() => {
    if (!user) return;
    async function fetchTasks() {
      try {
        const res = await api.get(`/tasks?assignedTo=${user.sub}`);
        setTasks(res.data);
      } catch (err) {
        console.error("Error fetching tasks:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchTasks();
  }, [user]);

  // Update task status
  async function handleStatusChange(taskId, newStatus) {
    try {
      await api.patch(`/tasks/${taskId}/status`, { status: newStatus });
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
      );
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Failed to update status");
    }
  }

  if (loading) {
    return (
      <MainLayout>
        <p>Loading your tasks...</p>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Employee Dashboard</h1>
        {tasks.length === 0 ? (
          <p className="text-gray-600">No tasks assigned yet.</p>
        ) : (
          <div className="grid gap-4">
            {tasks.map((task) => (
              <Card key={task.id} className="shadow-sm">
                <CardHeader>
                  <CardTitle>{task.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-3">
                    Current Status:{" "}
                    <span className="font-semibold text-blue-600">
                      {task.status}
                    </span>
                  </p>

                  <div className="flex gap-2 items-center">
                    <select
                      className="border px-3 py-2 rounded text-sm"
                      value={task.status}
                      onChange={(e) =>
                        handleStatusChange(task.id, e.target.value)
                      }
                    >
                      <option value="Pending">Pending</option>
                      <option value="InProgress">InProgress</option>
                      <option value="Completed">Completed</option>
                    </select>
                    <Button
                      variant="outline"
                      onClick={() =>
                        handleStatusChange(task.id, task.status)
                      }
                    >
                      Update
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
