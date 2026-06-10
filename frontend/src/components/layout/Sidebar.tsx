"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Coffee, LayoutDashboard, UtensilsCrossed, LogOut, MessageSquareText, Users, ClipboardList } from "lucide-react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [role, setRole] = useState<string | undefined>(undefined);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRole(Cookies.get("role"));
    setMounted(true);
  }, []);

  const handleLogout = () => {
    Cookies.remove("token");
    Cookies.remove("role");
    router.push("/login");
  };

  if (pathname === "/login") return null;

  const navItems = [
    { name: "Trang chủ", href: "/dashboard", icon: LayoutDashboard, roles: ["ADMIN"] },
    { name: "Sản phẩm", href: "/products", icon: Coffee, roles: ["ADMIN"] },
    { name: "Sơ đồ bàn", href: "/tables", icon: UtensilsCrossed, roles: ["ADMIN", "STAFF"] },
    { name: "Đặt hàng", href: "/orders", icon: UtensilsCrossed, roles: ["ADMIN", "STAFF"] },
    { name: "Lịch sử đơn hàng", href: "/staff-orders", icon: ClipboardList, roles: ["STAFF"] },
    { name: "Quản lý đơn hàng", href: "/order-history", icon: ClipboardList, roles: ["ADMIN"] },
    { name: "Quản lý nhân viên", href: "/accounts", icon: Users, roles: ["ADMIN"] },
    { name: "Chatbot AI", href: "/ai-assistant", icon: MessageSquareText, roles: ["ADMIN"] },
  ];

  return (
    <div className="w-64 h-screen bg-slate-900 text-white flex flex-col fixed left-0 top-0 border-r border-slate-800">
      <div className="p-6 flex items-center gap-3 border-b border-slate-800">
        <div className="bg-amber-500 p-2 rounded-lg text-slate-900 shadow-lg shadow-amber-500/20">
          <Coffee size={35} />
        </div>
        <span className="text-2xl font-bold text-white tracking-wide">
          Coffee Chill
        </span>
      </div>

      <nav className="flex-1 p-4 space-y-2 mt-4">
        {mounted && navItems.map((item) => {
          if (!item.roles.includes(role || "STAFF")) return null;
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${isActive
                ? "bg-amber-500 text-slate-900 font-semibold shadow-lg shadow-amber-500/20"
                : "hover:bg-slate-800 text-slate-300 hover:text-white"
                }`}
            >
              <item.icon size={20} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full text-left text-red-400 hover:bg-red-500/10 rounded-xl transition-colors font-medium"
        >
          <LogOut size={20} />
          <span>Đăng xuất</span>
        </button>
      </div>
    </div>
  );
}
