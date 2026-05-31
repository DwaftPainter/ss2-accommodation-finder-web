import { useState, type MouseEvent } from "react";
import { ListingCard as AccommodationCard } from "@/components/ui";
import { useAuth } from "../../../hooks/use-auth";
import { useListingsStore } from "../../../stores";
import type { ListingSummary } from "../../../types";

interface ListingCardProps {
    listing: ListingSummary;
    onSelect: (id: string) => void;
    onRequireAuth?: () => void;
}

export function ListingCard({ listing, onSelect, onRequireAuth }: ListingCardProps) {
    const isSaved = useListingsStore((state) => state.isListingSaved(listing.id));
    const toggleSaved = useListingsStore((state) => state.toggleSaved);
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    const handleToggleSaved = async (e: MouseEvent) => {
        e.stopPropagation();

        if (!user) {
            onRequireAuth?.();
            return;
        }

        if (isLoading) return;

        setIsLoading(true);
        try {
            await toggleSaved(listing.id);
        } catch (error) {
            console.error("Failed to toggle saved status:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AccommodationCard
            listing={listing}
            onSelect={onSelect}
            isSaved={isSaved}
            saveLoading={isLoading}
            onToggleSaved={handleToggleSaved}
            className="w-[72vw] max-w-[280px] flex-shrink-0 sm:w-[280px]"
        />
    );
}
