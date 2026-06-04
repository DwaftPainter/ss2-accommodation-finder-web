import { useState, useEffect, useCallback } from "react";
import {
    ArrowLeft,
    User,
    Phone,
    Bookmark,
    Share2,
    Star,
    Wifi,
    Car,
    ShieldCheck,
    Clock,
    Maximize,
    Waves,
    Snowflake,
    Refrigerator,
    Tv,
    Armchair,
    Building2,
    ImageIcon,
    Zap,
    Droplets,
    X,
    ChevronLeft,
    ChevronRight,
    MessageSquare,
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { listingsApi, chatApi } from "../services/api";
import { useAuth } from "../hooks/use-auth";
import { useListingsStore } from "../stores";
import { cn, formatAddress, formatPrice } from "../lib/utils";
import ReviewSection from "./review-section";
import type { ListingDetail as ListingDetailType } from "../types";
import { Button, ErrorState, LoadingState, MapPinIcon, SectionContainer } from "./ui";
import { LISTING_MESSAGES, getErrorMessage } from "../config/messages";

// Constants defined outside component to prevent recreation
const UTILITY_ICONS: Record<string, { icon: React.ReactNode; label: string }> = {
    wifi: { icon: <Wifi size={22} />, label: "WiFi miễn phí" },
    ac: { icon: <Snowflake size={22} />, label: "Điều hòa" },
    air_conditioning: { icon: <Snowflake size={22} />, label: "Điều hòa" },
    balcony: { icon: <Maximize size={22} />, label: "Ban công" },
    washing_machine: { icon: <Waves size={22} />, label: "Máy giặt" },
    parking: { icon: <Car size={22} />, label: "Chỗ để xe" },
    elevator: { icon: <Building2 size={22} />, label: "Thang máy" },
    security: { icon: <ShieldCheck size={22} />, label: "Bảo vệ 24/7" },
    flexible_hours: { icon: <Clock size={22} />, label: "Giờ giấc tự do" },
    fridge: { icon: <Refrigerator size={22} />, label: "Tủ lạnh" },
    tv: { icon: <Tv size={22} />, label: "TV" },
    furnished: { icon: <Armchair size={22} />, label: "Đầy đủ nội thất" },
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
            <div className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-200 bg-slate-50 text-slate-400 sm:aspect-[16/9] lg:aspect-[16/7]">
                <ImageIcon size={42} aria-hidden="true" />
                <span className="text-sm">Chưa có hình ảnh</span>
            </div>
        );
    }

    if (images.length === 1) {
        return (
            <>
                <button
                    type="button"
                    className="group aspect-[4/3] w-full overflow-hidden rounded-xl bg-slate-100 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/25 focus-visible:ring-offset-2 sm:aspect-[16/9] lg:aspect-[16/7]"
                    onClick={() => openLightbox(0)}
                    aria-label="Xem ảnh phòng"
                >
                    <img src={images[0]} alt={title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                </button>
                {lightboxOpen && (
                    <Lightbox images={images} index={lightboxIndex} onClose={() => setLightboxOpen(false)} onNext={nextImage} onPrev={prevImage} />
                )}
            </>
        );
    }

    // Grid layout: 1 large + up to 4 small
    const mainImg = images[0];
    const sideImgs = images.slice(1, 5);
    const getSideImageClass = (index: number) => {
        if (sideImgs.length === 1) return "md:col-span-2 md:row-span-2";
        if (sideImgs.length === 2) return "md:col-span-2";
        if (sideImgs.length === 3 && index === 2) return "md:col-span-2";
        return "";
    };

    return (
        <>
            <div className="grid aspect-[4/3] grid-cols-1 gap-2 overflow-hidden rounded-xl bg-slate-100 sm:aspect-[16/9] md:aspect-[16/7] md:grid-cols-4 md:grid-rows-2">
                {/* Main image */}
                <button
                    type="button"
                    className="group relative text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-500 md:col-span-2 md:row-span-2"
                    onClick={() => openLightbox(0)}
                    aria-label="Xem ảnh chính của phòng"
                >
                    <img src={mainImg} alt={title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <span className="absolute bottom-3 right-3 rounded-lg bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-sm backdrop-blur-sm md:hidden">
                        {images.length} ảnh
                    </span>
                </button>

                {/* Side images */}
                {sideImgs.map((img, i) => (
                    <button
                        type="button"
                        key={i}
                        className={cn(
                            "group relative hidden text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-500 md:block",
                            getSideImageClass(i),
                            i === 1 && "rounded-tr-xl",
                            i === 3 && "rounded-br-xl"
                        )}
                        onClick={() => openLightbox(i + 1)}
                        aria-label={`Xem ảnh phòng ${i + 2}`}
                    >
                        <img src={img} alt={`${title} ${i + 2}`} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        {/* Show all photos button on last image */}
                        {i === sideImgs.length - 1 && images.length > 5 && (
                            <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-800 shadow-sm">
                                +{images.length - 5} ảnh
                            </div>
                        )}
                    </button>
                ))}
            </div>
            <div className="mt-2 flex gap-2 overflow-x-auto pb-1 md:hidden">
                {images.map((img, i) => (
                    <button
                        type="button"
                        key={img + i}
                        className={cn(
                            "h-16 w-20 shrink-0 overflow-hidden rounded-lg bg-slate-100 ring-1 ring-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40",
                            i === lightboxIndex && "ring-2 ring-emerald-500"
                        )}
                        onClick={() => openLightbox(i)}
                        aria-label={`Xem ảnh phòng ${i + 1}`}
                    >
                        <img src={img} alt={`${title} ${i + 1}`} className="h-full w-full object-cover" />
                    </button>
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
        <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/95 p-4" onClick={onClose} role="dialog" aria-modal="true">
            <button
                type="button"
                className="absolute right-4 top-4 z-10 rounded-full p-2 text-white/80 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                onClick={onClose}
                aria-label="Đóng thư viện ảnh"
            >
                <X size={28} aria-hidden="true" />
            </button>
            {images.length > 1 && (
                <>
                    <button
                        type="button"
                        className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white/70 transition-all hover:bg-white/20 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 sm:left-4"
                        onClick={(e) => { e.stopPropagation(); onPrev(); }}
                        aria-label="Xem ảnh trước"
                    >
                        <ChevronLeft size={28} aria-hidden="true" />
                    </button>
                    <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white/70 transition-all hover:bg-white/20 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 sm:right-4"
                        onClick={(e) => { e.stopPropagation(); onNext(); }}
                        aria-label="Xem ảnh tiếp theo"
                    >
                        <ChevronRight size={28} aria-hidden="true" />
                    </button>
                </>
            )}
            <img
                src={images[index]}
                alt={`Ảnh phòng ${index + 1}`}
                className="max-h-[85vh] max-w-[92vw] rounded-lg object-contain"
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
        <div className="flex items-start gap-4 border-b border-slate-200 py-6 sm:items-center">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 text-lg font-bold text-white">
                {hostAvatar ? (
                    <img src={hostAvatar} alt={hostName} className="w-full h-full object-cover" />
                ) : (
                    <span>{hostName[0]?.toUpperCase()}</span>
                )}
            </div>
            <div className="min-w-0">
                <h3 className="break-words text-base font-semibold leading-6 text-slate-900">
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
        <section className="border-b border-slate-200 py-6" aria-labelledby="amenities-heading">
            <h3 id="amenities-heading" className="mb-4 text-lg font-semibold text-slate-900">Nơi này có gì cho bạn</h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                {utilities.map((u) => {
                    const info = UTILITY_ICONS[u] || { icon: <ShieldCheck size={22} />, label: u };
                    return (
                        <div key={u} className="flex min-w-0 items-center gap-3 rounded-lg bg-slate-50 px-3 py-2 text-slate-700 ring-1 ring-slate-100">
                            <span className="shrink-0 text-slate-500">{info.icon}</span>
                            <span className="min-w-0 break-words text-sm">{info.label}</span>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}

/* ─── Sticky Price Card ─── */
function PriceCard({
    listing,
    isSaved,
    onSave,
    onChat,
    user,
    onEdit,
    onDelete,
}: {
    listing: ListingDetailType;
    isSaved: boolean;
    onSave: () => void;
    onChat: () => void;
    user: { id: string } | null;
    onEdit: () => void;
    onDelete: () => void;
}) {
    return (
        <aside className="rounded-xl border border-slate-200 bg-white p-5 shadow-lg shadow-slate-200/60 lg:p-6" aria-label="Thông tin giá và liên hệ">
            {/* Price */}
            <div className="mb-5 flex flex-wrap items-baseline gap-x-1.5 gap-y-1">
                <span className="break-words text-2xl font-bold text-slate-900">
                    {formatPrice(listing.price)}
                </span>
                <span className="text-base text-slate-500 font-normal">/tháng</span>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-center">
                    <span className="block text-sm font-bold text-slate-800">{listing.area}</span>
                    <span className="text-xs text-slate-500">m²</span>
                </div>
                <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                        <Star size={14} className="fill-amber-400 text-amber-400" aria-hidden="true" />
                        <span className="text-sm font-bold text-slate-800">{listing.avgRating > 0 ? listing.avgRating.toFixed(1) : "Mới"}</span>
                    </div>
                    <span className="text-xs text-slate-500">{listing.reviews?.length || 0} đánh giá</span>
                </div>
            </div>

            {/* Service Fees */}
            <div className="space-y-3 mb-5 pb-5 border-b border-slate-200">
                <div className="flex items-center justify-between gap-4 text-sm">
                    <span className="flex items-center gap-2 text-slate-600">
                        <Zap size={14} className="shrink-0 text-amber-500" aria-hidden="true" />
                        Tiền điện
                    </span>
                    <span className="text-right font-medium text-slate-800">
                        {listing.electricityFee ? formatPrice(listing.electricityFee) + "/kWh" : "Theo EVN"}
                    </span>
                </div>
                <div className="flex items-center justify-between gap-4 text-sm">
                    <span className="flex items-center gap-2 text-slate-600">
                        <Droplets size={14} className="shrink-0 text-blue-500" aria-hidden="true" />
                        Tiền nước
                    </span>
                    <span className="text-right font-medium text-slate-800">
                        {listing.waterFee ? formatPrice(listing.waterFee) + "/m³" : "Theo nhà nước"}
                    </span>
                </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2">
                <Button
                    type="button"
                    onClick={onChat}
                    variant="primary"
                    size="lg"
                    className="w-full gap-2"
                >
                    <MessageSquare size={16} aria-hidden="true" />
                    Nhắn tin chủ nhà
                </Button>

                {listing.contactPhone && (
                    <a
                        href={`tel:${listing.contactPhone}`}
                        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-emerald-600 px-6 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/25 focus-visible:ring-offset-2"
                    >
                        <Phone size={16} aria-hidden="true" />
                        Gọi ngay
                    </a>
                )}
            </div>

            {/* Save */}
            {user && (
                <Button
                    type="button"
                    onClick={onSave}
                    variant="outline"
                    className={cn(
                        "mt-2 w-full gap-2",
                        isSaved && "border-rose-300 bg-rose-50 text-rose-600 hover:bg-rose-50"
                    )}
                    id="save-listing-btn"
                >
                    <Bookmark size={16} fill={isSaved ? "currentColor" : "none"} aria-hidden="true" />
                    {isSaved ? "Đã lưu" : "Lưu tin"}
                </Button>
            )}

            {/* Owner actions */}
            {user && user.id === listing.ownerId && (
                <div className="flex gap-2 mt-3">
                    <Button
                        type="button"
                        onClick={onEdit}
                        variant="outline"
                        className="flex-1"
                        id="edit-listing-btn"
                    >
                        Sửa tin
                    </Button>
                    <Button
                        type="button"
                        onClick={onDelete}
                        variant="destructive"
                        className="flex-1 bg-red-50 text-red-600 hover:bg-red-100"
                        id="delete-listing-btn"
                    >
                        Xóa
                    </Button>
                </div>
            )}
        </aside>
    );
}

/* ─── Main Component ─── */
export default function ListingDetail({ listingId, onClose, onEdit, onDeleted }: ListingDetailProps) {
    const { user } = useAuth();
    const navigate = useNavigate();
    const isSaved = useListingsStore(state => state.isListingSaved(listingId));
    const toggleSaved = useListingsStore(state => state.toggleSaved);
    const fetchSavedListings = useListingsStore(state => state.fetchSavedListings);
    const [listing, setListing] = useState<ListingDetailType | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const handleChat = useCallback(async () => {
        if (!user) {
            toast.error("Bạn cần đăng nhập để nhắn tin.");
            return;
        }

        if (!listing) return;

        try {
            const chat = await chatApi.createChat(listing.ownerId, listing.id);
            onClose();
            navigate(`/finder/chat?id=${chat.id}`);
        } catch (err) {
            console.error("Failed to create chat:", err);
            toast.error("Không thể bắt đầu cuộc trò chuyện lúc này.");
        }
    }, [listing, user, navigate, onClose]);

    useEffect(() => {
        setLoading(true);
        setError(null);
        listingsApi
            .getById(listingId)
            .then((data) => {
                setListing(data);
            })
            .catch((err) => {
                console.error("Failed to fetch listing:", err);
                setError("Không thể tải thông tin phòng trọ. Vui lòng thử lại sau.");
            })
            .finally(() => setLoading(false));

        if (user) {
            fetchSavedListings();
        }
    }, [listingId, user, fetchSavedListings]);

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
                        toast.error(getErrorMessage(err, LISTING_MESSAGES.DELETE_ERROR));
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
        <div className="fixed inset-0 z-[2000] animate-fade-in overflow-y-auto bg-white" id="listing-detail-page">
            {/* Loading */}
            {loading && (
                <LoadingState className="min-h-dvh" title="Đang tải thông tin phòng" />
            )}

            {/* Error */}
            {error && (
                <div className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-4 px-4">
                    <ErrorState description={error} />
                    <Button type="button" onClick={onClose} variant="outline">
                        Quay lại
                    </Button>
                </div>
            )}

            {/* Content */}
            {listing && !loading && !error && (
                <SectionContainer as="main" size="lg" className="py-4 sm:py-6">
                    {/* ─── Top Bar ─── */}
                    <div className="mb-5 flex items-center justify-between gap-3">
                        <Button
                            type="button"
                            onClick={onClose}
                            variant="ghost"
                            className="group shrink-0"
                            id="back-btn"
                        >
                            <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-0.5" aria-hidden="true" />
                            Quay lại
                        </Button>
                        <div className="flex min-w-0 items-center gap-1 sm:gap-2">
                            <Button
                                type="button"
                                onClick={handleShare}
                                variant="ghost"
                                size="sm"
                                aria-label="Chia sẻ tin"
                            >
                                <Share2 size={15} aria-hidden="true" />
                                <span className="hidden sm:inline">Chia sẻ</span>
                            </Button>
                            {user && (
                                <Button
                                    type="button"
                                    onClick={handleSave}
                                    variant="ghost"
                                    size="sm"
                                    aria-label={isSaved ? "Bỏ lưu tin" : "Lưu tin"}
                                >
                                    <Bookmark size={15} fill={isSaved ? "currentColor" : "none"} className={isSaved ? "text-rose-500" : ""} aria-hidden="true" />
                                    <span className="hidden sm:inline">{isSaved ? "Đã lưu" : "Lưu"}</span>
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* ─── Title ─── */}
                    <h1 className="mb-2 break-words text-2xl font-bold leading-tight text-slate-950 sm:text-3xl">{listing.title}</h1>
                    <div className="mb-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-slate-600">
                        <div className="flex shrink-0 items-center gap-1">
                            <Star size={14} className="fill-slate-900 text-slate-900" aria-hidden="true" />
                            <span className="font-semibold text-slate-900">{listing.avgRating > 0 ? listing.avgRating.toFixed(1) : "Mới"}</span>
                        </div>
                        <span className="text-slate-400" aria-hidden="true">·</span>
                        <span className="shrink-0 underline underline-offset-2">{listing.reviews?.length || 0} đánh giá</span>
                        <span className="hidden text-slate-400 sm:inline" aria-hidden="true">·</span>
                        <span className="flex min-w-0 basis-full items-start gap-1 sm:basis-auto">
                            <MapPinIcon size={14} className="mt-0.5 shrink-0" />
                            <span className="min-w-0 break-words">{formatAddress(listing.address, { style: "full" })}</span>
                        </span>
                    </div>

                    {/* ─── Photo Gallery ─── */}
                    <PhotoGallery images={listing.images || []} title={listing.title} />

                    {/* ─── Split Layout ─── */}
                    <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:gap-10 xl:gap-12">
                        {/* ─── Left Column ─── */}
                        <div className="flex-1 min-w-0">
                            {/* Host Info */}
                            <HostInfo listing={listing} />

                            {/* Description */}
                            {listing.description && (
                                <section className="border-b border-slate-200 py-6" aria-labelledby="description-heading">
                                    <h3 id="description-heading" className="mb-3 text-lg font-semibold text-slate-900">Giới thiệu về phòng</h3>
                                    <p className="whitespace-pre-line break-words text-sm leading-7 text-slate-700 sm:text-base">
                                        {listing.description}
                                    </p>
                                </section>
                            )}

                            {/* Amenities */}
                            <AmenitiesSection utilities={listing.utilities} />

                            {/* Contact info (visible on mobile only since desktop has price card) */}
                            <section className="border-b border-slate-200 py-6 lg:hidden" aria-labelledby="mobile-contact-heading">
                                <h3 id="mobile-contact-heading" className="mb-3 text-lg font-semibold text-slate-900">Liên hệ</h3>
                                <div className="flex flex-col gap-3 text-sm text-slate-700">
                                    <div className="flex min-w-0 items-start gap-3">
                                        <User size={16} className="mt-0.5 shrink-0 text-slate-400" aria-hidden="true" />
                                        <span className="min-w-0 break-words">{listing.contactName || listing.owner?.name || "Chủ nhà"}</span>
                                    </div>
                                    {listing.contactPhone && (
                                        <div className="flex min-w-0 items-start gap-3">
                                            <Phone size={16} className="mt-0.5 shrink-0 text-slate-400" aria-hidden="true" />
                                            <a href={`tel:${listing.contactPhone}`} className="min-w-0 break-words font-medium text-emerald-700 hover:text-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/25">
                                                {listing.contactPhone}
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </section>
                        </div>

                        {/* ─── Right Column (Sticky Price Card) ─── */}
                        <div className="hidden w-[340px] shrink-0 lg:block xl:w-[380px]">
                            <div className="sticky top-6">
                                <PriceCard
                                    listing={listing}
                                    isSaved={isSaved}
                                    onSave={handleSave}
                                    onChat={handleChat}
                                    user={user}
                                    onEdit={() => onEdit(listing)}
                                    onDelete={handleDelete}
                                />
                            </div>
                        </div>
                    </div>

                    {/* ─── Mobile Price Bar (fixed bottom) ─── */}
                    <div className="fixed bottom-0 left-0 right-0 z-[2001] flex items-center justify-between gap-3 border-t border-slate-200 bg-white px-4 py-3 shadow-[0_-4px_12px_rgba(0,0,0,0.08)] lg:hidden">
                        <div className="min-w-0">
                            <span className="block truncate text-lg font-bold leading-6 text-slate-900">{formatPrice(listing.price)}</span>
                            <span className="block text-sm text-slate-500">/tháng</span>
                        </div>
                        <div className="flex shrink-0 gap-2">
                            <Button
                                type="button"
                                onClick={handleChat}
                                variant="outline"
                                size="icon"
                                aria-label="Nhắn tin chủ nhà"
                                className="border-emerald-600 text-emerald-700 hover:bg-emerald-50"
                            >
                                <MessageSquare size={20} aria-hidden="true" />
                            </Button>
                            {listing.contactPhone ? (
                                <a
                                    href={`tel:${listing.contactPhone}`}
                                    className="inline-flex h-10 items-center justify-center rounded-lg bg-linear-to-r from-emerald-500 to-teal-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:from-emerald-600 hover:to-teal-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/25 focus-visible:ring-offset-2 sm:px-6"
                                >
                                    Gọi ngay
                                </a>
                            ) : (
                                <Button
                                    type="button"
                                    onClick={handleSave}
                                    variant="primary"
                                    className="px-4 sm:px-6"
                                >
                                    {isSaved ? "Đã lưu" : "Lưu tin"}
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* ─── Reviews (full width) ─── */}
                    <div className="mt-8 pb-24 lg:pb-8">
                        <ReviewSection listingId={listingId} />
                    </div>
                </SectionContainer>
            )}
        </div>
    );
}
