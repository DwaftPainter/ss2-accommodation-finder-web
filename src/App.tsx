import { useState, useCallback, useEffect } from "react";
import { MapPin, Plus } from "lucide-react";
import Navbar from "./components/Navbar";
import MapView from "./components/MapView";
import FilterPanel from "./components/FilterPanel";
import ListingDetail from "./components/ListingDetail";
import ListingForm, { type ListingFormData } from "./components/ListingForm";
import SavedListings from "./components/SavedListings";
import AuthModal from "./components/AuthModal";
import { useAuth } from "./hooks/useAuth";
import { useListingsStore } from "./stores";
import { toast } from "sonner";
import type { ListingDetail as ListingDetailType, ListingFilters } from "./types";
import type { LatLng } from "leaflet";

export default function App() {
    const { user } = useAuth();
    const [filters, setFilters] = useState<ListingFilters>({});
    const [showFilters, setShowFilters] = useState(false);
    const [selectedListingId, setSelectedListingId] = useState<string | null>(null);
    const [editListing, setEditListing] = useState<ListingDetailType | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [showSaved, setShowSaved] = useState(false);
    const [showAuth, setShowAuth] = useState(false);
    const [pinLocation, setPinLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [flyTo, setFlyTo] = useState<[number, number] | null>(null);
    const [addingMode, setAddingMode] = useState(false);

    const {
        listings,
        fetchListings,
        createListing,
        updateListing,
        isLoading,
    } = useListingsStore();

    // Fetch listings on mount and when filters change
    useEffect(() => {
        fetchListings(filters);
    }, [fetchListings, filters]);

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

    const handleSavedSelect = (id: string) => {
        setShowSaved(false);
        setSelectedListingId(id);
        const listing = listings.find((l) => l.id === id);
        if (listing) setFlyTo([listing.lat, listing.lng]);
    };

    const handleNavbarSearch = (query: string) => {
        setFilters((prev) => ({ ...prev, search: query }));
    };

    const handleFormSubmit = async (data: ListingFormData) => {
        const apiData = {
            ...data,
            electricityFee: data.electricityFee?.toString(),
            waterFee: data.waterFee?.toString(),
        } as unknown as import("./types").ListingFormData;
        try {
            if (editListing) {
                await updateListing(editListing.id, apiData);
                toast.success("Listing updated successfully!");
            } else {
                await createListing(apiData);
                toast.success("Listing created successfully!");
            }
            setShowForm(false);
            setEditListing(null);
            setPinLocation(null);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to save listing");
        }
    };

    return (
        <div className="h-screen flex flex-col overflow-hidden">
            <Navbar
                onOpenSaved={() => setShowSaved(true)}
                onToggleFilters={() => setShowFilters((p) => !p)}
                showFilters={showFilters}
                onOpenAuth={() => setShowAuth(true)}
                onSearch={handleNavbarSearch}
            />

            <div className="flex-1 flex overflow-hidden relative">
                <FilterPanel
                    filters={filters}
                    onFilterChange={setFilters}
                    onSearch={() => fetchListings(filters)}
                    visible={showFilters}
                />

                <div className="flex-1 relative">
                    {/* FAB */}
                    <div className="absolute top-0 left-0 right-0 z-[500] pointer-events-none">
                        <button
                            onClick={handleStartAdding}
                            className={`pointer-events-auto absolute top-4 right-4 flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white shadow-xl transition-all hover:-translate-y-0.5
                ${
                    addingMode
                        ? "bg-gradient-to-r from-amber-500 to-orange-500 animate-fab-pulse"
                        : "bg-gradient-to-r from-indigo-500 to-purple-600 hover:shadow-[var(--color-accent-glow),0_10px_40px_rgba(0,0,0,0.5)]"
                }`}
                            id="add-listing-btn"
                        >
                            {addingMode ? (
                                <>
                                    <MapPin size={18} />
                                    Nhấp chọn vị trí
                                </>
                            ) : (
                                <>
                                    <Plus size={18} />
                                    Đăng tin
                                </>
                            )}
                        </button>

                        <div className="pointer-events-auto absolute bottom-6 left-1/2 -translate-x-1/2 px-5 py-2 bg-[var(--color-bg-glass)] backdrop-blur-xl border border-white/[0.08] rounded-full text-sm font-medium text-slate-400 shadow-lg">
                            {isLoading ? "..." : `${listings.length} phòng trọ`}
                        </div>
                    </div>

                    <MapView
                        listings={listings}
                        onSelectListing={(id) => setSelectedListingId(id)}
                        onMapClick={addingMode ? handleMapClick : null}
                        pinLocation={pinLocation}
                        flyTo={flyTo}
                    />
                </div>
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

            <SavedListings
                visible={showSaved}
                onClose={() => setShowSaved(false)}
                onSelectListing={handleSavedSelect}
            />

            {showAuth && (
                <AuthModal onClose={() => setShowAuth(false)} />
            )}
        </div>
    );
}
