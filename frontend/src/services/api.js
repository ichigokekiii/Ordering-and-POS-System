import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api",
  //baseURL: "https://petal-express-api.onrender.com/api",
});

// 🔹 Request Interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// 🔹 Response Interceptor
api.interceptors.response.use(
  (response) => {
    // Automatically hide loading here if using global loader
    return response;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default api;
