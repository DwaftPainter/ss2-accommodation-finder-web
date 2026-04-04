import { z } from "zod";

export const loginSchema = z.object({
    email: z
        .string()
        .min(1, "Email is required")
        .email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z
    .object({
        name: z.string().min(1, "Full name is required"),
        email: z
            .string()
            .min(1, "Email is required")
            .email("Invalid email format"),
        password: z
            .string()
            .min(6, "Password must be at least 6 characters"),
        confirmPassword: z.string().min(1, "Please confirm your password"),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

export type RegisterFormData = z.infer<typeof registerSchema>;

export const otpSchema = z.object({
    otp: z
        .string()
        .length(6, "OTP must be 6 digits")
        .regex(/^\d{6}$/, "OTP must contain only digits"),
});

export type OtpFormData = z.infer<typeof otpSchema>;
