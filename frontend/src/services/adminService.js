import api from "@/api/axios";

const adminService = {
  // Simple dashboard summary
  getAdminDashboard: async () => {
    const { data } = await api.get("/admin/dashboard");
    return data;
  },

  // Full analytics (detailed)
  getAdminAnalytics: async () => {
    const { data } = await api.get("/admin/analytics");
    return data;
  },

  inviteUser: async (name, email, role) => {
    const { data } = await api.post("/admin/invite", { name, email, role });
    return data;
  },

  getPendingInvites: async () => {
    const { data } = await api.get("/admin/pending-invites");
    return data;
  },

  getAllUsers: async () => {
    const { data } = await api.get("/admin/users");
    return data;
  },

  getUserById: async (id) => {
    const { data } = await api.get(`/admin/users/${id}`);
    return data;
  },

  // frontend/src/services/adminService.js
  getProjectAnalytics: async () => {
    const { data } = await api.get("/admin/projects/analytics");
    return data;
  },

  // frontend/src/services/adminService.js
  getAllProjects: async () => {
    const { data } = await api.get("/projects");
    return data;
  },
};

export default adminService;
