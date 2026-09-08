"use client";

import useSWR from "swr";
import { axiosFetcher } from "@/lib/swr";

interface Account {
  id: number;
  username: string;
  role: string;
}

/**
 * Custom hook quản lý dữ liệu Accounts với SWR caching.
 *
 * - Dữ liệu cache hiển thị ngay khi quay lại trang
 * - SWR tự động revalidate ngầm
 * - Trả về `mutate` để refresh sau khi CRUD
 */
export function useAccountsData() {
  const {
    data: accountsData,
    isLoading,
    isValidating,
    mutate,
  } = useSWR<Account[]>("/accounts", axiosFetcher);

  return {
    accounts: accountsData || [],
    isLoading,
    isValidating,
    mutate,
  };
}

export type { Account };
