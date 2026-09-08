"use client";

import { Loader2 } from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";

interface GoogleSignInButtonProps {
  onSuccess: (idToken: string) => Promise<void> | void;
  onError?: (errorMessage: string) => void;
  disabled?: boolean;
}

// Khai báo global interface cho Google Identity Services SDK
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
          }) => void;
          prompt: (notification?: (notification: unknown) => void) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              theme?: "outline" | "filled_blue" | "filled_black";
              size?: "large" | "medium" | "small";
              text?: "signin_with" | "signup_with" | "continue_with" | "signin";
              shape?: "rectangular" | "pill" | "circle" | "square";
              logo_alignment?: "left" | "center";
              width?: string | number;
              locale?: string;
            },
          ) => void;
        };
      };
    };
  }
}

export default function GoogleSignInButton({
  onSuccess,
  onError,
  disabled = false,
}: GoogleSignInButtonProps) {
  const [loading, setLoading] = useState(false);
  const [sdkReady, setSdkReady] = useState(false);
  const [showDemoPrompt, setShowDemoPrompt] = useState(false);
  const [demoEmail, setDemoEmail] = useState("google.staff@coffeechill.com");
  const hiddenBtnRef = useRef<HTMLDivElement>(null);

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";
  const isRealClientIdConfigured =
    clientId.trim() !== "" && !clientId.includes("YOUR_GOOGLE_CLIENT_ID");

  const handleCredentialResponse = useCallback(
    async (response: { credential: string }) => {
      if (!response.credential) {
        onError?.("Không nhận được mã xác thực từ Google");
        return;
      }
      try {
        setLoading(true);
        await onSuccess(response.credential);
      } catch {
        onError?.("Đăng nhập bằng Google thất bại. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    },
    [onError, onSuccess],
  );

  useEffect(() => {
    if (!isRealClientIdConfigured) {
      return;
    }

    // Tải Google Identity Services SDK
    const loadGsiScript = () => {
      if (window.google?.accounts?.id) {
        initGsi();
        return;
      }

      const existingScript = document.getElementById("google-gsi-script");
      if (!existingScript) {
        const script = document.createElement("script");
        script.id = "google-gsi-script";
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.onload = () => initGsi();
        script.onerror = () => {
          console.warn("[GoogleAuth] Không thể tải Google Identity Services SDK");
        };
        document.body.appendChild(script);
      } else {
        existingScript.addEventListener("load", initGsi);
      }
    };

    const initGsi = () => {
      if (!window.google?.accounts?.id) return;

      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleCredentialResponse,
        });
        setSdkReady(true);

        // Render hidden official button để trigger qua click nếu prompt() bị block
        if (hiddenBtnRef.current) {
          window.google.accounts.id.renderButton(hiddenBtnRef.current, {
            theme: "outline",
            size: "large",
            width: 280,
          });
        }
      } catch (err) {
        console.error("[GoogleAuth] Init error:", err);
      }
    };

    loadGsiScript();
  }, [clientId, isRealClientIdConfigured, handleCredentialResponse]);

  const handleClick = () => {
    if (disabled || loading) return;

    if (!isRealClientIdConfigured) {
      // Mở modal demo nếu chưa cấu hình Client ID thật
      setShowDemoPrompt(true);
      return;
    }

    if (sdkReady && window.google?.accounts?.id) {
      setLoading(true);
      // Kích hoạt Google One-Tap hoặc click vào nút ẩn
      const hiddenBtn = hiddenBtnRef.current?.querySelector(
        'div[role="button"]',
      ) as HTMLElement | null;

      if (hiddenBtn) {
        hiddenBtn.click();
        setLoading(false);
      } else {
        window.google.accounts.id.prompt(() => {
          setLoading(false);
        });
      }
    } else {
      setShowDemoPrompt(true);
    }
  };

  const handleDemoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!demoEmail.trim()) return;
    setShowDemoPrompt(false);
    setLoading(true);
    try {
      // Gửi token giả lập định dạng demo
      const mockToken = `demo-google-token-${demoEmail.trim()}`;
      await onSuccess(mockToken);
    } catch {
      onError?.("Đăng nhập demo thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Nút ẩn của Google để trigger click native */}
      <div ref={hiddenBtnRef} className="hidden" aria-hidden="true" />

      {/* Nút hiển thị Glassmorphism theo theme Coffee Chill */}
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled || loading}
        className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 hover:border-white/30 text-white font-medium shadow-md hover:shadow-lg transition-all duration-200 group active:scale-[0.99] disabled:opacity-60 disabled:pointer-events-none cursor-pointer"
      >
        {loading ? (
          <Loader2 className="animate-spin text-amber-400" size={20} />
        ) : (
          <svg
            className="w-5 h-5 transition-transform duration-200 group-hover:scale-110"
            viewBox="0 0 24 24"
          >
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
        )}
        <span className="text-sm font-semibold text-slate-200 group-hover:text-white">
          {loading ? "Đang xử lý..." : "Đăng nhập bằng Google"}
        </span>
      </button>

      {/* Modal Demo Google Login (khi chưa cấu hình Google Cloud Client ID) */}
      {showDemoPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-slate-900 border border-amber-500/30 p-6 rounded-2xl shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-amber-400">
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <h3 className="font-bold text-white text-base">Google Sign-In Preview</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {!isRealClientIdConfigured ? (
                <>
                  Chưa tìm thấy{" "}
                  <code className="text-amber-300 font-mono">NEXT_PUBLIC_GOOGLE_CLIENT_ID</code>{" "}
                  trong file <code className="text-amber-300 font-mono">.env.local</code>. Bạn có
                  thể nhập email Google để test trực tiếp luồng đăng nhập ngay:
                </>
              ) : (
                "Đang kết nối tới Google Identity Services..."
              )}
            </p>
            <form onSubmit={handleDemoSubmit} className="space-y-3">
              <input
                type="email"
                required
                value={demoEmail}
                onChange={(e) => setDemoEmail(e.target.value)}
                placeholder="Nhập email Google test..."
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <div className="flex gap-2 justify-end pt-1">
                <button
                  type="button"
                  onClick={() => setShowDemoPrompt(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-900 transition-colors"
                >
                  Xác nhận Test
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
