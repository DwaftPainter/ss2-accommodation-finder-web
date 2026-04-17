import { useEffect, useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import MapView from "../components/MapView";
import ExploreView from "../components/ExploreView";
import FilterPanel from "../components/FilterPanel";
import ListingDetail from "../components/ListingDetail";
import ListingForm from "../components/ListingForm";
import { AuthModal } from "../components/auth";
import ChatBox from "../components/ChatBox";
import { useAuth } from "../hooks/useAuth";
import { useListingsStore, useUserMode, useUIStore } from "../stores";
import { toast } from "sonner";
import type { ListingDetail as ListingDetailType, ListingFilters, ListingPayload } from "../types";
import type { LatLng } from "leaflet";

export default function ExploreRoute() {
    const userMode = useUserMode();
    const { toggleUserMode } = useUIStore();
    const [showMap, setShowMap] = useState(false);
    const [filters, setFilters] = useState<ListingFilters>({});
    const [showFilters, setShowFilters] = useState(false);
    const [selectedListingId, setSelectedListingId] = useState<string | null>(null);
    const [editListing, setEditListing] = useState<ListingDetailType | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [pinLocation, setPinLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [flyTo, setFlyTo] = useState<[number, number] | null>(null);
    const [addingMode, setAddingMode] = useState(false);
    const [showAuth, setShowAuth] = useState(false);

    const navigate = useNavigate();
    const { user } = useAuth();
    const { listings, fetchListings, createListing, updateListing, fetchMyListings } = useListingsStore();

    useEffect(() => {
        if (userMode === "landlord" && user) {
            fetchMyListings();
        } else {
            fetchListings(filters);
        }
    }, [fetchListings, fetchMyListings, filters, userMode, user]);

    const handleMapClick = (latlng: LatLng) => {
        if (!addingMode) return;
        setPinLocation(latlng);
        setShowForm(true);
        setAddingMode(false);
    };

    const handleStartAdding = () => {
        if (!user) {
            setShowAuth(true);
            return;
        }
        setAddingMode(true);
        setPinLocation(null);
    };

    const handleEdit = (listing: ListingDetailType) => {
        setEditListing(listing);
        setShowForm(true);
        setSelectedListingId(null);
    };

    const handleNavigateToSaved = useCallback(() => {
        if (!user) {
            setShowAuth(true);
            return;
        }
        navigate("/saved");
    }, [user, navigate]);

    const handleNavbarSearch = (query: string) => {
        setFilters((prev) => ({ ...prev, search: query }));
    };

    const handleFormSubmit = async (data: ListingPayload) => {
        try {
            if (editListing) {
                await updateListing(editListing.id, data);
                toast.success("Cập nhật tin thành công!");
            } else {
                await createListing(data);
                toast.success("Đăng tin thành công!");
            }
            setShowForm(false);
            setEditListing(null);
            setPinLocation(null);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Đăng tin thất bại";
            toast.error(errorMessage);
        }
    };

    return (
        <div className="h-screen flex flex-col overflow-hidden">
            <Navbar
                onOpenSaved={handleNavigateToSaved}
                onToggleFilters={() => setShowFilters((p) => !p)}
                showFilters={showFilters}
                onOpenAuth={() => setShowAuth(true)}
                onSearch={handleNavbarSearch}
                onToggleMode={toggleUserMode}
                showMap={showMap}
                onToggleMap={() => setShowMap((p) => !p)}
            />

            <div className="flex-1 flex overflow-hidden relative">
                {userMode === "finder" && (
                    <FilterPanel
                        filters={filters}
                        onFilterChange={setFilters}
                        onSearch={() => fetchListings(filters)}
                        visible={showFilters}
                    />
                )}

                {userMode === "finder" ? (
                    <div className="flex-1 overflow-hidden bg-slate-50">
                        {!showMap ? (
                            <ExploreView
                                listings={listings}
                                onSelectListing={(id) => setSelectedListingId(id)}
                            />
                        ) : (
                            <div className="h-full p-4">
                                <div className="h-full rounded-2xl overflow-hidden border border-slate-200 shadow-lg bg-white">
                                    {/* <MapView
                                        listings={listings}
                                        onSelectListing={(id) => setSelectedListingId(id)}
                                        onMapClick={null}
                                        pinLocation={null}
                                        flyTo={flyTo}
                                    /> */}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex-1 overflow-hidden">
                        <div className="flex flex-col h-full">
                            <div className="px-6 py-4 bg-white border-b border-slate-200">
                                <h1 className="text-xl font-semibold text-slate-800">Tin đăng của tôi</h1>
                                <p className="text-sm text-slate-500 mt-1">
                                    Quản lý tin đăng cho thuê phòng trọ của bạn
                                </p>
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <ExploreView
                                    listings={listings}
                                    onSelectListing={(id) => setSelectedListingId(id)}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {selectedListingId && (
                <ListingDetail
                    listingId={selectedListingId}
                    onClose={() => setSelectedListingId(null)}
                    onEdit={handleEdit}
                    onDeleted={fetchListings}
                />
            )}

            {showForm && (
                <ListingForm
                    listing={editListing}
                    pinLocation={pinLocation}
                    onClose={() => {
                        setShowForm(false);
                        setEditListing(null);
                        setPinLocation(null);
                    }}
                    onSaved={handleFormSubmit}
                />
            )}

            {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}

            <ChatBox />
        </div>
    );
}
