import { useEffect } from 'react';
import { X } from 'lucide-react';
import { useListingsStore } from '../stores';
import { formatAddress } from '../lib/utils';
import { formatListingPrice } from '@/features/listings';
import { EmptyState, LoadingState } from './ui';

interface SavedListingsProps {
    visible: boolean;
    onClose: () => void;
    onSelectListing: (id: string) => void;
}

export default function SavedListings({ visible, onClose, onSelectListing }: SavedListingsProps) {
    const listings = useListingsStore((state) => state.savedListings);
    const loading = useListingsStore((state) => state.isLoadingSaved);
    const error = useListingsStore((state) => state.error);
    const fetchSavedListings = useListingsStore((state) => state.fetchSavedListings);

    useEffect(() => {
        if (visible) {
            fetchSavedListings();
        }
    }, [fetchSavedListings, visible]);

    if (!visible) return null;

    return (
        <div className="absolute top-0 right-0 w-[340px] h-full bg-white/95 backdrop-blur-xl border-l border-slate-200 z-[1500] flex flex-col animate-slide-right max-sm:w-full" id="saved-panel">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
                <h3 className="text-base font-semibold text-slate-950">Tin đã lưu</h3>
                <button onClick={onClose} className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 hover:bg-rose-50 hover:text-rose-600 flex items-center justify-center transition-all">
                    <X size={14} />
                </button>
            </div>

            {loading ? (
                <LoadingState title="Đang tải tin đã lưu" className="py-10" />
            ) : listings.length === 0 ? (
                <EmptyState title={error || "Bạn chưa lưu tin nào"} className="py-10" />
            ) : (
                <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
                    {listings?.map((l) => (
                        <div key={l.id} onClick={() => onSelectListing(l.id)} className="bg-white border border-slate-200 rounded-lg p-3 cursor-pointer hover:border-emerald-300 hover:bg-emerald-50/60 hover:-translate-y-0.5 transition-all">
                            <h4 className="text-sm font-semibold mb-1 text-slate-950">{l.title}</h4>
                            <p className="text-[11px] text-slate-500 mb-1.5">{formatAddress(l.address)}</p>
                            <div className="flex gap-2.5 text-xs">
                                <span className="font-semibold text-emerald-600">{formatListingPrice(l.price, " đ")}/tháng</span>
                                <span className="text-slate-400">{l.area} m²</span>
                                <span className="text-amber-400">★ {l.avgRating}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
