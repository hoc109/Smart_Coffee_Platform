"use client";
import { Bell, User } from "lucide-react";
import { usePathname } from "next/navigation";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const [role, setRole] = useState<string | undefined>("");

  // 1. Thêm một cái "rổ" (state) để đựng tên đăng nhập
  const [username, setUsername] = useState<string | undefined>("");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRole(Cookies.get("role"));

    // 2. Lấy tên đăng nhập từ Cookie ra bỏ vào rổ
    setUsername(Cookies.get("username"));
  }, [pathname]);

  if (pathname === "/login") return null;

  return (
    <header className="relative h-20 bg-white/50 backdrop-blur-md border-b border-slate-200 flex items-center justify-end px-8 sticky top-0 z-50">

      {/* Phần Tiêu đề được ép ra chính giữa tuyệt đối */}
      <div className="absolute left-1/2 -translate-x-1/2 flex items-center">
        <h2 className="text-3xl font-bold text-slate-800 text-center">
          {pathname === "/dashboard" ? "Welcome to Dashboard" :
            pathname === "/tables" ? "Quản lý bàn" :
              pathname === "/orders" ? "Đặt hàng" :
                pathname === "/products" ? "Danh sách các sản phẩm" :
                  pathname === "/accounts" ? "Danh sách nhân viên" :
                    pathname === "/order-history" ? "Lịch sử đặt hàng" :
                      pathname === "/staff-orders" ? "Danh sách đơn hàng" :
                        "AI-Assistant"}
        </h2>
      </div>

      {/* Phần Chuông và User được đẩy sang góc phải */}
      <div className="flex items-center gap-6">
        <button className="relative p-2 text-slate-400 hover:text-amber-500 transition-colors">
          <Bell size={24} />
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        <div className="flex items-center gap-3 pl-6 border-l border-slate-200 cursor-pointer">
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 border border-slate-200">
            <User size={20} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-700">Hi,{username}</p>
            <p className="text-xs text-slate-500 font-medium">{role === 'ADMIN' ? 'Quản trị viên' : 'Nhân viên'}</p>
          </div>
        </div>
      </div>
    </header>
  );
}