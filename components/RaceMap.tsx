import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L, { LatLngExpression, Icon } from 'leaflet';
import { parseGPXFile } from '@/lib/gpx-parser';

// Icono de pin rojo muy grande y visible (SVG clásico de Google Maps)
const pinSvg = encodeURIComponent(`
<svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
  <g filter="url(#shadow)">
    <ellipse cx="40" cy="68" rx="12" ry="6" fill="#b91c1c" fill-opacity="0.4"/>
    <path d="M40 8C27 8 16 19.2 16 32.5C16 51.5 40 72 40 72C40 72 64 51.5 64 32.5C64 19.2 53 8 40 8Z" fill="#ef4444" stroke="#991b1b" stroke-width="4"/>
    <circle cx="40" cy="34" r="10" fill="#fff" stroke="#991b1b" stroke-width="3"/>
  </g>
  <defs>
    <filter id="shadow" x="0" y="0" width="80" height="80" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
      <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#991b1b"/>
    </filter>
  </defs>
</svg>
`);
const corredorIcon = new Icon({
  iconUrl: `data:image/svg+xml,${pinSvg}`,
  iconSize: [64, 80],
  iconAnchor: [32, 80],
  popupAnchor: [0, -80],
  className: 'corredor-pin-animado',
});

// Animación de pulso para el pin
if (typeof window !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = `
    .leaflet-marker-icon.corredor-pin-animado {
      filter: drop-shadow(0 0 12px #ef4444) drop-shadow(0 0 24px #ef4444);
      animation: corredor-pulse 1.2s infinite;
    }
    @keyframes corredor-pulse {
      0% { transform: scale(1); filter: drop-shadow(0 0 12px #ef4444); }
      50% { transform: scale(1.22); filter: drop-shadow(0 0 36px #ef4444); }
      100% { transform: scale(1); filter: drop-shadow(0 0 12px #ef4444); }
    }
  `;
  if (!document.head.querySelector('style[data-corredor-pin]')) {
    style.setAttribute('data-corredor-pin', 'true');
    document.head.appendChild(style);
  }
}

interface RaceMapProps {
  corredorPosition?: { lat: number; lon: number };
  liveTrack?: boolean;
}

export default function RaceMap({ corredorPosition, liveTrack = false }: RaceMapProps) {
  const [routePoints, setRoutePoints] = useState<LatLngExpression[]>([]);
  const [center, setCenter] = useState<LatLngExpression>([39.0968, -120.0324]); // Tahoe por defecto
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLiveTrack = async () => {
      setLoading(true);
      try {
        const res = await fetch('https://trackleaders.com/spot/tahoe200-25/Jorge_Combe.js');
        const text = await res.text();
        // Extraer el array LLarray del texto usando regex
        const match = text.match(/LLarray\s*=\s*(\[[^;]+\])/);
        if (match) {
          // El array está en formato [[lat, lon], ...]
          const arr = JSON.parse(match[1]);
          setRoutePoints(arr);
          if (arr.length > 0) setCenter(arr[arr.length - 1]);
        }
      } catch (e) {
        // Si falla, dejar el centro por defecto
      } finally {
        setLoading(false);
      }
    };
    const loadGPX = async () => {
      setLoading(true);
      try {
        const res = await fetch('/track_generado.gpx');
        const gpxText = await res.text();
        const gpxData = parseGPXFile(gpxText);
        if (gpxData && gpxData.tracks.length > 0) {
          const points = gpxData.tracks[0].points.map(p => [p.lat, p.lon] as LatLngExpression);
          setRoutePoints(points);
          if (points.length > 0) setCenter(points[0]);
        }
      } catch (e) {
        // Si falla, dejar el centro por defecto
      } finally {
        setLoading(false);
      }
    };
    if (liveTrack) {
      loadLiveTrack();
    } else {
      loadGPX();
    }
  }, [liveTrack]);

  if (loading) return <div className="w-full h-64 flex items-center justify-center">Cargando mapa...</div>;
  if (routePoints.length === 0) return <div className="w-full h-64 flex items-center justify-center">No se pudo cargar la ruta.</div>;

  // Último punto de la ruta en vivo
  const ultimo = routePoints[routePoints.length - 1];
  // Icono especial para el último punto
  const iconUltimo = new L.Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });

  return (
    <div className="w-full h-96 rounded-lg overflow-hidden border border-gray-200 shadow">
      <MapContainer center={center as LatLngExpression} zoom={11} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution={"&copy; OpenStreetMap contributors"}
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Polyline positions={routePoints} pathOptions={{ color: '#66b2dd', weight: 4 }} />
        {/* Último punto resaltado */}
        {liveTrack && (
          <Marker position={ultimo} icon={iconUltimo}>
            <Popup>Última actualización</Popup>
          </Marker>
        )}
        {/* Posición del corredor (si se pasa por prop) */}
        {corredorPosition && !liveTrack && (
          <Marker position={[corredorPosition.lat, corredorPosition.lon] as LatLngExpression} icon={corredorIcon as L.Icon}>
            <Popup>
              <span className="font-bold text-red-700">Posición actual del corredor</span>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
} 