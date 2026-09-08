"use client";

import { AlertTriangle, HelpCircle, Trash2, Wallet } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: React.ReactNode;
  onConfirm: () => void;
  onClose: () => void;
  type?: "danger" | "warning" | "success" | "info";
  confirmText?: string;
  cancelText?: string;
}

export function ConfirmModal({
  isOpen,
  title,
  message,
  onConfirm,
  onClose,
  type = "warning",
  confirmText = "Xác nhận",
  cancelText = "Hủy bỏ",
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case "danger":
        return <Trash2 size={28} className="text-red-600 animate-pulse" />;
      case "warning":
        return <AlertTriangle size={28} className="text-amber-600 animate-bounce" />;
      case "success":
        return <Wallet size={28} className="text-emerald-600 animate-pulse" />;
      default:
        return <HelpCircle size={28} className="text-blue-600" />;
    }
  };

  const getIconBg = () => {
    switch (type) {
      case "danger":
        return "bg-red-50 border border-red-100";
      case "warning":
        return "bg-amber-50 border border-amber-100";
      case "success":
        return "bg-emerald-50 border border-emerald-100";
      default:
        return "bg-blue-50 border border-blue-100";
    }
  };

  const getConfirmBtnClass = () => {
    switch (type) {
      case "danger":
        return "bg-red-500 hover:bg-red-600 text-white shadow-md shadow-red-500/20";
      case "warning":
        return "bg-amber-500 hover:bg-amber-600 text-slate-900 shadow-md shadow-amber-500/20";
      case "success":
        return "bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/20";
      default:
        return "bg-blue-500 hover:bg-blue-600 text-white shadow-md shadow-blue-500/20";
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 text-center space-y-4">
          <div
            className={`w-14 h-14 ${getIconBg()} rounded-full flex items-center justify-center mx-auto mb-4`}
          >
            {getIcon()}
          </div>
          <h3 className="text-lg font-bold text-slate-800">{title}</h3>
          <div className="text-slate-500 text-sm font-medium leading-relaxed">{message}</div>
          <div className="flex gap-3 mt-6">
            <button
              onClick={onClose}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-3 rounded-xl transition-colors cursor-pointer"
            >
              {cancelText}
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`flex-1 font-bold py-3 rounded-xl transition-all cursor-pointer ${getConfirmBtnClass()}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
