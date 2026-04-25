import { useState, useEffect, useCallback } from "react";
import { X, MapPin, User, Phone, Bookmark } from "lucide-react";
import { toast } from "sonner";
import { listingsApi } from "../services/api";
import { useAuth } from "../hooks/useAuth";
import { useListingsStore } from "../stores";
import { formatAddress, formatPrice } from "../lib/utils";
import ReviewSection from "./ReviewSection";
import type { ListingDetail as ListingDetailType } from "../types";
import Loader from "./ui/loading";

interface ListingDetailProps {
    listingId: string;
    onClose: () => void;
    onEdit: (listing: ListingDetailType) => void;
    onDeleted: () => void;
}

const UTILITY_LABELS: Record<string, string> = {
    wifi: "WiFi",
    air_conditioning: "Điều hòa",
    balcony: "Ban công",
    washing_machine: "Máy giặt",
    parking: "Chỗ để xe",
    elevator: "Thang máy",
    security: "Bảo vệ 24/7",
    flexible_hours: "Giờ giấc tự do"
};

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
            .catch((err: Error) => setError(err.message))
            .finally(() => setLoading(false));
    }, [listingId]);

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
                }
            },
            cancel: { label: "Hủy", onClick: () => {} }
        });
    }, [listingId, onDeleted, onClose]);

    return (
        <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[2000] flex items-center justify-center p-5 animate-fade-in"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div
                className="bg-white border border-slate-200 rounded-2xl max-h-[90vh] overflow-y-auto shadow-2xl w-[600px] max-w-full relative animate-modal-in"
                id="listing-detail-modal"
            >
                {/* Close */}
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-red-50 hover:text-red-500 flex items-center justify-center transition-all z-10"
                    id="close-detail-btn"
                >
                    <X size={18} />
                </button>

                {loading ? (
                    <div className="py-16 w-full flex justify-center">
                        <Loader />
                    </div>
                ) : error ? (
                    <div className="py-16 text-center text-slate-500">❌ {error}</div>
                ) : listing ? (
                    <div className="p-6">
                        {/* Header */}
                        <h2 className="text-xl font-bold mb-2 pr-10 text-slate-800">{listing.title}</h2>
                        <div className="flex flex-wrap gap-3 text-xs text-slate-500 mb-4">
                            <span className="flex items-center gap-1">
                                <MapPin size={12} />
                                {formatAddress(listing.address)}
                            </span>
                            <span>Đăng {new Date(listing.createdAt).toLocaleDateString("vi-VN")}</span>
                        </div>

                        {/* Price bar */}
                        <div className="flex items-center justify-between bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg p-4 mb-5">
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-extrabold text-emerald-600">
                                    {formatPrice(listing.price)}
                                </span>
                                <span className="text-sm text-slate-500">/tháng</span>
                            </div>
                            <div className="flex gap-3">
                                <div className="text-center px-3 py-1 bg-white rounded-lg border border-slate-200">
                                    <span className="block font-bold text-sm text-slate-800">
                                        {listing.area}
                                    </span>
                                    <span className="text-[11px] text-slate-500">m²</span>
                                </div>
                                <div className="text-center px-3 py-1 bg-white rounded-lg border border-slate-200">
                                    <span className="block font-bold text-sm text-amber-500">
                                        ★ {listing.avgRating}
                                    </span>
                                    <span className="text-[11px] text-slate-500">
                                        {listing.reviews?.length || 0} đánh giá
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        {listing.description && (
                            <div className="mb-5">
                                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 pb-1.5 border-b border-slate-200">
                                    Mô tả
                                </h3>
                                <p className="text-sm leading-relaxed text-slate-700">
                                    {listing.description}
                                </p>
                            </div>
                        )}

                        {/* Fees */}
                        <div className="mb-5">
                            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 pb-1.5 border-b border-slate-200">
                                Chi phí dịch vụ
                            </h3>
                            <div className="grid grid-cols-2 gap-2.5">
                                <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                                    <span className="text-[11px] text-slate-500 block">Tiền điện</span>
                                    <span className="font-semibold text-sm text-slate-800">
                                        {listing.electricityFee
                                            ? formatPrice(listing.electricityFee) + "/kWh"
                                            : "Theo EVN"}
                                    </span>
                                </div>
                                <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                                    <span className="text-[11px] text-slate-500 block">Tiền nước</span>
                                    <span className="font-semibold text-sm text-slate-800">
                                        {listing.waterFee
                                            ? formatPrice(listing.waterFee) + "/m³"
                                            : "Theo nhà nước"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Utilities */}
                        {listing.utilities?.length > 0 && (
                            <div className="mb-5">
                                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 pb-1.5 border-b border-slate-200">
                                    Tiện ích
                                </h3>
                                <div className="flex flex-wrap gap-1.5">
                                    {listing.utilities.map((u) => (
                                        <span
                                            key={u}
                                            className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full text-xs text-emerald-600 font-medium"
                                        >
                                            {UTILITY_LABELS[u] || u}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Contact */}
                        <div className="mb-5">
                            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 pb-1.5 border-b border-slate-200">
                                Liên hệ
                            </h3>
                            <div className="flex flex-col gap-2 text-sm text-slate-700">
                                <div className="flex items-center gap-2">
                                    <User size={14} className="text-slate-400 shrink-0" />
                                    {listing.contactName || listing.owner?.name || "Chủ nhà"}
                                </div>
                                {listing.contactPhone && (
                                    <div className="flex items-center gap-2">
                                        <Phone size={14} className="text-slate-400 shrink-0" />
                                        <a
                                            href={`tel:${listing.contactPhone}`}
                                            className="text-emerald-600 hover:text-emerald-700"
                                        >
                                            {listing.contactPhone}
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 mb-5 flex-wrap">
                            {user && (
                                <button
                                    onClick={handleSave}
                                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all border ${isSaved ? "bg-emerald-50 border-emerald-500 text-emerald-600" : "border-slate-200 text-slate-600 hover:border-emerald-300 hover:text-emerald-600"}`}
                                    id="save-listing-btn"
                                >
                                    <Bookmark size={14} fill={isSaved ? "currentColor" : "none"} />
                                    {isSaved ? "Đã lưu" : "Lưu tin"}
                                </button>
                            )}
                            {user && user.id === listing.ownerId && (
                                <>
                                    <button
                                        onClick={() => onEdit(listing)}
                                        className="px-4 py-2 rounded-lg text-sm font-medium border border-slate-200 text-slate-600 hover:border-emerald-300 hover:text-emerald-600 transition-all"
                                        id="edit-listing-btn"
                                    >
                                        ✏️ Sửa tin
                                    </button>
                                    <button
                                        onClick={handleDelete}
                                        className="px-4 py-2 rounded-lg text-sm font-medium bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 transition-all"
                                        id="delete-listing-btn"
                                    >
                                        🗑️ Xóa tin
                                    </button>
                                </>
                            )}
                        </div>

                        <ReviewSection listingId={listingId} />
                    </div>
                ) : null}
            </div>
        </div>
    );
}
