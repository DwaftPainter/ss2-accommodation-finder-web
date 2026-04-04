"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { User, Mail, Lock, Eye, EyeOff, ArrowLeft, Chrome, AlertCircle } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { registerSchema, type RegisterFormData } from "@/schemas";
import { AUTH_MESSAGES, getErrorMessage } from "@/config/messages";
import { inputClass, gradientButtonStyle, dividerLineStyle, outlinedButtonStyle } from "./constants";
import type { RegisterViewProps } from "./types";

export default function RegisterView({ onSwitchToLogin, onRegisterSuccess }: RegisterViewProps) {
    const { register: registerUser } = useAuth();

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const form = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
        mode: "onChange",
        defaultValues: {
            name: "",
            email: "",
            password: "",
            confirmPassword: ""
        }
    });

    const handleGoogleLogin = async () => {
        console.log("hello");
    };

    const onSubmit = async (data: RegisterFormData) => {
        try {
            setError(null);
            await registerUser(data);
            onRegisterSuccess(data.email);
        } catch (err) {
            const errorMessage = getErrorMessage(err, AUTH_MESSAGES.REGISTER_GENERIC_ERROR);
            setError(errorMessage);
        }
    };

    return (
        <>
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <button
                    onClick={onSwitchToLogin}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-all"
                >
                    <ArrowLeft size={18} />
                </button>
                <div>
                    <h2 className="text-xl font-bold text-white">Tạo tài khoản</h2>
                    <p className="text-xs text-slate-500">Điền thông tin để đăng ký tài khoản mới</p>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3.5">
                {/* Name */}
                <div>
                    <div className="relative">
                        <User
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
                            size={15}
                        />
                        <input
                            type="text"
                            placeholder="Họ và tên"
                            autoComplete="name"
                            className={`${inputClass} pl-10`}
                            {...form.register("name")}
                        />
                    </div>
                    {form.formState.errors.name && (
                        <p className="text-xs text-red-400 pl-1 mt-1">{form.formState.errors.name.message}</p>
                    )}
                </div>

                {/* Email */}
                <div>
                    <div className="relative">
                        <Mail
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
                            size={15}
                        />
                        <input
                            type="email"
                            placeholder="Email"
                            autoComplete="email"
                            className={`${inputClass} pl-10`}
                            {...form.register("email")}
                        />
                    </div>
                    {form.formState.errors.email && (
                        <p className="text-xs text-red-400 pl-1 mt-1">
                            {form.formState.errors.email.message}
                        </p>
                    )}
                </div>

                {/* Password */}
                <div>
                    <div className="relative">
                        <Lock
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
                            size={15}
                        />
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Mật khẩu"
                            autoComplete="new-password"
                            className={`${inputClass} pl-10 pr-10`}
                            {...form.register("password")}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword((p) => !p)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                        >
                            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                    </div>
                    {form.formState.errors.password && (
                        <p className="text-xs text-red-400 pl-1 mt-1">
                            {form.formState.errors.password.message}
                        </p>
                    )}
                </div>

                {/* Confirm Password */}
                <div>
                    <div className="relative">
                        <Lock
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
                            size={15}
                        />
                        <input
                            type={showConfirm ? "text" : "password"}
                            placeholder="Xác nhận mật khẩu"
                            autoComplete="new-password"
                            className={`${inputClass} pl-10 pr-10`}
                            {...form.register("confirmPassword")}
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirm((p) => !p)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                        >
                            {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                    </div>
                    {form.formState.errors.confirmPassword && (
                        <p className="text-xs text-red-400 pl-1 mt-1">
                            {form.formState.errors.confirmPassword.message}
                        </p>
                    )}
                </div>

                {/* Global Error */}
                {error && (
                    <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
                        <AlertCircle size={16} className="shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {/* Submit */}
                <button
                    type="submit"
                    disabled={!form.formState.isValid || form.formState.isSubmitting}
                    className="w-full flex items-center justify-center gap-2 py-3.5 px-5 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-40 disabled:pointer-events-none"
                    style={gradientButtonStyle}
                >
                    {form.formState.isSubmitting ? "Đang xử lý..." : "Đăng ký"}
                </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px" style={dividerLineStyle} />
                <span className="text-xs text-slate-600">hoặc</span>
                <div className="flex-1 h-px" style={dividerLineStyle} />
            </div>

            {/* Google */}
            <button
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-3 py-3 px-5 rounded-xl text-sm font-medium text-slate-300 transition-all hover:text-white hover:bg-white/[0.04]"
                style={outlinedButtonStyle}
            >
                <Chrome size={16} />
                Đăng ký với Google
            </button>

            {/* Switch */}
            <p className="text-center text-sm text-slate-500 mt-5">
                Đã có tài khoản?{" "}
                <button
                    onClick={onSwitchToLogin}
                    className="text-indigo-400 font-semibold hover:text-indigo-300"
                >
                    Đăng nhập
                </button>
            </p>
        </>
    );
}
