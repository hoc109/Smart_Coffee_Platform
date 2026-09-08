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
 * Custom hook quản lý dữ liệu Staff Orders với SWR caching.
 *
 * - Dữ liệu cache hiển thị ngay khi quay lại trang
 * - Chỉ đọc (read-only), không cần mutate
 */
export function useStaffOrdersData() {
  const {
    data: ordersData,
    isLoading,
    isValidating,
  } = useSWR<OrderItem[]>("/orders", axiosFetcher);

  return {
    orders: ordersData || [],
    isLoading,
    isValidating,
  };
}

export type { OrderItem };
