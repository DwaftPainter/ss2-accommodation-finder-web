import { MapPin, Star } from 'lucide-react';
import type { ListingSummary } from '../types/listing.type';

interface ExploreViewProps {
    listings: ListingSummary[];
    onSelectListing: (id: string) => void;
}

export default function ExploreView({ listings, onSelectListing }: ExploreViewProps) {
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
    };

    if (listings.length === 0) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[var(--color-bg-primary)] overflow-y-auto">
                <div className="w-16 h-16 bg-white/[0.05] rounded-full flex items-center justify-center mb-4">
                    <MapPin className="text-slate-500" size={24} />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Không tìm thấy phòng trọ nào</h3>
                <p className="text-slate-400 max-w-sm">
                    Hãy thử thay đổi bộ lọc tìm kiếm (Quận, Phường, Giá thuê) để xem thêm kết quả nhé.
                </p>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-[var(--color-bg-primary)]" id="explore-view-container">
            <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 mt-14 md:mt-0">Khám phá phòng trọ</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {listings.map(listing => (
                    <div 
                        key={listing.id} 
                        className="group flex flex-col gap-3 cursor-pointer"
                        onClick={() => onSelectListing(listing.id)}
                    >
                        <div className="relative aspect-square sm:aspect-[4/3] overflow-hidden rounded-xl bg-white/[0.05]">
                            <img 
                                src={listing.images[0] || '/listing-studio.png'} 
                                alt={listing.title} 
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <div className="flex justify-between items-start gap-2">
                                <h3 className="font-semibold text-white line-clamp-1 truncate text-base">{listing.address}</h3>
                                <div className="flex items-center gap-1 text-sm bg-black/20 px-1.5 py-0.5 rounded-md">
                                    <Star size={12} className="fill-emerald-500 text-emerald-500" />
                                    <span className="font-medium">{listing.avgRating > 0 ? listing.avgRating.toFixed(1) : 'Mới'}</span>
                                </div>
                            </div>
                            <p className="text-sm text-slate-400 line-clamp-1">{listing.title}</p>
                            <p className="text-sm text-slate-400">{listing.area} m² · {listing.utilities?.slice(0, 2).join(', ')}</p>
                            <div className="mt-1 font-semibold text-white flex items-center">
                                {formatPrice(listing.price)} <span className="font-normal text-slate-400 ml-1 text-sm">/tháng</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
