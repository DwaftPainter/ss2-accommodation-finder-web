import { useState, useEffect, useRef } from "react";
import { Search, Heart, ChevronLeft, ChevronRight, Star, Home, SwitchCamera, X, Filter, LogOut, User, List } from "lucide-react";
import { listingsApi } from "../services/api";
import { useAuth } from "../hooks/useAuth";
import { useListingsStore, useUIStore } from "../stores";
import MapView from "../components/MapView";
import FilterPanel from "../components/FilterPanel";
import ListingDetail from "../components/ListingDetail";
import { formatAddress } from "../lib/utils";
import type { ListingSummary } from "../types";

interface HomePageProps {
    onSelectListing?: (id: string) => void;
    onNavigate?: (page: string) => void;
}

// Mock data for different cities
const citySections = [
    { name: "Hồ Chí Minh", query: "Ho Chi Minh" },
    { name: "Đà Nẵng", query: "Da Nang" },
    { name: "Seoul", query: "Seoul" },
    { name: "Hà Nội", query: "Ha Noi" }
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
        <div className="flex items-center justify-center py-2">
            <div className="flex items-center bg-white rounded-full shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
                {/* 📍 Location */}
                <div className="flex flex-col px-6 py-2 hover:bg-gray-100 rounded-full transition-colors text-left min-w-[180px]">
                    <span className="text-xs font-semibold text-gray-900">Địa điểm</span>
                    <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="VD: Hà Nội, Cầu Giấy..."
                        className="text-sm text-gray-500 bg-transparent outline-none w-full"
                    />
                </div>

                <div className="w-px h-6 bg-gray-300" />

                {/* 💰 Price */}
                <div className="flex flex-col px-6 py-2 hover:bg-gray-100 rounded-full transition-colors text-left min-w-[140px]">
                    <span className="text-xs font-semibold text-gray-900">Giá</span>
                    <input
                        type="text"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="VD: ≤ 3 triệu"
                        className="text-sm text-gray-500 bg-transparent outline-none w-full"
                    />
                </div>

                <div className="w-px h-6 bg-gray-300" />

                {/* 🏠 Keyword / Type */}
                <div className="flex flex-col px-6 py-2 hover:bg-gray-100 rounded-full transition-colors text-left min-w-[160px]">
                    <span className="text-xs font-semibold text-gray-900">Loại / Từ khóa</span>
                    <input
                        type="text"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        placeholder="Phòng trọ, căn hộ, gần trường..."
                        className="text-sm text-gray-500 bg-transparent outline-none w-full"
                    />
                </div>

                {/* 🔍 Search */}
                <div className="pr-1.5 pl-1">
                    <button
                        onClick={handleSearch}
                        className="flex items-center justify-center w-10 h-10 bg-linear-to-br from-emerald-500 to-teal-500 rounded-full hover:scale-105 transition-transform"
                    >
                        <Search size={16} className="text-white" />
                    </button>
                </div>
            </div>
        </div>
    );
}

function ListingCard({ listing, onSelect }: { listing: ListingSummary; onSelect: (id: string) => void }) {
    const { toggleSaved, isListingSaved } = useListingsStore();
    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => {
        setIsSaved(isListingSaved(listing.id));
    }, [listing.id, isListingSaved]);

    const handleToggleSaved = async (e: React.MouseEvent) => {
        e.stopPropagation();
        const result = await toggleSaved(listing.id);
        setIsSaved(result);
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("vi-VN").format(price);
    };

    const imageUrl = listing.images?.[0] || sampleImages[0];

    return (
        <div onClick={() => onSelect(listing.id)} className="group cursor-pointer flex-shrink-0 w-[280px]">
            <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-200 mb-3">
                <img
                    src={imageUrl}
                    alt={listing.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {/* Guest favorite badge */}
                {/* {listing.avgRating >= 4.8 && (
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                        <span className="text-xs font-semibold text-gray-900">Được khách yêu thích</span>
                    </div>
                )} */}
                {/* Heart button */}
                <button
                    onClick={handleToggleSaved}
                    className="absolute top-3 right-3 p-2 rounded-full hover:scale-110 transition-transform"
                >
                    <Heart
                        size={24}
                        className={`${isSaved ? "fill-rose-500 text-rose-500" : "fill-white/70 text-white"} drop-shadow-md`}
                    />
                </button>
            </div>
            <div className="space-y-1">
                <div className="flex items-start justify-between">
                    <h3 className="text-sm font-semibold text-gray-900 line-clamp-1">{listing.title}</h3>
                    <div className="flex items-center gap-1 text-sm">
                        <Star size={14} className="fill-gray-900 text-gray-900" />
                        {/* <span>{listing.avgRating.toFixed(2)}</span> */}
                    </div>
                </div>
                <p className="text-sm text-gray-500 line-clamp-1">{formatAddress(listing.address)}</p>
                <p className="text-sm text-gray-500">{listing.area} m²</p>
                <div className="flex items-baseline gap-1 pt-1">
                    <span className="text-sm font-semibold text-gray-900">₫{formatPrice(listing.price)}</span>
                </div>
            </div>
        </div>
    );
}

function ListingRow({
    title,
    listings,
    onSelectListing
}: {
    title: string;
    listings: ListingSummary[];
    onSelectListing: (id: string) => void;
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
            const scrollAmount = 300;
            scrollRef.current.scrollBy({
                left: direction === "left" ? -scrollAmount : scrollAmount,
                behavior: "smooth"
            });
        }
    };

    return (
        <div className="py-8">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => scroll("left")}
                        className={`p-2 rounded-full border border-gray-300 hover:border-gray-900 transition-colors ${!showLeftArrow ? "opacity-30 cursor-not-allowed" : ""}`}
                        disabled={!showLeftArrow}
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <button
                        onClick={() => scroll("right")}
                        className={`p-2 rounded-full border border-gray-300 hover:border-gray-900 transition-colors ${!showRightArrow ? "opacity-30 cursor-not-allowed" : ""}`}
                        disabled={!showRightArrow}
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>
            <div
                ref={scrollRef}
                className="flex gap-6 overflow-x-auto scrollbar-hide pb-4"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
                {listings.map((listing) => (
                    <ListingCard key={listing.id} listing={listing} onSelect={onSelectListing} />
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
        <div ref={menuRef} className="flex items-center gap-3 pl-4 border-l border-gray-200">
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
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
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-2 p-1 border border-gray-300 rounded-full hover:shadow-md transition-shadow cursor-pointer"
                >
                    <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                        {user?.name?.[0]?.toUpperCase() || "U"}
                    </div>
                </button>

                {isOpen && (
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                        <button
                            onClick={handleSavedClick}
                            className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            <List size={18} />
                            <span className="text-sm font-medium">Danh sách yêu thích</span>
                        </button>
                        <button
                            onClick={handleProfileClick}
                            className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            <User size={18} />
                            <span className="text-sm font-medium">Hồ sơ</span>
                        </button>
                        <hr className="my-2 border-gray-200" />
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
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

export default function HomePage({ onSelectListing, onNavigate }: HomePageProps) {
    const { user } = useAuth();
    const { userMode, toggleUserMode } = useUIStore();
    const { listings, fetchListings } = useListingsStore();
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
        // Update URL with search param without navigation
        const url = new URL(window.location.href);
        url.searchParams.set("view", "map");
        window.history.pushState({}, "", url);
    };

    // Handle closing map view
    const handleCloseMap = () => {
        setShowMap(false);
        const url = new URL(window.location.href);
        url.searchParams.delete("view");
        window.history.pushState({}, "", url);
    };

    // Check initial URL params
    useEffect(() => {
        const url = new URL(window.location.href);
        if (url.searchParams.get("view") === "map") {
            setShowMap(true);
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
    }, []);

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

    useEffect(() => {
        console.log("listingsByCity:", listingsByCity);
    }, [listingsByCity]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-gray-500 text-sm">Đang tải...</p>
                </div>
            </div>
        );
    }

    // Home Feed View
    return (
        <div className="min-h-screen bg-white flex flex-col">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex items-center justify-between h-20">
                        {/* Logo */}
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-linear-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                                <Home className="text-white" size={24} />
                            </div>
                            <div className="landing-brand">
                                <span className="landing-brand-text">AccomFinder</span>
                            </div>
                        </div>

                        {/* Search Bar */}
                        <SearchBar onShowMap={handleShowMap} />

                        {/* Right side - User menu */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleToggleMode}
                                className="flex justify-center w-33 min-w-33 items-center gap-2 text-sm text-center font-medium text-gray-900 hover:bg-gray-100  py-2 rounded-full transition-colors"
                            >
                                {modeButtonText}
                            </button>

                            <UserMenu user={user} onNavigate={onNavigate} />
                        </div>
                    </div>
                </div>
            </header>

            {showMap ? (
                <div className="flex-1 flex overflow-hidden relative">
                    {userMode === "finder" && (
                        <FilterPanel
                            filters={filters}
                            onFilterChange={setFilters}
                            onSearch={() => {}}
                            visible={showFilters}
                        />
                    )}

                    <div className="flex-1 p-4 overflow-hidden">
                        <div className="h-full rounded-2xl overflow-hidden border border-gray-200 shadow-lg bg-white">
                            <MapView
                                listings={listings}
                                onSelectListing={(id) => handleSelectListingInternal(id)}
                                onMapClick={null}
                                pinLocation={null}
                                flyTo={flyTo}
                                onClose={() => setShowMap(false)}
                            />
                        </div>
                    </div>
                </div>
            ) : (
                <main className="max-w-7xl mx-auto px-6 pb-12">
                    {citySections.map(
                        (city) =>
                            listingsByCity[city.name]?.length > 0 && (
                                <ListingRow
                                    key={city.name}
                                    title={`Nơi lưu trú được ưa chuộng tại ${city.name}`}
                                    listings={listingsByCity[city.name] || []}
                                    onSelectListing={handleSelectListingInternal}
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
