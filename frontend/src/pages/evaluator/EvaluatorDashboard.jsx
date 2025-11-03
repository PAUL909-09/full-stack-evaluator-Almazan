// frontend/src/pages/Employee/EmployeeDashboard.jsx
import React, { useEffect, useState } from "react";
import api from "@/api/axios";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function EmployeeDashboard() {
  const [tasks, setTasks] = useState([]);        // ← NOW USED
  const { toast } = useToast();

  // ← FIXED: Added 'toast' to deps + safe error handling
  useEffect(() => {
    api.get("/tasks?mine=true")
      .then(res => setTasks(res.data))
      .catch(err => toast({
        title: "Error loading tasks",
        description: err.message || "Try again later",
        variant: "destructive"
      }));
  }, [toast]);  // ← ESLint happy

  // ← FIXED: updateStatus NOW USED inside the map
  const updateStatus = async (id, status) => {
    try {
      await api.put(`/tasks/${id}/status`, { status });
      toast({ title: "Done!", description: "Status updated" });
      setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t));
    } catch (err) {
      toast({ title: "Failed", description: err.message, variant: "destructive" });
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold mb-8 text-gray-800">My Tasks</h1>

      {tasks.length === 0 ? (
        <p className="text-gray-500 text-lg">No tasks yet — enjoy the calm!</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tasks.map(task => (
            <div
              key={task.id}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition"
            >
              <h3 className="text-xl font-bold text-blue-600">{task.title}</h3>
              <p className="text-gray-600 mt-2">{task.description || "No description"}</p>
              <div className="flex items-center gap-2 mt-4">
                <span className="text-sm font-medium text-gray-700">Status:</span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold
                  ${task.status === "Done" ? "bg-green-100 text-green-800" :
                    task.status === "InProgress" ? "bg-yellow-100 text-yellow-800" :
                    "bg-gray-100 text-gray-800"}`}>
                  {task.status}
                </span>
              </div>

              <div className="flex gap-2 mt-5">
                {["Todo", "InProgress", "Done"].map(s => (
                  <Button
                    key={s}
                    size="sm"
                    variant={task.status === s ? "default" : "outline"}
                    onClick={() => updateStatus(task.id, s)}
                    disabled={task.status === s}
                  >
                    {s}
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}