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
import type { ListingSummary, ListingDetail as ListingDetailType } from "../types";
import { toast } from "sonner";
import type L from "leaflet";
import { Button, EmptyState, ListingCard, ListingGrid, LoadingState, PageHeader, SectionContainer } from "@/components/ui";

interface LandlordPageProps {
    onSelectListing?: (id: string) => void;
    onNavigate?: (page: string) => void;
}

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
            <PageHeader
                className="mb-6"
                eyebrow="Quản lý tin"
                title={title}
                description={`${listings.length} bài đăng`}
            />
            <ListingGrid
                listings={listings}
                onSelect={onSelectListing}
                renderCard={(listing) => (
                    <ListingCard
                        key={listing.id}
                        listing={listing}
                        onSelect={onSelectListing}
                        badge="Đang hiển thị"
                    />
                )}
            />
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
            <LoadingState className="min-h-screen bg-white" />
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
                        <SectionContainer as="div" className="pb-12">
                            {myListings.length > 0 ? (
                                <ListingsRow
                                    title="Bài đăng của bạn"
                                    listings={myListings}
                                    onSelectListing={handleSelectListingInternal}
                                />
                            ) : (
                                <EmptyState
                                    icon={List}
                                    title="Chưa có bài đăng nào"
                                    description="Bắt đầu đăng tin cho thuê nhà của bạn."
                                    action={{ label: "Đăng bài ngay", onClick: () => handleTabChange("create") }}
                                />
                            )}
                        </SectionContainer>
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
                                <Button
                                    type="button"
                                    onClick={() => {
                                        setEditingListing(null);
                                        setShowForm(true);
                                    }}
                                    disabled={!pinLocation}
                                    variant="primary"
                                    className={`rounded-full ${
                                        pinLocation
                                            ? "hover:scale-105"
                                            : "bg-gray-300 text-gray-500 shadow-none"
                                    }`}
                                >
                                    <Plus size={18} />
                                    <span>Đăng bài</span>
                                </Button>
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
