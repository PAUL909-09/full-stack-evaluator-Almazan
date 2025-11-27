// frontend/src/services/tasksService.js
import api from "@/api/axios";

/**
 * GET /tasks/project/{projectId}
 * Fetch all tasks for a project
 */
export async function getTasksByProject(projectId) {
  try {
    const { data } = await api.get(`/tasks/project/${projectId}`);
    return data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to get tasks by project");
  }
}

/**
 * GET /tasks/project/{projectId}/employees
 * Get employees assigned to a project
 */
export async function getEmployeesByProject(projectId) {
  const { data } = await api.get(`/tasks/project/${projectId}/employees`);
  return data;
}
// export async function getEmployeesByProject(projectId) {
//   const { data } = await api.get(`/projectassignments/project/${projectId}`);
//   return data.map(a => a.user); // depends on backend shape
// }


/**
 * GET /tasks/{id}
 * Fetch a single task by ID
 */
export async function getTaskById(id) {
  const { data } = await api.get(`/tasks/${id}`);
  return data;
}

/**
 * POST /tasks
 * Create a new task
 */
export async function createTask(payload) {
  const { data } = await api.post(`/tasks`, payload);
  return data;
}

/**
 * PUT /tasks/{id}
 * Full update (Evaluator only)
 */
export async function updateTask(id, payload) {
  const { data } = await api.put(`/tasks/${id}`, payload);
  return data;
}

/**
 * PUT /tasks/{id}/status
 * Update only status (Employee + Evaluator)
 */
export async function updateTaskStatus(id, newStatus) {
  const { data } = await api.put(`/tasks/${id}/status`, { status: newStatus });
  return data;
}

/**
 * DELETE /tasks/{id}
 * Delete a task
 */
export async function deleteTask(id) {
  const { data } = await api.delete(`/tasks/${id}`);
  return data;
}