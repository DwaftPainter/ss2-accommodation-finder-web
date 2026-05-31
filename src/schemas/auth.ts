import { z } from "zod";

export const loginSchema = z.object({
    email: z
        .string()
        .min(1, "Vui lòng nhập email.")
        .email("Vui lòng nhập email hợp lệ."),
    password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự."),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z
    .object({
        name: z.string().min(1, "Vui lòng nhập họ và tên."),
        email: z
            .string()
            .min(1, "Vui lòng nhập email.")
            .email("Vui lòng nhập email hợp lệ."),
        password: z
            .string()
            .min(6, "Mật khẩu phải có ít nhất 6 ký tự."),
        confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu."),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Mật khẩu xác nhận không khớp.",
        path: ["confirmPassword"],
    });

export type RegisterFormData = z.infer<typeof registerSchema>;

export const otpSchema = z.object({
    otp: z
        .string()
        .length(6, "Mã OTP phải gồm 6 chữ số.")
        .regex(/^\d{6}$/, "Mã OTP chỉ được chứa chữ số."),
});

export type OtpFormData = z.infer<typeof otpSchema>;
