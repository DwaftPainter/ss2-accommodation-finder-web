import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { savedApi } from '../services/api';
import type { SavedListing } from '../types';

const formatPrice = (p: number) => new Intl.NumberFormat('vi-VN').format(p) + ' đ';

interface SavedListingsProps {
    visible: boolean;
    onClose: () => void;
    onSelectListing: (id: string) => void;
}

export default function SavedListings({ visible, onClose, onSelectListing }: SavedListingsProps) {
    const [listings, setListings] = useState<SavedListing[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (visible) {
            setLoading(true);
            savedApi.getAll().then(setListings).catch(console.error).finally(() => setLoading(false));
        }
    }, [visible]);

    if (!visible) return null;

    return (
        <div className="absolute top-0 right-0 w-[340px] h-full bg-[var(--color-bg-glass)] backdrop-blur-xl border-l border-white/[0.08] z-[1500] flex flex-col animate-slide-right max-sm:w-full" id="saved-panel">
            <div className="flex items-center justify-between p-4 border-b border-white/[0.08]">
                <h3 className="text-base font-semibold">📌 Tin đã lưu</h3>
                <button onClick={onClose} className="w-7 h-7 rounded-full bg-white/[0.06] text-slate-400 hover:bg-red-500/20 hover:text-red-400 flex items-center justify-center transition-all">
                    <X size={14} />
                </button>
            </div>

            {loading ? (
                <div className="py-10 text-center">
                    <div className="w-7 h-7 border-[3px] border-white/[0.08] border-t-indigo-500 rounded-full animate-spin mx-auto" />
                </div>
            ) : listings.length === 0 ? (
                <div className="py-10 text-center text-slate-500 text-sm">Bạn chưa lưu tin nào</div>
            ) : (
                <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
                    {listings.map((l) => (
                        <div key={l.id} onClick={() => onSelectListing(l.id)} className="bg-white/[0.04] border border-white/[0.08] rounded-lg p-3 cursor-pointer hover:border-indigo-500 hover:bg-indigo-500/[0.05] hover:-translate-y-0.5 transition-all">
                            <h4 className="text-sm font-semibold mb-1">{l.title}</h4>
                            <p className="text-[11px] text-slate-500 mb-1.5">{l.address}</p>
                            <div className="flex gap-2.5 text-xs">
                                <span className="font-semibold text-indigo-400">{formatPrice(l.price)}/tháng</span>
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
