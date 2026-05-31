import { useEffect, useRef, useState } from "react";
import { ChevronRight } from "lucide-react";
import { MapPinIcon } from "@/components/ui";
import { formatAddress } from "@/lib/utils";
import { listingsApi } from "@/services/api";
import type { ListingSummary } from "@/types";

export function FeaturedListings({ onNavigateToMap }: { onNavigateToMap: () => void }) {
    const [listings, setListings] = useState<ListingSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const ref = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);

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
                setListings([]);
            })
            .finally(() => setLoading(false));
    }, []);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("vi-VN").format(price) + "đ";
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
                ) : listings.length > 0 ? (
                    <div className={`landing-listings-grid ${visible ? "visible" : ""}`}>
                        <div className="landing-listing-card large" style={{ transitionDelay: "0ms" }}>
                            <div className="landing-listing-img">
                                <img
                                    src={listings[0]?.images?.[0] || "/listing-studio.png"}
                                    alt={listings[0]?.title}
                                />
                            </div>
                            <div className="landing-listing-info">
                                <h3 className="landing-listing-name">
                                    {listings[0]?.title || "Căn hộ studio sáng sủa gần ĐH Bách Khoa"}
                                </h3>
                                <div className="landing-listing-price">
                                    {formatPrice(listings[0]?.price || 3500000)}
                                    <span>/tháng</span>
                                </div>
                                <p className="landing-listing-address">
                                    <MapPinIcon size={13} />
                                    {formatAddress(listings[0]?.address) || "Quận Hai Bà Trưng, Hà Nội"}
                                </p>
                            </div>
                        </div>

                        <div className="landing-listings-right-col">
                            {listings.slice(1, 3).map((listing, index) => (
                                <div
                                    key={listing.id || index}
                                    className="landing-listing-card horizontal"
                                    style={{ transitionDelay: `${(index + 1) * 150}ms` }}
                                >
                                    <div className="landing-listing-img-sm">
                                        <img
                                            src={listing.images?.[0] || `/listing-room${index + 1}.png`}
                                            alt={listing.title}
                                        />
                                    </div>
                                    <div className="landing-listing-info">
                                        <h3 className="landing-listing-name">{listing.title}</h3>
                                        <p className="landing-listing-address">
                                            <MapPinIcon size={12} />
                                            {formatAddress(listing.address)}
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
                ) : (
                    <div className="text-center py-12 text-slate-500">
                        <p className="text-lg">Hiện tại chưa có phòng trọ nổi bật nào.</p>
                    </div>
                )}
            </div>
        </section>
    );
}
