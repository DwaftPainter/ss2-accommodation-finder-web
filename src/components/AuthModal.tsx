import { useEffect, useRef, useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    X,
    Home,
    Chrome,
    Shield,
    Star,
    MapPin,
    User,
    Mail,
    Lock,
    Eye,
    EyeOff,
    ArrowLeft,
    ShieldCheck,
    RotateCcw,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import {
    loginSchema,
    registerSchema,
    otpSchema,
    type LoginFormData,
    type RegisterFormData,
    type OtpFormData,
} from "../schemas";

type AuthView = "login" | "register" | "otp";
const OTP_LENGTH = 6;

interface AuthModalProps {
    onClose: () => void;
}

const inputClass =
    "w-full pl-10 pr-4 py-3 rounded-xl text-sm text-white placeholder-slate-500 transition-all duration-200 focus:outline-none";
const inputStyle = {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
};
const inputFocusStyle = {
    border: "1px solid rgba(99,102,241,0.5)",
    background: "rgba(255,255,255,0.06)",
    boxShadow: "0 0 0 3px rgba(99,102,241,0.1)",
};

export default function AuthModal({ onClose }: AuthModalProps) {
    const { login } = useAuth();
    const overlayRef = useRef<HTMLDivElement>(null);
    const [view, setView] = useState<AuthView>("login");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [otpCountdown, setOtpCountdown] = useState(60);
    const [otpResendable, setOtpResendable] = useState(false);
    const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Login form
    const loginForm = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: "", password: "" },
    });

    // Register form
    const registerForm = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
        },
    });

    // OTP form
    const otpForm = useForm<OtpFormData>({
        resolver: zodResolver(otpSchema),
        defaultValues: { otp: "" },
    });

    const regEmail = registerForm.watch("email");

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [onClose]);

    // OTP countdown timer
    useEffect(() => {
        if (view !== "otp") return;
        if (otpCountdown <= 0) {
            setOtpResendable(true);
            return;
        }
        const timer = setTimeout(
            () => setOtpCountdown((c) => c - 1),
            1000
        );
        return () => clearTimeout(timer);
    }, [view, otpCountdown]);

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === overlayRef.current) onClose();
    };

    const handleGoogleLogin = () => {
        login();
        onClose();
    };

    const onLoginSubmit = (data: LoginFormData) => {
        console.log("Login:", data);
        // TODO: Implement actual login API call
    };

    const onRegisterSubmit = (data: RegisterFormData) => {
        console.log("Register:", data);
        // Reset OTP form and switch to OTP view
        otpForm.reset({ otp: "" });
        setOtpCountdown(60);
        setOtpResendable(false);
        setView("otp");
    };

    const onOtpSubmit = (data: OtpFormData) => {
        console.log("OTP Verify:", { email: regEmail, code: data.otp });
        // TODO: Implement actual OTP verification
    };

    const handleResendOtp = () => {
        setOtpCountdown(60);
        setOtpResendable(false);
        otpForm.reset({ otp: "" });
        otpRefs.current[0]?.focus();
        console.log("Resend OTP to:", regEmail);
    };

    const switchToRegister = () => {
        setView("register");
        registerForm.reset();
    };

    const switchToLogin = () => {
        setView("login");
        loginForm.reset();
    };

    const focusHandlers = {
        onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
            Object.assign(e.currentTarget.style, inputFocusStyle);
        },
        onBlur: (e: React.FocusEvent<HTMLInputElement>) => {
            e.currentTarget.style.border = inputStyle.border;
            e.currentTarget.style.background = inputStyle.background;
            e.currentTarget.style.boxShadow = "none";
        },
    };

    // OTP digit inputs handler
    const handleOtpChange = useCallback(
        (index: number, value: string) => {
            if (value && !/^\d$/.test(value)) return;

            const currentOtp = otpForm.getValues("otp").split("");
            currentOtp[index] = value;
            const newOtp = currentOtp.join("").slice(0, OTP_LENGTH);
            otpForm.setValue("otp", newOtp, { shouldValidate: true });

            if (value && index < OTP_LENGTH - 1) {
                otpRefs.current[index + 1]?.focus();
            }
        },
        [otpForm]
    );

    const handleOtpKeyDown = useCallback(
        (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
            const currentOtp = otpForm.getValues("otp");
            if (
                e.key === "Backspace" &&
                !currentOtp[index] &&
                index > 0
            ) {
                otpRefs.current[index - 1]?.focus();
            }
        },
        [otpForm]
    );

    const handleOtpPaste = useCallback(
        (e: React.ClipboardEvent<HTMLInputElement>) => {
            e.preventDefault();
            const pasted = e.clipboardData
                .getData("text")
                .replace(/\D/g, "")
                .slice(0, OTP_LENGTH);
            if (!pasted) return;

            otpForm.setValue("otp", pasted, { shouldValidate: true });
            const focusIdx = Math.min(pasted.length, OTP_LENGTH - 1);
            otpRefs.current[focusIdx]?.focus();
        },
        [otpForm]
    );

    const features = [
        { icon: <MapPin size={16} />, text: "Đăng tin phòng trọ lên bản đồ" },
        { icon: <Star size={16} />, text: "Lưu và đánh giá phòng trọ yêu thích" },
        { icon: <Shield size={16} />, text: "Quản lý tin đăng của bạn" },
    ];

    /* ──────── LOGIN VIEW ──────── */
    const loginView = (
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
                onSubmit={loginForm.handleSubmit(onLoginSubmit)}
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
                        {...loginForm.register("email")}
                        {...focusHandlers}
                    />
                </div>
                {loginForm.formState.errors.email && (
                    <p className="text-xs text-red-400 pl-1">
                        {loginForm.formState.errors.email.message}
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
                        {...loginForm.register("password")}
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
                {loginForm.formState.errors.password && (
                    <p className="text-xs text-red-400 pl-1">
                        {loginForm.formState.errors.password.message}
                    </p>
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
                    disabled={loginForm.formState.isSubmitting}
                    className="w-full flex items-center justify-center gap-2 py-3.5 px-5 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-40 disabled:pointer-events-none"
                    style={{
                        background:
                            "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
                        boxShadow: "0 8px 24px rgba(99,102,241,0.35)",
                    }}
                >
                    Đăng nhập
                </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-4">
                <div
                    className="flex-1 h-px"
                    style={{ background: "rgba(255,255,255,0.06)" }}
                />
                <span className="text-xs text-slate-600">hoặc</span>
                <div
                    className="flex-1 h-px"
                    style={{ background: "rgba(255,255,255,0.06)" }}
                />
            </div>

            {/* Google Login */}
            <button
                onClick={handleGoogleLogin}
                id="google-login-btn"
                className="w-full flex items-center justify-center gap-3 py-3 px-5 rounded-xl text-sm font-medium text-slate-300 transition-all hover:text-white hover:bg-white/[0.04]"
                style={{ border: "1px solid rgba(255,255,255,0.07)" }}
            >
                <Chrome size={16} />
                Tiếp tục với Google
            </button>

            {/* Switch to Register */}
            <p className="text-center text-sm text-slate-500 mt-5">
                Chưa có tài khoản?{" "}
                <button
                    onClick={switchToRegister}
                    id="switch-to-register"
                    className="text-indigo-400 font-semibold hover:text-indigo-300 transition-colors"
                >
                    Đăng ký ngay
                </button>
            </p>
        </>
    );

    /* ──────── REGISTER VIEW ──────── */
    const registerView = (
        <>
            {/* Back + Title */}
            <div className="flex items-center gap-3 mb-6">
                <button
                    onClick={switchToLogin}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-all"
                    id="back-to-login"
                >
                    <ArrowLeft size={18} />
                </button>
                <div>
                    <h2 className="text-xl font-bold text-white">Tạo tài khoản</h2>
                    <p className="text-xs text-slate-500">
                        Điền thông tin để đăng ký tài khoản mới
                    </p>
                </div>
            </div>

            {/* Register Form */}
            <form
                onSubmit={registerForm.handleSubmit(onRegisterSubmit)}
                className="space-y-3.5"
            >
                {/* Name */}
                <div className="relative">
                    <User
                        size={15}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
                    />
                    <input
                        type="text"
                        id="register-name"
                        placeholder="Họ và tên"
                        className={inputClass}
                        style={inputStyle}
                        {...registerForm.register("name")}
                        {...focusHandlers}
                    />
                </div>
                {registerForm.formState.errors.name && (
                    <p className="text-xs text-red-400 pl-1">
                        {registerForm.formState.errors.name.message}
                    </p>
                )}

                {/* Email */}
                <div className="relative">
                    <Mail
                        size={15}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
                    />
                    <input
                        type="email"
                        id="register-email"
                        placeholder="Email"
                        className={inputClass}
                        style={inputStyle}
                        {...registerForm.register("email")}
                        {...focusHandlers}
                    />
                </div>
                {registerForm.formState.errors.email && (
                    <p className="text-xs text-red-400 pl-1">
                        {registerForm.formState.errors.email.message}
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
                        id="register-password"
                        placeholder="Mật khẩu"
                        className={`${inputClass} pr-10`}
                        style={inputStyle}
                        {...registerForm.register("password")}
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
                {registerForm.formState.errors.password && (
                    <p className="text-xs text-red-400 pl-1">
                        {registerForm.formState.errors.password.message}
                    </p>
                )}

                {/* Confirm Password */}
                <div className="relative">
                    <Lock
                        size={15}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
                    />
                    <input
                        type={showConfirm ? "text" : "password"}
                        id="register-confirm"
                        placeholder="Xác nhận mật khẩu"
                        className={`${inputClass} pr-10`}
                        style={inputStyle}
                        {...registerForm.register("confirmPassword")}
                        {...focusHandlers}
                    />
                    <button
                        type="button"
                        onClick={() => setShowConfirm((p) => !p)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                    >
                        {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                </div>
                {registerForm.formState.errors.confirmPassword && (
                    <p className="text-xs text-red-400 pl-1">
                        {registerForm.formState.errors.confirmPassword.message}
                    </p>
                )}

                {/* Submit */}
                <button
                    type="submit"
                    id="register-submit-btn"
                    disabled={registerForm.formState.isSubmitting}
                    className="w-full flex items-center justify-center gap-2 py-3.5 px-5 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-40 disabled:pointer-events-none"
                    style={{
                        background:
                            "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
                        boxShadow: "0 8px 24px rgba(99,102,241,0.35)",
                    }}
                >
                    Đăng ký
                </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-4">
                <div
                    className="flex-1 h-px"
                    style={{ background: "rgba(255,255,255,0.06)" }}
                />
                <span className="text-xs text-slate-600">hoặc</span>
                <div
                    className="flex-1 h-px"
                    style={{ background: "rgba(255,255,255,0.06)" }}
                />
            </div>

            {/* Google shortcut */}
            <button
                onClick={handleGoogleLogin}
                id="register-google-btn"
                className="w-full flex items-center justify-center gap-3 py-3 px-5 rounded-xl text-sm font-medium text-slate-300 transition-all hover:text-white hover:bg-white/[0.04]"
                style={{ border: "1px solid rgba(255,255,255,0.07)" }}
            >
                <Chrome size={16} />
                Đăng ký với Google
            </button>

            {/* Switch back */}
            <p className="text-center text-sm text-slate-500 mt-5">
                Đã có tài khoản?{" "}
                <button
                    onClick={switchToLogin}
                    id="switch-to-login"
                    className="text-indigo-400 font-semibold hover:text-indigo-300 transition-colors"
                >
                    Đăng nhập
                </button>
            </p>
        </>
    );

    /* ──────── OTP VIEW ──────── */
    const maskedEmail = regEmail
        ? regEmail.replace(/(.{2})(.*)(@.*)/, "$1***$3")
        : "email của bạn";

    const formatTime = (s: number) =>
        `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

    const currentOtpValue = otpForm.watch("otp");
    const otpDigits = currentOtpValue.split("").concat(
        Array(OTP_LENGTH).fill("")
    ).slice(0, OTP_LENGTH);

    const otpView = (
        <>
            {/* Back + Title */}
            <div className="flex items-center gap-3 mb-2">
                <button
                    onClick={switchToRegister}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-all"
                    id="back-to-register"
                >
                    <ArrowLeft size={18} />
                </button>
                <div>
                    <h2 className="text-xl font-bold text-white">Xác thực OTP</h2>
                    <p className="text-xs text-slate-500">
                        Điền mã xác thực đã gửi đến email
                    </p>
                </div>
            </div>

            {/* Icon */}
            <div className="flex flex-col items-center text-center my-6">
                <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                    style={{
                        background:
                            "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                        boxShadow: "0 12px 30px rgba(16,185,129,0.35)",
                    }}
                >
                    <ShieldCheck size={30} className="text-white" />
                </div>
                <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
                    Chúng tôi đã gửi mã xác thực 6 số đến{" "}
                    <span className="text-indigo-400 font-semibold">
                        {maskedEmail}
                    </span>
                </p>
            </div>

            {/* OTP Inputs */}
            <form onSubmit={otpForm.handleSubmit(onOtpSubmit)}>
                <input
                    type="hidden"
                    {...otpForm.register("otp")}
                />
                <div className="flex justify-center gap-2.5 mb-6">
                    {otpDigits.map((digit, idx) => (
                        <input
                            key={idx}
                            ref={(el) => {
                                otpRefs.current[idx] = el;
                            }}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            id={`otp-input-${idx}`}
                            value={digit}
                            onChange={(e) =>
                                handleOtpChange(idx, e.target.value)
                            }
                            onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                            onPaste={idx === 0 ? handleOtpPaste : undefined}
                            className="w-12 h-14 text-center text-xl font-bold text-white rounded-xl transition-all duration-200 focus:outline-none"
                            style={{
                                background: digit
                                    ? "rgba(99,102,241,0.12)"
                                    : "rgba(255,255,255,0.04)",
                                border: digit
                                    ? "1.5px solid rgba(99,102,241,0.5)"
                                    : "1px solid rgba(255,255,255,0.08)",
                                boxShadow: digit
                                    ? "0 0 0 2px rgba(99,102,241,0.1)"
                                    : "none",
                            }}
                            onFocus={(e) => {
                                e.currentTarget.style.border =
                                    "1.5px solid rgba(99,102,241,0.6)";
                                e.currentTarget.style.boxShadow =
                                    "0 0 0 3px rgba(99,102,241,0.12)";
                                e.currentTarget.style.background =
                                    "rgba(99,102,241,0.08)";
                            }}
                            onBlur={(e) => {
                                const v = e.currentTarget.value;
                                e.currentTarget.style.border = v
                                    ? "1.5px solid rgba(99,102,241,0.5)"
                                    : "1px solid rgba(255,255,255,0.08)";
                                e.currentTarget.style.boxShadow = v
                                    ? "0 0 0 2px rgba(99,102,241,0.1)"
                                    : "none";
                                e.currentTarget.style.background = v
                                    ? "rgba(99,102,241,0.12)"
                                    : "rgba(255,255,255,0.04)";
                            }}
                        />
                    ))}
                </div>
                {otpForm.formState.errors.otp && (
                    <p className="text-xs text-red-400 text-center mb-4">
                        {otpForm.formState.errors.otp.message}
                    </p>
                )}

                {/* Verify Button */}
                <button
                    type="submit"
                    id="otp-verify-btn"
                    disabled={
                        currentOtpValue.length !== OTP_LENGTH ||
                        otpForm.formState.isSubmitting
                    }
                    className="w-full flex items-center justify-center gap-2 py-3.5 px-5 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-40 disabled:pointer-events-none"
                    style={{
                        background:
                            "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                        boxShadow: "0 8px 24px rgba(16,185,129,0.3)",
                    }}
                >
                    <ShieldCheck size={16} />
                    Xác thực
                </button>
            </form>

            {/* Resend */}
            <div className="flex flex-col items-center gap-2 mt-5" translate="no">
                {otpResendable ? (
                    <button
                        onClick={handleResendOtp}
                        id="resend-otp-btn"
                        className="flex items-center gap-1.5 text-sm text-indigo-400 font-semibold hover:text-indigo-300 transition-colors"
                    >
                        <RotateCcw size={14} />
                        Gửi lại mã
                    </button>
                ) : (
                    <p className="text-sm text-slate-500">
                        Gửi lại mã sau{" "}
                        <span className="text-indigo-400 font-semibold notranslate">
                            {formatTime(otpCountdown)}
                        </span>
                    </p>
                )}
            </div>
        </>
    );

    return (
        <div
            ref={overlayRef}
            onClick={handleOverlayClick}
            className="fixed inset-0 z-[2000] flex items-center justify-center p-4"
            style={{
                background: "rgba(10, 11, 18, 0.75)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
            }}
        >
            <div
                className="relative w-full max-w-md animate-modal-in"
                style={{
                    background:
                        "linear-gradient(145deg, rgba(26,29,39,0.98) 0%, rgba(18,20,30,0.98) 100%)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "20px",
                    boxShadow:
                        "0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(99,102,241,0.15), inset 0 1px 0 rgba(255,255,255,0.05)",
                    overflow: "hidden",
                }}
            >
                {/* Gradient Orb Background */}
                <div
                    className="absolute -top-24 -right-24 w-64 h-64 rounded-full opacity-20 pointer-events-none"
                    style={{
                        background: "radial-gradient(circle, #6366f1 0%, transparent 70%)",
                        filter: "blur(30px)",
                    }}
                />
                <div
                    className="absolute -bottom-20 -left-20 w-56 h-56 rounded-full opacity-15 pointer-events-none"
                    style={{
                        background: "radial-gradient(circle, #a855f7 0%, transparent 70%)",
                        filter: "blur(30px)",
                    }}
                />

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-white hover:bg-white/[0.06] transition-all z-10"
                    id="auth-modal-close"
                >
                    <X size={18} />
                </button>

                {/* Content – animate on view change */}
                <div key={view} className="relative p-8 animate-fade-in">
                    {view === "login" && loginView}
                    {view === "register" && registerView}
                    {view === "otp" && otpView}

                    {/* Footer note */}
                    {view !== "otp" && (
                        <p className="text-center text-xs text-slate-600 mt-4 leading-relaxed">
                            Bằng cách{" "}
                            {view === "login" ? "đăng nhập" : "đăng ký"}, bạn đồng ý với{" "}
                            <span className="text-slate-500 cursor-pointer hover:text-indigo-400 transition-colors">
                                Điều khoản dịch vụ
                            </span>{" "}
                            và{" "}
                            <span className="text-slate-500 cursor-pointer hover:text-indigo-400 transition-colors">
                                Chính sách bảo mật
                            </span>
                            .
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
