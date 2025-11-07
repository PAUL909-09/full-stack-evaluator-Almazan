// frontend/src/services/tasksService.js
import api from "@/api/axios";

/**
 * All task-related API calls
 */
export const tasksService = {
  // ── READ ─────────────────────────────────────
  /** Get all tasks for a project */
  getTasksByProject: async (projectId) => {
    const { data } = await api.get(`/tasks/project/${projectId}`);
    return data; // array of TaskItem
  },

  /** Get a single task (with history) */
  getTaskById: async (taskId) => {
    const { data } = await api.get(`/tasks/${taskId}`);
    return data;
  },

  /** Get task audit history */
  getTaskHistory: async (taskId) => {
    const { data } = await api.get(`/tasks/${taskId}/history`);
    return data;
  },

  // ── CREATE ───────────────────────────────────
  /** Create a new task */
  createTask: async (taskData) => {
    const { data } = await api.post("/tasks", taskData);
    return data;
  },

  // ── UPDATE ───────────────────────────────────
  /** Change task status */
  updateTaskStatus: async (taskId, status) => {
    const { data } = await api.put(`/tasks/${taskId}/status`, { status });
    return data;
  },

  // ── DELETE ───────────────────────────────────
  /** Delete a task (Evaluator / Admin only) */
  deleteTask: async (taskId) => {
    await api.delete(`/tasks/${taskId}`);
  },

  // ── EMPLOYEES ───────────────────────────────
  /** Get employees that have at least one task in the project */
  getEmployeesByProject: async (projectId) => {
    const { data } = await api.get(`/tasks/project/${projectId}/employees`);
    return data;
  },
};