import axios from "axios";
import Cookies from "js-cookie";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Callback để redirect không gây hard reload (SPA-friendly)
// Được inject từ ClientLayout với Next.js router
let redirectCallback: ((path: string) => void) | null = null;

export function setRedirectCallback(cb: (path: string) => void) {
  redirectCallback = cb;
}

// Interceptor to add JWT token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = Cookies.get("token");
    console.log(
      "[Axios] Sending request to",
      config.url,
      "with token:",
      token ? token.substring(0, 10) + "..." : "none",
    );
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      const isLoginPage = typeof window !== "undefined" && window.location.pathname === "/login";
      if (!isLoginPage) {
        Cookies.remove("token");
        Cookies.remove("role");
        // Sử dụng Next.js router thay vì window.location.href
        // để tránh hard reload toàn bộ trang
        if (redirectCallback) {
          redirectCallback("/login");
        } else if (typeof window !== "undefined") {
          // Fallback nếu callback chưa được inject
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
