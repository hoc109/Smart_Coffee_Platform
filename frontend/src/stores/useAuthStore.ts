import Cookies from "js-cookie";
import { create } from "zustand";

export interface UserState {
  username: string | null;
  role: "ADMIN" | "STAFF" | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (payload: { username: string; role: string; token: string }) => void;
  logout: () => void;
  syncFromCookies: () => void;
}

/**
 * Zustand Store quản lý trạng thái xác thực và người dùng
 * Đồng bộ hai chiều với Cookies cho Next.js Middleware và Client Layouts
 */
export const useAuthStore = create<UserState>((set) => ({
  username: null,
  role: null,
  token: null,
  isAuthenticated: false,

  setAuth: ({ username, role, token }) => {
    Cookies.set("token", token, { path: "/" });
    Cookies.set("role", role, { path: "/" });
    Cookies.set("username", username, { path: "/" });
    set({
      username,
      role: role as "ADMIN" | "STAFF",
      token,
      isAuthenticated: true,
    });
  },

  logout: () => {
    Cookies.remove("token");
    Cookies.remove("role");
    Cookies.remove("username");
    set({
      username: null,
      role: null,
      token: null,
      isAuthenticated: false,
    });
  },

  syncFromCookies: () => {
    const token = Cookies.get("token") || null;
    const role = (Cookies.get("role") as "ADMIN" | "STAFF") || null;
    const username = Cookies.get("username") || null;
    set({
      token,
      role,
      username,
      isAuthenticated: Boolean(token),
    });
  },
}));
