import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { MapPin, Check, Loader2, Search } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Default fallback: Sudan center
const SUDAN_CENTER: [number, number] = [15.5, 32.5];
const DEFAULT_ZOOM = 14;

/**
 * Smart geocoding: resolves an area name to coordinates using Nominatim API.
 * Searches with "Sudan" appended for accuracy. Falls back to Sudan center.
 */
async function geocodeArea(areaName: string): Promise<[number, number]> {
    try {
        const query = encodeURIComponent(`${areaName}, السودان`);
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1&accept-language=ar`,
            {
                headers: {
                    'User-Agent': 'VitaDirectApp/1.0'
                }
            }
        );
        const results = await response.json();
        if (results && results.length > 0) {
            return [parseFloat(results[0].lat), parseFloat(results[0].lon)];
        }
    } catch (error) {
        console.warn('Geocoding failed, using fallback:', error);
    }
    return SUDAN_CENTER;
}

interface LocationMapProps {
    area: string;
    onLocationConfirmed: (lat: number, lng: number, url: string) => void;
    onCancel: () => void;
}

export default function LocationMap({ area, onLocationConfirmed, onCancel }: LocationMapProps) {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<L.Map | null>(null);
    const markerRef = useRef<L.Marker | null>(null);
    const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [isReady, setIsReady] = useState(false);
    const [isGeocoding, setIsGeocoding] = useState(true);

    useEffect(() => {
        if (!mapContainerRef.current || mapRef.current) return;

        let cancelled = false;

        // Custom pin icon
        const pinIcon = L.divIcon({
            html: `<div style="
        width: 40px; height: 40px;
        background: linear-gradient(135deg, #059669, #10b981);
        border: 3px solid white;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 6px 20px rgba(5,150,105,0.4);
        display: flex; align-items: center; justify-content: center;
      "><div style="
        width: 12px; height: 12px;
        background: white;
        border-radius: 50%;
        transform: rotate(45deg);
      "></div></div>`,
            className: '',
            iconSize: [40, 40],
            iconAnchor: [20, 40],
        });

        // Initialize map with a temporary center while geocoding
        const map = L.map(mapContainerRef.current, {
            center: SUDAN_CENTER,
            zoom: 6,
            zoomControl: false,
            attributionControl: false,
        });

        L.control.zoom({ position: 'bottomleft' }).addTo(map);

        // Google Maps Satellite + Labels (Hybrid)
        L.tileLayer('https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
            maxZoom: 20,
            subdomains: ['0', '1', '2', '3'],
        }).addTo(map);

        // Handle map clicks
        map.on('click', (e: L.LeafletMouseEvent) => {
            const { lat, lng } = e.latlng;

            if (markerRef.current) {
                markerRef.current.setLatLng([lat, lng]);
            } else {
                markerRef.current = L.marker([lat, lng], { icon: pinIcon }).addTo(map);
            }

            setSelectedLocation({ lat, lng });
        });

        mapRef.current = map;

        // Smart geocoding: resolve area name to coordinates
        (async () => {
            setIsGeocoding(true);
            const coords = await geocodeArea(area);
            if (cancelled) return;
            
            map.setView(coords, DEFAULT_ZOOM, { animate: true });
            setIsGeocoding(false);
            setIsReady(true);

            // Also try GPS if available for refinement
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (pos) => {
                        if (cancelled) return;
                        const { latitude, longitude } = pos.coords;
                        const dist = Math.sqrt(
                            Math.pow(latitude - coords[0], 2) + Math.pow(longitude - coords[1], 2)
                        );
                        if (dist < 1.5) {
                            map.setView([latitude, longitude], 16, { animate: true });
                        }
                    },
                    () => { /* ignore GPS failure */ },
                    { enableHighAccuracy: false, timeout: 5000 }
                );
            }
        })();

        return () => {
            cancelled = true;
            map.remove();
            mapRef.current = null;
            markerRef.current = null;
        };
    }, [area]);

    const handleConfirm = () => {
        if (!selectedLocation) return;
        const url = `https://www.google.com/maps?q=${selectedLocation.lat},${selectedLocation.lng}`;
        onLocationConfirmed(selectedLocation.lat, selectedLocation.lng, url);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#F8F7F4] dark:bg-slate-900 z-[95] flex flex-col overflow-hidden"
            dir="rtl"
        >
            {/* Header */}
            <div className="px-4 py-3 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-b border-stone-100 dark:border-slate-700 flex items-center justify-between shrink-0 z-10">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
                        <MapPin size={18} className="text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-stone-800 dark:text-white">حدد موقعك في {area}</h3>
                        <p className="text-[10px] text-stone-400 dark:text-stone-500">اضغط على الخريطة لتحديد موقع التوصيل</p>
                    </div>
                </div>
                <button
                    onClick={onCancel}
                    className="text-xs font-bold text-stone-500 dark:text-stone-400 px-3 py-1.5 rounded-xl hover:bg-stone-100 dark:hover:bg-slate-700 transition-colors border border-stone-200 dark:border-slate-600"
                >
                    إلغاء
                </button>
            </div>

            {/* Map */}
            <div className="flex-1 relative">
                <div ref={mapContainerRef} className="absolute inset-0" />

                {/* Geocoding loading overlay */}
                {isGeocoding && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 flex flex-col items-center justify-center bg-stone-100/80 dark:bg-slate-800/80 backdrop-blur-sm z-[500]"
                    >
                        <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-2xl border border-stone-200 dark:border-slate-700 flex flex-col items-center gap-4">
                            <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center">
                                <Search size={24} className="text-emerald-600 animate-pulse" />
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-bold text-stone-800 dark:text-white mb-1">جاري تحديد المنطقة...</p>
                                <p className="text-[11px] text-stone-400">البحث عن «{area}» على الخريطة</p>
                            </div>
                            <Loader2 size={20} className="text-emerald-600 animate-spin" />
                        </div>
                    </motion.div>
                )}

                {/* Instruction overlay */}
                {isReady && !selectedLocation && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute top-4 left-4 right-4 z-[400] bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-2xl p-3.5 shadow-xl border border-stone-200/50 dark:border-slate-700/50"
                    >
                        <p className="text-sm text-stone-700 dark:text-stone-300 text-center font-bold">
                            👆 اضغط على موقعك في الخريطة
                        </p>
                    </motion.div>
                )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-t border-stone-100 dark:border-slate-700 shrink-0 z-10">
                <button
                    onClick={handleConfirm}
                    disabled={!selectedLocation}
                    className={`w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 active:scale-[0.98] transition-all ${selectedLocation
                        ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-600/25'
                        : 'bg-stone-200 dark:bg-slate-700 text-stone-400 dark:text-stone-500 cursor-not-allowed'
                        }`}
                >
                    <Check size={20} />
                    {selectedLocation ? 'تم — تأكيد الموقع وإرسال الطلب' : 'حدد موقعك أولاً'}
                </button>
            </div>
        </motion.div>
    );
}
