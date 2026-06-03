import { lazy, Suspense, useEffect, useState } from "react";
import {
    SlidersHorizontal,
    SwitchCamera,
} from "lucide-react";
import { listingsApi } from "../../services/api";
import { useAuth } from "../../hooks/use-auth";
import { useListingsStore, useUIStore } from "../../stores";
import FilterPanel from "../../components/filter-panel";
import NotificationBell from "../../components/notification-bell";
import { formatAddress } from "../../lib/utils";
import type { ListingFilters, ListingSummary } from "../../types";
import Loader from "@/components/ui/loading";
import { EmptyState, ErrorState, LoadingState, SectionContainer } from "@/components/ui";
import {
    CITY_SECTIONS,
    LISTING_FALLBACK_IMAGES,
    formatListingPrice,
} from "@/features/listings";
import { ListingRow, SearchBar, UserMenu } from "./components";

const ListingDetail = lazy(() => import("../../components/listing-detail"));
const MapView = lazy(() => import("../../components/map-view"));

interface HomePageProps {
    onSelectListing?: (id: string) => void;
    onNavigate?: (page: string) => void;
    onRequireAuth?: () => void;
}

function hasActiveFilters(filters: ListingFilters) {
    return Object.values(filters).some((value) => {
        if (Array.isArray(value)) return value.length > 0;
        return value !== undefined && value !== null && value !== "";
    });
}

export default function HomePage({ onSelectListing, onNavigate, onRequireAuth }: HomePageProps) {
    const { user } = useAuth();
    const userMode = useUIStore((state) => state.userMode);
    const listings = useListingsStore((state) => state.listings);
    const fetchListings = useListingsStore((state) => state.fetchListings);
    const fetchSavedListings = useListingsStore((state) => state.fetchSavedListings);
    const isSearching = useListingsStore((state) => state.isLoading);
    const searchError = useListingsStore((state) => state.error);
    const [listingsByCity, setListingsByCity] = useState<Record<string, ListingSummary[]>>({});
    const [isLoading, setIsLoading] = useState(true);

    const [showMap, setShowMap] = useState(false);
    const [filters, setFilters] = useState<ListingFilters>({});
    const [showFilters, setShowFilters] = useState(false);
    const [selectedListingId, setSelectedListingId] = useState<string | null>(null);
    const [flyTo, setFlyTo] = useState<[number, number] | null>(null);

    const modeButtonText = "Cho thuê phòng";

    const handleToggleMode = () => {
        onNavigate?.("landlord");
    };

    const handleShowMap = (searchFilters: ListingFilters = filters) => {
        setFilters(searchFilters);
        setShowMap(true);
        setShowFilters(window.innerWidth >= 1024);
        const url = new URL(window.location.href);
        url.searchParams.set("view", "map");
        if (searchFilters.search) {
            url.searchParams.set("q", String(searchFilters.search));
        } else {
            url.searchParams.delete("q");
        }
        window.history.pushState({}, "", url);
    };

    const handleCloseMap = () => {
        setShowMap(false);
        setFilters({});
        setShowFilters(false);
        const url = new URL(window.location.href);
        url.searchParams.delete("view");
        url.searchParams.delete("q");
        window.history.pushState({}, "", url);
    };

    useEffect(() => {
        const url = new URL(window.location.href);
        if (url.searchParams.get("view") === "map") {
            const q = url.searchParams.get("q");
            if (q) setFilters({ search: q });
            setShowMap(true);
            setShowFilters(window.innerWidth >= 1024);
        }
    }, []);

    useEffect(() => {
        const fetchAllListings = async () => {
            setIsLoading(true);
            try {
                const results: Record<string, ListingSummary[]> = {};

                await Promise.all(CITY_SECTIONS.map(async (city) => {
                    try {
                        const cityListings = await listingsApi.getAll({ search: city.query });

                        if (cityListings.length > 0) {
                            const listingsWithImages = cityListings.map((listing, idx) => ({
                                ...listing,
                                images:
                                    listing.images?.length > 0
                                        ? listing.images
                                        : [LISTING_FALLBACK_IMAGES[idx % LISTING_FALLBACK_IMAGES.length]]
                            }));

                            results[city.name] = listingsWithImages.slice(0, 8);
                        } else {
                            results[city.name] = [];
                        }
                    } catch {
                        results[city.name] = [];
                    }
                }));

                setListingsByCity(results);
            } catch (error) {
                console.error("Failed to fetch listings:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAllListings();

        if (user) {
            fetchSavedListings();
        }
    }, [user, fetchSavedListings]);

    useEffect(() => {
        if (showMap) {
            fetchListings(filters);
        }
    }, [showMap, filters, fetchListings]);

    const updateFilters = (nextFilters: ListingFilters) => {
        setFilters(nextFilters);
    };

    const applyFilters = () => {
        fetchListings(filters);
        setShowFilters(false);
    };

    const clearSearch = () => {
        setFilters({});
        fetchListings({});
    };

    const handleSelectListingInternal = (id: string) => {
        setSelectedListingId(id);

        const listing = listings.find((l) => l.id === id);
        if (listing) {
            const lat = listing.address.lat;
            const lng = listing.address.lng;

            if (lat && lng) setFlyTo([lat, lng]);
        }
        onSelectListing?.(id);
    };

    const handleCloseDetail = () => {
        setSelectedListingId(null);
    };

    if (isLoading) {
        return (
            <LoadingState className="min-h-screen bg-white" />
        );
    }

    return (
        <div className={`flex flex-col bg-slate-50 ${showMap ? "h-dvh overflow-hidden" : "min-h-screen overflow-x-hidden"}`}>
            <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="flex flex-wrap lg:flex-nowrap items-center justify-between min-h-16 lg:min-h-20 py-2 gap-2 lg:gap-3">
                        <div className="order-1 flex items-center gap-2 flex-shrink-0 min-w-0">
                            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-linear-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                                <img src="/logo.png" alt="Logo" className="size-5" />
                            </div>
                            <div className="landing-brand hidden lg:block min-w-0">
                                <span className="landing-brand-text text-lg xl:text-xl">AccomFinder</span>
                            </div>
                        </div>

                        <div className="order-3 lg:order-2 basis-full lg:basis-auto lg:flex-1 flex justify-center min-w-0 px-0 lg:px-2 xl:px-4">
                            <SearchBar onSearch={handleShowMap} />
                        </div>

                        <div className="order-2 lg:order-3 flex items-center gap-1 sm:gap-2 lg:gap-3 flex-shrink-0">
                            <button
                                type="button"
                                onClick={handleToggleMode}
                                className="hidden lg:flex justify-center items-center gap-2 text-sm text-center font-medium text-gray-900 hover:bg-gray-100 py-2 px-3 xl:px-4 rounded-full transition-colors whitespace-nowrap"
                            >
                                {modeButtonText}
                            </button>

                            <button
                                type="button"
                                onClick={handleToggleMode}
                                aria-label="Chuyển sang chế độ cho thuê"
                                className="lg:hidden flex items-center justify-center w-9 h-9 rounded-full hover:bg-gray-100 transition-colors"
                            >
                                <SwitchCamera size={20} className="text-gray-700" />
                            </button>

                            <NotificationBell enabled={Boolean(user)} />
                            <UserMenu user={user} onNavigate={onNavigate} />
                        </div>
                    </div>
                </div>
            </header>

            {showMap ? (
                <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden md:flex-row">
                    {userMode === "finder" && (
                        <FilterPanel
                            filters={filters}
                            onFilterChange={updateFilters}
                            onSearch={applyFilters}
                            visible={showFilters}
                        />
                    )}

                    <div className="z-[900] flex max-h-[45dvh] w-full shrink-0 flex-col border-b border-gray-200 bg-white md:h-full md:max-h-none md:w-[360px] md:max-w-[40vw] md:border-b-0 md:border-r lg:w-[380px]">
                        <div className="p-4 border-b border-gray-100 flex items-start justify-between gap-3">
                            <div className="min-w-0">
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Kết quả tìm kiếm</p>
                                <h2 className="text-lg font-semibold text-slate-900 truncate">
                                    {filters.search ? filters.search : "Tất cả phòng trọ"}
                                </h2>
                                <p className="text-sm text-slate-500">
                                    {isSearching ? "Đang tải..." : `${listings.length} bài đăng phù hợp`}
                                </p>
                            </div>
                            <button
                                onClick={() => setShowFilters((open) => !open)}
                                className={`shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-full border transition-colors ${
                                    hasActiveFilters(filters)
                                        ? "border-emerald-500 text-emerald-600 bg-emerald-50"
                                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                                }`}
                                aria-label="Mở bộ lọc"
                            >
                                <SlidersHorizontal size={18} />
                            </button>
                        </div>

                        {hasActiveFilters(filters) && (
                            <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2 overflow-x-auto scrollbar-hide">
                                {filters.search && (
                                    <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">
                                        {filters.search}
                                    </span>
                                )}
                                {filters.price_min && (
                                    <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">
                                        Từ ₫{formatListingPrice(Number(filters.price_min), "")}
                                    </span>
                                )}
                                {filters.price_max && (
                                    <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">
                                        Đến ₫{formatListingPrice(Number(filters.price_max), "")}
                                    </span>
                                )}
                                <button
                                    onClick={clearSearch}
                                    className="shrink-0 rounded-full px-3 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50"
                                >
                                    Xóa
                                </button>
                            </div>
                        )}

                        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3">
                            {isSearching ? (
                                <LoadingState title="Đang tìm phòng phù hợp" className="py-12" />
                            ) : searchError ? (
                                <ErrorState description={searchError} />
                            ) : listings.length === 0 ? (
                                <EmptyState
                                    title="Không tìm thấy bài đăng"
                                    description="Thử đổi khu vực, khoảng giá hoặc tiện ích."
                                    className="py-12"
                                />
                            ) : (
                                listings.map((listing) => (
                                    <button
                                        key={listing.id}
                                        onClick={() => handleSelectListingInternal(listing.id)}
                                        className="w-full text-left flex gap-3 rounded-lg border border-slate-200 p-2 hover:border-emerald-300 hover:bg-emerald-50/40 transition-colors"
                                    >
                                        <img
                                            src={listing.images?.[0] || LISTING_FALLBACK_IMAGES[0]}
                                            alt={listing.title}
                                            className="h-20 w-24 shrink-0 rounded-md object-cover bg-slate-100"
                                        />
                                        <span className="min-w-0 flex-1">
                                            <span className="block text-sm font-semibold text-slate-900 line-clamp-1">{listing.title}</span>
                                            <span className="block text-xs text-slate-500 line-clamp-1">{formatAddress(listing.address)}</span>
                                            <span className="mt-2 flex items-center justify-between gap-2">
                                                <span className="text-sm font-semibold text-emerald-600">₫{formatListingPrice(listing.price, "")}</span>
                                                <span className="text-xs text-slate-500">{listing.area} m²</span>
                                            </span>
                                        </span>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="min-h-0 flex-1 overflow-hidden p-2 sm:p-4">
                        <div className="h-full min-h-0 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg sm:rounded-2xl">
                            <Suspense fallback={<Loader />}>
                                <MapView
                                    listings={listings}
                                    onSelectListing={(id) => handleSelectListingInternal(id)}
                                    onMapClick={null}
                                    pinLocation={null}
                                    flyTo={flyTo}
                                    onClose={handleCloseMap}
                                />
                            </Suspense>
                        </div>
                    </div>
                </div>
            ) : (
                <SectionContainer as="main" className="pb-12">
                    {CITY_SECTIONS.map(
                        (city) =>
                            listingsByCity[city.name]?.length > 0 && (
                                <ListingRow
                                    key={city.name}
                                    title={`Nơi lưu trú được ưa chuộng tại ${city.label}`}
                                    listings={listingsByCity[city.name] || []}
                                    onSelectListing={handleSelectListingInternal}
                                    onRequireAuth={onRequireAuth}
                                />
                            )
                    )}
                </SectionContainer>
            )}

            {selectedListingId && (
                <Suspense fallback={null}>
                    <ListingDetail
                        listingId={selectedListingId}
                        onClose={handleCloseDetail}
                        onEdit={() => {}}
                        onDeleted={() => {}}
                    />
                </Suspense>
            )}
        </div>
    );
}
