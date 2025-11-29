// frontend/src/services/tasksService.js
import api from "@/api/axios";

/**
 * Get all tasks belonging to a specific project
 */
export async function getTasksByProject(projectId) {
  const { data } = await api.get(`/tasks/project/${projectId}`);
  return data;
}

/**
 * Get all employees assigned to tasks in a project (evaluator view)
 */
export async function getEmployeesByProject(projectId) {
  const { data } = await api.get(`/tasks/project/${projectId}/employees`);
  return data;
}

/**
 * Get a single task by ID with full details
 */
export async function getTaskById(id) {
  const { data } = await api.get(`/tasks/${id}`);
  return data;
}

/**
 * Create a new task in a project (evaluator only)
 */
export async function createTask(payload) {
  const { data } = await api.post("/tasks", payload);
  return data;
}

/**
 * Fully update a task (title, description, assignee, deadline — evaluator only)
 */
export async function updateTask(id, payload) {
  const { data } = await api.put(`/tasks/${id}`, payload);
  return data;
}

/**
 * Update task status only (employee: submit, evaluator: approve/reject)
 */
export async function updateTaskStatus(id, newStatus) {
  const { data } = await api.put(`/tasks/${id}/status`, { status: newStatus });
  return data;
}

/**
 * Delete a task (evaluator or admin)
 */
export async function deleteTask(id) {
  await api.delete(`/tasks/${id}`);
}