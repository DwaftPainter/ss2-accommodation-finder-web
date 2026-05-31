import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";

export function LandingNavbar({
    onOpenAuth,
}: {
    onNavigateToMap: () => void;
    onOpenAuth: () => void;
}) {
    const { user, logout } = useAuth();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <nav
            className={`landing-navbar ${scrolled ? "scrolled" : ""}`}
            id="landing-navbar"
        >
            <div className="landing-navbar-inner">
                <div className="landing-brand">
                    <span className="landing-brand-text">AccomFinder</span>
                </div>

                <div className="landing-nav-links">
                    <a href="#" className="landing-nav-link active">Trang chủ</a>
                    <a href="#features" className="landing-nav-link">Khám phá</a>
                    <a href="#listings" className="landing-nav-link">Tin nổi bật</a>
                </div>

                <div className="landing-nav-actions">
                    {user ? (
                        <div className="landing-nav-user">
                            <div className="landing-nav-avatar">
                                {user.avatarUrl ? (
                                    <img src={user.avatarUrl} alt={user.name} />
                                ) : (
                                    <span>{user.name?.[0]?.toUpperCase()}</span>
                                )}
                            </div>
                            <button onClick={() => logout()} className="landing-nav-logout">
                                Đăng xuất
                            </button>
                        </div>
                    ) : (
                        <button
                            className="landing-nav-login-btn"
                            onClick={onOpenAuth}
                            id="landing-login-btn"
                        >
                            Đăng nhập
                        </button>
                    )}

                    <div className="landing-nav-avatar-placeholder" id="landing-user-icon">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                        </svg>
                    </div>
                </div>
            </div>
        </nav>
    );
}
