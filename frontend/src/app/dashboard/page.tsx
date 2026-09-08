"use client";

import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from "chart.js";
import { ArrowUpRight, Coffee, DollarSign, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Chart } from "react-chartjs-2";
import { DataUpdatedToast, MutatingOverlay, useSmartOverlay } from "@/components/ui/LoadingOverlay";
import RevenueDetailModal from "@/components/ui/RevenueDetailModal";
import { useDashboardData } from "@/hooks/useDashboardData";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  bg: string;
  href?: string;
  onClick?: () => void;
}

export default function Dashboard() {
  const { stats, chartRevenueData, isLoading, isValidating } = useDashboardData();
  const { showOverlay, showToast } = useSmartOverlay(stats, isValidating, isLoading);
  const [revenueModalOpen, setRevenueModalOpen] = useState(false);

  // Prepare combo chart data from real API data (sort ascending by date so X-axis goes Old → New)
  const sortedChartData = [...chartRevenueData]
    .sort((a, b) => new Date(a.period).getTime() - new Date(b.period).getTime())
    .slice(-14);
  const chartLabels = sortedChartData.map((d) => {
    const date = new Date(d.period);
    return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
  });
  const chartRevenues = sortedChartData.map((d) => d.totalRevenue);
  const chartOrders = sortedChartData.map((d) => d.totalOrders);

  const comboChartData = {
    labels: chartLabels.length > 0 ? chartLabels : ["Chưa có dữ liệu"],
    datasets: [
      {
        type: "bar" as const,
        label: "Doanh thu (đ)",
        data: chartRevenues.length > 0 ? chartRevenues : [0],
        backgroundColor: "rgba(16, 185, 129, 0.6)",
        borderColor: "rgb(16, 185, 129)",
        borderWidth: 1,
        borderRadius: 6,
        maxBarThickness: 50,
        yAxisID: "y",
        order: 2,
      },
      {
        type: "line" as const,
        label: "Số đơn hàng",
        data: chartOrders.length > 0 ? chartOrders : [0],
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        borderWidth: 2.5,
        pointBackgroundColor: "rgb(59, 130, 246)",
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.4,
        fill: false,
        yAxisID: "y1",
        order: 1,
      },
    ],
  };

  const comboChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index" as const, intersect: false },
    plugins: {
      legend: {
        position: "top" as const,
        labels: { usePointStyle: true, padding: 20, font: { size: 12, weight: "bold" as const } },
      },
      tooltip: {
        callbacks: {
          label: (ctx: { dataset: { label?: string }; parsed: { y: number | null } }) => {
            const label = ctx.dataset.label || "";
            const val = ctx.parsed.y ?? 0;
            if (label.includes("Doanh thu")) return `${label}: ${val.toLocaleString("vi-VN")} đ`;
            return `${label}: ${val}`;
          },
        },
      },
    },
    scales: {
      y: {
        type: "linear" as const,
        display: true,
        position: "left" as const,
        border: { display: false },
        grid: { color: "#f1f5f9" },
        ticks: {
          callback: (value: string | number) => {
            const num = typeof value === "string" ? parseFloat(value) : value;
            if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
            if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
            return String(num);
          },
          font: { size: 11 },
        },
        title: {
          display: true,
          text: "Doanh thu (đ)",
          font: { size: 11, weight: "bold" as const },
          color: "#10b981",
        },
      },
      y1: {
        type: "linear" as const,
        display: true,
        position: "right" as const,
        border: { display: false },
        grid: { drawOnChartArea: false },
        ticks: { stepSize: 1, font: { size: 11 } },
        title: {
          display: true,
          text: "Số đơn",
          font: { size: 11, weight: "bold" as const },
          color: "#3b82f6",
        },
      },
      x: { border: { display: false }, grid: { display: false }, ticks: { font: { size: 11 } } },
    },
  };

  return (
    <div className="space-y-6">
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-500 font-medium">Đang tải dữ liệu...</p>
          </div>
        </div>
      ) : (
        <>
          <DataUpdatedToast show={showToast} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            <MutatingOverlay show={showOverlay} />
            <StatCard
              title="Tổng Doanh Thu"
              value={`${stats.revenue.toLocaleString("vi-VN")} đ`}
              icon={DollarSign}
              color="text-emerald-500"
              bg="bg-emerald-100"
              onClick={() => setRevenueModalOpen(true)}
            />
            <StatCard
              title="Tổng Đơn Hàng"
              value={stats.orders}
              icon={ShoppingBag}
              color="text-blue-500"
              bg="bg-blue-100"
              href="/order-history"
            />
            <StatCard
              title="Tổng Sản Phẩm"
              value={stats.products}
              icon={Coffee}
              color="text-amber-500"
              bg="bg-amber-100"
              href="/products"
            />
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-800">Biểu đồ Doanh thu & Đơn hàng</h3>
              <button
                onClick={() => setRevenueModalOpen(true)}
                className="text-sm text-amber-500 font-medium hover:text-amber-600 flex items-center gap-1 cursor-pointer"
              >
                Xem chi tiết <ArrowUpRight size={16} />
              </button>
            </div>
            <div className="h-[400px]">
              <Chart type="bar" options={comboChartOptions} data={comboChartData} />
            </div>
          </div>

          {/* Footer */}
          <footer className="mt-8 bg-amber-50/50 border border-slate-100 rounded-2xl pt-8 pb-6 px-8 shadow-sm">
            <div className="flex flex-col md:flex-row justify-between gap-8 mb-8 text-center md:text-left">
              <div className="flex-1">
                <h4 className="text-slate-800 font-bold mb-4 text-base">Information</h4>
                <ul className="space-y-3 text-sm">
                  <li>
                    <Link href="#" className="text-blue-500 hover:text-blue-700 transition-colors">
                      Payment Center
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-blue-500 hover:text-blue-700 transition-colors">
                      News & Updates
                    </Link>
                  </li>
                </ul>
              </div>
              <div className="flex-1 flex flex-col md:items-center">
                <div className="text-left">
                  <h4 className="text-slate-800 font-bold mb-4 text-base">Follow Us</h4>
                  <ul className="space-y-3 text-sm">
                    <li>
                      <Link
                        href="#"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-700 transition-colors flex items-center gap-2"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="18"
                          height="18"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                        Facebook
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="#"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-black hover:text-gray-700 transition-colors flex items-center gap-2"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="18"
                          height="18"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                        </svg>
                        GitHub
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="flex-1 flex flex-col items-center md:items-end">
                <h4 className="text-slate-800 font-bold mb-4 text-base">Support</h4>
                <ul className="text-sm flex flex-col items-center md:items-start gap-3">
                  <li>
                    <Link href="#" className="text-blue-500 hover:text-blue-700 transition-colors">
                      Terms
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-blue-500 hover:text-blue-700 transition-colors">
                      Website
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            <div className="text-center text-sm text-slate-400 border-t border-slate-200/60 pt-6">
              © Copyright 2026 - Hjtee109. All rights reserved.
            </div>
          </footer>

          <RevenueDetailModal
            isOpen={revenueModalOpen}
            onClose={() => setRevenueModalOpen(false)}
          />
        </>
      )}
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color, bg, href, onClick }: StatCardProps) {
  const baseClasses =
    "h-full w-full bg-white p-6 rounded-2xl border border-slate-100 flex items-center gap-5 transition-all duration-300";
  const interactiveClasses =
    href || onClick
      ? "hover:-translate-y-1 hover:shadow-lg hover:border-amber-200 cursor-pointer"
      : "shadow-sm hover:shadow-md";
  const finalClasses = `${baseClasses} ${interactiveClasses}`;

  const innerContent = (
    <>
      <div
        className={`w-14 h-14 shrink-0 rounded-xl flex items-center justify-center ${bg} ${color}`}
      >
        <Icon size={28} />
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <h4 className="text-2xl font-bold text-slate-800 mt-1">{value}</h4>
      </div>
    </>
  );

  if (onClick) {
    return (
      <button onClick={onClick} className={finalClasses + " text-left"}>
        {innerContent}
      </button>
    );
  }

  if (href) {
    return (
      <Link href={href} className={finalClasses}>
        {innerContent}
      </Link>
    );
  }

  return <div className={finalClasses}>{innerContent}</div>;
}
