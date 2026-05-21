import axios from "axios";

const backendURL = (
  import.meta.env.VITE_BACKEND_URL || "http://localhost:8000"
).replace(/\/+$/, "");

const isFormData = (value) =>
  typeof FormData !== "undefined" && value instanceof FormData;

const clearContentTypeHeader = (headers) => {
  if (!headers) return;

  if (typeof headers.delete === "function") {
    headers.delete("Content-Type");
    headers.delete("content-type");
    return;
  }

  delete headers["Content-Type"];
  delete headers["content-type"];
};

const setJsonContentType = (headers) => {
  if (!headers) return;

  if (typeof headers.set === "function") {
    headers.set("Content-Type", "application/json");
    return;
  }

  headers["Content-Type"] = "application/json";
};

const hasContentTypeHeader = (headers) => {
  if (!headers) return false;

  if (typeof headers.has === "function") {
    return headers.has("Content-Type") || headers.has("content-type");
  }

  return Boolean(headers["Content-Type"] || headers["content-type"]);
};

const api = axios.create({
  baseURL: `${backendURL}/api`,
  withCredentials: false,
  headers: {
    Accept: "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = window.sessionStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (isFormData(config.data)) {
      // Let the browser generate the multipart boundary for file uploads.
      clearContentTypeHeader(config.headers);
    } else if (config.data !== undefined && !hasContentTypeHeader(config.headers)) {
      setJsonContentType(config.headers);
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
