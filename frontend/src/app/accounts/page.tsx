"use client";
import { Edit2, Plus, Search, Trash2, Users, X } from "lucide-react";
import { useState } from "react";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { DataUpdatedToast, MutatingOverlay, useSmartOverlay } from "@/components/ui/LoadingOverlay";
import { useAccountsData } from "@/hooks/useAccountsData";
import axiosInstance from "@/lib/axios";

interface Account {
  id: number;
  username: string;
  role: string;
}

export default function AccountsPage() {
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({ username: "", password: "", role: "STAFF" });

  // Custom ConfirmModal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  // SWR: Dữ liệu cache hiển thị ngay, revalidate ngầm
  const { accounts, isLoading, isValidating, mutate } = useAccountsData();
  const { showOverlay, showToast, startMutation, endMutation } = useSmartOverlay(
    accounts,
    isValidating,
    isLoading,
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      startMutation();
      if (editingId) {
        await axiosInstance.put(`/accounts/${editingId}`, formData);
      } else {
        await axiosInstance.post("/accounts", formData);
      }
      setIsModalOpen(false);
      await mutate();
      endMutation();
    } catch (error: unknown) {
      endMutation();
      const err = error as { response?: { data?: { message?: string } } };
      alert(err.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClick = (account: Account) => {
    setConfirmModal({
      isOpen: true,
      title: "Xác nhận xóa tài khoản",
      message: `Bạn có chắc muốn xóa tài khoản "${account.username}"? Việc này có thể gây lỗi nếu họ đã tạo đơn hàng.`,
      onConfirm: async () => {
        try {
          startMutation();
          await axiosInstance.delete(`/accounts/${account.id}`);
          await mutate();
          endMutation();
        } catch {
          endMutation();
          alert(
            "Không thể xóa tài khoản này (có thể đã có dữ liệu liên quan). Vui lòng thử đổi mật khẩu hoặc đổi Role.",
          );
        }
      },
    });
  };

  const openModal = (account?: Account) => {
    if (account) {
      setEditingId(account.id);
      setFormData({ username: account.username, password: "", role: account.role });
    } else {
      setEditingId(null);
      setFormData({ username: "", password: "", role: "STAFF" });
    }
    setIsModalOpen(true);
  };

  const filteredAccounts = accounts.filter((a) =>
    a.username.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <MutatingOverlay show={showOverlay} />
      <DataUpdatedToast show={showToast} />

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        type="danger"
        confirmText="Xóa tài khoản"
      />

      <div className="flex items-center justify-between">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Tìm kiếm tài khoản..."
            className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 w-80"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button
          onClick={() => openModal()}
          className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={20} /> Thêm Tài Khoản
        </button>
      </div>

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
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-sm text-slate-500">
                <th className="p-4 font-medium w-16">ID</th>
                <th className="p-4 font-medium">Tên đăng nhập</th>
                <th className="p-4 font-medium">Phân quyền (Role)</th>
                <th className="p-4 font-medium">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredAccounts.map((a) => (
                <tr
                  key={a.id}
                  className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors"
                >
                  <td className="p-4 text-slate-500">#{a.id}</td>
                  <td className="p-4 font-bold text-slate-700 flex items-center gap-2">
                    <Users
                      size={16}
                      className={a.role === "ADMIN" ? "text-amber-500" : "text-blue-500"}
                    />
                    {a.username}
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${a.role === "ADMIN" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"}`}
                    >
                      {a.role}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => openModal(a)}
                        className="text-blue-500 hover:bg-blue-50 p-2 rounded-lg transition-colors"
                        title="Chỉnh sửa"
                      >
                        <Edit2 size={18} />
                      </button>
                      {a.username !== "admin" && (
                        <button
                          onClick={() => handleDeleteClick(a)}
                          className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                          title="Xóa"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredAccounts.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-500">
                    Không tìm thấy tài khoản nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800">
                {editingId ? "Cập nhật tài khoản" : "Thêm tài khoản"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:bg-slate-100 p-2 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Tên đăng nhập
                </label>
                <input
                  required
                  disabled={!!editingId}
                  type="text"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none disabled:bg-slate-100 disabled:text-slate-400"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Mật khẩu {editingId && "(Bỏ trống nếu không đổi)"}
                </label>
                <input
                  required={!editingId}
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Quyền hạn</label>
                <select
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="STAFF">STAFF (Nhân viên)</option>
                  <option value="ADMIN">ADMIN (Quản trị viên)</option>
                </select>
              </div>
              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-slate-900 rounded-lg font-bold"
                >
                  {saving ? "Đang lưu..." : "Lưu lại"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
