"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  getBrandConfig,
  applyBrandConfig,
  getWaypoints,
  getEntrants,
} from "@/lib/store";

// ─── Types ──────────────────────────────────────────────────────────────────

interface Waypoint {
  id?: string;
  stop?: number;
  name: string;
  time: string;
  location: string;
  description?: string;
  lat?: number;
  lng?: number;
}

// ─── GPS Coordinates for Tour Stops ─────────────────────────────────────────

const STOP_COORDS: Record<string, [number, number]> = {
  "Prospect Street, La Jolla": [32.8502, -117.2713],
  "Private garage, Rancho Santa Fe": [33.0203, -117.1726],
  "Torrey Pines Gliderport": [32.8899, -117.2510],
  "Coast Highway through Del Mar": [32.9537, -117.2611],
  "San Dieguito Heritage Museum, Encinitas": [32.9940, -117.2623],
  "Private Estate, Rancho Santa Fe": [33.0153, -117.1826],
};

function getCoords(wp: Waypoint): [number, number] {
  if (wp.lat && wp.lng) return [wp.lat, wp.lng];
  return STOP_COORDS[wp.location] || [32.85, -117.27];
}

import BottomNav from "@/components/BottomNav";

// ─── Screen 4: Navigate ──────────────────────────────────────────────────────

export default function NavigatePage() {
  const router = useRouter();
  const [brandConfig, setBrandConfig] = useState<any>(null);
  const [waypoints, setWaypoints] = useState<Waypoint[]>([]);
  const [currentStop, setCurrentStop] = useState(0);
  const [showRadar, setShowRadar] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [mapReady, setMapReady] = useState(false);

  // Load data
  useEffect(() => {
    const config = getBrandConfig();
    applyBrandConfig(config);
    setBrandConfig(config);
    setWaypoints(getWaypoints(config.tenant_id));
  }, []);

  // Initialize Leaflet map
  useEffect(() => {
    if (!brandConfig || waypoints.length === 0 || mapInstanceRef.current) return;

    // Load Leaflet CSS
    const linkEl = document.createElement("link");
    linkEl.rel = "stylesheet";
    linkEl.href = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
    document.head.appendChild(linkEl);

    // Load Leaflet JS
    const scriptEl = document.createElement("script");
    scriptEl.src = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";
    scriptEl.onload = () => {
      initMap();
    };
    document.head.appendChild(scriptEl);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [brandConfig, waypoints]);

  function initMap() {
    if (!mapContainerRef.current || !(window as any).L) return;

    const L = (window as any).L;
    const coords = waypoints.map(getCoords);

    // Center on the route midpoint
    const bounds = L.latLngBounds(coords);
    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: false,
    }).fitBounds(bounds, { padding: [40, 40] });

    mapInstanceRef.current = map;

    // Elegant dark map tiles (CartoDB Dark Matter)
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      maxZoom: 18,
    }).addTo(map);

    // Route polyline
    const routeLine = L.polyline(coords, {
      color: "#C9A84C",
      weight: 3,
      opacity: 0.8,
      dashArray: "8, 6",
      lineCap: "round",
    }).addTo(map);

    // Waypoint markers
    markersRef.current = [];
    coords.forEach((coord: [number, number], i: number) => {
      const isActive = i === currentStop;
      const isPast = i < currentStop;

      const markerIcon = L.divIcon({
        className: "toor-marker",
        html: `<div class="toor-marker-dot ${isActive ? "active" : ""} ${isPast ? "past" : ""}" data-stop="${i + 1}">
          ${isActive ? '<div class="toor-pulse"></div>' : ""}
          <div class="toor-dot-inner">${i + 1}</div>
        </div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      const marker = L.marker(coord, { icon: markerIcon }).addTo(map);
      marker.on("click", () => {
        setCurrentStop(i);
      });

      // Tooltip with stop name
      marker.bindTooltip(waypoints[i]?.name || `Stop ${i + 1}`, {
        permanent: false,
        direction: "top",
        offset: [0, -20],
        className: "toor-tooltip",
      });

      markersRef.current.push(marker);
    });

    // Zoom controls in a better position
    L.control.zoom({ position: "topright" }).addTo(map);

    setMapReady(true);
  }

  // Update markers when currentStop changes
  useEffect(() => {
    if (!mapInstanceRef.current || markersRef.current.length === 0 || !(window as any).L) return;

    const L = (window as any).L;
    const coords = waypoints.map(getCoords);

    // Update each marker's appearance
    markersRef.current.forEach((marker: any, i: number) => {
      const isActive = i === currentStop;
      const isPast = i < currentStop;

      const newIcon = L.divIcon({
        className: "toor-marker",
        html: `<div class="toor-marker-dot ${isActive ? "active" : ""} ${isPast ? "past" : ""}" data-stop="${i + 1}">
          ${isActive ? '<div class="toor-pulse"></div>' : ""}
          <div class="toor-dot-inner">${i + 1}</div>
        </div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      marker.setIcon(newIcon);
    });

    // Fly to current stop
    const currentCoord = coords[currentStop];
    if (currentCoord) {
      mapInstanceRef.current.flyTo(currentCoord, 14, {
        duration: 0.8,
        easeLinearity: 0.5,
      });
    }
  }, [currentStop, waypoints]);

  // Toggle radar pins
  useEffect(() => {
    if (!mapInstanceRef.current || !(window as any).L) return;
    const L = (window as any).L;
    const map = mapInstanceRef.current;

    // Remove existing radar markers
    map.eachLayer((layer: any) => {
      if (layer._isRadar) map.removeLayer(layer);
    });

    if (showRadar) {
      const radarPins = [
        { lat: 32.852, lng: -117.269, name: "C. Beaumont" },
        { lat: 32.877, lng: -117.255, name: "T. Chen" },
        { lat: 32.910, lng: -117.259, name: "M. Vasquez" },
        { lat: 32.845, lng: -117.274, name: "B. Fitzgerald" },
      ];

      radarPins.forEach((pin) => {
        const icon = L.divIcon({
          className: "toor-radar-pin",
          html: `<div class="toor-radar-dot">
            <div class="toor-radar-pulse"></div>
            <div class="toor-radar-center"></div>
          </div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        const m = L.marker([pin.lat, pin.lng], { icon }).addTo(map);
        m._isRadar = true;
        m.bindTooltip(pin.name, {
          permanent: true,
          direction: "right",
          offset: [12, 0],
          className: "toor-radar-tooltip",
        });
      });
    }
  }, [showRadar]);

  if (!brandConfig) return null;

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--bg)",
        fontFamily: "var(--body-font)",
        paddingBottom: 80,
      }}
    >
      {/* ── Top Bar ── */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          backgroundColor: "var(--primary)",
          padding: "14px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            onClick={() => router.push("/home")}
            style={{
              backgroundColor: "transparent",
              border: "none",
              cursor: "pointer",
              padding: 4,
              display: "flex",
              alignItems: "center",
            }}
            aria-label="Go back"
          >
            <svg
              width="20" height="20" viewBox="0 0 24 24" fill="none"
              stroke="var(--bg)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            >
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
          </button>
          <div>
            <div style={{
              fontFamily: "var(--heading-font)", fontSize: 16,
              color: "var(--bg)", fontWeight: 400,
            }}>
              Tour d&apos;Elegance
            </div>
            <div style={{ fontSize: 11, color: "var(--bg)", opacity: 0.5 }}>
              Saturday · Departs 7:00 AM
            </div>
          </div>
        </div>

        {/* Group Radar Toggle */}
        <button
          onClick={() => setShowRadar(!showRadar)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "7px 14px",
            backgroundColor: showRadar ? "var(--accent)" : "rgba(250, 248, 244, 0.1)",
            color: showRadar ? "var(--primary)" : "var(--bg)",
            border: showRadar ? "none" : "1px solid rgba(250, 248, 244, 0.2)",
            borderRadius: 20,
            fontFamily: "var(--body-font)",
            fontSize: 11,
            fontWeight: 500,
            cursor: "pointer",
            transition: "all 0.2s",
          }}
          aria-pressed={showRadar}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="2" />
            <path d="M16.24 7.76a6 6 0 0 1 0 8.49" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
          </svg>
          Radar {showRadar ? "On" : "Off"}
        </button>
      </div>

      {/* ── Interactive Map ── */}
      <div style={{ padding: "0", position: "relative" }}>
        <div
          ref={mapContainerRef}
          style={{
            width: "100%",
            height: 340,
            backgroundColor: "var(--primary)",
          }}
        />
        {!mapReady && (
          <div style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "var(--primary)",
          }}>
            <div style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 12,
            }}>
              <div style={{
                width: 32, height: 32,
                border: "2px solid transparent",
                borderTopColor: "var(--accent)",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
              }} />
              <span style={{
                fontSize: 12, color: "var(--bg)", opacity: 0.5,
                fontFamily: "var(--body-font)",
              }}>Loading map...</span>
            </div>
          </div>
        )}
      </div>

      {/* ── Stop Counter ── */}
      <div style={{ textAlign: "center", padding: "16px 24px 8px" }}>
        <span style={{
          fontSize: 11, fontWeight: 600, letterSpacing: "0.12em",
          textTransform: "uppercase", color: "var(--accent)",
        }}>
          Stop {currentStop + 1} of {waypoints.length}
        </span>
      </div>

      {/* ── Waypoint List ── */}
      <div style={{ padding: "8px 20px 24px" }}>
        {waypoints.map((wp, i) => {
          const isActive = i === currentStop;
          const isPast = i < currentStop;
          return (
            <div
              key={i}
              onClick={() => setCurrentStop(i)}
              style={{
                display: "flex",
                gap: 16,
                padding: "16px 0",
                borderBottom: i < waypoints.length - 1
                  ? "1px solid rgba(27, 42, 74, 0.06)" : "none",
                opacity: isPast ? 0.45 : 1,
                cursor: "pointer",
                transition: "opacity 0.2s",
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") setCurrentStop(i);
              }}
            >
              {/* Timeline dot */}
              <div style={{
                display: "flex", flexDirection: "column",
                alignItems: "center", width: 24, flexShrink: 0, paddingTop: 2,
              }}>
                <div style={{
                  width: isActive ? 16 : 10,
                  height: isActive ? 16 : 10,
                  borderRadius: "50%",
                  backgroundColor: isActive ? "var(--accent)" : isPast ? "var(--accent)" : "transparent",
                  border: "2px solid var(--accent)",
                  transition: "all 0.2s",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  {isPast && (
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none"
                      stroke="var(--primary)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12l5 5L20 7" />
                    </svg>
                  )}
                </div>
              </div>

              {/* Content */}
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <h4 style={{
                    fontFamily: isActive ? "var(--heading-font)" : "var(--body-font)",
                    fontSize: isActive ? 19 : 15,
                    fontWeight: 500,
                    color: "var(--primary)",
                    margin: 0,
                  }}>
                    {wp.name}
                  </h4>
                  <span style={{
                    fontSize: 12, fontWeight: 500,
                    color: isActive ? "var(--accent)" : "var(--text)",
                    opacity: isActive ? 1 : 0.4,
                    whiteSpace: "nowrap", marginLeft: 12,
                  }}>
                    {wp.time}
                  </span>
                </div>
                <p style={{ fontSize: 13, color: "var(--text)", opacity: 0.5, margin: "3px 0 0" }}>
                  {wp.location}
                </p>
                {isActive && wp.description && (
                  <p style={{
                    fontSize: 13, color: "var(--text)", opacity: 0.65,
                    lineHeight: 1.5, marginTop: 8, fontStyle: "italic",
                  }}>
                    {wp.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Bottom Navigation Controls (above nav bar) ── */}
      <div style={{
        position: "sticky",
        bottom: 64,
        backgroundColor: "var(--bg)",
        borderTop: "1px solid rgba(27, 42, 74, 0.08)",
        padding: "12px 20px",
        display: "flex",
        gap: 12,
      }}>
        <button
          onClick={() => setCurrentStop(Math.max(0, currentStop - 1))}
          disabled={currentStop === 0}
          style={{
            flex: 1, padding: "14px",
            backgroundColor: "transparent",
            color: currentStop === 0 ? "rgba(44, 44, 44, 0.2)" : "var(--accent)",
            border: `1.5px solid ${currentStop === 0 ? "rgba(44, 44, 44, 0.1)" : "var(--accent)"}`,
            borderRadius: 8,
            fontFamily: "var(--body-font)", fontSize: 14, fontWeight: 600,
            cursor: currentStop === 0 ? "not-allowed" : "pointer",
            transition: "all 0.2s",
          }}
        >
          ← Previous
        </button>
        <button
          onClick={() => setCurrentStop(Math.min(waypoints.length - 1, currentStop + 1))}
          disabled={currentStop === waypoints.length - 1}
          style={{
            flex: 1, padding: "14px",
            backgroundColor: currentStop === waypoints.length - 1 ? "rgba(44, 44, 44, 0.08)" : "var(--accent)",
            color: currentStop === waypoints.length - 1 ? "rgba(44, 44, 44, 0.3)" : "var(--primary)",
            border: "none",
            borderRadius: 8,
            fontFamily: "var(--body-font)", fontSize: 14, fontWeight: 600,
            cursor: currentStop === waypoints.length - 1 ? "not-allowed" : "pointer",
            transition: "all 0.2s",
          }}
        >
          Next Stop →
        </button>
      </div>

      {/* Bottom Nav */}
      <BottomNav active="navigate" />

      {/* ── Custom Marker Styles ── */}
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
        button:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        .toor-marker { background: none !important; border: none !important; }

        .toor-marker-dot {
          position: relative;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .toor-dot-inner {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: rgba(27, 42, 74, 0.85);
          border: 2px solid rgba(201, 168, 76, 0.4);
          color: rgba(250, 248, 244, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 600;
          font-family: 'Inter', sans-serif;
          transition: all 0.3s ease;
          z-index: 2;
          position: relative;
        }

        .toor-marker-dot.active .toor-dot-inner {
          width: 30px;
          height: 30px;
          background: #C9A84C;
          border-color: #C9A84C;
          color: #1B2A4A;
          font-size: 13px;
          box-shadow: 0 0 16px rgba(201, 168, 76, 0.5);
        }

        .toor-marker-dot.past .toor-dot-inner {
          background: #C9A84C;
          border-color: #C9A84C;
          color: #1B2A4A;
          opacity: 0.6;
        }

        .toor-pulse {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: rgba(201, 168, 76, 0.25);
          animation: pulse-ring 2s ease-out infinite;
          z-index: 1;
        }

        @keyframes pulse-ring {
          0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.6; }
          70% { transform: translate(-50%, -50%) scale(1.5); opacity: 0; }
          100% { transform: translate(-50%, -50%) scale(1.5); opacity: 0; }
        }

        .toor-tooltip {
          background: #1B2A4A !important;
          color: #FAF8F4 !important;
          border: 1px solid rgba(201, 168, 76, 0.3) !important;
          border-radius: 6px !important;
          padding: 4px 10px !important;
          font-family: 'Inter', sans-serif !important;
          font-size: 11px !important;
          font-weight: 500 !important;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3) !important;
        }

        .toor-tooltip::before {
          border-top-color: #1B2A4A !important;
        }

        .toor-radar-pin { background: none !important; border: none !important; }

        .toor-radar-dot {
          position: relative;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .toor-radar-center {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #C9A84C;
          z-index: 2;
          position: relative;
        }

        .toor-radar-pulse {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: rgba(201, 168, 76, 0.2);
          animation: radar-ping 2.5s ease-out infinite;
        }

        @keyframes radar-ping {
          0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0.8; }
          100% { transform: translate(-50%, -50%) scale(2); opacity: 0; }
        }

        .toor-radar-tooltip {
          background: rgba(27, 42, 74, 0.9) !important;
          color: #C9A84C !important;
          border: none !important;
          border-radius: 4px !important;
          padding: 2px 8px !important;
          font-family: 'Inter', sans-serif !important;
          font-size: 10px !important;
          font-weight: 500 !important;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3) !important;
        }

        .toor-radar-tooltip::before { display: none !important; }

        .leaflet-control-zoom a {
          background: rgba(27, 42, 74, 0.85) !important;
          color: #FAF8F4 !important;
          border-color: rgba(201, 168, 76, 0.2) !important;
          width: 32px !important;
          height: 32px !important;
          line-height: 32px !important;
          font-size: 16px !important;
        }

        .leaflet-control-zoom a:hover {
          background: rgba(27, 42, 74, 1) !important;
          color: #C9A84C !important;
        }

        .leaflet-control-zoom {
          border: none !important;
          border-radius: 8px !important;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3) !important;
          margin-top: 12px !important;
          margin-right: 12px !important;
        }
      `}</style>
    </div>
  );
}
