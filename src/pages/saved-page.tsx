import { useEffect } from "react";
import { ArrowLeft, Heart, Plus } from "lucide-react";
import { useListingsStore } from "../stores";
import { formatAddress } from "../lib/utils";
import type { SavedListing } from "../types";
import { Button, EmptyState, LoadingState, PageHeader, SectionContainer } from "@/components/ui";

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
    const { savedListings = [], isLoadingSaved: loading, fetchSavedListings } = useListingsStore();

    useEffect(() => {
        fetchSavedListings();
    }, [fetchSavedListings]);

    // Group listings into wishlists (for now, create default groups based on location)
    // In a real app, this would come from the backend with actual wishlist data
    const wishlists: WishlistGroup[] = (() => {
        if (!Array.isArray(savedListings) || savedListings.length === 0) return [];

        // For demo purposes, create wishlists based on location keywords
        const groups: Record<string, SavedListing[]> = {};

        savedListings.forEach((listing) => {
            if (!listing || !listing.address) return;
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
        return result.sort((a, b) => (b.listings?.length || 0) - (a.listings?.length || 0));
    })();

    const totalStays = Array.isArray(savedListings) ? savedListings.length : 0;
    const totalLists = wishlists.length || (totalStays > 0 ? 1 : 0);

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
                <div className="w-full px-4 sm:px-6 h-16 flex items-center justify-between gap-2">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 text-gray-800 hover:bg-gray-100 px-2 sm:px-3 py-2 rounded-full transition-colors"
                    >
                        <ArrowLeft size={20} />
                        <span className="font-medium hidden sm:inline">Quay lại</span>
                    </button>
                    <h1 className="text-xl font-semibold text-gray-900 hidden sm:block">Đã lưu</h1>
                    <div className="w-10 sm:w-20" /> {/* Spacer for centering */}
                </div>
            </header>

            {/* Main Content */}
            <SectionContainer as="main" className="py-6 sm:py-8">
                {/* Title Section */}
                <PageHeader
                    className="mb-8"
                    title="Đã lưu"
                    description={`${totalLists} danh sách`}
                    actions={
                        <Button type="button" variant="outline" disabled title="Tính năng đang được phát triển">
                            <Plus size={18} />
                            Tạo danh sách
                        </Button>
                    }
                />

                {/* Loading State */}
                {loading && (
                    <LoadingState title="Đang tải danh sách đã lưu" />
                )}

                {/* Empty State */}
                {!loading && totalStays === 0 && (
                    <EmptyState
                        icon={Heart}
                        title="Chưa có nơi nào được lưu"
                        description="Khi bạn tìm thấy nơi ở phù hợp, hãy nhấn vào biểu tượng trái tim để lưu lại."
                        action={{ label: "Bắt đầu tìm kiếm", onClick: onBack }}
                    />
                )}

                {/* Wishlists Grid */}
                {!loading && totalStays > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 gap-6">
                        {wishlists.map((wishlist) => (
                            <WishlistCard
                                key={wishlist.id}
                                wishlist={wishlist}
                                onClick={() => {
                                    // If only one listing, open it directly
                                    if (wishlist.listings?.length === 1) {
                                        onSelectListing(wishlist.listings[0].id);
                                    }
                                    // Otherwise, could open a detail view of the wishlist
                                }}
                            />
                        ))}
                    </div>
                )}
            </SectionContainer>
        </div>
    );
}

interface WishlistCardProps {
    wishlist: WishlistGroup;
    onClick: () => void;
}

function WishlistCard({ wishlist, onClick }: WishlistCardProps) {
    const listings = wishlist.listings || [];
    const images = listings
        .slice(0, 3)
        .map((l) => l.images?.[0])
        .filter(Boolean);
    const stayCount = listings.length;

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
