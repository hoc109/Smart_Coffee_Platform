import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Hàm tiện ích kết hợp class names với Tailwind Merge và Clsx
 * Chuẩn mực của Shadcn/ui
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
