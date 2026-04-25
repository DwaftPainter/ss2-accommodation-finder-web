import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LandlordPage } from "../pages";
import ChatBox from "../components/ChatBox";
import { useListingsStore } from "../stores";

export default function LandlordRoute() {
    const navigate = useNavigate();
    const [selectedListingId, setSelectedListingId] = useState<string | null>(null);
    const { listings, fetchListings } = useListingsStore();

    const handleNavigate = useCallback(
        (page: string) => {
            if (page === "saved") {
                navigate("/saved");
            } else if (page === "messages") {
                navigate("/landlord/chat");
            } else if (page === "profile") {
                navigate("/profile");
            } else if (page === "finder") {
                navigate("/");
            } else {
                navigate(`/${page}`);
            }
        },
        [navigate]
    );

    const handleSelectListing = useCallback((id: string) => {
        setSelectedListingId(id);
    }, []);

    return (
        <>
            <LandlordPage onSelectListing={handleSelectListing} onNavigate={handleNavigate} />
            <ChatBox />
        </>
    );
}
