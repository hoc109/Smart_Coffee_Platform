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

/**
 * Custom hook quản lý dữ liệu Products với SWR caching.
 *
 * - SWR key phụ thuộc vào `search` → tự động refetch khi search thay đổi
 * - `keepPreviousData: true` (global) giữ dữ liệu cũ khi đổi search term
 * - Trả về `mutate` để gọi sau khi CRUD thành công
 */
export function useProductsData() {
  const {
    data: productsData,
    isLoading: productsLoading,
    isValidating: productsValidating,
    mutate: mutateProducts,
  } = useSWR<{ content: Product[] }>("/products?size=1000", axiosFetcher);

  const {
    data: categoriesData,
    isLoading: categoriesLoading,
    isValidating: categoriesValidating,
    mutate: mutateCategories,
  } = useSWR<Category[]>("/categories", axiosFetcher);

  return {
    products: productsData?.content || [],
    categories: categoriesData || [],
    isLoading: productsLoading || categoriesLoading,
    isValidating: productsValidating || categoriesValidating,
    // Refresh chỉ products (nhanh) — dùng cho thêm/sửa/xóa sản phẩm
    mutateProducts,
    // Refresh cả products + categories
    mutate: async () => {
      await Promise.all([mutateProducts(), mutateCategories()]);
    },
  };
}
