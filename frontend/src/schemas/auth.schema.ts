import { z } from "zod";

/**
 * Schema Zod xác thực form Đăng nhập
 */
export const loginSchema = z.object({
  username: z
    .string()
    .min(1, "Tên đăng nhập không được để trống")
    .max(50, "Tên đăng nhập không quá 50 ký tự"),
  password: z
    .string()
    .min(1, "Mật khẩu không được để trống")
    .min(4, "Mật khẩu phải có ít nhất 4 ký tự"),
});

/**
 * Schema Zod xác thực form Đăng ký
 */
export const registerSchema = z
  .object({
    username: z
      .string()
      .min(1, "Tên đăng nhập không được để trống")
      .min(3, "Tên đăng nhập phải có ít nhất 3 ký tự")
      .max(50, "Tên đăng nhập không quá 50 ký tự"),
    password: z
      .string()
      .min(1, "Mật khẩu không được để trống")
      .min(6, "Mật khẩu đăng ký phải có ít nhất 6 ký tự"),
    confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
