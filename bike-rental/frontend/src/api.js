import axios from "axios";

// One axios instance for the whole app, pointing at the Spring Boot backend
const api = axios.create({
  baseURL: "http://localhost:8080/api",
});

// Before every request, attach the JWT token (if the user is logged in)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = "Bearer " + token;
  }
  return config;
});

// Handle expired tokens / 401 responses gracefully
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const url = error.config?.url || "";
      if (!url.includes("/auth/login") && !url.includes("/auth/register")) {
        localStorage.clear();
      }
    }
    return Promise.reject(error);
  }
);

export default api;
