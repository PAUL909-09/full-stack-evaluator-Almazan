import api from "@/api/axios";

const adminService = {
  // Fetch basic dashboard stats (users, projects, tasks, etc.)
  getAdminDashboard: async () => {
    const { data } = await api.get("/admin/dashboard");
    return data;
  },

  // Fetch detailed admin analytics (evaluators, employees, task breakdown)
  getAdminAnalytics: async () => {
    const { data } = await api.get("/admin/analytics");
    return data;
  },

  // Invite a new user by sending OTP email (admin only)
  inviteUser: async (name, email, role) => {
    const { data } = await api.post("/admin/invite", { name, email, role });
    return data;
  },

  // Get list of pending (unverified) user invitations
  getPendingInvites: async () => {
    const { data } = await api.get("/admin/pending-invites");
    return data;
  },

  // Get all registered users (admin view)
  getAllUsers: async () => {
    const { data } = await api.get("/admin/users");
    return data;
  },

  // Get a specific user by ID
  getUserById: async (id) => {
    const { data } = await api.get(`/admin/users/${id}`);
    return data;
  },

  // Get detailed analytics for all projects (task status, top performers, etc.)
  getProjectAnalytics: async () => {
    const { data } = await api.get("/admin/projects/analytics");
    return data;
  },

  // Get all projects (admin sees everything)
  getAllProjects: async () => {
    const { data } = await api.get("/projects");
    return data;
  },
};

export default adminService;