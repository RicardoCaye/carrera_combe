import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Polyline, Marker, Popup, CircleMarker } from "react-leaflet";
import L, { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";

export default function MapaRuta() {
  const [puntos, setPuntos] = useState<LatLngExpression[]>([]);
  const [bandera, setBandera] = useState<LatLngExpression | null>(null);
  const [popupHtml, setPopupHtml] = useState<string>("");
  const [tooltipText, setTooltipText] = useState<string>("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        console.log("Obteniendo datos del tracker...");
        
        // Usar nuestra API route local
        const res = await fetch("/api/tracker/jorge-combe");

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();
        console.log("Datos recibidos:", data);

        if (data.error) {
          throw new Error(data.error);
        }

        // Establecer los datos
        if (data.puntos && data.puntos.length > 0) {
          setPuntos(data.puntos);
          console.log("Puntos cargados:", data.puntos.length);
        }

        if (data.bandera) {
          setBandera(data.bandera);
          setTooltipText(data.tooltipText || "");
          setPopupHtml(data.popupHtml || "");
          console.log("Bandera establecida en:", data.bandera);
        }

        setCargando(false);
      } catch (err) {
        console.error("Error obteniendo datos:", err);
        setError(`Error: ${err instanceof Error ? err.message : 'Error desconocido'}`);
        setCargando(false);
      }
    }

    fetchData();
  }, []);

  // Crear icono de bandera
  const banderaIcon = L.divIcon({
    html: `
      <div style="position: relative;">
        <svg width="30" height="40" viewBox="0 0 30 40" style="filter: drop-shadow(2px 2px 4px rgba(0,0,0,0.5));">
          <!-- Asta -->
          <line x1="2" y1="0" x2="2" y2="40" stroke="#8B4513" stroke-width="2"/>
          <!-- Bandera -->
          <path d="M2 0 L25 0 L20 8 L25 16 L2 16 Z" fill="#FF0000" stroke="#CC0000" stroke-width="1"/>
          <!-- Texto -->
          <text x="13" y="10" text-anchor="middle" fill="white" font-size="8" font-weight="bold">57</text>
        </svg>
      </div>
    `,
    className: 'bandera-icon',
    iconSize: [30, 40],
    iconAnchor: [2, 40],
    popupAnchor: [15, -40]
  });

  if (cargando) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg">Cargando mapa...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (puntos.length === 0 && !bandera) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500">No se encontraron datos de la ruta</div>
      </div>
    );
  }

  // Centro del mapa: bandera si existe, sino el último punto de la ruta
  const centro = bandera || (puntos.length > 0 ? puntos[puntos.length - 1] : [38.779350, -120.000060]);

  return (
    <div className="w-full h-96 rounded-lg overflow-hidden shadow-lg">
      <MapContainer
        center={centro as LatLngExpression}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {/* Ruta como línea */}
        {puntos.length > 0 && (
          <Polyline
            positions={puntos}
            pathOptions={{ color: "#66b2dd", weight: 4 }}
          />
        )}
        
        {/* Marcadores pequeños para cada punto del historial */}
        {puntos.map((punto, index) => (
          <CircleMarker
            key={index}
            center={punto}
            radius={4}
            pathOptions={{
              fillColor: "#888888",
              color: "#666666",
              weight: 1,
              opacity: 0.8,
              fillOpacity: 0.6
            }}
          >
            <Popup>
              <div>
                <b>Punto #{index + 1}</b><br/>
                Lat: {Array.isArray(punto) ? punto[0].toFixed(6) : 'N/A'}°<br/>
                Lon: {Array.isArray(punto) ? punto[1].toFixed(6) : 'N/A'}°
              </div>
            </Popup>
          </CircleMarker>
        ))}
        
        {/* Bandera en la última posición */}
        {bandera && (
          <Marker position={bandera} icon={banderaIcon}>
            <Popup>
              {popupHtml ? (
                <div dangerouslySetInnerHTML={{ __html: popupHtml }} />
              ) : (
                <div>
                  <b>Jorge Combe (57)</b><br/>
                  {tooltipText || "Última posición reportada"}
                </div>
              )}
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
} 