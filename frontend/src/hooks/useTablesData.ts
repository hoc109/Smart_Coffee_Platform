"use client";

import useSWR from "swr";
import { axiosFetcher } from "@/lib/swr";

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

/**
 * Custom hook quản lý dữ liệu Sơ đồ bàn với SWR caching.
 *
 * - Dữ liệu cache hiển thị ngay khi quay lại trang
 * - Trả về mutate để refresh sau khi thao tác (checkout, thêm bàn)
 */
export function useTablesData() {
  const {
    data: tablesData,
    isLoading: tablesLoading,
    isValidating: tablesValidating,
    mutate: mutateTables,
  } = useSWR<Table[]>("/tables", axiosFetcher);

  const {
    data: ordersData,
    isLoading: ordersLoading,
    isValidating: ordersValidating,
    mutate: mutateOrders,
  } = useSWR<Order[]>("/orders", axiosFetcher);

  // Lọc orders PENDING
  const pendingOrders = (ordersData || []).filter((o) => o.status === "PENDING");

  return {
    tables: tablesData || [],
    orders: pendingOrders,
    isLoading: tablesLoading || ordersLoading,
    isValidating: tablesValidating || ordersValidating,
    // Refresh chỉ tables (nhanh) — dùng cho thêm bàn, làm mới
    mutateTables,
    // Refresh cả tables + orders — dùng cho checkout (thay đổi cả hai)
    mutate: async () => {
      await Promise.all([mutateTables(), mutateOrders()]);
    },
  };
}

export type { Order, Table };
