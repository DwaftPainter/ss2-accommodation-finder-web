import type { SavedListing } from "@/types";

export interface WishlistGroup {
    id: string;
    name: string;
    listings: SavedListing[];
}

interface WishlistCardProps {
    wishlist: WishlistGroup;
    onClick: () => void;
}

export function WishlistCard({ wishlist, onClick }: WishlistCardProps) {
    const listings = wishlist.listings || [];
    const images = listings
        .slice(0, 3)
        .map((listing) => listing.images?.[0])
        .filter(Boolean);
    const stayCount = listings.length;

    return (
        <div onClick={onClick} className="group cursor-pointer">
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

                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
            </div>

            <h3 className="font-medium text-gray-900 text-base mb-0.5">{wishlist.name}</h3>
            <p className="text-gray-500 text-sm">
                {stayCount} {stayCount === 1 ? "chỗ ở" : "chỗ ở"}
            </p>
        </div>
    );
}
