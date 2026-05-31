import { useEffect } from "react";
import { ArrowLeft, Heart, Plus } from "lucide-react";
import { useListingsStore } from "../../stores";
import { formatAddress } from "../../lib/utils";
import type { SavedListing } from "../../types";
import { Button, EmptyState, LoadingState, PageHeader, SectionContainer } from "@/components/ui";
import { WishlistCard, type WishlistGroup } from "./components";

interface SavedPageProps {
    onBack: () => void;
    onSelectListing: (id: string) => void;
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
