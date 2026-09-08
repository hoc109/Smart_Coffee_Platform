"use client";

import useSWR from "swr";
import { axiosFetcher } from "@/lib/swr";

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

interface Table {
  id: number;
  name: string;
  status: string;
}

/**
 * Custom hook quản lý dữ liệu trang Đặt hàng với SWR caching.
 *
 * - Dữ liệu products/categories/tables cache ngay khi quay lại trang
 * - Trả về `mutateTables` để refresh danh sách bàn trống sau khi đặt hàng
 */
export function useOrdersPageData() {
  const {
    data: productsData,
    isLoading: productsLoading,
    isValidating: productsValidating,
  } = useSWR<{ content: Product[] }>("/products?size=1000", axiosFetcher);

  const {
    data: categoriesData,
    isLoading: categoriesLoading,
    isValidating: categoriesValidating,
  } = useSWR<Category[]>("/categories", axiosFetcher);

  const {
    data: tablesData,
    isLoading: tablesLoading,
    isValidating: tablesValidating,
    mutate: mutateTables,
  } = useSWR<Table[]>("/tables", axiosFetcher);

  // Chỉ lấy bàn trống
  const availableTables = (tablesData || []).filter((t) => t.status === "AVAILABLE");

  return {
    products: productsData?.content || [],
    categories: categoriesData || [],
    tables: availableTables,
    isLoading: productsLoading || categoriesLoading || tablesLoading,
    isValidating: productsValidating || categoriesValidating || tablesValidating,
    mutateTables,
  };
}

export type { Category, Product, Table };
