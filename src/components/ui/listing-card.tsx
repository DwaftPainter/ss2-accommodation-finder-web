import type React from "react";
import { Heart, Star } from "lucide-react";
import { formatAddress } from "@/lib/utils";
import { LISTING_FALLBACK_IMAGES, formatListingPrice } from "@/features/listings";
import type { ListingSummary } from "@/types";
import { Badge } from "./badge";
import { Button } from "./button";
import { cn } from "@/lib/utils";

type ListingCardProps = {
    listing: ListingSummary;
    onSelect: (id: string) => void;
    className?: string;
    imageClassName?: string;
    badge?: string;
    isSaved?: boolean;
    saveLoading?: boolean;
    onToggleSaved?: (event: React.MouseEvent<HTMLButtonElement>) => void;
};

export function ListingCard({
    listing,
    onSelect,
    className,
    imageClassName,
    badge,
    isSaved,
    saveLoading,
    onToggleSaved,
}: ListingCardProps) {
    const imageUrl = listing.images?.[0] || LISTING_FALLBACK_IMAGES[0];

    return (
        <article
            className={cn(
                "group min-w-0 cursor-pointer rounded-xl bg-white p-2 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:shadow-md",
                className
            )}
            onClick={() => onSelect(listing.id)}
        >
            <div
                className={cn(
                    "relative mb-3 aspect-square overflow-hidden rounded-lg bg-slate-100",
                    imageClassName
                )}
            >
                <img
                    src={imageUrl}
                    alt={listing.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                {(badge || listing.avgRating >= 4.5) && (
                    <Badge className="absolute left-3 top-3 bg-white/90 text-slate-900 backdrop-blur">
                        {badge || "Được yêu thích"}
                    </Badge>
                )}
                {onToggleSaved && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        isLoading={saveLoading}
                        onClick={onToggleSaved}
                        aria-label={isSaved ? "Bỏ lưu tin" : "Lưu tin"}
                        className="absolute right-3 top-3 h-9 w-9 rounded-full bg-white/90 text-slate-700 shadow-sm backdrop-blur hover:bg-white"
                    >
                        <Heart
                            size={18}
                            className={cn(isSaved && "fill-rose-500 text-rose-500")}
                            aria-hidden="true"
                        />
                    </Button>
                )}
            </div>
            <div className="space-y-1 px-1 pb-1">
                <div className="flex items-start justify-between gap-3">
                    <h3 className="min-w-0 text-sm font-semibold leading-5 text-slate-950 line-clamp-1">
                        {listing.title}
                    </h3>
                    <span className="flex shrink-0 items-center gap-1 text-sm text-slate-700">
                        <Star size={14} className="fill-amber-400 text-amber-400" aria-hidden="true" />
                        {listing.avgRating > 0 ? listing.avgRating.toFixed(1) : "Mới"}
                    </span>
                </div>
                <p className="text-sm text-slate-500 line-clamp-1">{formatAddress(listing.address)}</p>
                <div className="flex items-center justify-between gap-3 pt-1 text-sm">
                    <span className="font-semibold text-slate-950">
                        ₫{formatListingPrice(listing.price, "")}
                    </span>
                    <span className="text-slate-500">{listing.area} m²</span>
                </div>
            </div>
        </article>
    );
}

export function ListingGrid({
    listings,
    onSelect,
    className,
    renderCard,
}: {
    listings: ListingSummary[];
    onSelect: (id: string) => void;
    className?: string;
    renderCard?: (listing: ListingSummary) => React.ReactNode;
}) {
    return (
        <div className={cn("grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4", className)}>
            {listings.map((listing) =>
                renderCard ? (
                    renderCard(listing)
                ) : (
                    <ListingCard key={listing.id} listing={listing} onSelect={onSelect} />
                )
            )}
        </div>
    );
}
