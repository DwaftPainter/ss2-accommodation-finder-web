import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SavedPage } from "../pages";
import ListingDetail from "../components/ListingDetail";
import ChatBox from "../components/ChatBox";
import { useListingsStore } from "../stores";

export default function SavedRoute() {
    const navigate = useNavigate();
    const [selectedListingId, setSelectedListingId] = useState<string | null>(null);
    const fetchListings = useListingsStore(state => state.fetchListings);

    const handleBack = useCallback(() => {
        navigate("/");
    }, [navigate]);

    const handleSelectListing = useCallback(
        (id: string) => {
            navigate("/");
            setSelectedListingId(id);
        },
        [navigate]
    );

    return (
        <>
            <SavedPage onBack={handleBack} onSelectListing={handleSelectListing} />
            {selectedListingId && (
                <ListingDetail
                    listingId={selectedListingId}
                    onClose={() => setSelectedListingId(null)}
                    onEdit={() => {}}
                    onDeleted={fetchListings}
                />
            )}
            <ChatBox />
        </>
    );
}
