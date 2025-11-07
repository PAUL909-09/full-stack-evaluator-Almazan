// frontend/src/services/tasksService.js
import api from "@/api/axios"; // ✅ or "../api/axios" if alias not configured

export const tasksService = {
  // ✅ Fetch all tasks for a specific project
  getTasksByProject: async (projectId) => {
    const response = await api.get(`/tasks/project/${projectId}`);
    return response.data;
  },

  // ✅ Fetch employees assigned to a specific project
  getEmployeesByProject: async (projectId) => {
    const response = await api.get(`/tasks/project/${projectId}/employees`);
    return response.data;
  },

  // ✅ Create a new task
  createTask: async (taskData) => {
    const response = await api.post("/tasks", taskData);
    return response.data;
  },

  // ✅ Update task status
  updateTaskStatus: async (taskId, status) => {
    const response = await api.put(`/tasks/${taskId}/status`, { status });
    return response.data;
  },

  // ✅ Assign task to employee (if you later add PUT /assign)
  assignTaskToEmployee: async (taskId, employeeId) => {
    const response = await api.put(`/tasks/${taskId}/assign`, { employeeId });
    return response.data;
  },
};
