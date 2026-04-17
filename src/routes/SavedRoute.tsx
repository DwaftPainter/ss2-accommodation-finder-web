import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SavedPage } from "../pages";
import ListingDetail from "../components/ListingDetail";
import ChatBox from "../components/ChatBox";
import { useListingsStore } from "../stores";

export default function SavedRoute() {
    const navigate = useNavigate();
    const [selectedListingId, setSelectedListingId] = useState<string | null>(null);
    const { listings, fetchListings } = useListingsStore();

    const handleBack = useCallback(() => {
        navigate("/explore");
    }, [navigate]);

    const handleSelectListing = useCallback((id: string) => {
        navigate("/explore");
        setSelectedListingId(id);
    }, [navigate]);

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
