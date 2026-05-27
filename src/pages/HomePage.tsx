import { lazy, Suspense, useState, useEffect, useRef } from "react";
import {
    Search,
    Heart,
    Star,
    SlidersHorizontal,
    SwitchCamera,
    LogOut,
    User,
    List,
    MessageSquare,
    ChevronLeftIcon,
    ChevronRightIcon
} from "lucide-react";
import { listingsApi } from "../services/api";
import { useAuth } from "../hooks/useAuth";
import { useListingsStore, useUIStore } from "../stores";
import FilterPanel from "../components/FilterPanel";
import NotificationBell from "../components/NotificationBell";
import { formatAddress } from "../lib/utils";
import type { ListingFilters, ListingSummary } from "../types";
import Loader from "@/components/ui/loading";
import { useNavigate } from "react-router-dom";
import {
    CITY_SECTIONS,
    LISTING_FALLBACK_IMAGES,
    formatListingPrice,
} from "@/features/listings";

const ListingDetail = lazy(() => import("../components/ListingDetail"));
const MapView = lazy(() => import("../components/MapView"));

interface HomePageProps {
    onSelectListing?: (id: string) => void;
    onNavigate?: (page: string) => void;
    onRequireAuth?: () => void;
}

type SearchInput = {
    location: string;
    price: string;
    keyword: string;
};

function parsePriceFilter(priceInput: string): Pick<ListingFilters, "price_min" | "price_max"> {
    const normalized = priceInput
        .trim()
        .toLowerCase()
        .replace(/,/g, ".")
        .replace(/\s+/g, " ");

    if (!normalized) return {};

    const toVnd = (value: string) => {
        const parsed = Number.parseFloat(value);
        if (!Number.isFinite(parsed)) return undefined;
        return Math.round(parsed * 1_000_000);
    };

    const rangeMatch = normalized.match(/(\d+(?:\.\d+)?)\s*(?:-|đến|toi|tới)\s*(\d+(?:\.\d+)?)/);
    if (rangeMatch) {
        return {
            price_min: toVnd(rangeMatch[1]),
            price_max: toVnd(rangeMatch[2]),
        };
    }

    const amountMatch = normalized.match(/(\d+(?:\.\d+)?)/);
    if (!amountMatch) return {};

    const amount = toVnd(amountMatch[1]);
    if (amount === undefined) return {};

    if (
        normalized.includes(">") ||
        normalized.includes("trên") ||
        normalized.includes("tu ") ||
        normalized.includes("từ ")
    ) {
        return { price_min: amount };
    }

    return { price_max: amount };
}

function buildSearchFilters({ location, price, keyword }: SearchInput): ListingFilters {
    const search = [location, keyword]
        .map((value) => value.trim())
        .filter(Boolean)
        .join(" ");

    return {
        ...(search ? { search } : {}),
        ...parsePriceFilter(price),
    };
}

function hasActiveFilters(filters: ListingFilters) {
    return Object.values(filters).some((value) => {
        if (Array.isArray(value)) return value.length > 0;
        return value !== undefined && value !== null && value !== "";
    });
}

function SearchBar({ onSearch }: { onSearch: (filters: ListingFilters) => void }) {
    const [location, setLocation] = useState("");
    const [price, setPrice] = useState("");
    const [keyword, setKeyword] = useState("");

    const handleSearch = () => {
        onSearch(buildSearchFilters({ location, price, keyword }));
    };

    return (
        <div className="flex items-center justify-center py-1.5 w-full px-0">
            {/* Mobile: Simplified Search Bar */}
            <div className="flex w-full max-w-md items-center rounded-full border border-gray-200 bg-white shadow-md transition-shadow hover:shadow-lg md:hidden">
                <div className="flex flex-col px-4 py-2 hover:bg-gray-100 rounded-full transition-colors text-left flex-1 min-w-0">
                    <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        placeholder="Tìm kiếm địa điểm..."
                        className="w-full bg-transparent text-sm text-gray-700 outline-none"
                        aria-label="Tìm kiếm địa điểm"
                    />
                </div>
                <div className="pr-1.5 pl-1">
                    <button
                        type="button"
                        onClick={handleSearch}
                        aria-label="Mở bản đồ tìm kiếm"
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br from-emerald-500 to-teal-500 transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                    >
                        <Search size={16} className="text-white" aria-hidden="true" />
                    </button>
                </div>
            </div>

            {/* Desktop: Full Search Bar */}
            <div className="hidden md:flex items-center max-w-full bg-white rounded-full shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
                {/* 📍 Location */}
                <div className="flex flex-col px-4 xl:px-6 py-2 hover:bg-gray-100 rounded-full transition-colors text-left min-w-0 w-40 xl:w-[180px]">
                    <span className="text-xs font-semibold text-gray-900">Địa điểm</span>
                    <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        placeholder="VD: Hà Nội, Cầu Giấy..."
                        className="w-full bg-transparent text-sm text-gray-500 outline-none"
                        aria-label="Địa điểm"
                    />
                </div>

                <div className="w-px h-6 bg-gray-300" />

                {/* 💰 Price */}
                <div className="flex flex-col px-4 xl:px-6 py-2 hover:bg-gray-100 rounded-full transition-colors text-left min-w-0 w-32 xl:w-[140px]">
                    <span className="text-xs font-semibold text-gray-900">Giá</span>
                    <input
                        type="text"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        placeholder="VD: ≤ 3 triệu"
                        className="w-full bg-transparent text-sm text-gray-500 outline-none"
                        aria-label="Giá thuê"
                    />
                </div>

                <div className="w-px h-6 bg-gray-300" />

                {/* 🏠 Keyword / Type */}
                <div className="flex flex-col px-4 xl:px-6 py-2 hover:bg-gray-100 rounded-full transition-colors text-left min-w-0 w-40 xl:w-[160px]">
                    <span className="text-xs font-semibold text-gray-900">Loại / Từ khóa</span>
                    <input
                        type="text"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        placeholder="Phòng trọ, căn hộ, gần trường..."
                        className="w-full bg-transparent text-sm text-gray-500 outline-none"
                        aria-label="Loại phòng hoặc từ khóa"
                    />
                </div>

                {/* 🔍 Search */}
                <div className="pr-1.5 pl-1">
                    <button
                        type="button"
                        onClick={handleSearch}
                        aria-label="Mở bản đồ tìm kiếm"
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br from-emerald-500 to-teal-500 transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                    >
                        <Search size={16} className="text-white" aria-hidden="true" />
                    </button>
                </div>
            </div>
        </div>
    );
}

function ListingCard({
    listing,
    onSelect,
    onRequireAuth
}: {
    listing: ListingSummary;
    onSelect: (id: string) => void;
    onRequireAuth?: () => void;
}) {
    const isSaved = useListingsStore((state) => state.isListingSaved(listing.id));
    const toggleSaved = useListingsStore((state) => state.toggleSaved);
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    const handleToggleSaved = async (e: React.MouseEvent) => {
        e.stopPropagation();

        if (!user) {
            onRequireAuth?.();
            return;
        }

        if (isLoading) return;

        setIsLoading(true);
        try {
            await toggleSaved(listing.id);
        } catch (error) {
            console.error("Failed to toggle saved status:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const imageUrl = listing.images?.[0] || LISTING_FALLBACK_IMAGES[0];

    return (
        <div onClick={() => onSelect(listing.id)} className="group cursor-pointer flex-shrink-0 w-[72vw] max-w-[280px] sm:w-[280px]">
            <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-200 mb-3">
                <img
                    src={imageUrl}
                    alt={listing.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                {/* Guest favorite badge */}
                {listing.avgRating >= 4.5 && (
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                        <span className="text-xs font-semibold text-gray-900">Được yêu thích</span>
                    </div>
                )}
                {/* Heart button */}
                <button
                    type="button"
                    onClick={handleToggleSaved}
                    aria-label={isSaved ? "Bỏ lưu tin" : "Lưu tin"}
                    className="absolute right-3 top-3 rounded-full p-2 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2"
                >
                    <Heart
                        size={24}
                        className={`${isSaved ? "fill-rose-500 text-rose-500" : "fill-white/70 text-white"} drop-shadow-md`}
                    />
                </button>
            </div>
            <div className="space-y-1 px-1 pb-2">
                <div className="flex items-start justify-between">
                    <h3 className="text-sm font-semibold text-gray-900 line-clamp-1">{listing.title}</h3>
                    <div className="flex items-center gap-1 text-sm">
                        <Star size={14} className="fill-gray-900 text-gray-900" />
                        <span>{listing.avgRating > 0 ? listing.avgRating.toFixed(1) : "N/A"}</span>
                    </div>
                </div>
                <p className="text-sm text-gray-500 line-clamp-1">{formatAddress(listing.address)}</p>
                <p className="text-sm text-gray-500">{listing.area} m²</p>
                <div className="flex items-baseline gap-1 pt-1">
                    <span className="text-sm font-semibold text-gray-900">₫{formatListingPrice(listing.price, "")}</span>
                </div>
            </div>
        </div>
    );
}

function ListingRow({
    title,
    listings,
    onSelectListing,
    onRequireAuth
}: {
    title: string;
    listings: ListingSummary[];
    onSelectListing: (id: string) => void;
    onRequireAuth?: () => void;
}) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(true);

    const checkScroll = () => {
        if (scrollRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
            setShowLeftArrow(scrollLeft > 0);
            setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
        }
    };

    useEffect(() => {
        checkScroll();
        const scrollEl = scrollRef.current;
        if (scrollEl) {
            scrollEl.addEventListener("scroll", checkScroll);
            return () => scrollEl.removeEventListener("scroll", checkScroll);
        }
    }, []);

    const scroll = (direction: "left" | "right") => {
        if (scrollRef.current) {
            scrollRef.current.scrollBy({
                left: direction === "left" ? -300 : 300,
                behavior: "smooth"
            });
        }
    };

    return (
        <div className="py-8">
            <div className="flex items-center justify-between gap-3 mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{title}</h2>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => scroll("left")}
                        className={`p-2 rounded-full border border-gray-300 hover:border-gray-900 transition-colors ${!showLeftArrow ? "opacity-30 cursor-not-allowed" : ""}`}
                        disabled={!showLeftArrow}
                    >
                        <ChevronLeftIcon size={20} />
                    </button>
                    <button
                        onClick={() => scroll("right")}
                        className={`p-2 rounded-full border border-gray-300 hover:border-gray-900 transition-colors ${!showRightArrow ? "opacity-30 cursor-not-allowed" : ""}`}
                        disabled={!showRightArrow}
                    >
                        <ChevronRightIcon size={20} />
                    </button>
                </div>
                <p className="text-sm text-gray-500">{listings.length} lựa chọn phù hợp</p>
            </div>

            <div
                ref={scrollRef}
                className="flex gap-6 overflow-x-auto scrollbar-hide pb-4"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
                {listings.map((listing) => (
                    <ListingCard
                        key={listing.id}
                        listing={listing}
                        onSelect={onSelectListing}
                        onRequireAuth={onRequireAuth}
                    />
                ))}
            </div>
        </div>
    );
}

// User Menu Component
interface UserMenuProps {
    user: { name?: string } | null;
    onNavigate?: (page: string) => void;
}

function UserMenu({ user, onNavigate }: UserMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const { logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSavedClick = () => {
        onNavigate?.("saved");
        setIsOpen(false);
    };

    const handleProfileClick = () => {
        onNavigate?.("profile");
        setIsOpen(false);
    };

    const handleLogout = () => {
        logout();
        setIsOpen(false);
    };

    return (
        <div ref={menuRef} className="flex items-center gap-2 border-l border-gray-200 pl-2 sm:gap-3 sm:pl-4">
            <button
                type="button"
                aria-label="Mở menu tài khoản"
                className="hidden rounded-full p-2 transition-colors hover:bg-gray-100 sm:block"
            >
                <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                >
                    <path d="M3 12h18M3 6h18M3 18h18" />
                </svg>
            </button>
            <div className="relative">
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    aria-expanded={isOpen}
                    aria-haspopup="menu"
                    className="flex cursor-pointer items-center gap-2 rounded-full border border-gray-300 p-1 transition-shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 text-sm font-medium text-white">
                        {user?.name?.[0]?.toUpperCase() || "U"}
                    </div>
                </button>

                {isOpen && (
                    <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-xl border border-gray-200 bg-white py-2 shadow-lg" role="menu">
                        <button
                            type="button"
                            onClick={handleSavedClick}
                            className="flex w-full items-center gap-3 px-4 py-3 text-gray-700 transition-colors hover:bg-gray-50"
                            role="menuitem"
                        >
                            <List size={18} />
                            <span className="text-sm font-medium">Danh sách yêu thích</span>
                        </button>
                        <button
                            type="button"
                            className="flex w-full items-center gap-3 px-4 py-3 text-gray-700 transition-colors hover:bg-gray-50"
                            onClick={() => navigate("/finder/chat")}
                            role="menuitem"
                        >
                            <MessageSquare size={18} />
                            <span className="text-sm font-medium">Tin nhắn</span>
                        </button>
                        <button
                            type="button"
                            onClick={handleProfileClick}
                            className="flex w-full items-center gap-3 px-4 py-3 text-gray-700 transition-colors hover:bg-gray-50"
                            role="menuitem"
                        >
                            <User size={18} />
                            <span className="text-sm font-medium">Hồ sơ</span>
                        </button>
                        <hr className="my-2 border-gray-200" />
                        <button
                            type="button"
                            onClick={handleLogout}
                            className="flex w-full items-center gap-3 px-4 py-3 text-gray-700 transition-colors hover:bg-gray-50"
                            role="menuitem"
                        >
                            <LogOut size={18} />
                            <span className="text-sm font-medium">Đăng xuất</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
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

    // Map view state controlled by search params
    const [showMap, setShowMap] = useState(false);
    const [filters, setFilters] = useState<ListingFilters>({});
    const [showFilters, setShowFilters] = useState(false);
    const [selectedListingId, setSelectedListingId] = useState<string | null>(null);
    const [flyTo, setFlyTo] = useState<[number, number] | null>(null);

    const modeButtonText = "Cho thuê phòng";

    const handleToggleMode = () => {
        // Navigate to landlord page
        onNavigate?.("landlord");
    };

    // Handle showing map view
    const handleShowMap = (searchFilters: ListingFilters = filters) => {
        setFilters(searchFilters);
        setShowMap(true);
        setShowFilters(window.innerWidth >= 1024);
        // Update URL with search param without navigation
        const url = new URL(window.location.href);
        url.searchParams.set("view", "map");
        if (searchFilters.search) {
            url.searchParams.set("q", String(searchFilters.search));
        } else {
            url.searchParams.delete("q");
        }
        window.history.pushState({}, "", url);
    };

    // Handle closing map view
    const handleCloseMap = () => {
        setShowMap(false);
        setFilters({});
        setShowFilters(false);
        const url = new URL(window.location.href);
        url.searchParams.delete("view");
        url.searchParams.delete("q");
        window.history.pushState({}, "", url);
    };

    // Check initial URL params
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

    // Fetch listings for map view
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
            // Address is always an object now
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
            <div className="min-h-screen flex items-center justify-center bg-white">
                <Loader />
            </div>
        );
    }

    // Home Feed View
    return (
        <div className="flex min-h-screen flex-col overflow-x-hidden bg-slate-50">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="flex flex-wrap lg:flex-nowrap items-center justify-between min-h-16 lg:min-h-20 py-2 gap-2 lg:gap-3">
                        {/* Logo */}
                        <div className="order-1 flex items-center gap-2 flex-shrink-0 min-w-0">
                            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-linear-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                                <img src="/logo.png" alt="Logo" className="size-5" />
                            </div>
                            <div className="landing-brand hidden lg:block min-w-0">
                                <span className="landing-brand-text text-lg xl:text-xl">AccomFinder</span>
                            </div>
                        </div>

                        {/* Search Bar - Hidden on small mobile, shown on md+ */}
                        <div className="order-3 lg:order-2 basis-full lg:basis-auto lg:flex-1 flex justify-center min-w-0 px-0 lg:px-2 xl:px-4">
                            <SearchBar onSearch={handleShowMap} />
                        </div>

                        {/* Right side - User menu */}
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
                <div className="flex-1 min-h-[calc(100dvh-4rem)] sm:min-h-[calc(100dvh-5rem)] flex flex-col md:flex-row overflow-hidden relative">
                    {userMode === "finder" && (
                        <FilterPanel
                            filters={filters}
                            onFilterChange={updateFilters}
                            onSearch={applyFilters}
                            visible={showFilters}
                        />
                    )}

                    <div className="w-full md:w-[360px] lg:w-[380px] md:max-w-[40vw] bg-white border-b md:border-b-0 md:border-r border-gray-200 flex flex-col max-h-[45dvh] md:max-h-none z-[900]">
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
                            <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2 overflow-x-auto">
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
                                <div className="py-12 flex justify-center">
                                    <Loader />
                                </div>
                            ) : searchError ? (
                                <div className="rounded-lg border border-rose-100 bg-rose-50 p-4 text-sm text-rose-700">
                                    {searchError}
                                </div>
                            ) : listings.length === 0 ? (
                                <div className="py-12 text-center">
                                    <p className="font-medium text-slate-900">Không tìm thấy bài đăng</p>
                                    <p className="mt-1 text-sm text-slate-500">Thử đổi khu vực, khoảng giá hoặc tiện ích.</p>
                                </div>
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

                    <div className="flex-1 min-h-[55dvh] p-2 sm:p-4 overflow-hidden">
                        <div className="h-full min-h-[55dvh] rounded-xl sm:rounded-2xl overflow-hidden border border-gray-200 shadow-lg bg-white">
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
                <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 pb-12">
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
                </main>
            )}

            {/* Listing Detail Modal */}
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
