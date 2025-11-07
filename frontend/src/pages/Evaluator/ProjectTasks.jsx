// frontend/src/pages/Evaluator/ProjectTasks.jsx
import React, { useState, useEffect } from "react";
import api from "@/api/axios";
import { tasksService } from "@/api/tasksService";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";  // Assumes you have a Table component
import { toast } from "react-toastify";
import { Loader2, Edit, Trash2 } from "lucide-react";

export default function ProjectTasks() {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch projects on mount
    const fetchProjects = async () => {
      try {
        const res = await api.get("/projects");
        setProjects(res.data);
      } catch (err) {
        toast.error("Failed to load projects.");
      }
    };
    fetchProjects();
  }, []);

  useEffect(() => {
    // Fetch tasks when project is selected
    if (selectedProjectId) {
      const fetchTasks = async () => {
        setLoading(true);
        try {
          const data = await tasksService.getTasksByProject(selectedProjectId);
          setTasks(data);
        } catch (err) {
          toast.error("Failed to load tasks for this project.");
        } finally {
          setLoading(false);
        }
      };
      fetchTasks();
    } else {
      setTasks([]);
    }
  }, [selectedProjectId]);

  const handleStatusUpdate = async (taskId, newStatus) => {
    try {
      await tasksService.updateTaskStatus(taskId, newStatus);
      toast.success("Task status updated.");
      // Refresh tasks
      const data = await tasksService.getTasksByProject(selectedProjectId);
      setTasks(data);
    } catch (err) {
      toast.error("Failed to update status.");
    }
  };

  const handleDelete = async (taskId) => {
    if (window.confirm("Delete this task?")) {
      try {
        await api.delete(`/tasks/${taskId}`);
        toast.success("Task deleted.");
        // Refresh tasks
        const data = await tasksService.getTasksByProject(selectedProjectId);
        setTasks(data);
      } catch (err) {
        toast.error("Failed to delete task.");
      }
    }
  };

  return (
    <div className="p-8 bg-gradient-to-br from-[#F8FBFF] to-[#E9F4FF] min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Tasks by Project</h1>

      {/* Project Selector */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Select Project</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a project" />
            </SelectTrigger>
            <SelectContent>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Tasks Table */}
      {loading ? (
        <div className="flex justify-center">
          <Loader2 className="animate-spin" />
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Assigned Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            {tasks.length === 0 ? (
              <p>No tasks for this project.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tasks.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell>{task.title}</TableCell>
                      <TableCell>{task.description || "N/A"}</TableCell>
                      <TableCell>{task.status}</TableCell>
                      <TableCell>
                        {task.assignedTo ? `${task.assignedTo.firstname} ${task.assignedTo.lastname} (${task.assignedTo.email})` : "Unassigned"}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          onClick={() => handleStatusUpdate(task.id, "InProgress")}  // Example: Toggle to InProgress
                          className="mr-2"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(task.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}