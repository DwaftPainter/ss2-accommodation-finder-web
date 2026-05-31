import { useEffect, useRef, useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Button } from "@/components/ui";
import type { ListingSummary } from "../../../types";
import { ListingCard } from "./listing-card";

interface ListingRowProps {
    title: string;
    listings: ListingSummary[];
    onSelectListing: (id: string) => void;
    onRequireAuth?: () => void;
}

export function ListingRow({ title, listings, onSelectListing, onRequireAuth }: ListingRowProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(true);

    const checkScroll = () => {
        if (scrollRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
            setShowLeftArrow(scrollLeft > 0);
            setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
        }
    };

    useEffect(() => {
        checkScroll();
        const scrollEl = scrollRef.current;
        if (scrollEl) {
            scrollEl.addEventListener("scroll", checkScroll);
            return () => scrollEl.removeEventListener("scroll", checkScroll);
        }
    }, []);

    const scroll = (direction: "left" | "right") => {
        if (scrollRef.current) {
            scrollRef.current.scrollBy({
                left: direction === "left" ? -300 : 300,
                behavior: "smooth"
            });
        }
    };

    return (
        <div className="py-8">
            <div className="flex items-center justify-between gap-3 mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{title}</h2>
                <div className="flex items-center gap-2">
                    <Button
                        type="button"
                        onClick={() => scroll("left")}
                        variant="outline"
                        size="icon"
                        className="rounded-full"
                        disabled={!showLeftArrow}
                    >
                        <ChevronLeftIcon size={20} />
                    </Button>
                    <Button
                        type="button"
                        onClick={() => scroll("right")}
                        variant="outline"
                        size="icon"
                        className="rounded-full"
                        disabled={!showRightArrow}
                    >
                        <ChevronRightIcon size={20} />
                    </Button>
                </div>
                <p className="text-sm text-gray-500">{listings.length} lựa chọn phù hợp</p>
            </div>

            <div ref={scrollRef} className="flex gap-6 overflow-x-auto scrollbar-hide pb-4">
                {listings.map((listing) => (
                    <ListingCard
                        key={listing.id}
                        listing={listing}
                        onSelect={onSelectListing}
                        onRequireAuth={onRequireAuth}
                    />
                ))}
            </div>
        </div>
    );
}
