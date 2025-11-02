// src/pages/admin/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "@/api/axios";
import MainLayout from "@/components/layout/MainLayout";

export default function AdminDashboard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/tasks").then(res => {
      setTasks(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleAssign = async (taskId, employeeId) => {
    try {
      await api.post(`/tasks/${taskId}/assign`, { assignedTo: employeeId });
      setTasks(prev => prev.map(t =>
        t.id === taskId ? { ...t, assignedTo: employeeId } : t
      ));
    } catch {
      alert("Assign failed");
    }
  };

  return (
    <MainLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">All Tasks</h1>
        <Link
          to="/admin/tasks/create"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Create Task
        </Link>
      </div>

      {loading ? (
        <p>Loading tasks...</p>
      ) : tasks.length === 0 ? (
        <p className="text-gray-600">No tasks yet. Create one!</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tasks.map(task => (
            <div key={task.id} className="bg-white p-4 rounded shadow">
              <h3 className="font-semibold">{task.title}</h3>
              <p className="text-sm text-gray-600 mt-1">
                Status: <span className="font-medium">{task.status}</span>
              </p>
              <p className="text-sm text-gray-600">
                Assigned: {task.assignedUser?.name || "Unassigned"}
              </p>

              {!task.assignedTo && (
                <select
                  onChange={(e) => handleAssign(task.id, e.target.value)}
                  className="mt-3 w-full border rounded px-2 py-1 text-sm"
                >
                  <option value="">Assign to...</option>
                  <option value="33333333-3333-3333-3333-333333333333">John Doe (Employee)</option>
                  {/* Add more from API later */}
                </select>
              )}
            </div>
          ))}
        </div>
      )}
    </MainLayout>
  );
}