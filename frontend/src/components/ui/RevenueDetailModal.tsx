"use client";

import { Calendar, DollarSign, ShoppingBag, TrendingUp, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { RevenueItem } from "@/hooks/useDashboardData";
import axiosInstance from "@/lib/axios";

// --- Vietnamese Date Picker helpers ---

/** Format "yyyy-MM-dd" → "dd/MM/yyyy" */
function formatDateVN(isoDate: string): string {
  const [y, m, d] = isoDate.split("-");
  return `${d}/${m}/${y}`;
}

/** Format "yyyy-MM" → "MM/yyyy" */
function formatMonthVN(isoMonth: string): string {
  const [y, m] = isoMonth.split("-");
  return `${m}/${y}`;
}

/** A custom date input that displays dd/MM/yyyy but uses the native date picker */
function ViDateInput({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div className="flex-1">
      <label className="block text-xs font-medium text-slate-500 mb-1">{label}</label>
      <div className="relative">
        <button
          type="button"
          onClick={() => ref.current?.showPicker?.()}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none text-left bg-white cursor-pointer flex items-center justify-between"
        >
          <span>{formatDateVN(value)}</span>
          <Calendar size={14} className="text-slate-400" />
        </button>
        <input
          ref={ref}
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 opacity-0 cursor-pointer"
          tabIndex={-1}
        />
      </div>
    </div>
  );
}

/** A custom month input that displays MM/yyyy but uses the native month picker */
function ViMonthInput({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div className="flex-1">
      <label className="block text-xs font-medium text-slate-500 mb-1">{label}</label>
      <div className="relative">
        <button
          type="button"
          onClick={() => ref.current?.showPicker?.()}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none text-left bg-white cursor-pointer flex items-center justify-between"
        >
          <span>{formatMonthVN(value)}</span>
          <Calendar size={14} className="text-slate-400" />
        </button>
        <input
          ref={ref}
          type="month"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 opacity-0 cursor-pointer"
          tabIndex={-1}
        />
      </div>
    </div>
  );
}

type ViewMode = "day" | "month" | "year";

interface RevenueDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RevenueDetailModal({ isOpen, onClose }: RevenueDetailModalProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("day");
  const [data, setData] = useState<RevenueItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Date filters
  const [fromDate, setFromDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split("T")[0];
  });
  const [toDate, setToDate] = useState(() => new Date().toISOString().split("T")[0]);

  // Month filters
  const [fromMonth, setFromMonth] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 11);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });
  const [toMonth, setToMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });

  // Year filters
  const [fromYear, setFromYear] = useState(() => String(new Date().getFullYear() - 2));
  const [toYear, setToYear] = useState(() => String(new Date().getFullYear()));

  useEffect(() => {
    if (!isOpen) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get<RevenueItem[]>(`/revenue/stats?type=${viewMode}`);
        let filtered = res.data;

        if (viewMode === "day") {
          filtered = filtered.filter((item) => item.period >= fromDate && item.period <= toDate);
        } else if (viewMode === "month") {
          filtered = filtered.filter((item) => item.period >= fromMonth && item.period <= toMonth);
        } else {
          filtered = filtered.filter((item) => item.period >= fromYear && item.period <= toYear);
        }

        // Sort descending so newest data appears first in the table
        filtered.sort((a, b) => b.period.localeCompare(a.period));
        setData(filtered);
      } catch (err) {
        console.error("Failed to fetch revenue data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isOpen, viewMode, fromDate, toDate, fromMonth, toMonth, fromYear, toYear]);

  if (!isOpen) return null;

  const totalRevenue = data.reduce((sum, d) => sum + d.totalRevenue, 0);
  const totalOrders = data.reduce((sum, d) => sum + d.totalOrders, 0);

  const formatPeriod = (period: string) => {
    if (viewMode === "day") {
      const d = new Date(period);
      return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
    }
    if (viewMode === "month") {
      const [y, m] = period.split("-");
      return `Tháng ${parseInt(m)}/${y}`;
    }
    return `Năm ${period}`;
  };

  const yearOptions: number[] = [];
  for (let y = 2024; y <= new Date().getFullYear() + 1; y++) yearOptions.push(y);

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-emerald-50 to-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500 p-2.5 rounded-xl text-white shadow-lg shadow-emerald-500/20">
              <TrendingUp size={22} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">Thống kê Doanh thu Chi tiết</h3>
              <p className="text-xs text-slate-500 font-medium">
                Phân tích doanh thu theo thời gian
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:bg-slate-100 p-2 rounded-lg transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-5 pt-4 shrink-0">
          <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
            {[
              { key: "day" as ViewMode, label: "Theo Ngày", icon: Calendar },
              { key: "month" as ViewMode, label: "Theo Tháng", icon: Calendar },
              { key: "year" as ViewMode, label: "Theo Năm", icon: Calendar },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setViewMode(tab.key)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-bold transition-all duration-200 cursor-pointer ${
                  viewMode === tab.key
                    ? "bg-white text-emerald-700 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <tab.icon size={15} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="px-5 pt-4 shrink-0">
          <div className="flex items-center gap-3">
            {viewMode === "day" && (
              <>
                <ViDateInput label="Từ ngày" value={fromDate} onChange={setFromDate} />
                <ViDateInput label="Đến ngày" value={toDate} onChange={setToDate} />
              </>
            )}
            {viewMode === "month" && (
              <>
                <ViMonthInput label="Từ tháng" value={fromMonth} onChange={setFromMonth} />
                <ViMonthInput label="Đến tháng" value={toMonth} onChange={setToMonth} />
              </>
            )}
            {viewMode === "year" && (
              <>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-slate-500 mb-1">Từ năm</label>
                  <select
                    value={fromYear}
                    onChange={(e) => setFromYear(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    {yearOptions.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-slate-500 mb-1">Đến năm</label>
                  <select
                    value={toYear}
                    onChange={(e) => setToYear(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    {yearOptions.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="px-5 pt-4 shrink-0">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 flex items-center gap-3">
              <div className="bg-emerald-500 p-2 rounded-lg text-white">
                <DollarSign size={18} />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Tổng doanh thu</p>
                <p className="text-lg font-black text-emerald-700">
                  {totalRevenue.toLocaleString("vi-VN")} đ
                </p>
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex items-center gap-3">
              <div className="bg-blue-500 p-2 rounded-lg text-white">
                <ShoppingBag size={18} />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Tổng đơn hàng</p>
                <p className="text-lg font-black text-blue-700">{totalOrders}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="p-5 flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="w-7 h-7 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : data.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-slate-400">
              <Calendar size={40} className="opacity-20 mb-2" />
              <p className="font-medium">Không có dữ liệu trong khoảng thời gian này</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500 uppercase tracking-wide">
                  <th className="p-3 font-semibold rounded-tl-lg">#</th>
                  <th className="p-3 font-semibold">
                    {viewMode === "day" ? "Ngày" : viewMode === "month" ? "Tháng" : "Năm"}
                  </th>
                  <th className="p-3 font-semibold text-right">Số đơn hàng</th>
                  <th className="p-3 font-semibold text-right rounded-tr-lg">Doanh thu</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item, idx) => (
                  <tr
                    key={item.period}
                    className="border-b border-slate-100 hover:bg-emerald-50/40 transition-colors"
                  >
                    <td className="p-3 text-sm text-slate-400 font-mono">{idx + 1}</td>
                    <td className="p-3 text-sm font-semibold text-slate-700">
                      {formatPeriod(item.period)}
                    </td>
                    <td className="p-3 text-sm text-right">
                      <span className="inline-flex items-center gap-1 text-blue-600 font-bold">
                        <ShoppingBag size={13} /> {item.totalOrders}
                      </span>
                    </td>
                    <td className="p-3 text-sm text-right font-bold text-emerald-700">
                      {item.totalRevenue.toLocaleString("vi-VN")} đ
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-50 font-bold text-sm">
                  <td colSpan={2} className="p-3 text-slate-700 rounded-bl-lg">
                    Tổng cộng
                  </td>
                  <td className="p-3 text-right text-blue-700">{totalOrders}</td>
                  <td className="p-3 text-right text-emerald-700 rounded-br-lg">
                    {totalRevenue.toLocaleString("vi-VN")} đ
                  </td>
                </tr>
              </tfoot>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
