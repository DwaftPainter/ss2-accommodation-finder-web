import { useEffect, useState } from "react";
import { AuthLayout, LoginView, RegisterView, OTPView } from "./";
import type { AuthView as ViewType, AuthModalProps } from "./types";
import type { OtpFormData } from "@/schemas";
import { useAuthStore } from "@/stores";
import { AUTH_MESSAGES, getErrorMessage } from "@/config/messages";

export default function AuthModal({ onClose }: AuthModalProps) {
    const [view, setView] = useState<ViewType>("login");
    const [otpEmail, setOtpEmail] = useState("");
    const [otpError, setOtpError] = useState<string | null>(null);
    const { verifyOtp, resendOtp } = useAuthStore();

    // Close on Escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [onClose]);

    const handleSwitchToRegister = () => {
        setView("register");
    };

    const handleSwitchToLogin = () => {
        setView("login");
    };

    const handleRegisterSuccess = (email: string) => {
        setOtpEmail(email);
        setOtpError(null);
        setView("otp");
    };

    const handleOtpVerify = async (data: OtpFormData) => {
        try {
            setOtpError(null);
            await verifyOtp(otpEmail, data.otp);
            onClose();
        } catch (err) {
            setOtpError(getErrorMessage(err, AUTH_MESSAGES.OTP_GENERIC_ERROR));
            throw err;
        }
    };

    const handleResendOtp = async () => {
        try {
            await resendOtp(otpEmail);
        } catch (err) {
            setOtpError(getErrorMessage(err, AUTH_MESSAGES.OTP_GENERIC_ERROR));
        }
    };

    const handleBackToRegister = () => {
        setView("register");
    };

    return (
        <AuthLayout onClose={onClose} view={view}>
            {view === "login" && (
                <LoginView
                    onClose={onClose}
                    onSwitchToRegister={handleSwitchToRegister}
                />
            )}
            {view === "register" && (
                <RegisterView
                    onSwitchToLogin={handleSwitchToLogin}
                    onRegisterSuccess={handleRegisterSuccess}
                />
            )}
            {view === "otp" && (
                <OTPView
                    email={otpEmail}
                    error={otpError}
                    onBack={handleBackToRegister}
                    onVerify={handleOtpVerify}
                    onResend={handleResendOtp}
                />
            )}
        </AuthLayout>
    );
}
