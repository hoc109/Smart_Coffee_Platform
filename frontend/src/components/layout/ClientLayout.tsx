"use client";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import QueryProvider from "@/components/providers/QueryProvider";
import { setApiRedirectCallback } from "@/lib/api-client";
import { setRedirectCallback } from "@/lib/axios";
import { SWRProvider } from "@/lib/swr";
import { useAuthStore } from "@/stores/useAuthStore";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === "/login";
  const syncFromCookies = useAuthStore((s) => s.syncFromCookies);

  // Inject Next.js router vào interceptor
  // để redirect 401/403 không gây hard reload
  useEffect(() => {
    syncFromCookies();
    setRedirectCallback((path: string) => {
      router.push(path);
    });
    setApiRedirectCallback((path: string) => {
      router.push(path);
    });
  }, [router, syncFromCookies]);

  if (isLoginPage) {
    return (
      <QueryProvider>
        <main className="min-h-screen bg-slate-50">{children}</main>
      </QueryProvider>
    );
  }

  return (
    <QueryProvider>
      <SWRProvider>
        <div className="flex min-h-screen bg-slate-50 text-slate-900">
          <Sidebar />
          <div className="flex-1 flex flex-col ml-64 max-md:ml-0 min-h-screen relative">
            <Navbar />
            <main className="flex-1 p-8 overflow-y-auto w-full">{children}</main>
          </div>
        </div>
      </SWRProvider>
    </QueryProvider>
  );
}
