import { useEffect, useMemo, memo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { formatAddress } from "../lib/utils";
import type { ListingSummary } from "../types";
import LocationTracker from "./LocationTracker";
import { XIcon } from "lucide-react";

interface MapViewProps {
    listings: ListingSummary[];
    onSelectListing: (id: string) => void;
    onMapClick: ((latlng: L.LatLng) => void) | null;
    pinLocation: { lat: number; lng: number } | null;
    flyTo: [number, number] | null;
    onClose: () => void;
    showClose?: boolean;
}

// Fix Leaflet marker icon assets
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png"
});

// Icon Cache to prevent DOM thrashing
const iconCache = new Map<number, L.DivIcon>();

const createIcon = (avgRating: number) => {
    if (iconCache.has(avgRating)) return iconCache.get(avgRating)!;

    const color =
        avgRating >= 4 ? "#10b981" : avgRating >= 3 ? "#f59e0b" : avgRating > 0 ? "#ef4444" : "#6366f1";
    const icon = L.divIcon({
        className: "custom-marker",
        html: `<div style="background:${color};width:32px;height:32px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;">
          <svg style="transform:rotate(45deg);width:16px;height:16px;" viewBox="0 0 24 24" fill="white"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
        </div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
    });
    iconCache.set(avgRating, icon);
    return icon;
};

const formatPrice = (p: number) => new Intl.NumberFormat("vi-VN").format(p) + " đ";

const ListingMarker = memo(
    ({ listing, onSelect }: { listing: ListingSummary; onSelect: (id: string) => void }) => {
        const rating = listing.avgRating ?? 0;
        const icon = useMemo(() => createIcon(rating), [rating]);

        if (typeof listing.address.lat !== "number" || typeof listing.address.lng !== "number") {
            return null;
        }

        return (
            <Marker
                position={[listing.address.lat, listing.address.lng]}
                icon={icon}
                eventHandlers={{ click: () => onSelect(listing.id) }}
            >
                <Popup>
                    <div className="map-popup min-w-50 p-1">
                        <h4 className="font-bold text-sm mb-1">{listing.title ?? "Untitled"}</h4>
                        <p className="text-xs text-gray-600 mb-2">{formatAddress(listing.address)}</p>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-emerald-600 font-bold text-xs">
                                {formatPrice(listing.price ?? 0)}
                            </span>
                            <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                                {listing.area ?? 0} m²
                            </span>
                        </div>
                        <div className="text-xs mb-3">
                            <span className="text-yellow-500">{"★".repeat(Math.round(rating))}</span>
                            <span className="text-gray-300">{"★".repeat(5 - Math.round(rating))}</span>
                            <span className="text-gray-400 ml-1">({listing.reviewCount ?? 0})</span>
                        </div>
                        <button
                            onClick={() => onSelect(listing.id)}
                            className="w-full py-1.5 rounded bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-colors"
                        >
                            Xem chi tiết
                        </button>
                    </div>
                </Popup>
            </Marker>
        );
    }
);

function MapClickHandler({ onMapClick }: { onMapClick: (latlng: L.LatLng) => void }) {
    useMapEvents({ click: (e) => onMapClick(e.latlng) });
    return null;
}

function FlyTo({ center }: { center: [number, number] }) {
    const map = useMap();
    useEffect(() => {
        if (center) {
            const [lat, lng] = center;
            // Validate coordinates before flying
            if (
                typeof lat === "number" &&
                !isNaN(lat) &&
                typeof lng === "number" &&
                !isNaN(lng) &&
                lat >= -90 &&
                lat <= 90 &&
                lng >= -180 &&
                lng <= 180
            ) {
                map.flyTo(center, 15, { duration: 1.5 });
            }
        }
    }, [center, map]);
    return null;
}

export default function MapView({
    listings,
    onSelectListing,
    onMapClick,
    pinLocation,
    flyTo,
    onClose,
    showClose = true
}: MapViewProps) {
    const defaultCenter: [number, number] = [21.0285, 105.8542];

    return (
        <div className="h-full w-full relative">
            {showClose && (
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 z-[1000] bg-white shadow-md rounded-full p-2 hover:bg-gray-100 transition"
                >
                    <XIcon size={18} />
                </button>
            )}

            <MapContainer
                center={defaultCenter}
                zoom={13}
                style={{ height: "100%", width: "100%" }}
                scrollWheelZoom={true}
            >
                <TileLayer
                    attribution="&copy; OpenStreetMap contributors"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <LocationTracker />
                {flyTo && <FlyTo center={flyTo} />}
                {onMapClick && <MapClickHandler onMapClick={onMapClick} />}

                {/* 2. Use the memoized markers correctly */}
                {listings.map((listing: any) => (
                    <ListingMarker key={listing.id} listing={listing} onSelect={onSelectListing} />
                ))}

                {pinLocation && (
                    <Marker position={[pinLocation.lat, pinLocation.lng]}>
                        <Popup>
                            <div className="text-center p-1">
                                <h4 className="font-bold">📍 Vị trí mới</h4>
                                <p className="text-xs">Nhấn "Đăng tin" để tiếp tục</p>
                            </div>
                        </Popup>
                    </Marker>
                )}
            </MapContainer>
        </div>
    );
}
