import { useState, useEffect, useRef } from "react";
import {
    ChevronLeft,
    ChevronRight,
    Home,
    Plus,
    List,
    LogOut,
    User,
    Menu,
    SwitchCamera,
    MessageSquare
} from "lucide-react";
import { listingsApi } from "../services/api";
import { useAuth } from "../hooks/useAuth";
import { useListingsStore } from "../stores";
import MapView from "../components/MapView";
import ListingDetail from "../components/ListingDetail";
import ListingForm from "../components/ListingForm";
import { formatAddress } from "../lib/utils";
import type { ListingSummary, ListingDetail as ListingDetailType } from "../types";
import { toast } from "sonner";
import type L from "leaflet";
import Loader from "@/components/ui/loading";

interface LandlordPageProps {
    onSelectListing?: (id: string) => void;
    onNavigate?: (page: string) => void;
}

const sampleImages = [
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&auto=format&fit=crop"
];

interface LandlordNavProps {
    activeTab: "listings" | "create";
    onTabChange: (tab: "listings" | "create") => void;
}

function LandlordNav({ activeTab, onTabChange }: LandlordNavProps) {
    return (
        <div className="flex items-center justify-center">
            <div className="flex items-center bg-white rounded-full shadow-md border border-gray-200 p-1">
                <button
                    onClick={() => onTabChange("listings")}
                    className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-2 rounded-full transition-all ${
                        activeTab === "listings"
                            ? "bg-gray-900 text-white"
                            : "text-gray-600 hover:bg-gray-100"
                    }`}
                >
                    <List size={16} />
                    <span className="text-xs sm:text-sm font-medium whitespace-nowrap">Bài đăng</span>
                </button>
                <button
                    onClick={() => onTabChange("create")}
                    className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-2 rounded-full transition-all ${
                        activeTab === "create"
                            ? "bg-emerald-500 text-white"
                            : "text-gray-600 hover:bg-gray-100"
                    }`}
                >
                    <Plus size={16} />
                    <span className="text-xs sm:text-sm font-medium whitespace-nowrap">Đăng bài</span>
                </button>
            </div>
        </div>
    );
}

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
    const handleMessagesClick = () => {
        onNavigate?.("messages");
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
                <Menu size={18} />
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
                            onClick={handleMessagesClick}
                            className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            <MessageSquare size={18} />
                            <span className="text-sm font-medium">Tin nhắn</span>
                        </button>
                        <button
                            onClick={handleSavedClick}
                            className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            <List size={18} className="rotate-90" />
                            <span className="text-sm font-medium">Yêu thích đã lưu</span>
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

function ListingCard({ listing, onSelect }: { listing: ListingSummary; onSelect: (id: string) => void }) {
    const formatPrice = (price: number) => new Intl.NumberFormat("vi-VN").format(price);
    const imageUrl = listing.images?.[0] || sampleImages[0];

    return (
        <div onClick={() => onSelect(listing.id)} className="group cursor-pointer flex-shrink-0 w-[280px]">
            <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-200 mb-3">
                <img
                    src={imageUrl}
                    alt={listing.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 right-3 px-2 py-1 bg-white/90 rounded-full text-xs font-medium">
                    Đang hiển thị
                </div>
            </div>
            <div className="space-y-1">
                <h3 className="text-sm font-semibold text-gray-900 line-clamp-1">{listing.title}</h3>
                <p className="text-sm text-gray-500 line-clamp-1">{formatAddress(listing.address)}</p>
                <p className="text-sm text-gray-500">{listing.area} m²</p>
                <div className="flex items-baseline gap-1 pt-1">
                    <span className="text-sm font-semibold text-gray-900">₫{formatPrice(listing.price)}</span>
                </div>
            </div>
        </div>
    );
}

function ListingsRow({
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
            scrollRef.current.scrollBy({
                left: direction === "left" ? -300 : 300,
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

export default function LandlordPage({ onSelectListing, onNavigate }: LandlordPageProps) {
    const { user } = useAuth();
    const { fetchListings } = useListingsStore();
    const [myListings, setMyListings] = useState<ListingSummary[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"listings" | "create">("listings");

    const [selectedListingId, setSelectedListingId] = useState<string | null>(null);
    const [flyTo, setFlyTo] = useState<[number, number] | null>(null);
    const [pinLocation, setPinLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [showForm, setShowForm] = useState(false);

    const modeButtonText = "Tìm phòng trọ";

    useEffect(() => {
        const fetchMyListingsAction = async () => {
            setIsLoading(true);
            try {
                // Should fetch ONLY user's listings, not all listings
                const allListings = await listingsApi.getMyListings();
                setMyListings(allListings);
            } catch (error) {
                console.error("Failed to fetch listings:", error);
                toast.error("Không thể tải danh sách bài đăng của bạn");
            } finally {
                setIsLoading(false);
            }
        };

        fetchMyListingsAction();
    }, []);

    const handleToggleMode = () => {
        onNavigate?.("finder");
    };

    const isValidCoordinate = (lat: number | undefined, lng: number | undefined): boolean => {
        return (
            typeof lat === "number" &&
            typeof lng === "number" &&
            !isNaN(lat) &&
            !isNaN(lng) &&
            lat >= -90 &&
            lat <= 90 &&
            lng >= -180 &&
            lng <= 180
        );
    };

    const handleSelectListingInternal = (id: string) => {
        setSelectedListingId(id);
        const listing = myListings.find((l) => l.id === id);
        if (isValidCoordinate(listing?.address.lat, listing?.address.lng)) {
            setFlyTo([listing!.address.lat, listing!.address.lng]);
        }
        onSelectListing?.(id);
    };

    const handleTabChange = (tab: "listings" | "create") => {
        setActiveTab(tab);
        if (tab === "create") {
            setFlyTo(null);
            setTimeout(() => {
                window.dispatchEvent(new Event("resize"));
            }, 50);
        }
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

    return (
        <div className="h-screen flex flex-col overflow-hidden bg-white">
            {/* Header */}
            <header className="flex-shrink-0 z-50 bg-white border-b border-gray-200">
                <div className="w-full px-4 sm:px-6">
                    <div className="flex items-center justify-between h-16 sm:h-20">
                        <div className="flex items-center gap-2 flex-shrink-0">
                            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-linear-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                                <Home className="text-white" size={20} />
                            </div>
                            <div className="landing-brand hidden sm:block">
                                <span className="landing-brand-text text-lg sm:text-xl">AccomFinder</span>
                            </div>
                        </div>

                        <div className="flex-1 flex justify-center px-2 sm:px-4">
                            <LandlordNav activeTab={activeTab} onTabChange={handleTabChange} />
                        </div>

                        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                            <button
                                onClick={handleToggleMode}
                                className="hidden sm:flex justify-center items-center gap-2 text-sm text-center font-medium text-gray-900 hover:bg-gray-100 py-2 px-4 rounded-full transition-colors whitespace-nowrap"
                            >
                                {modeButtonText}
                            </button>

                            <button
                                onClick={handleToggleMode}
                                className="sm:hidden flex items-center justify-center w-9 h-9 rounded-full hover:bg-gray-100 transition-colors"
                            >
                                <SwitchCamera size={20} className="text-gray-700" />
                            </button>
                            <UserMenu user={user} onNavigate={onNavigate} />
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
                {activeTab === "listings" ? (
                    <div className="flex-1 overflow-y-auto">
                        <div className="w-full px-6 pb-12">
                            {myListings.length > 0 ? (
                                <ListingsRow
                                    title="Bài đăng của bạn"
                                    listings={myListings}
                                    onSelectListing={handleSelectListingInternal}
                                />
                            ) : (
                                <div className="flex flex-col items-center justify-center py-20">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                        <List size={32} className="text-gray-400" />
                                    </div>
                                    <h3 className="text-xl font-medium text-gray-900 mb-2">
                                        Chưa có bài đăng nào
                                    </h3>
                                    <p className="text-gray-500 mb-6">
                                        Bắt đầu đăng tin cho thuê nhà của bạn
                                    </p>
                                    <button
                                        onClick={() => handleTabChange("create")}
                                        className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-medium rounded-lg transition-all shadow-md hover:shadow-lg"
                                    >
                                        Đăng bài ngay
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 p-4 overflow-hidden">
                        <div className="h-full rounded-2xl overflow-hidden border border-gray-200 shadow-lg bg-white relative">
                            <MapView
                                listings={[]}
                                onSelectListing={() => {}}
                                onMapClick={(latlng: L.LatLng) =>
                                    setPinLocation({ lat: latlng.lat, lng: latlng.lng })
                                }
                                pinLocation={pinLocation}
                                flyTo={flyTo}
                                onClose={() => handleTabChange("listings")}
                                showClose={false}
                            />

                            {/* Back button - top left */}
                            <button
                                onClick={() => handleTabChange("listings")}
                                className="absolute top-4 left-4 z-[400] flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                <ChevronLeft size={16} />
                                Quay lại
                            </button>

                            {/* Create listing button - top right */}
                            <div className="absolute top-4 right-4 z-[400]">
                                <button
                                    onClick={() => setShowForm(true)}
                                    disabled={!pinLocation}
                                    className={`flex items-center gap-2 px-6 py-2.5 rounded-full shadow-lg text-sm font-medium transition-all ${
                                        pinLocation
                                            ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:shadow-xl hover:scale-105"
                                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                    }`}
                                >
                                    <Plus size={18} />
                                    <span>Đăng bài</span>
                                </button>
                            </div>

                            {/* Hint text when no location selected */}
                            {!pinLocation && (
                                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[400] px-4 py-2 bg-white/90 rounded-full shadow-md">
                                    <p className="text-sm text-gray-600">Nhấn vào bản đồ để chọn vị trí</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>

            {selectedListingId && (
                <ListingDetail
                    listingId={selectedListingId}
                    onClose={handleCloseDetail}
                    onEdit={() => {}}
                    onDeleted={() => {}}
                />
            )}

            {showForm && (
                <ListingForm
                    listing={null}
                    pinLocation={pinLocation}
                    onClose={() => {
                        setShowForm(false);
                        setPinLocation(null);
                    }}
                    onSaved={async (data) => {
                        try {
                            await listingsApi.create(data);
                            toast.success("Đăng tin thành công!");
                            setShowForm(false);
                            setPinLocation(null);
                            // Refresh listings
                            const allListings = await listingsApi.getMyListings();
                            setMyListings(allListings);
                            // Switch back to listings tab
                            setActiveTab("listings");
                        } catch (error) {
                            const errorMessage = error instanceof Error ? error.message : "Đăng tin thất bại";
                            toast.error(errorMessage);
                        }
                    }}
                />
            )}
        </div>
    );
}
