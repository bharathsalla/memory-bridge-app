import { useEffect, useState, useRef } from 'react';
import { MapPin } from 'lucide-react';

/**
 * Interactive map using Leaflet + OpenStreetMap (no API key needed).
 * Uses browser geolocation API to show the user's real location.
 */
export default function LiveMap({ height = 160 }: { height?: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function initMap() {
      try {
        const L = await import('leaflet');
        // Import leaflet CSS
        if (!document.getElementById('leaflet-css')) {
          const link = document.createElement('link');
          link.id = 'leaflet-css';
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          document.head.appendChild(link);
        }

        if (cancelled || !containerRef.current) return;

        // Get user's real location
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 8000,
            maximumAge: 60000,
          });
        });

        if (cancelled || !containerRef.current) return;

        const { latitude, longitude } = pos.coords;

        // Create map
        if (mapRef.current) {
          mapRef.current.remove();
        }

        const map = L.map(containerRef.current, {
          center: [latitude, longitude],
          zoom: 15,
          zoomControl: false,
          attributionControl: false,
          dragging: true,
          scrollWheelZoom: false,
        });

        mapRef.current = map;

        // Apple-Maps-style tile layer
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
          maxZoom: 19,
        }).addTo(map);

        // Custom marker icon (teal dot)
        const markerIcon = L.divIcon({
          className: '',
          html: `<div style="width:20px;height:20px;border-radius:50%;background:#34C759;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);"></div>`,
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        });

        L.marker([latitude, longitude], { icon: markerIcon }).addTo(map);

        // Safe zone circle
        L.circle([latitude, longitude], {
          radius: 200,
          color: '#34C759',
          fillColor: '#34C759',
          fillOpacity: 0.08,
          weight: 1.5,
          dashArray: '6,4',
        }).addTo(map);

        setLoading(false);

        // Fix tile rendering after container resize
        setTimeout(() => map.invalidateSize(), 100);
      } catch {
        if (!cancelled) {
          setError(true);
          setLoading(false);
        }
      }
    }

    initMap();

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  if (error) {
    return (
      <div className="w-full flex flex-col items-center justify-center bg-muted text-muted-foreground gap-2" style={{ height }}>
        <MapPin className="w-7 h-7" />
        <span className="text-xs font-medium">Home · Safe Zone</span>
        <span className="text-[10px] text-muted-foreground/60">Location unavailable</span>
      </div>
    );
  }

  return (
    <div className="relative w-full" style={{ height }}>
      <div ref={containerRef} className="w-full h-full rounded-xl" style={{ zIndex: 0 }} />
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted rounded-xl">
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <div className="w-5 h-5 border-2 border-muted-foreground/30 border-t-primary rounded-full animate-spin" />
            <span className="text-[11px]">Locating...</span>
          </div>
        </div>
      )}
    </div>
  );
}
