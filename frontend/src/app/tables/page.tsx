"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState, useCallback } from "react";
import axiosInstance from "@/lib/axios";
import { Plus, X, Coffee, CheckCircle } from "lucide-react";

// 1. Định nghĩa Interface cho Table và Order
interface Table {
  id: number;
  name: string;
  status: string;
}

interface Order {
  id: number;
  status: string;
  totalAmount: number;
  cafeTable: Table;
}

export default function TablesPage() {
  // 2. Thay thế 'any' bằng các Interfaces tương ứng
  const [tables, setTables] = useState<Table[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tableName, setTableName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [tableRes, orderRes] = await Promise.all([
        axiosInstance.get("/tables"),
        axiosInstance.get("/orders")
      ]);
      setTables(tableRes.data);
      // 3. Sử dụng Interface 'Order' thay vì 'any'
      setOrders(orderRes.data.filter((o: Order) => o.status === "PENDING"));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, [fetchData]);

  const handleAddTable = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await axiosInstance.post("/tables", { name: tableName, status: "AVAILABLE" });
      setIsModalOpen(false);
      setTableName("");
      fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleCheckout = async (tableId: number) => {
    const order = orders.find(o => o.cafeTable.id === tableId);
    if (!order) return alert("Không tìm thấy đơn hàng cho bàn này");
    
    if (confirm("Xác nhận thanh toán cho " + order.cafeTable.name + "? Tổng tiền: " + order.totalAmount.toLocaleString() + " đ")) {
      try {
        await axiosInstance.put(`/orders/${order.id}/checkout`);
        alert("Thanh toán thành công!");
        fetchData();
      } catch (err) {
        console.error(err);
        alert("Có lỗi xảy ra");
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800">Sơ Đồ Bàn</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={20} /> Thêm Bàn Mới
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-500 font-medium">Đang tải dữ liệu...</p>
          </div>
        </div>
      ) : (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {tables.map(table => {
          const isUsing = table.status === "OCCUPIED";
          return (
            <div 
              key={table.id}
              className={`relative p-6 rounded-2xl border-2 flex flex-col items-center justify-center gap-3 transition-all duration-300 ${
                isUsing 
                  ? "bg-amber-50 border-amber-200 text-amber-600 shadow-[0_0_15px_rgba(245,158,11,0.15)]" 
                  : "bg-white border-emerald-200 text-emerald-600 hover:border-emerald-400 hover:shadow-lg"
              }`}
            >
              <Coffee size={40} className={isUsing ? "text-amber-500" : "text-emerald-500"} />
              <span className="font-bold text-lg text-slate-800">{table.name}</span>
              
              {isUsing ? (
                <button 
                  onClick={() => handleCheckout(table.id)}
                  className="mt-2 w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-bold bg-amber-500 text-slate-900 hover:bg-amber-600 transition-colors shadow-md"
                >
                  <CheckCircle size={16} /> Thanh toán
                </button>
              ) : (
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700 mt-2 border border-emerald-200">
                  Bàn trống
                </span>
              )}
            </div>
          );
        })}
      </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800">Thêm bàn mới</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:bg-slate-100 p-2 rounded-lg"><X size={20} /></button>
            </div>
            <form onSubmit={handleAddTable} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tên bàn (Ví dụ: Bàn 01)</label>
                <input required type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none" value={tableName} onChange={e => setTableName(e.target.value)} />
              </div>
              <button type="submit" disabled={saving} className="w-full py-2 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-slate-900 rounded-lg font-bold">{saving ? "Đang lưu..." : "Lưu lại"}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}