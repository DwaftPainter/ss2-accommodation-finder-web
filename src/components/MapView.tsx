import { useEffect } from 'react';
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

const createIcon = (avgRating: number) => {
    const color = avgRating >= 4 ? '#10b981' : avgRating >= 3 ? '#f59e0b' : avgRating > 0 ? '#ef4444' : '#6366f1';
    return L.divIcon({
        className: 'custom-marker',
        html: `<div style="background:${color};width:32px;height:32px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;">
      <svg style="transform:rotate(45deg);width:16px;height:16px;" viewBox="0 0 24 24" fill="white" stroke="none"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
    </div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
    });
};

const formatPrice = (p: number) => new Intl.NumberFormat('vi-VN').format(p) + ' đ';

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

    return (
        <div className="h-full w-full" id="map-container">
            <MapContainer center={defaultCenter} zoom={13} style={{ height: '100%', width: '100%' }} zoomControl>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Real-time location tracking */}
                <LocationTracker />

                {flyTo && <FlyTo center={flyTo} />}
                {onMapClick && <MapClickHandler onMapClick={onMapClick} />}

                {Array.isArray(listings) && listings.map((l) => {
                    // Skip listings without valid coordinates
                    if (typeof l.lat !== 'number' || typeof l.lng !== 'number') return null;
                    const rating = l.avgRating ?? 0;
                    return (
                        <Marker key={l.id} position={[l.lat, l.lng]} icon={createIcon(rating)} eventHandlers={{ click: () => onSelectListing(l.id) }}>
                            <Popup>
                                <div className="map-popup min-w-[200px]">
                                    <h4>{l.title ?? 'Untitled'}</h4>
                                    <p className="popup-address">{l.address ?? 'No address'}</p>
                                    <div className="flex gap-3 mb-1.5">
                                        <span className="popup-price">{formatPrice(l.price ?? 0)}/tháng</span>
                                        <span className="popup-area">{l.area ?? 0} m²</span>
                                    </div>
                                    <div className="popup-rating">
                                        {'★'.repeat(Math.round(rating))}{'☆'.repeat(5 - Math.round(rating))}
                                        <span className="text-slate-400"> ({l.reviewCount ?? 0})</span>
                                    </div>
                                    <button onClick={() => onSelectListing(l.id)} className="w-full mt-1 px-3 py-1.5 rounded-md text-xs font-medium bg-indigo-500 text-white hover:bg-indigo-600 transition-colors">
                                        Xem chi tiết
                                    </button>
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}

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
