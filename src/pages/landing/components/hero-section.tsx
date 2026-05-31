import { useState } from "react";
import { Map, Search } from "lucide-react";

export function HeroSection({ onNavigateToMap }: { onNavigateToMap: () => void }) {
    const [searchQuery, setSearchQuery] = useState("");

    return (
        <section className="landing-hero" id="hero">
            <div className="landing-hero-bg">
                <img src="/hero-bg.png" alt="Không gian căn hộ hiện đại" />
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
                            document.getElementById("listings")?.scrollIntoView({ behavior: "smooth" });
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
