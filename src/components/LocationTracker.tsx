import { useEffect, useRef, useState } from "react";
import { Marker, Circle, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { toast } from "sonner";

const locationIcon = L.divIcon({
    className: "location-marker-wrapper",
    html: `
        <div class="location-dot">
            <div class="location-dot-pulse"></div>
            <div class="location-dot-inner"></div>
        </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20]
});

const LOCATE_SVG = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/></svg>`;

export default function LocationTracker() {
    const map = useMap();

    const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);
    const [accuracy, setAccuracy] = useState<number>(0);
    const [speed, setSpeed] = useState<number | null>(null);
    const [heading, setHeading] = useState<number | null>(null);

    const positionRef = useRef<{ lat: number; lng: number } | null>(null);
    const btnRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
        positionRef.current = position;
        if (btnRef.current) {
            btnRef.current.classList.toggle("tracking-active", !!position);
        }
    }, [position]);

    /* ── Custom Leaflet Control: "My Location" button ── */
    useEffect(() => {
        const MyLocationControl = L.Control.extend({
            options: { position: "topleft" as L.ControlPosition },

            onAdd() {
                const container = L.DomUtil.create("div", "leaflet-bar leaflet-control");
                const btn = L.DomUtil.create("a", "my-location-btn", container);
                btn.href = "#";
                btn.title = "Vị trí của tôi";
                btn.setAttribute("role", "button");
                btn.setAttribute("aria-label", "Vị trí của tôi");
                btn.innerHTML = LOCATE_SVG;

                btnRef.current = btn;

                L.DomEvent.disableClickPropagation(container);
                L.DomEvent.on(btn, "click", (e) => {
                    L.DomEvent.preventDefault(e);
                    const pos = positionRef.current;
                    if (pos) {
                        setTimeout(() => {
                            map.invalidateSize();
                            map.stop();
                            map.flyTo([pos.lat, pos.lng], 16, { duration: 1 });
                        }, 50);
                    } else {
                        toast.error("Chưa xác định được vị trí");
                    }
                });

                return container;
            }
        });

        const control = new MyLocationControl();
        control.addTo(map);

        return () => {
            control.remove();
        };
    }, [map]);

    /* ── Geolocation watcher ── */
    useEffect(() => {
        if (!navigator.geolocation) {
            toast.error("Trình duyệt không hỗ trợ định vị");
            return;
        }

        const mapContainer = map.getContainer();
        const errorShown = { current: false };

        const watchId = navigator.geolocation.watchPosition(
            (pos) => {
                const { latitude, longitude, accuracy: acc, speed: spd, heading: hdg } = pos.coords;

                const isValid = (val: number) => typeof val === "number" && !isNaN(val);

                if (isValid(latitude) && isValid(longitude)) {
                    setPosition({ lat: latitude, lng: longitude });
                    setAccuracy(acc);
                    setSpeed(spd);
                    setHeading(hdg);

                    if (!mapContainer.dataset.initialFlown) {
                        mapContainer.dataset.initialFlown = "true";
                        setTimeout(() => {
                            map.invalidateSize();
                            const size = map.getSize();
                            if (size.x > 0 && size.y > 0) {
                                map.stop();
                                map.flyTo([latitude, longitude], 15, { duration: 1.5 });
                            } else {
                                map.setView([latitude, longitude], 15);
                            }
                        }, 100);
                    }
                }
            },
            (err) => {
                if (!errorShown.current) {
                    const msg =
                        err.code === 1
                            ? "Bạn đã từ chối quyền truy cập vị trí"
                            : err.code === 3
                              ? "Hết thời gian xác định vị trí"
                              : "Không thể xác định vị trí";
                    toast.error(msg);
                    errorShown.current = true;
                }
            },
            {
                enableHighAccuracy: true,
                maximumAge: 5000,
                timeout: 15000
            }
        );

        return () => {
            navigator.geolocation.clearWatch(watchId);
            if (!document.contains(mapContainer)) {
                delete mapContainer.dataset.initialFlown;
            }
        };
    }, [map]);

    if (!position) return null;

    return (
        <>
            <Circle
                center={[position.lat, position.lng]}
                radius={accuracy}
                pathOptions={{
                    color: "#6366f1",
                    fillColor: "#6366f1",
                    fillOpacity: 0.07,
                    weight: 1.5,
                    opacity: 0.25,
                    dashArray: "4 6"
                }}
            />

            <Marker position={[position.lat, position.lng]} icon={locationIcon}>
                <Popup>
                    <div className="map-popup min-w-[200px]">
                        <h4>📍 Vị trí của bạn</h4>
                        <div
                            style={{
                                fontSize: "0.75rem",
                                color: "#64748b",
                                lineHeight: "1.7",
                                marginTop: "4px"
                            }}
                        >
                            <div>
                                <strong>Vĩ độ:</strong> {position.lat.toFixed(6)}
                            </div>
                            <div>
                                <strong>Kinh độ:</strong> {position.lng.toFixed(6)}
                            </div>
                            <div>
                                <strong>Độ chính xác:</strong> ~{Math.round(accuracy)}m
                            </div>
                            {speed !== null && speed > 0 && (
                                <div>
                                    <strong>Tốc độ:</strong> {(speed * 3.6).toFixed(1)} km/h
                                </div>
                            )}
                            {heading !== null && heading >= 0 && (
                                <div>
                                    <strong>Hướng:</strong> {Math.round(heading)}°
                                </div>
                            )}
                        </div>
                    </div>
                </Popup>
            </Marker>
        </>
    );
}
