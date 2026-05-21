import { lazy, Suspense, useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LandingPage, HomePage } from "../pages";
import { AuthModal } from "../components/auth";
import { useAuth } from "../hooks/useAuth";
import { useListingsStore } from "../stores";

const ChatBox = lazy(() => import("../components/ChatBox"));
const ListingDetail = lazy(() => import("../components/ListingDetail"));

export default function HomeRoute() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const fetchListings = useListingsStore((state) => state.fetchListings);
    const [selectedListingId, setSelectedListingId] = useState<string | null>(null);
    const [showAuth, setShowAuth] = useState(false);

    const handleNavigateToMap = useCallback(() => {
        navigate("/?view=map");
    }, [navigate]);

    const handleNavigate = useCallback((page: string) => {
        navigate(`/${page}`);
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
                onNavigate={handleNavigate}
                onRequireAuth={() => setShowAuth(true)}
            />
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
            {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
            <Suspense fallback={null}>
                <ChatBox />
            </Suspense>
        </>
    );
}
