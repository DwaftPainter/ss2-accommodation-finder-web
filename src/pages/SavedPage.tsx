import { useState, useEffect } from "react";
import { ArrowLeft, Plus } from "lucide-react";
import { savedApi } from "../services/api";
import { formatAddress } from "../lib/utils";
import type { SavedListing } from "../types";

interface SavedPageProps {
    onBack: () => void;
    onSelectListing: (id: string) => void;
}

interface WishlistGroup {
    id: string;
    name: string;
    listings: SavedListing[];
}

export default function SavedPage({ onBack, onSelectListing }: SavedPageProps) {
    const [savedListings, setSavedListings] = useState<SavedListing[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        savedApi
            .getAll()
            .then(setSavedListings)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    // Group listings into wishlists (for now, create default groups based on location)
    // In a real app, this would come from the backend with actual wishlist data
    const wishlists: WishlistGroup[] = (() => {
        if (savedListings.length === 0) return [];

        // For demo purposes, create wishlists based on location keywords
        const groups: Record<string, SavedListing[]> = {};

        savedListings.forEach((listing) => {
            const location = formatAddress(listing.address, { style: "short" });
            if (!groups[location]) {
                groups[location] = [];
            }
            groups[location].push(listing);
        });

        // If we have many groups, combine small ones into "Other"
        const result: WishlistGroup[] = [];
        let otherListings: SavedListing[] = [];

        Object.entries(groups).forEach(([name, listings]) => {
            if (listings.length >= 2) {
                result.push({
                    id: name,
                    name: name,
                    listings
                });
            } else {
                otherListings = [...otherListings, ...listings];
            }
        });

        if (otherListings.length > 0) {
            result.push({
                id: "other",
                name: "Đã lưu",
                listings: otherListings
            });
        }

        // Sort by number of listings
        return result.sort((a, b) => b.listings.length - a.listings.length);
    })();

    const totalStays = savedListings.length;
    const totalLists = wishlists.length || (totalStays > 0 ? 1 : 0);

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
                <div className="max-w-6xl px-6 h-16 flex items-center justify-between">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 text-gray-800 hover:bg-gray-100 px-3 py-2 rounded-full transition-colors"
                    >
                        <ArrowLeft size={20} />
                        <span className="font-medium">Quay lại</span>
                    </button>
                    <h1 className="text-xl font-semibold text-gray-900 hidden sm:block">Đã lưu</h1>
                    <div className="w-20" /> {/* Spacer for centering */}
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-6xl mx-auto px-6 py-8">
                {/* Title Section */}
                <div className="flex items-start justify-between mb-8">
                    <div>
                        <h2 className="text-3xl font-semibold text-gray-900 mb-1">Đã lưu</h2>
                        <p className="text-gray-500">{totalLists} danh sách</p>
                    </div>

                    <button
                        className="flex items-center gap-2 px-4 py-2.5 border border-emerald-600 rounded-lg text-sm font-medium text-emerald-600 hover:bg-emerald-50 transition-colors"
                        onClick={() => {
                            /* TODO: Create list functionality */
                        }}
                    >
                        <Plus size={18} />
                        Tạo danh sách
                    </button>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-8 h-8 border-3 border-slate-200 border-t-emerald-500 rounded-full animate-spin" />
                    </div>
                )}

                {/* Empty State */}
                {!loading && savedListings.length === 0 && (
                    <div className="text-center py-20">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg
                                width="28"
                                height="28"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                className="text-gray-400"
                            >
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-medium text-gray-900 mb-2">Chưa có nơi nào được lưu</h3>
                        <p className="text-gray-500 mb-6">
                            Khi bạn tìm thấy nơi ở phù hợp, hãy nhấn vào biểu tượng trái tim để lưu lại.
                        </p>
                        <button
                            onClick={onBack}
                            className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-medium rounded-lg transition-all shadow-md hover:shadow-lg"
                        >
                            Bắt đầu tìm kiếm
                        </button>
                    </div>
                )}

                {/* Wishlists Grid */}
                {!loading && savedListings.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {wishlists.map((wishlist) => (
                            <WishlistCard
                                key={wishlist.id}
                                wishlist={wishlist}
                                onClick={() => {
                                    // If only one listing, open it directly
                                    if (wishlist.listings.length === 1) {
                                        onSelectListing(wishlist.listings[0].id);
                                    }
                                    // Otherwise, could open a detail view of the wishlist
                                }}
                            />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

interface WishlistCardProps {
    wishlist: WishlistGroup;
    onClick: () => void;
}

function WishlistCard({ wishlist, onClick }: WishlistCardProps) {
    const images = wishlist.listings
        .slice(0, 3)
        .map((l) => l.images[0])
        .filter(Boolean);
    const stayCount = wishlist.listings.length;

    return (
        <div onClick={onClick} className="group cursor-pointer">
            {/* Image Collage */}
            <div className="relative aspect-square rounded-xl overflow-hidden mb-3 bg-gray-100">
                {images.length === 1 && (
                    <img
                        src={images[0]}
                        alt={wishlist.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                )}

                {images.length === 2 && (
                    <div className="grid grid-cols-2 gap-0.5 h-full">
                        <img
                            src={images[0]}
                            alt={wishlist.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <img
                            src={images[1]}
                            alt={wishlist.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                    </div>
                )}

                {images.length >= 3 && (
                    <div className="grid grid-cols-2 gap-0.5 h-full">
                        <img
                            src={images[0]}
                            alt={wishlist.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="grid grid-rows-2 gap-0.5 h-full">
                            <img
                                src={images[1]}
                                alt={wishlist.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <img
                                src={images[2]}
                                alt={wishlist.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                        </div>
                    </div>
                )}

                {/* Fallback if no images */}
                {images.length === 0 && (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                        <svg
                            width="48"
                            height="48"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            className="text-gray-400"
                        >
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                        </svg>
                    </div>
                )}

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
            </div>

            {/* Info */}
            <h3 className="font-medium text-gray-900 text-base mb-0.5">{wishlist.name}</h3>
            <p className="text-gray-500 text-sm">
                {stayCount} {stayCount === 1 ? "chỗ ở" : "chỗ ở"}
            </p>
        </div>
    );
}
