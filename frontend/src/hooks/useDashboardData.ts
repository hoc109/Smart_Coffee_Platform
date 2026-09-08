"use client";

import useSWR from "swr";
import { axiosFetcher } from "@/lib/swr";

interface Order {
  status: string;
  totalAmount: number;
}

interface DashboardStats {
  revenue: number;
  orders: number;
  products: number;
}

export interface RevenueItem {
  period: string;
  totalOrders: number;
  totalRevenue: number;
}

/**
 * Custom hook quản lý dữ liệu Dashboard với SWR caching.
 *
 * - Dữ liệu cũ hiển thị ngay từ cache khi quay lại trang
 * - SWR tự động revalidate ngầm và cập nhật UI khi có data mới
 */
export function useDashboardData() {
  // Fetch orders
  const {
    data: ordersData,
    isLoading: ordersLoading,
    isValidating: ordersValidating,
  } = useSWR<Order[]>("/orders", axiosFetcher);

  // Fetch products
  const {
    data: productsData,
    isLoading: productsLoading,
    isValidating: productsValidating,
  } = useSWR<{ content: { id: number }[] }>("/products?size=1000", axiosFetcher);

  // Fetch daily revenue for the combo chart (default view)
  const { data: chartRevenueData, isLoading: chartLoading } = useSWR<RevenueItem[]>(
    "/revenue/stats?type=day",
    axiosFetcher,
  );

  // Tính toán stats từ raw data
  const stats: DashboardStats = (() => {
    if (!ordersData || !productsData) {
      return { revenue: 0, orders: 0, products: 0 };
    }

    const paidOrders = ordersData.filter((o) => o.status === "PAID");
    const totalRev = paidOrders.reduce((sum, o) => sum + o.totalAmount, 0);

    return {
      revenue: totalRev,
      orders: ordersData.length,
      products: productsData.content?.length || 0,
    };
  })();

  return {
    stats,
    chartRevenueData: chartRevenueData || [],
    isLoading: ordersLoading || productsLoading || chartLoading,
    isValidating: ordersValidating || productsValidating,
  };
}
