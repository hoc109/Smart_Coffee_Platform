"use client";
import { Edit2, Plus, Search, Trash2, X } from "lucide-react";
import { useState } from "react";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { DataUpdatedToast, MutatingOverlay, useSmartOverlay } from "@/components/ui/LoadingOverlay";
import { useProductsData } from "@/hooks/useProductsData";
import axiosInstance from "@/lib/axios";

interface Category {
  id: number;
  name: string;
}
interface Product {
  id: number;
  name: string;
  price: number;
  imageUrl?: string;
  category: Category;
}

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({ name: "", price: "", categoryId: "" });
  const [file, setFile] = useState<File | null>(null);

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

  const { products, categories, isLoading, isValidating, mutateProducts } = useProductsData();
  const { showOverlay, showToast, startMutation, endMutation } = useSmartOverlay(
    products,
    isValidating,
    isLoading,
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData();
    data.append("name", formData.name);
    data.append("price", formData.price);
    data.append("categoryId", formData.categoryId);
    if (file) data.append("file", file);
    try {
      setSaving(true);
      startMutation();
      if (editingId) {
        await axiosInstance.put(`/products/${editingId}`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await axiosInstance.post("/products", data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      setIsModalOpen(false);
      await mutateProducts();
      endMutation();
    } catch (err) {
      console.error(err);
      endMutation();
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClick = (product: Product) => {
    setConfirmModal({
      isOpen: true,
      title: "Xác nhận xóa sản phẩm",
      message: `Bạn có chắc chắn muốn xóa sản phẩm "${product.name}"?`,
      onConfirm: async () => {
        try {
          startMutation();
          await axiosInstance.delete(`/products/${product.id}`);
          await mutateProducts();
          endMutation();
        } catch (err) {
          console.error(err);
          endMutation();
        }
      },
    });
  };

  const openModal = (product?: Product) => {
    if (product) {
      setEditingId(product.id);
      setFormData({
        name: product.name,
        price: product.price.toString(),
        categoryId: product.category.id.toString(),
      });
    } else {
      setEditingId(null);
      setFormData({ name: "", price: "", categoryId: categories[0]?.id.toString() || "" });
    }
    setFile(null);
    setIsModalOpen(true);
  };

  // Perform filtering client-side to keep revalidations separate from typing
  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
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
        confirmText="Xóa sản phẩm"
      />

      <div className="flex items-center justify-between">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 w-80"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button
          onClick={() => openModal()}
          className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={20} /> Thêm Sản Phẩm
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden relative">
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
                <th className="p-4 font-medium">Hình ảnh</th>
                <th className="p-4 font-medium">Tên sản phẩm</th>
                <th className="p-4 font-medium">Danh mục</th>
                <th className="p-4 font-medium">Giá bán</th>
                <th className="p-4 font-medium">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors"
                >
                  <td className="p-4">
                    {p.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={
                          p.imageUrl?.startsWith("http")
                            ? p.imageUrl
                            : `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080"}/uploads/${p.imageUrl}`
                        }
                        alt={p.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-slate-200 rounded-lg flex items-center justify-center text-slate-400 text-xs">
                        No img
                      </div>
                    )}
                  </td>
                  <td className="p-4 font-semibold text-slate-700">{p.name}</td>
                  <td className="p-4 text-slate-500">{p.category?.name}</td>
                  <td className="p-4 text-emerald-600 font-bold">
                    {p.price.toLocaleString("vi-VN")} đ
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => openModal(p)}
                        className="text-blue-500 hover:bg-blue-50 p-2 rounded-lg transition-colors"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(p)}
                        className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    Không tìm thấy sản phẩm nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800">
                {editingId ? "Cập nhật sản phẩm" : "Thêm sản phẩm mới"}
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
                  Tên sản phẩm
                </label>
                <input
                  required
                  type="text"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Giá bán</label>
                  <input
                    required
                    type="number"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Danh mục</label>
                  <select
                    required
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  >
                    <option value="">Chọn danh mục</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Hình ảnh {editingId && "(Bỏ trống nếu không đổi)"}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  className="w-full"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
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
