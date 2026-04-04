import { X } from "lucide-react";
import type { AuthLayoutProps, AuthView } from "./types";

interface ExtendedAuthLayoutProps extends AuthLayoutProps {
    view: AuthView;
}

export default function AuthLayout({ children, onClose, view }: ExtendedAuthLayoutProps) {
    return (
        <div
            className="fixed inset-0 z-[2000] flex items-center justify-center p-4"
            style={{
                background: "rgba(10, 11, 18, 0.75)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
            }}
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
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
                    {children}

                    {/* Footer note - only for login/register */}
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
