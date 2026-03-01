import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api",
});

// 🔹 Request Interceptor
api.interceptors.request.use(
  (config) => {
    // You can trigger global loading here later if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 🔹 Response Interceptor
api.interceptors.response.use(
  (response) => {
    // Automatically hide loading here if using global loader
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;