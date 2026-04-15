import type { LoginFormData, RegisterFormData, OtpFormData } from "@/schemas";

export type AuthView = "login" | "register" | "otp";

export interface AuthModalProps {
    onClose: () => void;
}

export interface LoginViewProps {
    onClose: () => void;
    onSwitchToRegister: () => void;
}

export interface RegisterViewProps {
    onSwitchToLogin: () => void;
    onRegisterSuccess: (email: string) => void;
}

export interface OTPViewProps {
    email: string;
    error: string | null;
    onBack: () => void;
    onVerify: (data: OtpFormData) => Promise<void>;
    onResend: () => Promise<void>;
}

export interface AuthLayoutProps {
    children: React.ReactNode;
    onClose: () => void;
}

export interface FocusHandlers {
    onFocus: (e: React.FocusEvent<HTMLInputElement>) => void;
    onBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
}

export { LoginFormData, RegisterFormData, OtpFormData };
