"use client";
import { useState } from "react";
import axiosInstance from "@/lib/axios";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { Coffee, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (isRegistering) {
      if (password !== confirmPassword) {
        setError("Mật khẩu xác nhận không đúng");
        setLoading(false);
        return;
      }
      try {
        await axiosInstance.post("/auth/register", { username, password });
        setIsRegistering(false);
        setPassword("");
        setConfirmPassword("");
        alert("Đăng ký thành công! Vui lòng đăng nhập.");
      } catch (error: unknown) { // Sửa 'any' thành 'unknown'
        // Ép kiểu an toàn để lấy message từ Axios
        const err = error as { response?: { data?: { message?: string } } };
        setError(err.response?.data?.message || "Đăng ký thất bại. Tên đăng nhập có thể đã tồn tại.");
      } finally {
        setLoading(false);
      }
    } else {
      try {
        const res = await axiosInstance.post("/auth/login", { username, password });
        Cookies.set("token", res.data.token, { path: '/' });
        Cookies.set("role", res.data.role, { path: '/' });
        Cookies.set("username", username, { path: '/' });
        if (res.data.role === "STAFF") {
          router.push("/orders");
        } else {
          router.push("/dashboard");
        }
      } catch { // Bỏ hẳn '(err: any)' vì không sử dụng đến
        setError("Tài khoản hoặc mật khẩu không chính xác");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-amber-500/10 blur-[120px]"></div>
        <div className="absolute top-[60%] right-[0%] w-[40%] h-[40%] rounded-full bg-blue-500/10 blur-[120px]"></div>
      </div>

      <div className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-3xl shadow-2xl relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-amber-500 p-3 rounded-2xl text-slate-900 shadow-lg shadow-amber-500/30 mb-4">
            <Coffee size={32} />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-wide">Coffee Chill</h1>
          <p className="text-slate-400 mt-2 text-sm">Hệ thống quản lý thông minh</p>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-xl mb-6 text-sm text-center">
            {error}
          </div>
        )}

        <div className="flex gap-4 mb-6 border-b border-white/10 pb-2">
          <button
            className={`flex-1 font-bold py-2 transition-colors ${!isRegistering ? 'text-amber-500 border-b-2 border-amber-500' : 'text-slate-400 hover:text-white'}`}
            onClick={() => { setIsRegistering(false); setError(""); }}
          >
            Đăng Nhập
          </button>
          <button
            className={`flex-1 font-bold py-2 transition-colors ${isRegistering ? 'text-amber-500 border-b-2 border-amber-500' : 'text-slate-400 hover:text-white'}`}
            onClick={() => { setIsRegistering(true); setError(""); }}
          >
            Đăng Ký
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5 ml-1">Tên đăng nhập</label>
            <input
              type="text"
              required
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all placeholder:text-slate-600"
              placeholder="Nhập tên đăng nhập"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5 ml-1">Mật khẩu</label>
            <input
              type="password"
              required
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all placeholder:text-slate-600"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {isRegistering && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5 ml-1">Xác nhận mật khẩu</label>
              <input
                type="password"
                required
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all placeholder:text-slate-600"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-900 font-bold py-3.5 rounded-xl transition-all duration-300 transform hover:-translate-y-1 shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2 mt-4 disabled:opacity-70 disabled:hover:translate-y-0"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : (isRegistering ? "Đăng ký tài khoản" : "Đăng nhập vào hệ thống")}
          </button>
        </form>
      </div>
    </div>
  );
}