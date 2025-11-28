// frontend/src/api/authService.js
import api from "../api/axios";

const TOKEN_KEY = "token";
const REFRESH_KEY = "refreshToken";

export const authService = {
  async login(email, password) {
    try {
      const response = await api.post("/auth/login", { email, password });
      const { token, accessToken, refreshToken } = response.data;

      // Use whichever the backend provides
      const finalToken = token || accessToken;
      if (!finalToken) {
        throw new Error("No token received from server");
      }

      // ✅ Save both tokens
      localStorage.setItem(TOKEN_KEY, finalToken);
      if (refreshToken) {
        localStorage.setItem(REFRESH_KEY, refreshToken);
      }

      return finalToken;
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || "Login failed";
      throw new Error(message);
    }
  },

  async verifyInvite({ email, otp, password }) {
    try {
      const response = await api.post("/auth/verify-invite", {
        email,
        otpCode: otp,
        password,
      });
      return response.data;
    } catch (err) {
      console.error("Verify Invite Error:", err);
      throw new Error(err.response?.data?.message || "Verification failed");
    }
  },
  getCurrentUser() {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return {
        id:
          payload["nameid"] ||
          payload[
            "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
          ],
        email:
          payload.email ||
          payload[
            "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"
          ],
        role:
          payload.role ||
          payload[
            "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
          ],
      };
    } catch (err) {
      console.error("Invalid token:", err);
      localStorage.removeItem(TOKEN_KEY);
      return null;
    }
  },

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    window.location.href = "/login";
  },
};
