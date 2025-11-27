// frontend/src/services/employeeService.js
import api from "@/api/axios";

const employeeService = {
  getMyTasks: () => api.get("/employees/tasks"),
  
  getMyStats: async () => {
    const response = await api.get("/employees/tasks");
    const tasks = response.data;

    return {
      total: tasks.length,
      todo: tasks.filter(t => t.status === "Todo").length,
      inProgress: tasks.filter(t => t.status === "InProgress").length,
      submitted: tasks.filter(t => t.status === "Submitted").length,
      approved: tasks.filter(t => t.evaluation?.status === "Approved").length,
      needsRevision: tasks.filter(t => t.evaluation?.status === "NeedsRevision").length,
      rejected: tasks.filter(t => t.evaluation?.status === "Rejected").length,
    };
  },

  updateTaskStatus: (taskId, status, file = null) => {
    const formData = new FormData();
    formData.append("status", status);
    if (file) formData.append("proofFile", file);

    return api.put(`/employees/tasks/${taskId}/status`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};

export default employeeService;