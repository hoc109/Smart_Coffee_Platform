"use client";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  if (isLoginPage) {
    return <main className="min-h-screen bg-slate-50">{children}</main>;
  }

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-64 max-md:ml-0 min-h-screen relative">
        <Navbar />
        <main className="flex-1 p-8 overflow-y-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
