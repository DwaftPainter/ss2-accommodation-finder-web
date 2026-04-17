import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LandingPage, HomePage } from "../pages";
import { AuthModal } from "../components/auth";
import ChatBox from "../components/ChatBox";
import ListingDetail from "../components/ListingDetail";
import { useAuth } from "../hooks/useAuth";
import { useListingsStore } from "../stores";

export default function HomeRoute() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { listings, fetchListings } = useListingsStore();
    const [selectedListingId, setSelectedListingId] = useState<string | null>(null);
    const [showAuth, setShowAuth] = useState(false);

    const handleNavigateToMap = useCallback(() => {
        navigate("/explore");
    }, [navigate]);

    const handleSelectListing = useCallback((id: string) => {
        setSelectedListingId(id);
    }, []);

    if (!user) {
        return (
            <>
                <LandingPage
                    onNavigateToMap={handleNavigateToMap}
                    onOpenAuth={() => setShowAuth(true)}
                />
                {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
                <ChatBox />
            </>
        );
    }

    return (
        <>
            <HomePage
                onSelectListing={handleSelectListing}
            />
            {selectedListingId && (
                <ListingDetail
                    listingId={selectedListingId}
                    onClose={() => setSelectedListingId(null)}
                    onEdit={() => {}}
                    onDeleted={fetchListings}
                />
            )}
            {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
            <ChatBox />
        </>
    );
}
