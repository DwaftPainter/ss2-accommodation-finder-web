import { useState, useEffect, useRef } from "react";
import {
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
import { useAuth } from "../hooks/use-auth";
import { useListingsStore } from "../stores";
import MapView from "../components/map-view";
import NotificationBell from "../components/notification-bell";
import ListingDetail from "../components/listing-detail";
import ListingForm from "../components/listing-form";
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
        <div className="flex items-center justify-center w-full">
            <div className="grid grid-cols-2 w-full max-w-sm sm:max-w-md lg:w-auto lg:max-w-none lg:flex lg:items-center bg-white rounded-full shadow-md border border-gray-200 p-1">
                <button
                    type="button"
                    onClick={() => onTabChange("listings")}
                    className={`flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-2 rounded-full transition-all ${
                        activeTab === "listings"
                            ? "bg-gray-900 text-white"
                            : "text-gray-600 hover:bg-gray-100"
                    }`}
                >
                    <List size={16} aria-hidden="true" />
                    <span className="text-xs sm:text-sm font-medium whitespace-nowrap">Bài đăng</span>
                </button>
                <button
                    type="button"
                    onClick={() => onTabChange("create")}
                    className={`flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-2 rounded-full transition-all ${
                        activeTab === "create"
                            ? "bg-emerald-500 text-white"
                            : "text-gray-600 hover:bg-gray-100"
                    }`}
                >
                    <Plus size={16} aria-hidden="true" />
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
        <div ref={menuRef} className="flex items-center gap-2 border-l border-gray-200 pl-2 sm:gap-3 sm:pl-4">
            <button
                type="button"
                aria-label="Mở menu tài khoản"
                className="hidden rounded-full p-2 transition-colors hover:bg-gray-100 sm:block"
            >
                <Menu size={18} aria-hidden="true" />
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
                            onClick={handleMessagesClick}
                            className="flex w-full items-center gap-3 px-4 py-3 text-gray-700 transition-colors hover:bg-gray-50"
                            role="menuitem"
                        >
                            <MessageSquare size={18} />
                            <span className="text-sm font-medium">Tin nhắn</span>
                        </button>
                        <button
                            type="button"
                            onClick={handleSavedClick}
                            className="flex w-full items-center gap-3 px-4 py-3 text-gray-700 transition-colors hover:bg-gray-50"
                            role="menuitem"
                        >
                            <List size={18} className="rotate-90" />
                            <span className="text-sm font-medium">Yêu thích đã lưu</span>
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

function ListingCard({ listing, onSelect }: { listing: ListingSummary; onSelect: (id: string) => void }) {
    const formatPrice = (price: number) => new Intl.NumberFormat("vi-VN").format(price);
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
                <div className="absolute right-3 top-3 rounded-full bg-white/90 px-2 py-1 text-xs font-medium shadow-sm">
                    Đang hiển thị
                </div>
            </div>
            <div className="space-y-1 px-1 pb-2">
                <h3 className="text-sm font-semibold text-gray-900 line-clamp-1">{listing.title}</h3>
                <p className="text-sm text-gray-500 line-clamp-1">{formatAddress(listing.address)}</p>
                <p className="text-sm text-gray-500">{listing.area} m²</p>
                <div className="flex items-baseline gap-1 pt-1">
                    <span className="text-sm font-semibold text-gray-900">₫{formatPrice(listing.price)}</span>
                </div>
            </div>
        </article>
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
    return (
        <section className="py-6 sm:py-8">
            <div className="mb-5 flex flex-col gap-2 sm:mb-6 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">Quản lý tin</p>
                    <h2 className="mt-1 text-[clamp(1.35rem,4vw,2rem)] font-bold leading-tight text-gray-950">
                        {title}
                    </h2>
                </div>
                <p className="text-sm text-gray-500">{listings.length} bài đăng</p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {listings.map((listing) => (
                    <ListingCard key={listing.id} listing={listing} onSelect={onSelectListing} />
                ))}
            </div>
        </section>
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

    const handleEditListing = (listing: ListingDetailType) => {
        setSelectedListingId(null);
        setEditingListing(listing);
        setShowForm(true);
    };

    const [editingListing, setEditingListing] = useState<ListingDetailType | null>(null);

    const refreshListings = async () => {
        try {
            const allListings = await listingsApi.getMyListings();
            setMyListings(allListings);
        } catch (error) {
            console.error("Failed to refresh listings:", error);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <Loader />
            </div>
        );
    }

    return (
        <div className="min-h-[100dvh] h-[100dvh] flex flex-col overflow-hidden bg-white">
            {/* Header */}
            <header className="flex-shrink-0 z-50 bg-white border-b border-gray-200">
                <div className="w-full px-4 sm:px-6">
                    <div className="flex flex-wrap lg:flex-nowrap items-center justify-between min-h-16 lg:min-h-20 py-2 gap-2 lg:gap-3">
                        <div className="order-1 flex items-center gap-2 flex-shrink-0 min-w-0">
                            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-linear-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                                <Home className="text-white" size={20} />
                            </div>
                            <div className="landing-brand hidden lg:block min-w-0">
                                <span className="landing-brand-text text-lg xl:text-xl">AccomFinder</span>
                            </div>
                        </div>

                        <div className="order-3 lg:order-2 basis-full lg:basis-auto lg:flex-1 flex justify-center min-w-0 px-0 lg:px-2 xl:px-4">
                            <LandlordNav activeTab={activeTab} onTabChange={handleTabChange} />
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
                                aria-label="Chuyển sang chế độ tìm phòng"
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

            {/* Main Content */}
            <main className="flex min-h-0 flex-1 flex-col">
                {activeTab === "listings" ? (
                    <div className="flex-1 overflow-y-auto">
                        <div className="w-full px-4 sm:px-6 pb-12">
                            {myListings.length > 0 ? (
                                <ListingsRow
                                    title="Bài đăng của bạn"
                                    listings={myListings}
                                    onSelectListing={handleSelectListingInternal}
                                />
                            ) : (
                                <div className="flex flex-col items-center justify-center px-4 py-20 text-center">
                                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                                        <List size={32} className="text-gray-400" />
                                    </div>
                                    <h3 className="text-xl font-medium text-gray-900 mb-2">
                                        Chưa có bài đăng nào
                                    </h3>
                                    <p className="text-gray-500 mb-6">
                                        Bắt đầu đăng tin cho thuê nhà của bạn
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => handleTabChange("create")}
                                        className="rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-3 font-medium text-white shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                                    >
                                        Đăng bài ngay
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 p-2 sm:p-4 overflow-hidden">
                        <div className="h-full rounded-xl sm:rounded-2xl overflow-hidden border border-gray-200 shadow-lg bg-white relative">
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

                            {/* Create listing button - top right */}
                            <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-[400]">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setEditingListing(null);
                                        setShowForm(true);
                                    }}
                                    disabled={!pinLocation}
                                    className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-full shadow-lg text-sm font-medium transition-all ${
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
                                <div className="absolute inset-x-3 bottom-4 z-[400] mx-auto max-w-sm rounded-2xl bg-white/90 px-4 py-2 text-center shadow-md backdrop-blur sm:bottom-8">
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
                    onEdit={handleEditListing}
                    onDeleted={refreshListings}
                />
            )}

            {showForm && (
                <ListingForm
                    listing={editingListing}
                    pinLocation={pinLocation}
                    onClose={() => {
                        setShowForm(false);
                        setEditingListing(null);
                        setPinLocation(null);
                    }}
                    onSaved={async () => {
                        await refreshListings();
                        // If we were creating (no editingListing), switch to listings tab
                        if (!editingListing) {
                            setActiveTab("listings");
                        }
                    }}
                />
            )}
        </div>
    );
}
