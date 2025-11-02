// frontend\src\api\authService.js
import api from "./axios";

const TOKEN_KEY = "token";

export const authService = {
  async login(email, password) {
    try {
      const response = await api.post("/auth/login", { email, password });  // ← Backend API call
      const { token } = response.data;
      if (token) {
        localStorage.setItem(TOKEN_KEY, token);
        return token;
      }
      throw new Error("No token from backend");
    } catch (err) {
      throw new Error(err.response?.data || "Login failed - check credentials or backend");
    }
  },

  async register(name, email, password, role = "Employee") {
    try {
      const response = await api.post("/auth/register", { name, email, password, role });  // ← Backend API call
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data || "Register failed - check if email exists");
    }
  },

  getCurrentUser() {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return {
        id: payload["nameid"],  // ← Matches backend ClaimTypes.NameIdentifier
        email: payload.email,
        role: payload.role,
      };
    } catch (err) {
      localStorage.removeItem(TOKEN_KEY);
      console.error("Bad token:", err);
      return null;
    }
  },

  // logout() {
  //   localStorage.removeItem(TOKEN_KEY);
  //   window.location.href = "/login";
  // },
  logout() {
    localStorage.removeItem("token");  // ← MUST CLEAR
    window.location.href = "/login";   // ← Force reload
  },
};