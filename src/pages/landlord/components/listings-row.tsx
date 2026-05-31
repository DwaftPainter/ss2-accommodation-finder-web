import { ListingCard, ListingGrid, PageHeader } from "@/components/ui";
import type { ListingSummary } from "@/types";

export function ListingsRow({
    title,
    listings,
    onSelectListing
}: {
    title: string;
    listings: ListingSummary[];
    onSelectListing: (id: string) => void;
}) {
    return (
        <section className="py-6 sm:py-8">
            <PageHeader
                className="mb-6"
                eyebrow="Quản lý tin"
                title={title}
                description={`${listings.length} bài đăng`}
            />
            <ListingGrid
                listings={listings}
                onSelect={onSelectListing}
                renderCard={(listing) => (
                    <ListingCard
                        key={listing.id}
                        listing={listing}
                        onSelect={onSelectListing}
                        badge="Đang hiển thị"
                    />
                )}
            />
        </section>
    );
}
