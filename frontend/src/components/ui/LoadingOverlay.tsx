"use client";

import { CheckCircle, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Hook thống nhất quản lý overlay + toast cho mọi trang.
 *
 * Flow:
 * - Lần đầu vào trang     → isLoading=true → Spinner toàn trang
 * - Quay lại trang         → Cache hiện ngay, kèm SyncingIndicator (nhỏ gọn ở góc)
 * - SWR revalidate ngầm:
 *   + Data GIỐNG           → Ẩn SyncingIndicator, không hiện gì thêm
 *   + Data KHÁC            → Cập nhật UI ngay lập tức + Hiện Toast
 * - CRUD (thêm/sửa/xóa)   → Overlay ngay → API + mutate → Toast
 */
export function useSmartOverlay<T>(data: T | undefined, isValidating: boolean, isLoading: boolean) {
  const [isMutating, setIsMutating] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // So sánh data
  const previousDataRef = useRef<string>("");
  const wasValidatingRef = useRef(false);

  // === CRUD: startMutation / endMutation ===

  const startMutation = useCallback(() => {
    setIsMutating(true);
    setShowToast(false);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
  }, []);

  const endMutation = useCallback(
    (skipToast = false) => {
      setIsMutating(false);
      if (data !== undefined) {
        previousDataRef.current = JSON.stringify(data);
      }
      if (!skipToast) {
        setShowToast(true);
        if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
        toastTimerRef.current = setTimeout(() => setShowToast(false), 2500);
      }
    },
    [data],
  );

  // === Background: So sánh data SAU KHI fetch xong ===

  useEffect(() => {
    // isValidating: true → false = fetch vừa xong
    if (wasValidatingRef.current && !isValidating && !isLoading && !isMutating) {
      const newDataStr = JSON.stringify(data);
      const oldDataStr = previousDataRef.current;

      if (oldDataStr === "") {
        // Lần đầu load → lưu snapshot, không hiện gì
        previousDataRef.current = newDataStr;
      } else if (newDataStr !== oldDataStr) {
        // Data KHÁC → Cập nhật UI ngay + Hiện toast
        previousDataRef.current = newDataStr;
        setShowToast(true);
        if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
        toastTimerRef.current = setTimeout(() => setShowToast(false), 2500);
      }
      // Data GIỐNG → im lặng hoàn toàn ✅
    }

    wasValidatingRef.current = isValidating;
  }, [data, isValidating, isLoading, isMutating]);

  // Lưu snapshot lần đầu
  useEffect(() => {
    if (data !== undefined && previousDataRef.current === "") {
      previousDataRef.current = JSON.stringify(data);
    }
  }, [data]);

  // Overlay hiện khi: CRUD đang chạy (startMutation → endMutation)
  const showOverlay = isMutating;
  // Indicator nhỏ góc phải hiện khi SWR đang check ngầm
  const isSyncing = isValidating && !isLoading && !isMutating;

  return {
    showOverlay, // Overlay "Đang cập nhật..." (chặn màn hình)
    showToast, // Toast "Cập nhật thành công" (chỉ khi data thay đổi)
    isSyncing, // Icon xoay góc phải (không chặn thao tác)
    startMutation,
    endMutation,
  };
}

/**
 * Overlay "Đang cập nhật..." — CHỈ hiện khi user thao tác CRUD.
 * KHÔNG hiện khi chuyển trang quay lại (background revalidation).
 */
export function MutatingOverlay({ show }: { show: boolean }) {
  if (!show) return null;

  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center backdrop-blur-[1px] bg-white/60 rounded-xl transition-opacity duration-300">
      <div className="flex flex-col items-center gap-3">
        <div className="w-9 h-9 border-[3px] border-amber-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-medium text-slate-500 tracking-wide">Đang cập nhật...</span>
      </div>
    </div>
  );
}

/**
 * Toast thông báo "Dữ liệu đã được cập nhật"
 * Hiện sau khi:
 * - CRUD hoàn thành (overlay ẩn → toast hiện)
 * - Background revalidation phát hiện data thay đổi
 */
export function DataUpdatedToast({ show, message }: { show: boolean; message?: string }) {
  if (!show) return null;

  return (
    <div className="fixed top-24 right-8 z-50 animate-slide-in">
      <div className="flex items-center gap-2.5 bg-emerald-50 border border-emerald-200 shadow-lg shadow-emerald-500/10 rounded-xl px-4 py-3">
        <CheckCircle size={18} className="text-emerald-500 shrink-0" />
        <span className="text-sm font-medium text-emerald-700">
          {message || "Cập nhật dữ liệu thành công ✓"}
        </span>
      </div>
    </div>
  );
}

/**
 * Indicator nhỏ gọn góc trên bên phải báo hiệu đang đồng bộ dữ liệu ngầm
 */
export function SyncingIndicator({ show }: { show: boolean }) {
  if (!show) return null;

  return (
    <div className="fixed top-24 right-8 z-40 animate-in fade-in slide-in-from-top-2 duration-300 pointer-events-none">
      <div className="flex items-center gap-2 bg-white/90 backdrop-blur-md border border-slate-200 shadow-lg shadow-slate-200/50 rounded-full px-4 py-2">
        <RefreshCw size={14} className="text-amber-500 animate-spin" />
        <span className="text-xs font-bold text-slate-600">Đang đồng bộ...</span>
      </div>
    </div>
  );
}
