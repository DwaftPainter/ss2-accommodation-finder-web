import { useEffect, useMemo, memo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import type { ListingSummary } from '../types';
import LocationTracker from './LocationTracker';

// Fix Leaflet marker icon
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Cache for icons to prevent recreation
const iconCache = new Map<number, L.DivIcon>();

const createIcon = (avgRating: number) => {
    if (iconCache.has(avgRating)) return iconCache.get(avgRating)!;

    const color = avgRating >= 4 ? '#10b981' : avgRating >= 3 ? '#f59e0b' : avgRating > 0 ? '#ef4444' : '#6366f1';
    const icon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="background:${color};width:32px;height:32px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;">
      <svg style="transform:rotate(45deg);width:16px;height:16px;" viewBox="0 0 24 24" fill="white" stroke="none"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
    </div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
    });
    iconCache.set(avgRating, icon);
    return icon;
};

const formatPrice = (p: number) => new Intl.NumberFormat('vi-VN').format(p) + ' đ';

// Memoized marker component to prevent unnecessary re-renders
const ListingMarker = memo(({ listing, onSelect }: { listing: ListingSummary; onSelect: (id: string) => void }) => {
    const rating = listing.avgRating ?? 0;
    const icon = useMemo(() => createIcon(rating), [rating]);

    if (typeof listing.lat !== 'number' || typeof listing.lng !== 'number') return null;

    return (
        <Marker
            position={[listing.lat, listing.lng]}
            icon={icon}
            eventHandlers={{ click: () => onSelect(listing.id) }}
        >
            <Popup>
                <div className="map-popup min-w-[200px]">
                    <h4>{listing.title ?? 'Untitled'}</h4>
                    <p className="popup-address">{listing.address ?? 'No address'}</p>
                    <div className="flex gap-3 mb-1.5">
                        <span className="popup-price">{formatPrice(listing.price ?? 0)}/tháng</span>
                        <span className="popup-area">{listing.area ?? 0} m²</span>
                    </div>
                    <div className="popup-rating">
                        {'★'.repeat(Math.round(rating))}{'☆'.repeat(5 - Math.round(rating))}
                        <span className="text-slate-400"> ({listing.reviewCount ?? 0})</span>
                    </div>
                    <button onClick={() => onSelect(listing.id)} className="w-full mt-1 px-3 py-1.5 rounded-md text-xs font-medium bg-indigo-500 text-white hover:bg-indigo-600 transition-colors">
                        Xem chi tiết
                    </button>
                </div>
            </Popup>
        </Marker>
    );
});
ListingMarker.displayName = 'ListingMarker';

function MapClickHandler({ onMapClick }: { onMapClick: (latlng: L.LatLng) => void }) {
    useMapEvents({ click: (e) => onMapClick(e.latlng) });
    return null;
}

function FlyTo({ center }: { center: [number, number] }) {
    const map = useMap();
    useEffect(() => { map.flyTo(center, 14, { duration: 1 }); }, [center, map]);
    return null;
}

interface MapViewProps {
    listings: ListingSummary[];
    onSelectListing: (id: string) => void;
    onMapClick: ((latlng: L.LatLng) => void) | null;
    pinLocation: { lat: number; lng: number } | null;
    flyTo: [number, number] | null;
}

export default function MapView({ listings, onSelectListing, onMapClick, pinLocation, flyTo }: MapViewProps) {
    const defaultCenter: [number, number] = [21.0285, 105.8542];

    // Memoize markers to prevent re-render on every parent update
    const markers = useMemo(() => {
        if (!Array.isArray(listings)) return null;
        return listings.map((l) => (
            <ListingMarker
                key={l.id}
                listing={l}
                onSelect={onSelectListing}
            />
        ));
    }, [listings, onSelectListing]);

    return (
        <div className="h-full w-full" id="map-container">
            <MapContainer center={defaultCenter} zoom={13} style={{ height: '100%', width: '100%' }} zoomControl>
                <TileLayer
                    attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Real-time location tracking */}
                <LocationTracker />

                {flyTo && <FlyTo center={flyTo} />}
                {onMapClick && <MapClickHandler onMapClick={onMapClick} />}

                {markers}

                {pinLocation && (
                    <Marker position={[pinLocation.lat, pinLocation.lng]}>
                        <Popup>
                            <div className="map-popup">
                                <h4>📍 Vị trí mới</h4>
                                <p>Nhấn "Đăng tin" để thêm phòng trọ tại đây</p>
                            </div>
                        </Popup>
                    </Marker>
                )}
            </MapContainer>
        </div>
    );
}
