"use client";
import { Check, CheckCircle, Coffee, Minus, Plus, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { mutate as globalMutate } from "swr";
import { DataUpdatedToast, MutatingOverlay, useSmartOverlay } from "@/components/ui/LoadingOverlay";
import { useOrdersPageData } from "@/hooks/useOrdersPageData";
import axiosInstance from "@/lib/axios";

interface Product {
  id: number;
  name: string;
  price: number;
  imageUrl?: string;
  category: { id: number; name: string };
}

interface CartItem extends Product {
  quantity: number;
}

export default function OrdersPage() {
  const [activeCategory, setActiveCategory] = useState<number | "ALL">("ALL");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedTableId, setSelectedTableId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // SWR: Dữ liệu cache hiển thị ngay khi quay lại trang
  const { products, categories, tables, isLoading, isValidating, mutateTables } =
    useOrdersPageData();
  const { showOverlay, showToast, startMutation, endMutation } = useSmartOverlay(
    products,
    isValidating,
    isLoading,
  );

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const exist = prev.find((p) => p.id === product.id);
      if (exist) {
        return prev.map((p) => (p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p));
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((p) => {
          if (p.id === id) {
            const newQ = p.quantity + delta;
            return newQ > 0 ? { ...p, quantity: newQ } : p;
          }
          return p;
        })
        .filter((p) => p.quantity > 0),
    );
  };

  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = async () => {
    if (!selectedTableId) return alert("Vui lòng chọn bàn!");
    if (cart.length === 0) return alert("Vui lòng chọn món!");

    try {
      setSaving(true);
      startMutation();
      const payload = {
        tableId: selectedTableId,
        details: cart.map((item) => ({ productId: item.id, quantity: item.quantity })),
      };
      await axiosInstance.post("/orders", payload);
      setCart([]);
      setSelectedTableId(null);
      // Refresh bàn trống + invalidate global /orders cache cho order-history
      await mutateTables();
      await globalMutate("/orders");
      endMutation();
      setShowSuccessModal(true);
    } catch (err) {
      console.error(err);
      endMutation();
      alert("Có lỗi xảy ra khi đặt món");
    } finally {
      setSaving(false);
    }
  };

  const filteredProducts =
    activeCategory === "ALL" ? products : products.filter((p) => p.category.id === activeCategory);

  return (
    <>
      <div className="flex gap-6 h-[calc(100vh-8rem)]">
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 flex gap-2 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveCategory("ALL")}
              className={`px-4 py-2 rounded-full whitespace-nowrap font-medium transition-colors ${activeCategory === "ALL" ? "bg-amber-500 text-slate-900" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
            >
              Tất cả
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-full whitespace-nowrap font-medium transition-colors ${activeCategory === cat.id ? "bg-amber-500 text-slate-900" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
              >
                {cat.name}
              </button>
            ))}
          </div>
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-slate-500 font-medium">Đang tải dữ liệu...</p>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredProducts.map((p) => (
                <div
                  key={p.id}
                  onClick={() => addToCart(p)}
                  className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden cursor-pointer hover:border-amber-400 hover:shadow-md transition-all group"
                >
                  <div className="h-32 bg-slate-200 relative">
                    {p.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={
                          p.imageUrl?.startsWith("http")
                            ? p.imageUrl
                            : `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080"}/uploads/${p.imageUrl}`
                        }
                        alt={p.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <Coffee size={32} />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-amber-500/0 group-hover:bg-amber-500/20 transition-all flex items-center justify-center">
                      <div className="bg-white text-slate-900 p-2 rounded-full opacity-0 group-hover:opacity-100 transform scale-50 group-hover:scale-100 transition-all shadow-lg">
                        <Plus size={24} />
                      </div>
                    </div>
                  </div>
                  <div className="p-3 bg-white">
                    <h4 className="font-semibold text-slate-800 line-clamp-1">{p.name}</h4>
                    <p className="text-amber-600 font-bold mt-1">
                      {p.price.toLocaleString("vi-VN")} đ
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="w-96 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col">
          <div className="p-4 border-b border-slate-100 flex items-center gap-3">
            <ShoppingCart size={24} className="text-slate-700" />
            <h3 className="font-bold text-lg text-slate-800">Đơn hàng hiện tại</h3>
          </div>

          <div className="p-4 border-b border-slate-100">
            <label className="block text-sm font-medium text-slate-700 mb-2">Chọn bàn trống</label>
            <select
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none font-medium"
              value={selectedTableId || ""}
              onChange={(e) => setSelectedTableId(Number(e.target.value))}
            >
              <option value="" disabled>
                -- Vui lòng chọn bàn --
              </option>
              {tables.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
            {cart.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between bg-white border border-slate-100 p-3 rounded-xl shadow-sm"
              >
                <div className="flex-1 pr-2">
                  <h5 className="font-semibold text-slate-800 text-sm line-clamp-1">{item.name}</h5>
                  <p className="text-amber-600 font-bold text-sm mt-0.5">
                    {(item.price * item.quantity).toLocaleString("vi-VN")} đ
                  </p>
                </div>
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg p-1">
                  <button
                    onClick={() => updateQuantity(item.id, -1)}
                    className="p-1 hover:bg-white rounded text-slate-600 shadow-sm transition-colors"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-6 text-center font-bold text-sm text-slate-800">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.id, 1)}
                    className="p-1 hover:bg-white rounded text-slate-600 shadow-sm transition-colors"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            ))}
            {cart.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2">
                <ShoppingCart size={48} className="opacity-20" />
                <p className="font-medium">Chưa có món nào</p>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-slate-200 mt-auto rounded-b-2xl shadow-[0_-10px_20px_rgba(0,0,0,0.02)]">
            <div className="flex justify-between items-center mb-4">
              <span className="text-slate-500 font-medium text-lg">Tổng cộng:</span>
              <span className="text-2xl font-bold text-slate-900">
                {totalAmount.toLocaleString("vi-VN")} đ
              </span>
            </div>
            <button
              onClick={handleCheckout}
              disabled={cart.length === 0 || !selectedTableId || saving}
              className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-slate-200 disabled:text-slate-400 text-slate-900 font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-amber-500/20 disabled:shadow-none flex items-center justify-center gap-2"
            >
              <Check size={20} /> {saving ? "Đang xử lý..." : "Xác nhận đặt hàng"}
            </button>
          </div>
        </div>
      </div>

      {/* Modal đặt hàng thành công */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-6 text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-emerald-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-800">Đặt hàng thành công</h3>
              <p className="text-slate-500 text-sm">Đơn hàng đã được ghi nhận vào hệ thống.</p>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-full mt-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-emerald-500/20"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
