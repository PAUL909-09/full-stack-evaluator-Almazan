// // frontend/src/services/adminService.js
// import api from "@/api/axios";

// const adminService = {
//   // Get full analytics dashboard data (renamed from getAnalytics for consistency with imports)
//   getAdminAnalytics: async () => {
//     const { data } = await api.get("/admin/analytics");
//     return data;
//   },

//   // Invite new user (Admin only)
//   inviteUser: async (name, email, role) => {
//     const { data } = await api.post("/admin/invite", { name, email, role });
//     return data;
//   },

//   // Get pending invites
//   getPendingInvites: async () => {
//     const { data } = await api.get("/admin/pending-invites");
//     return data;
//   },

//   // Get all users (for User Management) - now calls /admin/users for admin-specific access
//   getAllUsers: async () => {
//     const { data } = await api.get("/admin/users");
//     return data;
//   },

//   // Get user by ID
//   getUserById: async (id) => {
//     const { data } = await api.get(`/admin/users/${id}`);
//     return data;
//   },
// };

// export default adminService;

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
};

export default adminService;
