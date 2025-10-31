import api from "./axios";

export const authService = {
  login: async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    localStorage.setItem("token", res.data.token);
    return res.data;
  },
  register: async (name, email, password, role) => {
    const res = await api.post("/auth/register", { name, email, password, role });
    return res.data;
  },
  logout: () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  },
  getCurrentUser: () => {
    const token = localStorage.getItem("token");
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload;
    } catch {
      return null;
    }
  },
};
