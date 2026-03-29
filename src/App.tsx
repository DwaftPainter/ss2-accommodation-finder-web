import { useState, useCallback, useEffect } from "react";
import { MapPin, Plus } from "lucide-react";
import Navbar from "./components/Navbar";
import MapView from "./components/MapView";
import FilterPanel from "./components/FilterPanel";
import ListingDetail from "./components/ListingDetail";
import ListingForm from "./components/ListingForm";
import SavedListings from "./components/SavedListings";
import { listingsApi } from "./api";
import { useAuth } from "./context/AuthContext";
import { toast } from "sonner";
import type { ListingSummary, ListingDetail as ListingDetailType, ListingFilters } from "./types";
import type { LatLng } from "leaflet";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProfilePage from "./page/profilePage";

function HomeWithMap() {
    const { user } = useAuth();
    const [listings, setListings] = useState<ListingSummary[]>([]);
    const [filters, setFilters] = useState<ListingFilters>({});
    const [showFilters, setShowFilters] = useState(false);
    const [selectedListingId, setSelectedListingId] = useState<string | null>(null);
    const [editListing, setEditListing] = useState<ListingDetailType | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [showSaved, setShowSaved] = useState(false);
    const [pinLocation, setPinLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [flyTo, setFlyTo] = useState<[number, number] | null>(null);
    const [addingMode, setAddingMode] = useState(false);
    const [loading, setLoading] = useState(true);

    const fetchListings = useCallback(async () => {
        setLoading(true);
        try {
            const params: Record<string, string | number | undefined> = {};
            if (filters.search) params.search = filters.search;
            if (filters.price_min) params.price_min = filters.price_min;
            if (filters.price_max) params.price_max = filters.price_max;
            if (filters.area_min) params.area_min = filters.area_min;
            if (filters.area_max) params.area_max = filters.area_max;
            if (filters.lat) params.lat = filters.lat;
            if (filters.lng) params.lng = filters.lng;
            if (filters.radius) params.radius = filters.radius;
            if (filters.utilities && filters.utilities.length > 0) {
                params.utilities = filters.utilities.join(",");
            }
            const data = await listingsApi.getAll(params);
            setListings(data);
        } catch (err) {
            console.error("Failed to fetch listings:", err);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchListings();
    }, []);

    const handleMapClick = (latlng: LatLng) => {
        if (!addingMode) return;
        setPinLocation(latlng);
        setShowForm(true);
        setAddingMode(false);
    };

    const handleStartAdding = () => {
        if (!user) {
            toast.warning("Bạn cần đăng nhập để đăng tin.");
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

    return (
        <div className="h-screen flex flex-col overflow-hidden">
            <Navbar
                onOpenSaved={() => setShowSaved(true)}
                onToggleFilters={() => setShowFilters((p) => !p)}
                showFilters={showFilters}
            />

            <div className="flex-1 flex overflow-hidden relative">
                <FilterPanel
                    filters={filters}
                    onFilterChange={setFilters}
                    onSearch={fetchListings}
                    visible={showFilters}
                />

                <div className="flex-1 relative">
                    {/* FAB */}
                    <div className="absolute top-0 left-0 right-0 z-[500] pointer-events-none">
                        <button
                            onClick={handleStartAdding}
                            className={`pointer-events-auto absolute top-4 right-4 flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white shadow-xl transition-all hover:-translate-y-0.5
                ${addingMode
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
                            {loading ? "..." : `${listings.length} phòng trọ`}
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
                    onSaved={fetchListings}
                />
            )}

            <SavedListings
                visible={showSaved}
                onClose={() => setShowSaved(false)}
                onSelectListing={handleSavedSelect}
            />
        </div>
    );
}


export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* 🔧 sửa - thêm route / */}
                <Route path="/" element={<HomeWithMap />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </BrowserRouter>
    );
}
