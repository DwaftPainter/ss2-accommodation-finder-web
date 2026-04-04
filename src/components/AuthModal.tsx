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
    RotateCcw
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import {
    loginSchema,
    registerSchema,
    otpSchema,
    type LoginFormData,
    type RegisterFormData,
    type OtpFormData
} from "../schemas";

type AuthView = "login" | "register" | "otp";
const OTP_LENGTH = 6;

export default function AuthModal({ onClose }: { onClose: () => void }) {
    const { login } = useAuth();
    const overlayRef = useRef<HTMLDivElement>(null);

    const [view, setView] = useState<AuthView>("login");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [otpCountdown, setOtpCountdown] = useState(60);
    const [otpResendable, setOtpResendable] = useState(false);

    const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

    /* ---------------- FORMS ---------------- */
    const loginForm = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: "", password: "" }
    });

    const registerForm = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            confirmPassword: ""
        }
    });

    const otpForm = useForm<OtpFormData>({
        resolver: zodResolver(otpSchema),
        defaultValues: { otp: "" }
    });

    const regEmail = registerForm.watch("email");

    /* ---------------- GLOBAL EVENTS ---------------- */
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [onClose]);

    /* ---------------- OTP COUNTDOWN ---------------- */
    useEffect(() => {
        if (view !== "otp") return;

        if (otpCountdown <= 0) {
            setOtpResendable(true);
            return;
        }

        const timer = setTimeout(() => {
            setOtpCountdown((c) => c - 1);
        }, 1000);

        return () => clearTimeout(timer);
    }, [view, otpCountdown]);

    /* ---------------- AUTO FOCUS OTP ---------------- */
    useEffect(() => {
        if (view === "otp") {
            setTimeout(() => otpRefs.current[0]?.focus(), 100);
        }
    }, [view]);

    /* ---------------- HANDLERS ---------------- */

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === overlayRef.current) onClose();
    };

    const handleGoogleLogin = () => {
        login();
        onClose();
    };

    const onLoginSubmit = (data: LoginFormData) => {
        console.log("Login:", data);
    };

    const onRegisterSubmit = (data: RegisterFormData) => {
        console.log("Register:", data);

        otpForm.reset({ otp: "" });
        setOtpCountdown(60);
        setOtpResendable(false);
        setView("otp");
    };

    const onOtpSubmit = (data: OtpFormData) => {
        console.log("OTP Verify:", {
            email: regEmail,
            code: data.otp
        });
    };

    /* ---------------- OTP LOGIC (FINAL VERSION) ---------------- */

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

            if (e.key === "Backspace" && !currentOtp[index] && index > 0) {
                otpRefs.current[index - 1]?.focus();
            }
        },
        [otpForm]
    );

    const handleOtpPaste = useCallback(
        (e: React.ClipboardEvent<HTMLInputElement>) => {
            e.preventDefault();

            const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);

            if (!pasted) return;

            otpForm.setValue("otp", pasted, { shouldValidate: true });

            const focusIdx = Math.min(pasted.length, OTP_LENGTH - 1);
            otpRefs.current[focusIdx]?.focus();
        },
        [otpForm]
    );

    const handleResendOtp = () => {
        setOtpCountdown(60);
        setOtpResendable(false);
        otpForm.reset({ otp: "" });
        otpRefs.current[0]?.focus();

        console.log("Resend OTP to:", regEmail);
    };

    /* ---------------- VIEW SWITCH ---------------- */
    const switchToRegister = () => {
        setView("register");
        registerForm.reset();
    };

    const switchToLogin = () => {
        setView("login");
        loginForm.reset();
    };

    /* ---------------- OTP UI ---------------- */

    const currentOtpValue = otpForm.watch("otp");

    const otpDigits = currentOtpValue.split("").concat(Array(OTP_LENGTH).fill("")).slice(0, OTP_LENGTH);

    const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

    /* ---------------- RENDER ---------------- */

    return (
        <div
            ref={overlayRef}
            onClick={handleOverlayClick}
            className="fixed inset-0 flex items-center justify-center"
        >
            <div className="p-6 bg-black rounded-xl w-[400px]">
                {view === "login" && (
                    <form onSubmit={loginForm.handleSubmit(onLoginSubmit)}>
                        <input {...loginForm.register("email")} placeholder="Email" />
                        <input {...loginForm.register("password")} placeholder="Password" />
                        <button type="submit">Login</button>
                        <button type="button" onClick={switchToRegister}>
                            Register
                        </button>
                    </form>
                )}

                {view === "register" && (
                    <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)}>
                        <input {...registerForm.register("name")} placeholder="Name" />
                        <input {...registerForm.register("email")} placeholder="Email" />
                        <input {...registerForm.register("password")} placeholder="Password" />
                        <input {...registerForm.register("confirmPassword")} placeholder="Confirm" />
                        <button type="submit">Register</button>
                    </form>
                )}

                {view === "otp" && (
                    <form onSubmit={otpForm.handleSubmit(onOtpSubmit)}>
                        <div className="flex gap-2">
                            {otpDigits.map((digit, i) => (
                                <input
                                    key={i}
                                    ref={(el) => (otpRefs.current[i] = el)}
                                    value={digit}
                                    maxLength={1}
                                    onChange={(e) => handleOtpChange(i, e.target.value)}
                                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                                    onPaste={i === 0 ? handleOtpPaste : undefined}
                                />
                            ))}
                        </div>

                        <button disabled={currentOtpValue.length !== OTP_LENGTH} type="submit">
                            Verify
                        </button>

                        {otpResendable ? (
                            <button type="button" onClick={handleResendOtp}>
                                Resend
                            </button>
                        ) : (
                            <p>{formatTime(otpCountdown)}</p>
                        )}
                    </form>
                )}
            </div>
        </div>
    );
}
