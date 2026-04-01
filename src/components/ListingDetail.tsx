import { useState, useEffect } from 'react';
import { X, MapPin, User, Phone, Bookmark } from 'lucide-react';
import { toast } from 'sonner';
import { listingsApi, savedApi } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import ReviewSection from './ReviewSection';
import type { ListingDetail as ListingDetailType } from '../types';

const UTILITY_LABELS: Record<string, string> = {
    wifi: 'WiFi', air_conditioning: 'Điều hòa', balcony: 'Ban công',
    washing_machine: 'Máy giặt', parking: 'Chỗ để xe', elevator: 'Thang máy',
    security: 'Bảo vệ 24/7', flexible_hours: 'Giờ giấc tự do',
};

const formatPrice = (p: number) => new Intl.NumberFormat('vi-VN').format(p) + ' đ';

interface ListingDetailProps {
    listingId: string;
    onClose: () => void;
    onEdit: (listing: ListingDetailType) => void;
    onDeleted: () => void;
}

export default function ListingDetail({ listingId, onClose, onEdit, onDeleted }: ListingDetailProps) {
    const { user } = useAuth();
    const [listing, setListing] = useState<ListingDetailType | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSaved, setIsSaved] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);
        listingsApi.getById(listingId)
            .then((data) => { setListing(data); setIsSaved(data.isSaved); })
            .catch((err: Error) => setError(err.message))
            .finally(() => setLoading(false));
    }, [listingId]);

    const handleSave = async () => {
        try {
            const r = await savedApi.toggle(listingId);
            setIsSaved(r.saved);
            toast.success(r.saved ? 'Đã lưu tin!' : 'Đã bỏ lưu tin.');
        } catch {
            toast.error('Bạn cần đăng nhập để lưu tin.');
        }
    };

    const handleDelete = async () => {
        toast('Bạn có chắc muốn xóa tin này?', {
            action: {
                label: 'Xóa',
                onClick: async () => {
                    try {
                        await listingsApi.delete(listingId);
                        toast.success('Đã xóa tin thành công.');
                        onDeleted();
                        onClose();
                    } catch (err: unknown) {
                        toast.error('Lỗi khi xóa: ' + (err instanceof Error ? err.message : 'Không xác định'));
                    }
                },
            },
            cancel: { label: 'Hủy', onClick: () => { } },
        });
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[2000] flex items-center justify-center p-5 animate-fade-in" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="bg-[var(--color-bg-secondary)] border border-white/[0.08] rounded-2xl max-h-[90vh] overflow-y-auto shadow-2xl w-[600px] max-w-full relative animate-modal-in" id="listing-detail-modal">
                {/* Close */}
                <button onClick={onClose} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/[0.06] text-slate-400 hover:bg-red-500/20 hover:text-red-400 flex items-center justify-center transition-all z-10" id="close-detail-btn">
                    <X size={18} />
                </button>

                {loading ? (
                    <div className="py-16 text-center text-slate-400">
                        <div className="w-7 h-7 border-[3px] border-white/[0.08] border-t-indigo-500 rounded-full animate-spin mx-auto mb-3" />
                        <p>Đang tải...</p>
                    </div>
                ) : error ? (
                    <div className="py-16 text-center text-slate-400">❌ {error}</div>
                ) : listing ? (
                    <div className="p-6">
                        {/* Header */}
                        <h2 className="text-xl font-bold mb-2 pr-10">{listing.title}</h2>
                        <div className="flex flex-wrap gap-3 text-xs text-slate-400 mb-4">
                            <span className="flex items-center gap-1">
                                <MapPin size={12} />
                                {listing.address}
                            </span>
                            <span>Đăng {new Date(listing.createdAt).toLocaleDateString('vi-VN')}</span>
                        </div>

                        {/* Price bar */}
                        <div className="flex items-center justify-between bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-lg p-4 mb-5">
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-extrabold text-indigo-300">{formatPrice(listing.price)}</span>
                                <span className="text-sm text-slate-400">/tháng</span>
                            </div>
                            <div className="flex gap-3">
                                <div className="text-center px-3 py-1 bg-white/[0.06] rounded-lg">
                                    <span className="block font-bold text-sm">{listing.area}</span>
                                    <span className="text-[11px] text-slate-500">m²</span>
                                </div>
                                <div className="text-center px-3 py-1 bg-white/[0.06] rounded-lg">
                                    <span className="block font-bold text-sm text-amber-400">★ {listing.avgRating}</span>
                                    <span className="text-[11px] text-slate-500">{listing.reviews?.length || 0} đánh giá</span>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        {listing.description && (
                            <div className="mb-5">
                                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2 pb-1.5 border-b border-white/[0.08]">Mô tả</h3>
                                <p className="text-sm leading-relaxed">{listing.description}</p>
                            </div>
                        )}

                        {/* Fees */}
                        <div className="mb-5">
                            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2 pb-1.5 border-b border-white/[0.08]">Chi phí dịch vụ</h3>
                            <div className="grid grid-cols-2 gap-2.5">
                                <div className="bg-white/[0.04] rounded-lg p-3">
                                    <span className="text-[11px] text-slate-500 block">Tiền điện</span>
                                    <span className="font-semibold text-sm">{listing.electricityFee ? formatPrice(listing.electricityFee) + '/kWh' : 'Theo EVN'}</span>
                                </div>
                                <div className="bg-white/[0.04] rounded-lg p-3">
                                    <span className="text-[11px] text-slate-500 block">Tiền nước</span>
                                    <span className="font-semibold text-sm">{listing.waterFee ? formatPrice(listing.waterFee) + '/m³' : 'Theo nhà nước'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Utilities */}
                        {listing.utilities?.length > 0 && (
                            <div className="mb-5">
                                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2 pb-1.5 border-b border-white/[0.08]">Tiện ích</h3>
                                <div className="flex flex-wrap gap-1.5">
                                    {listing.utilities.map((u) => (
                                        <span key={u} className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/25 rounded-full text-xs text-emerald-400 font-medium">
                                            {UTILITY_LABELS[u] || u}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Contact */}
                        <div className="mb-5">
                            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2 pb-1.5 border-b border-white/[0.08]">Liên hệ</h3>
                            <div className="flex flex-col gap-2 text-sm">
                                <div className="flex items-center gap-2">
                                    <User size={14} className="text-slate-500 shrink-0" />
                                    {listing.contactName || listing.owner?.name || 'Chủ nhà'}
                                </div>
                                {listing.contactPhone && (
                                    <div className="flex items-center gap-2">
                                        <Phone size={14} className="text-slate-500 shrink-0" />
                                        <a href={`tel:${listing.contactPhone}`} className="text-indigo-400 hover:text-indigo-300">{listing.contactPhone}</a>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 mb-5 flex-wrap">
                            {user && (
                                <button onClick={handleSave} className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all border ${isSaved ? 'bg-indigo-500/15 border-indigo-500 text-indigo-400' : 'border-white/[0.08] text-slate-400 hover:border-white/[0.15]'}`} id="save-listing-btn">
                                    <Bookmark size={14} fill={isSaved ? 'currentColor' : 'none'} />
                                    {isSaved ? 'Đã lưu' : 'Lưu tin'}
                                </button>
                            )}
                            {user && user.id === listing.ownerId && (
                                <>
                                    <button onClick={() => onEdit(listing)} className="px-4 py-2 rounded-lg text-sm font-medium border border-white/[0.08] text-slate-400 hover:border-white/[0.15] transition-all" id="edit-listing-btn">✏️ Sửa tin</button>
                                    <button onClick={handleDelete} className="px-4 py-2 rounded-lg text-sm font-medium bg-red-500/15 border border-red-500/30 text-red-400 hover:bg-red-500/25 transition-all" id="delete-listing-btn">🗑️ Xóa tin</button>
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
