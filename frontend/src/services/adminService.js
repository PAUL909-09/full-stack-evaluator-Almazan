// frontend/src/services/adminService.js
import api from "@/api/axios";

const adminService = {
  // Get full analytics dashboard data
  getAnalytics: async () => {
    const { data } = await api.get("/admin/analytics");
    return data;
  },

  // Invite new user (Admin only)
  inviteUser: async (name, email, role) => {
    const { data } = await api.post("/admin/invite", { name, email, role });
    return data;
  },

  // Get pending invites
  getPendingInvites: async () => {
    const { data } = await api.get("/admin/pending-invites");
    return data;
  },

  // Get all users (for User Management)
  getAllUsers: async () => {
    const { data } = await api.get("/users"); // or "/admin/users" if you add it
    return data;
  },

  // Optional: Get user by ID
  getUserById: async (id) => {
    const { data } = await api.get(`/users/${id}`);
    return data;
  },
};

export default adminService;