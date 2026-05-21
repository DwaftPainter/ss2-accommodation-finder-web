import { lazy, Suspense, useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SavedPage } from "../pages";
import { useListingsStore } from "../stores";

const ChatBox = lazy(() => import("../components/ChatBox"));
const ListingDetail = lazy(() => import("../components/ListingDetail"));

export default function SavedRoute() {
    const navigate = useNavigate();
    const [selectedListingId, setSelectedListingId] = useState<string | null>(null);
    const fetchListings = useListingsStore(state => state.fetchListings);

    const handleBack = useCallback(() => {
        navigate("/");
    }, [navigate]);

    const handleSelectListing = useCallback(
        (id: string) => {
            setSelectedListingId(id);
        },
        []
    );

    return (
        <>
            <SavedPage onBack={handleBack} onSelectListing={handleSelectListing} />
            {selectedListingId && (
                <Suspense fallback={null}>
                    <ListingDetail
                        listingId={selectedListingId}
                        onClose={() => setSelectedListingId(null)}
                        onEdit={() => {}}
                        onDeleted={fetchListings}
                    />
                </Suspense>
            )}
            <Suspense fallback={null}>
                <ChatBox />
            </Suspense>
        </>
    );
}
