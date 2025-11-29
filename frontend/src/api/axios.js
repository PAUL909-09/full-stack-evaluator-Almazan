// import axios from "axios";

// const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// const api = axios.create({
//   baseURL: API_URL,
//   timeout: 10000,
// });

// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem("token");
//   if (token) config.headers.Authorization = `Bearer ${token}`;
//   return config;
// });

// api.interceptors.request.use(async (config) => {
//   const token = localStorage.getItem("token");
//   const refreshToken = localStorage.getItem("refreshToken");

//   if (token) {
//     const payload = JSON.parse(atob(token.split(".")[1]));
//     const exp = payload.exp * 1000;

//     if (Date.now() > exp && refreshToken) {
//       try {
//         const res = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
//         localStorage.setItem("token", res.data.accessToken);
//         localStorage.setItem("refreshToken", res.data.refreshToken);
//         config.headers.Authorization = `Bearer ${res.data.accessToken}`;
//       } catch (err) {
//         localStorage.removeItem("token");
//         localStorage.removeItem("refreshToken");
//         window.location.href = "/login";
//         throw err;
//       }
//     } else {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//   }
//   return config;
// });



// export default api;

import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

api.interceptors.request.use(async (config) => {
  let token = localStorage.getItem("token");
  const refreshToken = localStorage.getItem("refreshToken");

  // If no token: return immediately
  if (!token) return config;

  // Decode JWT
  const payload = JSON.parse(atob(token.split(".")[1]));
  const exp = payload.exp * 1000;

  // If token is still valid, attach it
  if (Date.now() < exp) {
    config.headers.Authorization = `Bearer ${token}`;
    return config;
  }

  // Token expired → try refreshing
  if (refreshToken) {
    try {
      const res = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });

      localStorage.setItem("token", res.data.accessToken);
      localStorage.setItem("refreshToken", res.data.refreshToken);

      config.headers.Authorization = `Bearer ${res.data.accessToken}`;
      return config;

    } catch (err) {
      // Refresh failed → logout
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      window.location.href = "/login";
      throw err;
    }
  }

  // No refresh token → logout
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  window.location.href = "/login";
  return config;
});

export default api;

