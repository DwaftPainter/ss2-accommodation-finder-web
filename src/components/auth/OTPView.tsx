import { useEffect, useRef, useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ShieldCheck, RotateCcw, AlertCircle } from "lucide-react";
import { otpSchema, type OtpFormData } from "@/schemas";
import { OTP_LENGTH, gradientGreenButtonStyle } from "./constants";
import type { OTPViewProps } from "./types";

export default function OTPView({ email, error, onBack, onVerify, onResend }: OTPViewProps) {
    const [countdown, setCountdown] = useState(60);
    const [resendable, setResendable] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

    const form = useForm<OtpFormData>({
        resolver: zodResolver(otpSchema),
        defaultValues: { otp: "" }
    });

    // Countdown timer
    useEffect(() => {
        if (countdown <= 0) {
            setResendable(true);
            return;
        }
        const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
        return () => clearTimeout(timer);
    }, [countdown]);

    const handleResend = async () => {
        try {
            setIsResending(true);
            await onResend();
            setCountdown(60);
            setResendable(false);
            form.reset({ otp: "" });
            otpRefs.current[0]?.focus();
        } finally {
            setIsResending(false);
        }
    };

    const handleOtpChange = useCallback(
        (index: number, value: string) => {
            if (value && !/^\d$/.test(value)) return;

            const currentOtp = form.getValues("otp").split("");
            currentOtp[index] = value;
            const newOtp = currentOtp.join("").slice(0, OTP_LENGTH);
            form.setValue("otp", newOtp, { shouldValidate: true });

            if (value && index < OTP_LENGTH - 1) {
                otpRefs.current[index + 1]?.focus();
            }
        },
        [form]
    );

    const handleOtpKeyDown = useCallback(
        (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
            const currentOtp = form.getValues("otp");
            if (e.key === "Backspace" && !currentOtp[index] && index > 0) {
                otpRefs.current[index - 1]?.focus();
            }
        },
        [form]
    );

    const handleOtpPaste = useCallback(
        (e: React.ClipboardEvent<HTMLInputElement>) => {
            e.preventDefault();
            const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
            if (!pasted) return;

            form.setValue("otp", pasted, { shouldValidate: true });
            const focusIdx = Math.min(pasted.length, OTP_LENGTH - 1);
            otpRefs.current[focusIdx]?.focus();
        },
        [form]
    );

    const maskedEmail = email ? email.replace(/(.{2})(.*)(@.*)/, "$1***$3") : "email của bạn";

    const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

    const currentOtpValue = form.watch("otp");
    const otpDigits = currentOtpValue.split("").concat(Array(OTP_LENGTH).fill("")).slice(0, OTP_LENGTH);

    return (
        <>
            {/* Back + Title */}
            <div className="flex items-center gap-3 mb-2">
                <button
                    onClick={onBack}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-all"
                    id="back-to-register"
                >
                    <ArrowLeft size={18} />
                </button>
                <div>
                    <h2 className="text-xl font-bold text-white">Xác thực OTP</h2>
                    <p className="text-xs text-slate-500">Điền mã xác thực đã gửi đến email</p>
                </div>
            </div>

            {/* Icon */}
            <div className="flex flex-col items-center text-center my-6">
                <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                    style={{
                        background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                        boxShadow: "0 12px 30px rgba(16,185,129,0.35)"
                    }}
                >
                    <ShieldCheck size={30} className="text-white" />
                </div>
                <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
                    Chúng tôi đã gửi mã xác thực 6 số đến{" "}
                    <span className="text-indigo-400 font-semibold">{maskedEmail}</span>
                </p>
            </div>

            {/* OTP Inputs */}
            <form onSubmit={form.handleSubmit(onVerify)}>
                <input type="hidden" {...form.register("otp")} />
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
                            onChange={(e) => handleOtpChange(idx, e.target.value)}
                            onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                            onPaste={idx === 0 ? handleOtpPaste : undefined}
                            className="w-12 h-14 text-center text-xl font-bold text-white rounded-xl transition-all duration-200 focus:outline-none"
                            style={{
                                background: digit ? "rgba(99,102,241,0.12)" : "rgba(255,255,255,0.04)",
                                border: digit
                                    ? "1.5px solid rgba(99,102,241,0.5)"
                                    : "1px solid rgba(255,255,255,0.08)",
                                boxShadow: digit ? "0 0 0 2px rgba(99,102,241,0.1)" : "none"
                            }}
                            onFocus={(e) => {
                                e.currentTarget.style.border = "1.5px solid rgba(99,102,241,0.6)";
                                e.currentTarget.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.12)";
                                e.currentTarget.style.background = "rgba(99,102,241,0.08)";
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
                {(form.formState.errors.otp || error) && (
                    <div className="flex items-center justify-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400 mb-4">
                        <AlertCircle size={16} className="shrink-0" />
                        <span>{form.formState.errors.otp?.message || error}</span>
                    </div>
                )}

                {/* Verify Button */}
                <button
                    type="submit"
                    id="otp-verify-btn"
                    disabled={currentOtpValue.length !== OTP_LENGTH || form.formState.isSubmitting}
                    className="w-full flex items-center justify-center gap-2 py-3.5 px-5 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-40 disabled:pointer-events-none"
                    style={gradientGreenButtonStyle}
                >
                    <ShieldCheck size={16} />
                    Xác thực
                </button>
            </form>

            {/* Resend */}
            <div className="flex flex-col items-center gap-2 mt-5" translate="no">
                {resendable ? (
                    <button
                        onClick={handleResend}
                        id="resend-otp-btn"
                        disabled={isResending}
                        className="flex items-center gap-1.5 text-sm text-indigo-400 font-semibold hover:text-indigo-300 transition-colors disabled:opacity-50"
                    >
                        <RotateCcw size={14} className={isResending ? "animate-spin" : ""} />
                        {isResending ? "Đang gửi..." : "Gửi lại mã"}
                    </button>
                ) : (
                    <p className="text-sm text-slate-500">
                        Gửi lại mã sau{" "}
                        <span className="text-indigo-400 font-semibold notranslate">
                            {formatTime(countdown)}
                        </span>
                    </p>
                )}
            </div>
        </>
    );
}
