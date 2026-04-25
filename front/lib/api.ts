import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Request interceptor: attach auth token
api.interceptors.request.use((config) => {
    if (typeof window !== "undefined") {
        const token =
            localStorage.getItem("adminToken") ||
            localStorage.getItem("teacherToken") ||
            localStorage.getItem("userToken");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

// Response interceptor: handle 401
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 && typeof window !== "undefined") {
            // Only redirect if not already on login page
            if (!window.location.pathname.includes("/login")) {
                localStorage.removeItem("adminToken");
                localStorage.removeItem("teacherToken");
                localStorage.removeItem("userToken");
                localStorage.removeItem("adminInfo");
                localStorage.removeItem("teacherInfo");
                localStorage.removeItem("userInfo");
                window.location.href = "/login";
            }
        }
        return Promise.reject(error);
    }
);

export { API_BASE_URL };
export default api;
