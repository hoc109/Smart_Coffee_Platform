"use client";

import React from "react";
import { SWRConfig } from "swr";
import axiosInstance from "./axios";

// Axios-based fetcher cho SWR
export const axiosFetcher = async (url: string) => {
  const res = await axiosInstance.get(url);
  return res.data;
};

// SWR Provider component bọc toàn bộ app
// Cấu hình global cho cơ chế Stale-While-Revalidate
export function SWRProvider({ children }: { children: React.ReactNode }) {
  return React.createElement(
    SWRConfig,
    {
      value: {
        fetcher: axiosFetcher,
        revalidateOnFocus: false, // TẮT revalidate khi focus lại tab → không load thừa
        revalidateOnReconnect: true, // Revalidate khi mạng reconnect
        revalidateOnMount: true, // Chỉ fetch lần đầu mount, sau đó dùng cache
        dedupingInterval: 10000, // Tránh gọi API trùng lặp trong 10s (tăng từ 2s)
        errorRetryCount: 0, // Không retry khi lỗi
        errorRetryInterval: 5000, // Thời gian chờ retry
        keepPreviousData: true, // Giữ data cũ khi key thay đổi (search)
      },
    },
    children,
  );
}
