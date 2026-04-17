import { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Compass, DollarSign, Clock, Headphones, ChevronRight, Map } from 'lucide-react';
import { listingsApi } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import type { ListingSummary } from '../types';

interface LandingPageProps {
    onNavigateToMap: () => void;
    onOpenAuth: () => void;
}

/* ─── sub-components ─── */

function LandingNavbar({ onNavigateToMap, onOpenAuth }: { onNavigateToMap: () => void; onOpenAuth: () => void }) {
    const { user, logout } = useAuth();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav
            className={`landing-navbar ${scrolled ? 'scrolled' : ''}`}
            id="landing-navbar"
        >
            <div className="landing-navbar-inner">
                {/* Brand */}
                <div className="landing-brand">
                    <span className="landing-brand-text">AccomFinder</span>
                </div>

                {/* Nav links */}
                <div className="landing-nav-links">
                    <a href="#" className="landing-nav-link active">Home</a>
                    <a href="#features" className="landing-nav-link">Explore</a>
                    <a href="#listings" className="landing-nav-link">Saved</a>
                </div>

                {/* Actions */}
                <div className="landing-nav-actions">
                    <button
                        className="landing-nav-map-btn"
                        onClick={onNavigateToMap}
                        id="nav-map-view-btn"
                    >
                        <Map size={16} />
                        Xem bản đồ
                    </button>

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

function HeroSection({ onNavigateToMap }: { onNavigateToMap: () => void }) {
    const [searchQuery, setSearchQuery] = useState('');

    return (
        <section className="landing-hero" id="hero">
            <div className="landing-hero-bg">
                <img src="/hero-bg.png" alt="Modern apartment interior" />
                <div className="landing-hero-overlay" />
            </div>

            <div className="landing-hero-content">
                <h1 className="landing-hero-title">
                    Tìm phòng trọ &amp; chung<br />cư mini phù hợp nhất
                </h1>

                <div className="landing-hero-search">
                    <Search size={18} className="landing-hero-search-icon" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Nhập khu vực, tên đường hoặc trường đại học..."
                        className="landing-hero-search-input"
                        id="hero-search-input"
                    />
                </div>

                <div className="landing-hero-cta">
                    <button
                        className="landing-cta-primary"
                        onClick={onNavigateToMap}
                        id="hero-map-btn"
                    >
                        <Map size={18} />
                        Xem Bản Đồ
                    </button>
                    <button
                        className="landing-cta-secondary"
                        onClick={() => {
                            document.getElementById('listings')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        id="hero-explore-btn"
                    >
                        Khám phá ngay
                    </button>
                </div>
            </div>
        </section>
    );
}

const features = [
    {
        icon: <Compass size={24} />,
        title: 'Tìm trọ gần đây',
        desc: 'Tìm phòng trọ quanh vị trí hiện tại cho bạn.',
        color: '#10b981',
        bg: '#ecfdf5',
    },
    {
        icon: <DollarSign size={24} />,
        title: 'Lọc theo giá',
        desc: 'Dễ dàng tìm kiếm phòng trọ theo ngân sách.',
        color: '#3b82f6',
        bg: '#eff6ff',
    },
    {
        icon: <Clock size={24} />,
        title: 'Phòng mới đăng',
        desc: 'Xem những phòng trọ vừa được cập nhật.',
        color: '#f59e0b',
        bg: '#fffbeb',
    },
    {
        icon: <Headphones size={24} />,
        title: 'Hỗ trợ tìm trọ',
        desc: 'Chúng tôi sẵn sàng giúp bạn tìm được phòng.',
        color: '#8b5cf6',
        bg: '#f5f3ff',
    },
];

function FeaturesSection() {
    const ref = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) setVisible(true); },
            { threshold: 0.2 }
        );
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);

    return (
        <section className="landing-features" id="features" ref={ref}>
            <div className="landing-features-grid">
                {features.map((f, i) => (
                    <div
                        key={i}
                        className={`landing-feature-card ${visible ? 'visible' : ''}`}
                        style={{ transitionDelay: `${i * 100}ms` }}
                    >
                        <div
                            className="landing-feature-icon"
                            style={{ background: f.bg, color: f.color }}
                        >
                            {f.icon}
                        </div>
                        <h3 className="landing-feature-title">{f.title}</h3>
                        <p className="landing-feature-desc">{f.desc}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}

function FeaturedListings({ onNavigateToMap }: { onNavigateToMap: () => void }) {
    const [listings, setListings] = useState<ListingSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const ref = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);

    // Fallback image data for when API is not available
    const fallbackListings = [
        {
            id: '1',
            title: 'Sunny Studio - Gần ĐH Bách Khoa',
            address: 'Quận Hai Bà Trưng, Hà Nội',
            price: 3500000,
            images: ['/listing-studio.png'],
        },
        {
            id: '2',
            title: 'Phòng Trọ Khép Kín - Cầu Giấy',
            address: 'Quận Cầu Giấy, Hà Nội',
            price: 2800000,
            images: ['/listing-room1.png'],
        },
        {
            id: '3',
            title: 'Chung Cư Mini - Gần ĐH Quốc Gia',
            address: 'Quận Nam Từ Liêm, Hà Nội',
            price: 4200000,
            images: ['/listing-room2.png'],
        },
    ];

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) setVisible(true); },
            { threshold: 0.15 }
        );
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        listingsApi.getAll({})
            .then((data) => {
                setListings(data.slice(0, 3));
            })
            .catch(() => {
                // Use fallback data if API fails
                setListings(fallbackListings as any);
            })
            .finally(() => setLoading(false));
    }, []);

    const displayListings = listings.length > 0 ? listings : fallbackListings;

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
    };

    return (
        <section className="landing-listings" id="listings" ref={ref}>
            <div className="landing-listings-inner">
                <div className="landing-listings-header">
                    <div>
                        <span className="landing-listings-tag">PHÒNG TRỌ NỔI BẬT</span>
                        <h2 className="landing-listings-title">Phòng trọ nổi bật</h2>
                    </div>
                    <button
                        className="landing-listings-view-all"
                        onClick={onNavigateToMap}
                        id="view-all-btn"
                    >
                        Xem tất cả <ChevronRight size={16} />
                    </button>
                </div>

                {loading ? (
                    <div className="landing-listings-loading">
                        <div className="landing-listings-skeleton" />
                        <div className="landing-listings-skeleton-col">
                            <div className="landing-listings-skeleton small" />
                            <div className="landing-listings-skeleton small" />
                        </div>
                    </div>
                ) : (
                    <div className={`landing-listings-grid ${visible ? 'visible' : ''}`}>
                        {/* Large card */}
                        <div className="landing-listing-card large" style={{ transitionDelay: '0ms' }}>
                            <div className="landing-listing-img">
                                <img
                                    src={(displayListings[0] as any)?.images?.[0] || '/listing-studio.png'}
                                    alt={(displayListings[0] as any)?.title}
                                />
                            </div>
                            <div className="landing-listing-info">
                                <h3 className="landing-listing-name">
                                    {(displayListings[0] as any)?.title || 'Sunny Studio - Gần ĐH Bách Khoa'}
                                </h3>
                                <div className="landing-listing-price">
                                    {formatPrice((displayListings[0] as any)?.price || 3500000)}
                                    <span>/tháng</span>
                                </div>
                                <p className="landing-listing-address">
                                    <MapPin size={13} />
                                    {(displayListings[0] as any)?.address || 'Quận Hai Bà Trưng, Hà Nội'}
                                </p>
                            </div>
                        </div>

                        {/* Right column cards */}
                        <div className="landing-listings-right-col">
                            {displayListings.slice(1, 3).map((listing: any, i: number) => (
                                <div
                                    key={listing.id || i}
                                    className="landing-listing-card horizontal"
                                    style={{ transitionDelay: `${(i + 1) * 150}ms` }}
                                >
                                    <div className="landing-listing-img-sm">
                                        <img
                                            src={listing.images?.[0] || `/listing-room${i + 1}.png`}
                                            alt={listing.title}
                                        />
                                    </div>
                                    <div className="landing-listing-info">
                                        <h3 className="landing-listing-name">{listing.title}</h3>
                                        <p className="landing-listing-address">
                                            <MapPin size={12} />
                                            {listing.address}
                                        </p>
                                        <div className="landing-listing-price">
                                            {formatPrice(listing.price)}
                                            <span>/tháng</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}

function Footer() {
    return (
        <footer className="landing-footer" id="footer">
            <div className="landing-footer-inner">
                <div className="landing-footer-brand">
                    <span className="landing-footer-logo">AccomFinder</span>
                    <p className="landing-footer-desc">
                        Nền tảng tìm kiếm không gian sống hiện đại<br />
                        và tiện ích hàng đầu.
                    </p>
                </div>

                <div className="landing-footer-links">
                    <a href="#">Privacy Policy</a>
                    <a href="#">Terms of Service</a>
                    <a href="#">Cookie Policy</a>
                    <a href="#">Contact Us</a>
                </div>

                <div className="landing-footer-copyright">
                    © 2026 Accommodation Finder. All rights reserved.
                </div>
            </div>
        </footer>
    );
}

/* ─── main component ─── */

export default function LandingPage({ onNavigateToMap, onOpenAuth }: LandingPageProps) {
    return (
        <div className="landing-page">
            <LandingNavbar onNavigateToMap={onNavigateToMap} onOpenAuth={onOpenAuth} />
            <HeroSection onNavigateToMap={onNavigateToMap} />
            <FeaturesSection />
            <FeaturedListings onNavigateToMap={onNavigateToMap} />
            <Footer />
        </div>
    );
}
