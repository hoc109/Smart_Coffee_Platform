"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Coffee, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ApiError, apiClient } from "@/lib/api-client";
import {
  type LoginFormValues,
  loginSchema,
  type RegisterFormValues,
  registerSchema,
} from "@/schemas/auth.schema";
import { useAuthStore } from "@/stores/useAuthStore";

interface AuthResponse {
  token: string;
  username: string;
  role: string;
}

export default function LoginPage() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [serverError, setServerError] = useState("");
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  // Form đăng nhập với Zod & React Hook Form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Form đăng ký với Zod & React Hook Form
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Mutation Đăng nhập qua TanStack Query & Native apiClient
  const loginMutation = useMutation({
    mutationFn: (data: LoginFormValues) => apiClient.post<AuthResponse>("/auth/login", data),
    onSuccess: (res) => {
      setAuth({
        username: res.username,
        role: res.role,
        token: res.token,
      });
      if (res.role === "STAFF") {
        router.push("/orders");
      } else {
        router.push("/dashboard");
      }
    },
    onError: (err) => {
      if (err instanceof ApiError) {
        setServerError(err.message || "Tài khoản hoặc mật khẩu không chính xác");
      } else {
        setServerError("Đăng nhập thất bại. Vui lòng thử lại sau.");
      }
    },
  });

  // Mutation Đăng ký qua TanStack Query & Native apiClient
  const registerMutation = useMutation({
    mutationFn: (data: RegisterFormValues) =>
      apiClient.post<{ message: string }>("/auth/register", {
        username: data.username,
        password: data.password,
      }),
    onSuccess: () => {
      setIsRegistering(false);
      registerForm.reset();
      alert("Đăng ký thành công! Vui lòng đăng nhập.");
    },
    onError: (err) => {
      if (err instanceof ApiError) {
        setServerError(err.message || "Đăng ký thất bại. Tên đăng nhập có thể đã tồn tại.");
      } else {
        setServerError("Đăng ký thất bại. Vui lòng thử lại.");
      }
    },
  });

  // Mutation Đăng nhập bằng Google
  const googleMutation = useMutation({
    mutationFn: (idToken: string) => apiClient.post<AuthResponse>("/auth/google", { idToken }),
    onSuccess: (res) => {
      setAuth({
        username: res.username,
        role: res.role,
        token: res.token,
      });
      if (res.role === "STAFF") {
        router.push("/orders");
      } else {
        router.push("/dashboard");
      }
    },
    onError: (err) => {
      if (err instanceof ApiError) {
        setServerError(err.message || "Đăng nhập bằng Google thất bại");
      } else {
        setServerError("Đăng nhập bằng Google thất bại. Vui lòng thử lại.");
      }
    },
  });

  const isLoading =
    loginMutation.isPending || registerMutation.isPending || googleMutation.isPending;

  const onLoginSubmit = (values: LoginFormValues) => {
    setServerError("");
    loginMutation.mutate(values);
  };

  const onRegisterSubmit = (values: RegisterFormValues) => {
    setServerError("");
    registerMutation.mutate(values);
  };

  const handleGoogleSuccess = async (idToken: string) => {
    setServerError("");
    googleMutation.mutate(idToken);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Glow Lights */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-amber-500/10 blur-[120px]" />
        <div className="absolute top-[60%] right-[0%] w-[40%] h-[40%] rounded-full bg-blue-500/10 blur-[120px]" />
      </div>

      <Card className="w-full max-w-md relative z-10 border-white/20 bg-white/10 backdrop-blur-xl">
        <CardHeader className="flex flex-col items-center mb-2 text-center pb-4">
          <div className="bg-amber-500 p-3 rounded-2xl text-slate-900 shadow-lg shadow-amber-500/30 mb-3">
            <Coffee size={32} />
          </div>
          <CardTitle className="text-3xl font-bold text-white tracking-wide">
            Coffee Chill
          </CardTitle>
          <CardDescription className="text-slate-400 mt-1 text-sm">
            Hệ thống quản lý thông minh
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Server Error Alert */}
          {serverError && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-xl text-sm text-center animate-in fade-in">
              {serverError}
            </div>
          )}

          {/* Tab Switcher */}
          <div className="flex gap-4 border-b border-white/10 pb-2">
            <button
              type="button"
              className={`flex-1 font-bold py-2 transition-colors cursor-pointer ${
                !isRegistering
                  ? "text-amber-500 border-b-2 border-amber-500"
                  : "text-slate-400 hover:text-white"
              }`}
              onClick={() => {
                setIsRegistering(false);
                setServerError("");
              }}
            >
              Đăng Nhập
            </button>
            <button
              type="button"
              className={`flex-1 font-bold py-2 transition-colors cursor-pointer ${
                isRegistering
                  ? "text-amber-500 border-b-2 border-amber-500"
                  : "text-slate-400 hover:text-white"
              }`}
              onClick={() => {
                setIsRegistering(true);
                setServerError("");
              }}
            >
              Đăng Ký
            </button>
          </div>

          {/* Form Content */}
          {!isRegistering ? (
            <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5 ml-1">
                  Tên đăng nhập
                </label>
                <Input
                  placeholder="Nhập tên đăng nhập"
                  {...loginForm.register("username")}
                  error={loginForm.formState.errors.username?.message}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5 ml-1">
                  Mật khẩu
                </label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  {...loginForm.register("password")}
                  error={loginForm.formState.errors.password?.message}
                />
              </div>

              <Button type="submit" disabled={isLoading} className="w-full mt-2" size="lg">
                {isLoading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  "Đăng nhập vào hệ thống"
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5 ml-1">
                  Tên đăng nhập
                </label>
                <Input
                  placeholder="Nhập tên đăng nhập mới"
                  {...registerForm.register("username")}
                  error={registerForm.formState.errors.username?.message}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5 ml-1">
                  Mật khẩu
                </label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  {...registerForm.register("password")}
                  error={registerForm.formState.errors.password?.message}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5 ml-1">
                  Xác nhận mật khẩu
                </label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  {...registerForm.register("confirmPassword")}
                  error={registerForm.formState.errors.confirmPassword?.message}
                />
              </div>

              <Button type="submit" disabled={isLoading} className="w-full mt-2" size="lg">
                {isLoading ? <Loader2 className="animate-spin" size={20} /> : "Đăng ký tài khoản"}
              </Button>
            </form>
          )}

          {/* Divider */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-slate-800/90 px-3 py-0.5 text-slate-400 font-medium rounded-full border border-white/5">
                Hoặc tiếp tục với
              </span>
            </div>
          </div>

          {/* Google Sign-In Button */}
          <GoogleSignInButton
            onSuccess={handleGoogleSuccess}
            onError={(msg) => setServerError(msg)}
            disabled={isLoading}
          />
        </CardContent>
      </Card>
    </div>
  );
}
