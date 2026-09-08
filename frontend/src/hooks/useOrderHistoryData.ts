"use client";

import useSWR from "swr";
import { axiosFetcher } from "@/lib/swr";

interface CafeTable {
  id: number;
  name: string;
  status: string;
}

interface Account {
  id: number;
  username: string;
  role: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
}

interface OrderDetailItem {
  id: number;
  product: Product;
  quantity: number;
  price: number;
}

interface OrderItem {
  id: number;
  cafeTable: CafeTable | null;
  account: Account | null;
  orderDetails: OrderDetailItem[];
  totalAmount: number;
  status: string;
  createdAt: string;
}

/**
 * Custom hook quản lý dữ liệu Order History với SWR caching.
 *
 * - Fetch đồng thời orders và tables
 * - Dữ liệu cache hiển thị ngay khi quay lại trang
 * - Trả về `mutate` để refresh sau khi CRUD
 */
export function useOrderHistoryData() {
  const {
    data: ordersData,
    isLoading: ordersLoading,
    isValidating: ordersValidating,
    mutate: mutateOrders,
  } = useSWR<OrderItem[]>("/orders", axiosFetcher);

  const {
    data: tablesData,
    isLoading: tablesLoading,
    isValidating: tablesValidating,
    mutate: mutateTables,
  } = useSWR<CafeTable[]>("/tables", axiosFetcher);

  return {
    orders: ordersData || [],
    tables: tablesData || [],
    isLoading: ordersLoading || tablesLoading,
    isValidating: ordersValidating || tablesValidating,
    // Refresh chỉ orders (nhanh) — dùng cho xóa/sửa đơn hàng
    mutateOrders,
    // Refresh cả orders + tables — dùng khi cần
    mutate: async () => {
      await Promise.all([mutateOrders(), mutateTables()]);
    },
  };
}

export type { Account, CafeTable, OrderDetailItem, OrderItem, Product };
