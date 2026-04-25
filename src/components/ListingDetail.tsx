import { useState, useEffect, useCallback } from "react";
import {
    ArrowLeft,
    MapPin,
    User,
    Phone,
    Bookmark,
    Share2,
    Star,
    Wifi,
    Wind,
    Car,
    ShieldCheck,
    Clock,
    Maximize,
    Waves,
    ImageIcon,
    Zap,
    Droplets,
    X,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { listingsApi } from "../services/api";
import { useAuth } from "../hooks/useAuth";
import { useListingsStore } from "../stores";
import { formatAddress, formatPrice } from "../lib/utils";
import ReviewSection from "./ReviewSection";
import type { ListingDetail as ListingDetailType } from "../types";
import Loader from "./ui/loading";

// Constants defined outside component to prevent recreation
const UTILITY_ICONS: Record<string, { icon: React.ReactNode; label: string }> = {
    wifi: { icon: <Wifi size={22} />, label: "WiFi miễn phí" },
    air_conditioning: { icon: <Wind size={22} />, label: "Điều hòa" },
    balcony: { icon: <Maximize size={22} />, label: "Ban công" },
    washing_machine: { icon: <Waves size={22} />, label: "Máy giặt" },
    parking: { icon: <Car size={22} />, label: "Chỗ để xe" },
    elevator: { icon: <ShieldCheck size={22} />, label: "Thang máy" },
    security: { icon: <ShieldCheck size={22} />, label: "Bảo vệ 24/7" },
    flexible_hours: { icon: <Clock size={22} />, label: "Giờ giấc tự do" },
};

interface ListingDetailProps {
    listingId: string;
    onClose: () => void;
    onEdit: (listing: ListingDetailType) => void;
    onDeleted: () => void;
}

/* ─── Photo Gallery ─── */
function PhotoGallery({ images, title }: { images: string[]; title: string }) {
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);

    const openLightbox = (idx: number) => {
        setLightboxIndex(idx);
        setLightboxOpen(true);
    };

    const nextImage = () => setLightboxIndex((i) => (i + 1) % images.length);
    const prevImage = () => setLightboxIndex((i) => (i - 1 + images.length) % images.length);

    if (!images || images.length === 0) {
        return (
            <div className="w-full aspect-[16/7] bg-slate-100 rounded-xl flex flex-col items-center justify-center text-slate-400 gap-2">
                <ImageIcon size={48} />
                <span className="text-sm">Chưa có hình ảnh</span>
            </div>
        );
    }

    if (images.length === 1) {
        return (
            <>
                <div
                    className="w-full aspect-[16/7] rounded-xl overflow-hidden cursor-pointer group"
                    onClick={() => openLightbox(0)}
                >
                    <img src={images[0]} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                {lightboxOpen && (
                    <Lightbox images={images} index={lightboxIndex} onClose={() => setLightboxOpen(false)} onNext={nextImage} onPrev={prevImage} />
                )}
            </>
        );
    }

    // Grid layout: 1 large + up to 4 small
    const mainImg = images[0];
    const sideImgs = images.slice(1, 5);

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-2 rounded-xl overflow-hidden aspect-[16/7]">
                {/* Main image */}
                <div
                    className="md:col-span-2 md:row-span-2 cursor-pointer group relative"
                    onClick={() => openLightbox(0)}
                >
                    <img src={mainImg} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>

                {/* Side images */}
                {sideImgs.map((img, i) => (
                    <div
                        key={i}
                        className={`hidden md:block cursor-pointer group relative ${i === 1 ? "rounded-tr-xl" : ""} ${i === 3 ? "rounded-br-xl" : ""}`}
                        onClick={() => openLightbox(i + 1)}
                    >
                        <img src={img} alt={`${title} ${i + 2}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        {/* Show all photos button on last image */}
                        {i === sideImgs.length - 1 && images.length > 5 && (
                            <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-800 shadow-sm">
                                +{images.length - 5} ảnh
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {lightboxOpen && (
                <Lightbox images={images} index={lightboxIndex} onClose={() => setLightboxOpen(false)} onNext={nextImage} onPrev={prevImage} />
            )}
        </>
    );
}

/* ─── Lightbox ─── */
function Lightbox({
    images,
    index,
    onClose,
    onNext,
    onPrev,
}: {
    images: string[];
    index: number;
    onClose: () => void;
    onNext: () => void;
    onPrev: () => void;
}) {
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
            if (e.key === "ArrowRight") onNext();
            if (e.key === "ArrowLeft") onPrev();
        };
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [onClose, onNext, onPrev]);

    return (
        <div className="fixed inset-0 z-[3000] bg-black/95 flex items-center justify-center" onClick={onClose}>
            <button className="absolute top-4 right-4 text-white/80 hover:text-white p-2 z-10" onClick={onClose}>
                <X size={28} />
            </button>
            <button
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-all"
                onClick={(e) => { e.stopPropagation(); onPrev(); }}
            >
                <ChevronLeft size={28} />
            </button>
            <button
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-all"
                onClick={(e) => { e.stopPropagation(); onNext(); }}
            >
                <ChevronRight size={28} />
            </button>
            <img
                src={images[index]}
                alt={`Photo ${index + 1}`}
                className="max-h-[85vh] max-w-[90vw] object-contain rounded-lg"
                onClick={(e) => e.stopPropagation()}
            />
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/70 text-sm font-medium bg-black/50 px-4 py-1.5 rounded-full">
                {index + 1} / {images.length}
            </div>
        </div>
    );
}

/* ─── Host Info ─── */
function HostInfo({ listing }: { listing: ListingDetailType }) {
    const hostName = listing.contactName || listing.owner?.name || "Chủ nhà";
    const hostAvatar = listing.owner?.avatarUrl;

    return (
        <div className="flex items-center gap-4 py-6 border-b border-slate-200">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-lg font-bold text-white overflow-hidden flex-shrink-0">
                {hostAvatar ? (
                    <img src={hostAvatar} alt={hostName} className="w-full h-full object-cover" />
                ) : (
                    <span>{hostName[0]?.toUpperCase()}</span>
                )}
            </div>
            <div>
                <h3 className="text-base font-semibold text-slate-900">
                    Phòng trọ do {hostName} quản lý
                </h3>
                <p className="text-sm text-slate-500">
                    Đăng ngày {new Date(listing.createdAt).toLocaleDateString("vi-VN")}
                </p>
            </div>
        </div>
    );
}

/* ─── Amenities Section ─── */
function AmenitiesSection({ utilities }: { utilities: string[] }) {
    if (!utilities || utilities.length === 0) return null;

    return (
        <div className="py-6 border-b border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Nơi này có gì cho bạn</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {utilities.map((u) => {
                    const info = UTILITY_ICONS[u] || { icon: <ShieldCheck size={22} />, label: u };
                    return (
                        <div key={u} className="flex items-center gap-4 text-slate-700">
                            <span className="text-slate-500">{info.icon}</span>
                            <span className="text-sm">{info.label}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

/* ─── Sticky Price Card ─── */
function PriceCard({
    listing,
    isSaved,
    onSave,
    user,
    onEdit,
    onDelete,
}: {
    listing: ListingDetailType;
    isSaved: boolean;
    onSave: () => void;
    user: { id: string } | null;
    onEdit: () => void;
    onDelete: () => void;
}) {
    return (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-lg">
            {/* Price */}
            <div className="flex items-baseline gap-1.5 mb-5">
                <span className="text-2xl font-bold text-slate-900">
                    {formatPrice(listing.price)}
                </span>
                <span className="text-base text-slate-500 font-normal">/tháng</span>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 text-center">
                    <span className="block text-sm font-bold text-slate-800">{listing.area}</span>
                    <span className="text-xs text-slate-500">m²</span>
                </div>
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 text-center">
                    <div className="flex items-center justify-center gap-1">
                        <Star size={14} className="fill-amber-400 text-amber-400" />
                        <span className="text-sm font-bold text-slate-800">{listing.avgRating > 0 ? listing.avgRating.toFixed(1) : "Mới"}</span>
                    </div>
                    <span className="text-xs text-slate-500">{listing.reviews?.length || 0} đánh giá</span>
                </div>
            </div>

            {/* Service Fees */}
            <div className="space-y-3 mb-5 pb-5 border-b border-slate-200">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 flex items-center gap-2">
                        <Zap size={14} className="text-amber-500" />
                        Tiền điện
                    </span>
                    <span className="font-medium text-slate-800">
                        {listing.electricityFee ? formatPrice(listing.electricityFee) + "/kWh" : "Theo EVN"}
                    </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 flex items-center gap-2">
                        <Droplets size={14} className="text-blue-500" />
                        Tiền nước
                    </span>
                    <span className="font-medium text-slate-800">
                        {listing.waterFee ? formatPrice(listing.waterFee) + "/m³" : "Theo nhà nước"}
                    </span>
                </div>
            </div>

            {/* Contact */}
            {listing.contactPhone && (
                <a
                    href={`tel:${listing.contactPhone}`}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:shadow-lg hover:-translate-y-0.5 transition-all mb-3"
                >
                    <Phone size={16} />
                    Liên hệ ngay
                </a>
            )}

            {/* Save */}
            {user && (
                <button
                    onClick={onSave}
                    className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold transition-all border ${
                        isSaved
                            ? "bg-rose-50 border-rose-300 text-rose-600"
                            : "border-slate-300 text-slate-800 hover:bg-slate-50"
                    }`}
                    id="save-listing-btn"
                >
                    <Bookmark size={16} fill={isSaved ? "currentColor" : "none"} />
                    {isSaved ? "Đã lưu" : "Lưu tin"}
                </button>
            )}

            {/* Owner actions */}
            {user && user.id === listing.ownerId && (
                <div className="flex gap-2 mt-3">
                    <button
                        onClick={onEdit}
                        className="flex-1 py-2.5 rounded-lg text-sm font-medium border border-slate-200 text-slate-700 hover:border-emerald-300 hover:text-emerald-600 transition-all"
                        id="edit-listing-btn"
                    >
                        ✏️ Sửa tin
                    </button>
                    <button
                        onClick={onDelete}
                        className="flex-1 py-2.5 rounded-lg text-sm font-medium bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 transition-all"
                        id="delete-listing-btn"
                    >
                        🗑️ Xóa
                    </button>
                </div>
            )}
        </div>
    );
}

/* ─── Main Component ─── */
export default function ListingDetail({ listingId, onClose, onEdit, onDeleted }: ListingDetailProps) {
    const { user } = useAuth();
    const { toggleSaved } = useListingsStore();
    const [listing, setListing] = useState<ListingDetailType | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSaved, setIsSaved] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);
        listingsApi
            .getById(listingId)
            .then((data) => {
                setListing(data);
                setIsSaved(data.isSaved);
            })
            .catch(() => {
                // Fallback mock data for UI preview when API is unavailable
                setListing({
                    id: listingId,
                    title: "Studio Lake View – Tây Hồ, Hà Nội",
                    address: { street: "12 Nguyễn Đình Thi", ward: "Quảng An", district: "Quận Tây Hồ", city: "Hà Nội", province: "Hà Nội", lat: 21.065, lng: 105.822 },
                    price: 5500000,
                    area: 35,
                    utilities: ["wifi", "air_conditioning", "balcony", "washing_machine", "parking", "security", "flexible_hours"],
                    images: [
                        "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop",
                        "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&auto=format&fit=crop",
                        "https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?w=800&auto=format&fit=crop",
                        "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&auto=format&fit=crop",
                        "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&auto=format&fit=crop",
                    ],
                    owner: { id: "mock-owner", name: "Linh Nguyễn", avatarUrl: null },
                    avgRating: 4.86,
                    reviewCount: 44,
                    savedCount: 12,
                    createdAt: "2025-12-15T08:00:00Z",
                    electricityFee: 3500,
                    waterFee: 25000,
                    description: "Căn studio view hồ Tây tuyệt đẹp, nằm trên tầng cao với ban công rộng rãi hướng thẳng ra mặt hồ. Phòng được trang bị đầy đủ nội thất cao cấp, bao gồm giường đôi êm ái, bếp mini tiện nghi, và phòng tắm riêng biệt.\n\nVị trí thuận tiện, chỉ cách phố cổ 10 phút di chuyển, gần nhiều quán cafe và nhà hàng nổi tiếng. Khu vực yên tĩnh, an ninh tốt, phù hợp cho cả người đi làm và sinh viên.",
                    contactName: "Linh Nguyễn",
                    contactPhone: "0912345678",
                    ownerId: "mock-owner",
                    reviews: [],
                    starBreakdown: { 5: 30, 4: 10, 3: 3, 2: 1, 1: 0 },
                    isSaved: false,
                } as ListingDetailType);
            })
            .finally(() => setLoading(false));
    }, [listingId]);

    // Lock body scroll when detail is open
    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "";
        };
    }, []);

    const handleSave = useCallback(async () => {
        if (!user) {
            toast.error("Bạn cần đăng nhập để lưu tin.");
            return;
        }
        
        try {
            const saved = await toggleSaved(listingId);
            setIsSaved(saved);
            toast.success(saved ? "Đã lưu tin!" : "Đã bỏ lưu tin.");
        } catch {
            toast.error("Không thể lưu tin lúc này.");
        }
    }, [listingId, user, toggleSaved]);

    const handleDelete = useCallback(() => {
        toast("Bạn có chắc muốn xóa tin này?", {
            action: {
                label: "Xóa",
                onClick: async () => {
                    try {
                        await listingsApi.delete(listingId);
                        toast.success("Đã xóa tin thành công.");
                        onDeleted();
                        onClose();
                    } catch (err: unknown) {
                        toast.error(
                            "Lỗi khi xóa: " + (err instanceof Error ? err.message : "Không xác định")
                        );
                    }
                },
            },
            cancel: { label: "Hủy", onClick: () => {} },
        });
    }, [listingId, onDeleted, onClose]);

    const handleShare = useCallback(() => {
        navigator.clipboard.writeText(window.location.href);
        toast.success("Đã sao chép link!");
    }, []);

    return (
        <div className="fixed inset-0 z-[2000] bg-white overflow-y-auto animate-fade-in" id="listing-detail-page">
            {/* Loading */}
            {loading && (
                <div className="h-screen flex items-center justify-center">
                    <Loader />
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="h-screen flex flex-col items-center justify-center text-slate-500 gap-3">
                    <span className="text-4xl">😢</span>
                    <p>{error}</p>
                    <button onClick={onClose} className="mt-2 px-4 py-2 rounded-lg bg-slate-100 text-sm font-medium hover:bg-slate-200 transition-all">
                        Quay lại
                    </button>
                </div>
            )}

            {/* Content */}
            {listing && !loading && !error && (
                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
                    {/* ─── Top Bar ─── */}
                    <div className="flex items-center justify-between mb-5">
                        <button
                            onClick={onClose}
                            className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-slate-900 transition-all group"
                            id="back-btn"
                        >
                            <ArrowLeft size={18} className="group-hover:-translate-x-0.5 transition-transform" />
                            Quay lại
                        </button>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleShare}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 transition-all"
                            >
                                <Share2 size={15} />
                                <span className="hidden sm:inline">Chia sẻ</span>
                            </button>
                            {user && (
                                <button
                                    onClick={handleSave}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 transition-all"
                                >
                                    <Bookmark size={15} fill={isSaved ? "currentColor" : "none"} className={isSaved ? "text-rose-500" : ""} />
                                    <span className="hidden sm:inline">{isSaved ? "Đã lưu" : "Lưu"}</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* ─── Title ─── */}
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">{listing.title}</h1>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600 mb-5">
                        <div className="flex items-center gap-1">
                            <Star size={14} className="fill-slate-900 text-slate-900" />
                            <span className="font-semibold text-slate-900">{listing.avgRating > 0 ? listing.avgRating.toFixed(1) : "Mới"}</span>
                        </div>
                        <span className="text-slate-400">·</span>
                        <span className="underline cursor-pointer hover:text-slate-900">{listing.reviews?.length || 0} đánh giá</span>
                        <span className="text-slate-400">·</span>
                        <span className="flex items-center gap-1">
                            <MapPin size={14} />
                            {formatAddress(listing.address, { style: "full" })}
                        </span>
                    </div>

                    {/* ─── Photo Gallery ─── */}
                    <PhotoGallery images={listing.images || []} title={listing.title} />

                    {/* ─── Split Layout ─── */}
                    <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 mt-8">
                        {/* ─── Left Column ─── */}
                        <div className="flex-1 min-w-0">
                            {/* Host Info */}
                            <HostInfo listing={listing} />

                            {/* Description */}
                            {listing.description && (
                                <div className="py-6 border-b border-slate-200">
                                    <h3 className="text-lg font-semibold text-slate-900 mb-3">Giới thiệu về phòng</h3>
                                    <p className="text-sm sm:text-base leading-relaxed text-slate-700 whitespace-pre-line">
                                        {listing.description}
                                    </p>
                                </div>
                            )}

                            {/* Amenities */}
                            <AmenitiesSection utilities={listing.utilities} />

                            {/* Contact info (visible on mobile only since desktop has price card) */}
                            <div className="py-6 border-b border-slate-200 lg:hidden">
                                <h3 className="text-lg font-semibold text-slate-900 mb-3">Liên hệ</h3>
                                <div className="flex flex-col gap-3 text-sm text-slate-700">
                                    <div className="flex items-center gap-3">
                                        <User size={16} className="text-slate-400" />
                                        {listing.contactName || listing.owner?.name || "Chủ nhà"}
                                    </div>
                                    {listing.contactPhone && (
                                        <div className="flex items-center gap-3">
                                            <Phone size={16} className="text-slate-400" />
                                            <a href={`tel:${listing.contactPhone}`} className="text-emerald-600 font-medium hover:text-emerald-700">
                                                {listing.contactPhone}
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* ─── Right Column (Sticky Price Card) ─── */}
                        <div className="hidden lg:block w-[380px] flex-shrink-0">
                            <div className="sticky top-6">
                                <PriceCard
                                    listing={listing}
                                    isSaved={isSaved}
                                    onSave={handleSave}
                                    user={user}
                                    onEdit={() => onEdit(listing)}
                                    onDelete={handleDelete}
                                />
                            </div>
                        </div>
                    </div>

                    {/* ─── Mobile Price Bar (fixed bottom) ─── */}
                    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 py-3 flex items-center justify-between z-[2001] shadow-[0_-4px_12px_rgba(0,0,0,0.08)]">
                        <div>
                            <span className="text-lg font-bold text-slate-900">{formatPrice(listing.price)}</span>
                            <span className="text-sm text-slate-500"> /tháng</span>
                        </div>
                        {listing.contactPhone ? (
                            <a
                                href={`tel:${listing.contactPhone}`}
                                className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-600 shadow-md"
                            >
                                Liên hệ ngay
                            </a>
                        ) : (
                            <button
                                onClick={handleSave}
                                className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-600 shadow-md"
                            >
                                {isSaved ? "Đã lưu" : "Lưu tin"}
                            </button>
                        )}
                    </div>

                    {/* ─── Reviews (full width) ─── */}
                    <div className="mt-8 pb-24 lg:pb-8">
                        <ReviewSection listingId={listingId} />
                    </div>
                </div>
            )}
        </div>
    );
}
