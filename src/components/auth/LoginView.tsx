import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Lock, Eye, EyeOff, Home, Chrome, AlertCircle } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { loginSchema, type LoginFormData } from "@/schemas";
import { AUTH_MESSAGES, getErrorMessage } from "@/config/messages";
import {
    inputClass,
    inputStyle,
    inputFocusStyle,
    gradientButtonStyle,
    dividerLineStyle,
    outlinedButtonStyle,
} from "./constants";
import type { LoginViewProps, FocusHandlers } from "./types";

export default function LoginView({ onClose, onSwitchToRegister }: LoginViewProps) {
    const { login, loginWithGoogle } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const form = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: "", password: "" },
    });

    const focusHandlers: FocusHandlers = {
        onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
            Object.assign(e.currentTarget.style, inputFocusStyle);
        },
        onBlur: (e: React.FocusEvent<HTMLInputElement>) => {
            e.currentTarget.style.border = inputStyle.border;
            e.currentTarget.style.background = inputStyle.background;
            e.currentTarget.style.boxShadow = "none";
        },
    };

    const handleGoogleLogin = () => {
        loginWithGoogle();
    };

    const onSubmit = async (data: LoginFormData) => {
        setError(null);
        try {
            await login(data);
            onClose();
        } catch (err) {
            const errorMessage = getErrorMessage(err, AUTH_MESSAGES.LOGIN_GENERIC_ERROR);
            setError(errorMessage);
        }
    };

    return (
        <>
            {/* Logo & Title */}
            <div className="flex flex-col items-center text-center mb-6">
                <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                    style={{
                        background: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
                        boxShadow: "0 12px 30px rgba(99,102,241,0.4)",
                    }}
                >
                    <Home size={30} className="text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">
                    Chào mừng trở lại!
                </h2>
                <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
                    Đăng nhập để trải nghiệm đầy đủ tính năng của{" "}
                    <span className="text-indigo-400 font-semibold">AccomFinder</span>
                </p>
            </div>

            {/* Login Form */}
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-3.5 mb-4"
            >
                {/* Email */}
                <div className="relative">
                    <Mail
                        size={15}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
                    />
                    <input
                        type="email"
                        id="login-email"
                        placeholder="Email"
                        className={inputClass}
                        style={inputStyle}
                        {...form.register("email")}
                        {...focusHandlers}
                    />
                </div>
                {form.formState.errors.email && (
                    <p className="text-xs text-red-400 pl-1">
                        {form.formState.errors.email.message}
                    </p>
                )}

                {/* Password */}
                <div className="relative">
                    <Lock
                        size={15}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
                    />
                    <input
                        type={showPassword ? "text" : "password"}
                        id="login-password"
                        placeholder="Mật khẩu"
                        className={`${inputClass} pr-10`}
                        style={inputStyle}
                        {...form.register("password")}
                        {...focusHandlers}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword((p) => !p)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                    >
                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                </div>
                {form.formState.errors.password && (
                    <p className="text-xs text-red-400 pl-1">
                        {form.formState.errors.password.message}
                    </p>
                )}

                {/* Error Message */}
                {error && (
                    <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
                        <AlertCircle size={16} className="shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {/* Forgot password */}
                <div className="flex justify-end">
                    <button
                        type="button"
                        className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                        Quên mật khẩu?
                    </button>
                </div>

                {/* Submit */}
                <button
                    type="submit"
                    id="login-submit-btn"
                    disabled={form.formState.isSubmitting}
                    className="w-full flex items-center justify-center gap-2 py-3.5 px-5 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-40 disabled:pointer-events-none"
                    style={gradientButtonStyle}
                >
                    Đăng nhập
                </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px" style={dividerLineStyle} />
                <span className="text-xs text-slate-600">hoặc</span>
                <div className="flex-1 h-px" style={dividerLineStyle} />
            </div>

            {/* Google Login */}
            <button
                onClick={handleGoogleLogin}
                id="google-login-btn"
                className="w-full flex items-center justify-center gap-3 py-3 px-5 rounded-xl text-sm font-medium text-slate-300 transition-all hover:text-white hover:bg-white/[0.04]"
                style={outlinedButtonStyle}
            >
                <Chrome size={16} />
                Tiếp tục với Google
            </button>

            {/* Switch to Register */}
            <p className="text-center text-sm text-slate-500 mt-5">
                Chưa có tài khoản?{" "}
                <button
                    onClick={onSwitchToRegister}
                    id="switch-to-register"
                    className="text-indigo-400 font-semibold hover:text-indigo-300 transition-colors"
                >
                    Đăng ký ngay
                </button>
            </p>
        </>
    );
}
