"use client";
import {
  CalendarDays,
  ClipboardList,
  Coffee,
  DollarSign,
  Eye,
  Hash,
  Search,
  User,
  X,
} from "lucide-react";
import { useState } from "react";
import {
  DataUpdatedToast,
  MutatingOverlay,
  SyncingIndicator,
  useSmartOverlay,
} from "@/components/ui/LoadingOverlay";
import type { OrderItem } from "@/hooks/useStaffOrdersData";
import { useStaffOrdersData } from "@/hooks/useStaffOrdersData";
import axiosInstance from "@/lib/axios";

// ===================== Status Badge =====================
const statusConfig: Record<string, { label: string; bg: string; text: string }> = {
  PENDING: { label: "Đang phục vụ", bg: "bg-yellow-100", text: "text-yellow-700" },
  PAID: { label: "Đã thanh toán", bg: "bg-emerald-100", text: "text-emerald-700" },
  CANCELLED: { label: "Đã hủy", bg: "bg-red-100", text: "text-red-700" },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = statusConfig[status] || { label: status, bg: "bg-slate-100", text: "text-slate-600" };
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${cfg.bg} ${cfg.text}`}
    >
      {cfg.label}
    </span>
  );
}

// ===================== Main Page =====================
export default function StaffOrderHistoryPage() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");

  // Modal state (view-only)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);

  // SWR: Dữ liệu cache hiển thị ngay, revalidate ngầm
  const { orders, isLoading, isValidating } = useStaffOrdersData();
  const { showOverlay, showToast, isSyncing } = useSmartOverlay(orders, isValidating, isLoading);

  // Lọc & tìm kiếm
  const filteredOrders = orders
    .filter((o) => {
      if (filterStatus !== "ALL" && o.status !== filterStatus) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const tableName = o.cafeTable?.name?.toLowerCase() || "";
        const staffName = o.account?.username?.toLowerCase() || "";
        const orderId = `#${o.id}`;
        return tableName.includes(q) || staffName.includes(q) || orderId.includes(q);
      }
      return true;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Mở modal xem chi tiết
  const openModal = async (order: OrderItem) => {
    try {
      const res = await axiosInstance.get(`/orders/${order.id}`);
      setSelectedOrder(res.data);
      setIsModalOpen(true);
    } catch {
      alert("Không thể tải chi tiết đơn hàng");
    }
  };

  // Format thời gian
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      <MutatingOverlay show={showOverlay} />
      <DataUpdatedToast show={showToast} />
      <SyncingIndicator show={isSyncing} />
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-amber-500 p-2.5 rounded-xl text-slate-900 shadow-lg shadow-amber-500/20">
            <ClipboardList size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Lịch sử đơn hàng</h1>
            <p className="text-sm text-slate-500">Xem lại toàn bộ đơn hàng đã tạo</p>
          </div>
        </div>
        <div className="text-sm text-slate-500 bg-slate-100 px-4 py-2 rounded-lg font-medium">
          Tổng: <span className="text-amber-600 font-bold">{orders.length}</span> đơn hàng
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Tìm theo mã đơn, tên bàn, nhân viên..."
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {[
            { key: "ALL", label: "Tất cả" },
            { key: "PENDING", label: "Đang phục vụ" },
            { key: "PAID", label: "Đã thanh toán" },
            { key: "CANCELLED", label: "Đã hủy" },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilterStatus(f.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${filterStatus === f.key ? "bg-amber-500 text-slate-900 shadow-md shadow-amber-500/20" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden relative">
        <MutatingOverlay show={showOverlay} />
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-slate-500 font-medium">Đang tải dữ liệu...</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-sm text-slate-500">
                  <th className="p-4 font-medium w-20">Mã đơn</th>
                  <th className="p-4 font-medium">Tên Bàn</th>
                  <th className="p-4 font-medium">Người lập</th>
                  <th className="p-4 font-medium">Thời gian</th>
                  <th className="p-4 font-medium text-right">Tổng tiền</th>
                  <th className="p-4 font-medium text-center">Trạng thái</th>
                  <th className="p-4 font-medium text-center">Chi tiết</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-slate-100 hover:bg-amber-50/40 transition-colors"
                  >
                    <td className="p-4">
                      <span className="flex items-center gap-1.5 text-slate-500 font-mono text-sm">
                        <Hash size={14} className="text-amber-500" />
                        {order.id}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="font-semibold text-slate-700">
                        {order.cafeTable?.name || "—"}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="flex items-center gap-2 text-slate-600">
                        <User size={14} className="text-blue-500" />
                        {order.account?.username || "N/A"}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="flex items-center gap-2 text-slate-500 text-sm">
                        <CalendarDays size={14} className="text-slate-400" />
                        {formatDate(order.createdAt)}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <span className="font-bold text-slate-800">
                        {order.totalAmount.toLocaleString("vi-VN")} đ
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => openModal(order)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                        title="Xem chi tiết"
                      >
                        <Eye size={15} /> Xem
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredOrders.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-12 text-center">
                      <div className="flex flex-col items-center gap-3 text-slate-400">
                        <ClipboardList size={48} className="opacity-20" />
                        <p className="font-medium text-lg">Không tìm thấy đơn hàng nào</p>
                        <p className="text-sm">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Xem Chi Tiết (Read-Only) */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-amber-50 to-white">
              <div className="flex items-center gap-3">
                <div className="bg-amber-500 p-2 rounded-lg text-slate-900">
                  <ClipboardList size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800">Đơn hàng #{selectedOrder.id}</h3>
                  <p className="text-sm text-slate-500">{formatDate(selectedOrder.createdAt)}</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:bg-slate-100 p-2 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-xl p-3 space-y-1">
                  <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">Bàn</p>
                  <p className="font-semibold text-slate-800">
                    {selectedOrder.cafeTable?.name || "—"}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 space-y-1">
                  <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">
                    Trạng thái
                  </p>
                  <StatusBadge status={selectedOrder.status} />
                </div>
              </div>
              <div className="flex items-center gap-3 bg-slate-50 rounded-xl p-3">
                <User size={18} className="text-blue-500" />
                <div>
                  <p className="text-xs text-slate-500">Nhân viên lập đơn</p>
                  <p className="font-semibold text-slate-800">
                    {selectedOrder.account?.username || "N/A"}
                  </p>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                  <Coffee size={16} className="text-amber-500" /> Chi tiết đơn hàng
                </h4>
                <div className="space-y-2">
                  {selectedOrder.orderDetails && selectedOrder.orderDetails.length > 0 ? (
                    selectedOrder.orderDetails.map((detail) => (
                      <div
                        key={detail.id}
                        className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-xl p-3"
                      >
                        <div className="flex-1">
                          <p className="font-semibold text-slate-800 text-sm">
                            {detail.product?.name || "Sản phẩm đã xóa"}
                          </p>
                          <p className="text-xs text-slate-500">
                            SL: {detail.quantity} × {detail.price.toLocaleString("vi-VN")} đ
                          </p>
                        </div>
                        <span className="font-bold text-amber-600 text-sm">
                          {(detail.quantity * detail.price).toLocaleString("vi-VN")} đ
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-400 text-center py-4">Không có chi tiết</p>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-xl p-4">
                <span className="flex items-center gap-2 text-slate-700 font-medium">
                  <DollarSign size={18} className="text-amber-600" /> Tổng tiền
                </span>
                <span className="text-xl font-bold text-amber-700">
                  {selectedOrder.totalAmount.toLocaleString("vi-VN")} đ
                </span>
              </div>
            </div>
            <div className="p-6 border-t border-slate-100 flex items-center justify-end bg-slate-50">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-medium transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
