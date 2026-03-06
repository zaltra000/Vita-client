import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { MapPin, Check, Loader2 } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Area coordinates for Sudan Northern State
const AREA_COORDS: Record<string, [number, number]> = {
    'دنقلا': [19.1753, 30.4767],
    'مروي': [18.4833, 31.8167],
    'كريمة': [18.5500, 31.8500],
    'البركل': [18.5333, 31.8167],
    'أرقو': [20.0500, 30.3833],
    'الدبة': [18.0500, 30.9500],
    'كورتي': [18.3167, 31.1833],
    'القولد': [19.0000, 30.4000],
    'عبري': [20.7833, 30.3667],
};

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

    useEffect(() => {
        if (!mapContainerRef.current || mapRef.current) return;

        const coords = AREA_COORDS[area] || [19.1753, 30.4767]; // Default to Dongola

        // Custom pin icon
        const pinIcon = L.divIcon({
            html: `<div style="
        width: 36px; height: 36px;
        background: #059669;
        border: 3px solid white;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        display: flex; align-items: center; justify-content: center;
      "><div style="
        width: 10px; height: 10px;
        background: white;
        border-radius: 50%;
        transform: rotate(45deg);
      "></div></div>`,
            className: '',
            iconSize: [36, 36],
            iconAnchor: [18, 36],
        });

        const map = L.map(mapContainerRef.current, {
            center: coords,
            zoom: 14,
            zoomControl: false,
            attributionControl: false,
        });

        // Add zoom control to bottom-left
        L.control.zoom({ position: 'bottomleft' }).addTo(map);

        // Google Maps Satellite + Labels (Hybrid) - same as Google Maps app
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
        setIsReady(true);

        // Try to get user's current location to center the map better
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const { latitude, longitude } = pos.coords;
                    // Only re-center if user is roughly in the same area (within ~100km)
                    const dist = Math.sqrt(
                        Math.pow(latitude - coords[0], 2) + Math.pow(longitude - coords[1], 2)
                    );
                    if (dist < 1.5) { // ~150km
                        map.setView([latitude, longitude], 16);
                    }
                },
                () => { /* ignore GPS failure, map is already centered on the city */ },
                { enableHighAccuracy: false, timeout: 5000 }
            );
        }

        return () => {
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
            <div className="px-4 py-3 bg-white dark:bg-slate-800 border-b border-stone-100 dark:border-slate-700 flex items-center justify-between shrink-0 z-10">
                <div className="flex items-center gap-2">
                    <MapPin size={18} className="text-emerald-600 dark:text-emerald-400" />
                    <div>
                        <h3 className="text-sm font-bold text-stone-800 dark:text-white">حدد موقعك في {area}</h3>
                        <p className="text-[10px] text-stone-400 dark:text-stone-500">اضغط على الخريطة لتحديد موقع التوصيل</p>
                    </div>
                </div>
                <button
                    onClick={onCancel}
                    className="text-xs font-bold text-stone-500 dark:text-stone-400 px-3 py-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-slate-700 transition-colors"
                >
                    إلغاء
                </button>
            </div>

            {/* Map */}
            <div className="flex-1 relative">
                <div ref={mapContainerRef} className="absolute inset-0" />

                {!isReady && (
                    <div className="absolute inset-0 flex items-center justify-center bg-stone-100 dark:bg-slate-800">
                        <Loader2 size={32} className="text-emerald-600 animate-spin" />
                    </div>
                )}

                {/* Instruction overlay */}
                {isReady && !selectedLocation && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute top-4 left-4 right-4 z-[400] bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl p-3 shadow-lg border border-stone-200/50 dark:border-slate-700/50"
                    >
                        <p className="text-sm text-stone-700 dark:text-stone-300 text-center font-medium">
                            👆 اضغط على موقعك في الخريطة
                        </p>
                    </motion.div>
                )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-white dark:bg-slate-800 border-t border-stone-100 dark:border-slate-700 shrink-0 z-10">
                <button
                    onClick={handleConfirm}
                    disabled={!selectedLocation}
                    className={`w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 active:scale-95 transition-all ${selectedLocation
                        ? 'bg-emerald-700 dark:bg-emerald-600 text-white shadow-lg shadow-emerald-900/20'
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
