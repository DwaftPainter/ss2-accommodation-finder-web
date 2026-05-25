import { useState, useEffect, useRef } from "react";
import {
    Search,
    Heart,
    Star,
    SwitchCamera,
    LogOut,
    User,
    List,
    MessageSquare
} from "lucide-react";
import { listingsApi } from "../services/api";
import { useAuth } from "../hooks/useAuth";
import { useListingsStore, useUIStore } from "../stores";
import MapView from "../components/MapView";
import FilterPanel from "../components/FilterPanel";
import ListingDetail from "../components/ListingDetail";
import { formatAddress } from "../lib/utils";
import type { ListingSummary } from "../types";
import Loader from "@/components/ui/loading";
import { useNavigate } from "react-router-dom";

interface HomePageProps {
    onSelectListing?: (id: string) => void;
    onNavigate?: (page: string) => void;
    onRequireAuth?: () => void;
}

// Mock data for different cities
const citySections = [
    { name: "Hồ Chí Minh", query: "Hồ Chí Minh" },
    { name: "Đà Nẵng", query: "Đà Nẵng" },
    { name: "Seoul", query: "Seoul" },
    { name: "Hà Nội", query: "Hà Nội" }
];

// Sample listing images for fallback
const sampleImages = [
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&auto=format&fit=crop"
];

function SearchBar({ onShowMap }: { onShowMap: () => void }) {
    const [location, setLocation] = useState("");
    const [price, setPrice] = useState("");
    const [keyword, setKeyword] = useState("");

    const handleSearch = () => {
        onShowMap();
    };

    return (
        <div className="flex w-full items-center justify-center py-2">
            {/* Mobile: Simplified Search Bar */}
            <div className="flex w-full max-w-md items-center rounded-full border border-gray-200 bg-white shadow-md transition-shadow hover:shadow-lg md:hidden">
                <div className="flex flex-col px-4 py-2 hover:bg-gray-100 rounded-full transition-colors text-left flex-1 min-w-0">
                    <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
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
            <div className="hidden w-full max-w-3xl items-center rounded-full border border-gray-200 bg-white shadow-md transition-shadow hover:shadow-lg md:flex">
                {/* 📍 Location */}
                <div className="flex min-w-0 flex-1 flex-col rounded-full px-5 py-2 text-left transition-colors hover:bg-gray-100">
                    <span className="text-xs font-semibold text-gray-900">Địa điểm</span>
                    <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="VD: Hà Nội, Cầu Giấy..."
                        className="w-full bg-transparent text-sm text-gray-500 outline-none"
                        aria-label="Địa điểm"
                    />
                </div>

                <div className="w-px h-6 bg-gray-300" />

                {/* 💰 Price */}
                <div className="flex min-w-0 flex-1 flex-col rounded-full px-5 py-2 text-left transition-colors hover:bg-gray-100">
                    <span className="text-xs font-semibold text-gray-900">Giá</span>
                    <input
                        type="text"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="VD: ≤ 3 triệu"
                        className="w-full bg-transparent text-sm text-gray-500 outline-none"
                        aria-label="Giá thuê"
                    />
                </div>

                <div className="w-px h-6 bg-gray-300" />

                {/* 🏠 Keyword / Type */}
                <div className="flex min-w-0 flex-1 flex-col rounded-full px-5 py-2 text-left transition-colors hover:bg-gray-100">
                    <span className="text-xs font-semibold text-gray-900">Loại / Từ khóa</span>
                    <input
                        type="text"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
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

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("vi-VN").format(price);
    };

    const imageUrl = listing.images?.[0] || sampleImages[0];

    return (
        <article
            onClick={() => onSelect(listing.id)}
            className="group min-w-0 cursor-pointer rounded-3xl bg-white p-2 shadow-sm ring-1 ring-gray-200 transition hover:-translate-y-1 hover:shadow-xl"
        >
            <div className="relative mb-3 aspect-[4/3] overflow-hidden rounded-2xl bg-gray-200 sm:aspect-square">
                <img
                    src={imageUrl}
                    alt={listing.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                {/* Guest favorite badge */}
                {/* {listing.avgRating >= 4.8 && (
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                        <span className="text-xs font-semibold text-gray-900">Được khách yêu thích</span>
                    </div>
                )} */}
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
                        <Star size={14} className="fill-gray-900 text-gray-900" aria-hidden="true" />
                        {/* <span>{listing.avgRating.toFixed(2)}</span> */}
                    </div>
                </div>
                <p className="text-sm text-gray-500 line-clamp-1">{formatAddress(listing.address)}</p>
                <p className="text-sm text-gray-500">{listing.area} m²</p>
                <div className="flex items-baseline gap-1 pt-1">
                    <span className="text-sm font-semibold text-gray-900">₫{formatPrice(listing.price)}</span>
                </div>
            </div>
        </article>
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
    return (
        <section className="py-6 sm:py-8">
            <div className="mb-5 flex flex-col gap-2 sm:mb-6 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">Gợi ý khu vực</p>
                    <h2 className="mt-1 text-[clamp(1.35rem,4vw,2rem)] font-bold leading-tight text-gray-950">
                        {title}
                    </h2>
                </div>
                <p className="text-sm text-gray-500">{listings.length} lựa chọn phù hợp</p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {listings.map((listing) => (
                    <ListingCard
                        key={listing.id}
                        listing={listing}
                        onSelect={onSelectListing}
                        onRequireAuth={onRequireAuth}
                    />
                ))}
            </div>
        </section>
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
    const { userMode } = useUIStore();
    const { listings, fetchListings, fetchSavedListings } = useListingsStore();
    const [listingsByCity, setListingsByCity] = useState<Record<string, ListingSummary[]>>({});
    const [isLoading, setIsLoading] = useState(true);

    // Map view state controlled by search params
    const [showMap, setShowMap] = useState(false);
    const [filters, setFilters] = useState<{ search?: string }>({});
    const [showFilters, setShowFilters] = useState(false);
    const [selectedListingId, setSelectedListingId] = useState<string | null>(null);
    const [flyTo, setFlyTo] = useState<[number, number] | null>(null);

    const modeButtonText = "Cho thuê phòng";

    const handleToggleMode = () => {
        // Navigate to landlord page
        onNavigate?.("landlord");
    };

    // Handle showing map view
    const handleShowMap = () => {
        setShowMap(true);
        setShowFilters(window.innerWidth >= 1024);
        // Update URL with search param without navigation
        const url = new URL(window.location.href);
        url.searchParams.set("view", "map");
        window.history.pushState({}, "", url);
    };

    // Handle closing map view
    const handleCloseMap = () => {
        setShowMap(false);
        setShowFilters(false);
        const url = new URL(window.location.href);
        url.searchParams.delete("view");
        window.history.pushState({}, "", url);
    };

    // Check initial URL params
    useEffect(() => {
        const url = new URL(window.location.href);
        if (url.searchParams.get("view") === "map") {
            setShowMap(true);
            setShowFilters(window.innerWidth >= 1024);
        }
    }, []);

    useEffect(() => {
        const fetchAllListings = async () => {
            setIsLoading(true);
            try {
                const results: Record<string, ListingSummary[]> = {};

                for (const city of citySections) {
                    try {
                        const cityListings = await listingsApi.getAll({ search: city.query });

                        const listingsWithImages = cityListings.map((listing, idx) => ({
                            ...listing,
                            images:
                                listing.images?.length > 0
                                    ? listing.images
                                    : [sampleImages[idx % sampleImages.length]]
                        }));

                        results[city.name] = listingsWithImages.slice(0, 8);
                    } catch {
                        results[city.name] = generateMockListings(city.name);
                    }
                }

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
    }, [showMap, filters]);

    const generateMockListings = (cityName: string): ListingSummary[] => {
        const types = ["Phòng", "Căn hộ", "Nhà", "Studio"];
        const districts =
            cityName === "Hồ Chí Minh"
                ? ["Quận 1", "Quận 3", "Quận 7", "Quận Phú Nhuận"]
                : cityName === "Đà Nẵng"
                  ? ["Quận Hải Châu", "Quận Sơn Trà", "Quận Ngũ Hành Sơn"]
                  : cityName === "Hà Nội"
                    ? ["Quận Hoàn Kiếm", "Quận Ba Đình", "Quận Cầu Giấy"]
                    : ["Quận Trung tâm", "Quận Gangnam", "Quận Hongdae"];
        const wards = ["Phường 1", "Phường 2", "Phường Bến Nghé", "Phường Tân Định"];

        return Array.from({ length: 8 }, (_, i) => ({
            id: `${cityName}-${i}`,
            title: `${types[i % types.length]} tại ${districts[i % districts.length]}`,
            address: {
                street: "123 Đường Nguyễn Văn A",
                ward: wards[i % wards.length],
                district: districts[i % districts.length],
                city: cityName,
                province: cityName,
                lat: 10.8231 + Math.random() * 0.1,
                lng: 106.6297 + Math.random() * 0.1
            },
            price: 500000 + Math.floor(Math.random() * 2000000),
            area: 15 + Math.floor(Math.random() * 50),
            utilities: ["wifi", "ac", "parking"],
            images: [sampleImages[i % sampleImages.length]],
            owner: { id: "1", name: "Host", avatarUrl: null },
            avgRating: 4.5 + Math.random() * 0.5,
            reviewCount: Math.floor(Math.random() * 100),
            createdAt: new Date().toISOString()
        }));
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
            <header className="z-50 border-b border-gray-200 bg-white/95 backdrop-blur lg:sticky lg:top-0">
                <div className="mx-auto max-w-7xl px-4 sm:px-6">
                    <div className="flex min-h-16 flex-wrap items-center justify-between gap-3 py-3 sm:min-h-20 lg:flex-nowrap">
                        {/* Logo */}
                        <div className="flex flex-shrink-0 items-center gap-2">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-emerald-500 to-teal-500 sm:h-10 sm:w-10">
                                <img src="/logo.png" alt="Logo" className="size-5" />
                            </div>
                            <div className="landing-brand hidden sm:block">
                                <span className="landing-brand-text text-lg sm:text-xl">AccomFinder</span>
                            </div>
                        </div>

                        {/* Search Bar - Hidden on small mobile, shown on md+ */}
                        <div className="order-3 flex w-full justify-center lg:order-2 lg:min-w-0 lg:flex-1 lg:px-4">
                            <SearchBar onShowMap={handleShowMap} />
                        </div>

                        {/* Right side - User menu */}
                        <div className="order-2 flex flex-shrink-0 items-center gap-2 sm:gap-3 lg:order-3">
                            <button
                                type="button"
                                onClick={handleToggleMode}
                                className="hidden items-center justify-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-center text-sm font-medium text-gray-900 transition-colors hover:bg-gray-100 sm:flex"
                            >
                                {modeButtonText}
                            </button>

                            <button
                                type="button"
                                onClick={handleToggleMode}
                                aria-label="Chuyển sang chế độ cho thuê"
                                className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-gray-100 sm:hidden"
                            >
                                <SwitchCamera size={20} className="text-gray-700" />
                            </button>

                            <UserMenu user={user} onNavigate={onNavigate} />
                        </div>
                    </div>
                </div>
            </header>

            {showMap ? (
                <div className="relative flex min-h-[calc(100vh-8rem)] flex-1 overflow-hidden">
                    {userMode === "finder" && (
                        <FilterPanel
                            filters={filters}
                            onFilterChange={setFilters}
                            onSearch={() => {}}
                            visible={showFilters}
                        />
                    )}

                    <button
                        type="button"
                        onClick={() => setShowFilters((current) => !current)}
                        className="absolute left-4 top-4 z-[1200] inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-lg ring-1 ring-slate-200 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 lg:hidden"
                    >
                        <Search size={15} aria-hidden="true" />
                        Bộ lọc
                    </button>

                    <div className="min-w-0 flex-1 overflow-hidden p-3 sm:p-4">
                        <div className="h-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg">
                            <MapView
                                listings={listings}
                                onSelectListing={(id) => handleSelectListingInternal(id)}
                                onMapClick={null}
                                pinLocation={null}
                                flyTo={flyTo}
                                onClose={handleCloseMap}
                            />
                        </div>
                    </div>
                </div>
            ) : (
                <main className="mx-auto w-full max-w-7xl px-4 pb-12 sm:px-6">
                    {citySections.map(
                        (city) =>
                            listingsByCity[city.name]?.length > 0 && (
                                <ListingRow
                                    key={city.name}
                                    title={`Nơi lưu trú được ưa chuộng tại ${city.name}`}
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
                <ListingDetail
                    listingId={selectedListingId}
                    onClose={handleCloseDetail}
                    onEdit={() => {}}
                    onDeleted={() => {}}
                />
            )}
        </div>
    );
}
