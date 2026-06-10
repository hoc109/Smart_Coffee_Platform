"use client";

import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axios";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Coffee, DollarSign, ShoppingBag, ArrowUpRight, } from "lucide-react";

// 1. Thay thế useRouter bằng thẻ Link của Next.js
import Link from "next/link";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

interface Order {
  status: string;
  totalAmount: number;
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  bg: string;
  // 2. Đổi onClick thành href để nhận đường dẫn URL
  href?: string;
}

export default function Dashboard() {
  const [stats, setStats] = useState({ revenue: 0, orders: 0, products: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [ordersRes, productsRes] = await Promise.all([
          axiosInstance.get("/orders"),
          axiosInstance.get("/products?size=1000")
        ]);

        const allOrders: Order[] = ordersRes.data;
        const paidOrders = allOrders.filter((o: Order) => o.status === "PAID");
        const totalRev = paidOrders.reduce((sum: number, o: Order) => sum + o.totalAmount, 0);

        setStats({
          revenue: totalRev,
          orders: allOrders.length,
          products: productsRes.data.content?.length || 0
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const chartData = {
    labels: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
    datasets: [
      {
        fill: true,
        label: 'Doanh thu',
        data: [1200000, 1900000, 1500000, 2200000, 1800000, 2900000, stats.revenue > 0 ? stats.revenue : 3200000],
        borderColor: 'rgb(245, 158, 11)',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: { border: { display: false }, grid: { color: '#f1f5f9' } },
      x: { border: { display: false }, grid: { display: false } }
    }
  };

  return (
    <div className="space-y-6">
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-500 font-medium">Đang tải dữ liệu...</p>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Không truyền href -> Nó sẽ chỉ là cái thẻ bình thường */}
            <StatCard
              title="Tổng Doanh Thu"
              value={`${stats.revenue.toLocaleString('vi-VN')} đ`}
              icon={DollarSign}
              color="text-emerald-500"
              bg="bg-emerald-100"
              href="#" // <--- BÙA HỘ MỆNH Ở ĐÂY: Thêm href để nó biến thành thẻ Link giống 2 anh em kia
            />

            {/* 3. Truyền đường dẫn href thẳng vào đây */}
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
              <h3 className="text-lg font-bold text-slate-800">Biểu đồ doanh thu tuần</h3>
              <button className="text-sm text-amber-500 font-medium hover:text-amber-600 flex items-center gap-1">
                Xem chi tiết <ArrowUpRight size={16} />
              </button>
            </div>
            <div className="h-[400px]">
              <Line options={chartOptions} data={chartData} />
            </div>
          </div>

          {/* FOOTER ĐÃ ĐƯỢC CHUẨN HÓA CĂN LỀ & ĐỔI MÀU NỀN */}
          {/* Đổi màu ở đây: bg-amber-50/50 (Tông kem) hoặc bg-slate-50 (Tông xám khói) */}
          <footer className="mt-8 bg-amber-50/50 border border-slate-100 rounded-2xl pt-8 pb-6 px-8 shadow-sm">

            {/* Dùng flex justify-between để ép 3 cột giãn đều ra 3 góc */}
            <div className="flex flex-col md:flex-row justify-between gap-8 mb-8 text-center md:text-left">

              {/* Cột 1: Bám sát lề trái */}
              <div className="flex-1">
                <h4 className="text-slate-800 font-bold mb-4 text-base">Information</h4>
                <ul className="space-y-3 text-sm">
                  <li><Link href="#" className="text-blue-500 hover:text-blue-700 transition-colors">Payment Center</Link></li>
                  <li><Link href="#" className="text-blue-500 hover:text-blue-700 transition-colors">News & Updates</Link></li>
                </ul>
              </div>

              {/* Cột 2: Căn ngay chính giữa */}
              <div className="flex-1 flex flex-col md:items-center">
                <div className="text-left"> {/* Giữ cho chữ bên trong vẫn thẳng hàng với nhau */}
                  <h4 className="text-slate-800 font-bold mb-4 text-base">Follow Us</h4>
                  <ul className="space-y-3 text-sm">
                    <li>
                      <Link
                        href="#"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-700 transition-colors flex items-center gap-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
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
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                        </svg>
                        GitHub
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Cột 3: Bám sát lề phải */}
              <div className="flex-1 flex flex-col items-center md:items-end">
                <h4 className="text-slate-800 font-bold mb-4 text-base">Support</h4>
                <ul className="text-sm flex flex-col items-center md:items-start gap-3">
                  <li><Link href="#" className="text-blue-500 hover:text-blue-700 transition-colors">Terms</Link></li>
                  <li><Link href="#" className="text-blue-500 hover:text-blue-700 transition-colors">Website</Link></li>
                </ul>
              </div>
            </div>

            {/* Dòng bản quyền */}
            <div className="text-center text-sm text-slate-400 border-t border-slate-200/60 pt-6">
              © Copyright 2026 - Hjtee109. All rights reserved.
            </div>
          </footer>
        </>
      )}
    </div>
  );
}

// 4. Logic bọc thẻ Link thông minh
// Component StatCard đã dọn sạch lỗi xung đột Flex/Block
function StatCard({ title, value, icon: Icon, color, bg, href }: StatCardProps) {
  // ĐÃ XÓA chữ 'block', chỉ giữ lại 'flex' và 'h-full'
  const baseClasses = "h-full w-full bg-white p-6 rounded-2xl border border-slate-100 flex items-center gap-5 transition-all duration-300";
  const hoverClasses = href
    ? "hover:-translate-y-1 hover:shadow-lg hover:border-amber-200 cursor-pointer"
    : "shadow-sm hover:shadow-md";
  const finalClasses = `${baseClasses} ${hoverClasses}`;

  const innerContent = (
    <>
      <div className={`w-14 h-14 shrink-0 rounded-xl flex items-center justify-center ${bg} ${color}`}>
        <Icon size={28} />
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <h4 className="text-2xl font-bold text-slate-800 mt-1">{value}</h4>
      </div>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={finalClasses}>
        {innerContent}
      </Link>
    );
  }

  return (
    <div className={finalClasses}>
      {innerContent}
    </div>
  );
}