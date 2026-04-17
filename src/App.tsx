import { useState, useCallback, useEffect } from "react";
import { MapPin, Plus } from "lucide-react";
import { useAuth0 } from "@auth0/auth0-react";
import Navbar from "./components/Navbar";
import MapView from "./components/MapView";
import ExploreView from "./components/ExploreView";
import FilterPanel from "./components/FilterPanel";
import ListingDetail from "./components/ListingDetail";
import ListingForm from "./components/ListingForm";
import SavedListings from "./components/SavedListings";
import LandingPage from "./components/LandingPage";
import { AuthModal, Auth0CallbackHandler } from "./components/auth";
import ChatBox from "./components/ChatBox";
import { useAuth } from "./hooks/useAuth";
import { useListingsStore } from "./stores";
import { toast } from "sonner";
import type { ListingDetail as ListingDetailType, ListingFilters, ListingPayload } from "./types";
import type { LatLng } from "leaflet";

type AppView = 'landing' | 'explore';

export default function App() {
    const { user } = useAuth();
    const { isLoading: auth0Loading } = useAuth0();
    const [currentView, setCurrentView] = useState<AppView>('landing');
    const [showMap, setShowMap] = useState(false);
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

    const { listings, fetchListings, createListing, updateListing, isLoading } = useListingsStore();

    // Fetch listings on mount and when filters change
    useEffect(() => {
        fetchListings(filters);
    }, [fetchListings, filters]);

    useEffect(() => {
        if (user && currentView === 'landing') {
            setCurrentView('explore');
        }
    }, [user, currentView]);

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

    const handleNavigateToMap = useCallback(() => {
        setCurrentView('explore');
    }, []);

    // Show loading state while Auth0 is initializing
    if (auth0Loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#13161f]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-slate-400 text-sm">Đang tải...</p>
                </div>
            </div>
        );
    }

    /* ─── Landing Page View ─── */
    if (currentView === 'landing') {
        return (
            <>
                {/* Auth0 handler to sync authentication state with backend */}
                <Auth0CallbackHandler />
                <LandingPage
                    onNavigateToMap={handleNavigateToMap}
                    onOpenAuth={() => setShowAuth(true)}
                />
                {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
                <ChatBox />
            </>
        );
    }

    /* ─── Map View ─── */
    return (
        <div className="h-screen flex flex-col overflow-hidden">
            {/* Auth0 handler to sync authentication state with backend */}
            <Auth0CallbackHandler />
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
                        : "bg-gradient-to-r from-emerald-500 to-teal-600 hover:shadow-[var(--color-accent-glow),0_10px_40px_rgba(0,0,0,0.5)]"
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

                        <div className="pointer-events-auto absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3">
                            <div className="px-5 py-2.5 bg-[var(--color-bg-glass)] backdrop-blur-xl border border-white/[0.08] rounded-full text-sm font-medium text-slate-400 shadow-lg hidden md:block">
                                {isLoading ? "..." : `${listings.length} phòng trọ`}
                            </div>
                            <button
                                onClick={() => setShowMap(!showMap)}
                                className="flex items-center gap-2 px-6 py-2.5 bg-[#222222] hover:bg-black border border-white/10 rounded-full text-sm font-semibold text-white shadow-[0_8px_20px_rgba(0,0,0,0.5)] transition-all hover:scale-105"
                            >
                                {showMap ? (
                                    <><span>Hiện danh sách</span></>
                                ) : (
                                    <><span>Hiện bản đồ</span><MapPin size={16} /></>
                                )}
                            </button>
                        </div>
                    </div>

                    {!showMap ? (
                        <ExploreView 
                            listings={listings} 
                            onSelectListing={(id) => setSelectedListingId(id)} 
                        />
                    ) : (
                        <MapView
                            listings={listings}
                            onSelectListing={(id) => setSelectedListingId(id)}
                            onMapClick={addingMode ? handleMapClick : null}
                            pinLocation={pinLocation}
                            flyTo={flyTo}
                        />
                    )}
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

            {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}

            <ChatBox />
        </div>
    );
}
