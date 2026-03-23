"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  getBrandConfig,
  applyBrandConfig,
  getWaypoints,
  getEntrants,
} from "@/lib/store";

// ─── Map Component ──────────────────────────────────────────────────────────

interface Waypoint {
  id?: string;
  name: string;
  time: string;
  location: string;
  description?: string;
}

interface Entrant {
  id?: string;
  name: string;
}

interface TourMapProps {
  waypoints: Waypoint[];
  currentStop: number;
  showRadar: boolean;
  entrants: Entrant[];
}

function TourMap({
  waypoints,
  currentStop,
  showRadar,
  entrants,
}: TourMapProps) {
  // Approximate coastal route coordinates (normalized to SVG viewbox)
  const routePoints = [
    { x: 75, y: 280 }, // La Jolla
    { x: 310, y: 120 }, // Rancho Santa Fe
    { x: 45, y: 180 }, // Torrey Pines
    { x: 60, y: 130 }, // Del Mar
    { x: 100, y: 70 }, // Encinitas
    { x: 290, y: 90 }, // Rancho Santa Fe (lunch)
  ];

  const pathD = routePoints.reduce((acc, pt, i) => {
    if (i === 0) return `M ${pt.x} ${pt.y}`;
    const prev = routePoints[i - 1];
    const cpx = (prev.x + pt.x) / 2;
    const cpy = Math.min(prev.y, pt.y) - 20;
    return `${acc} Q ${cpx} ${cpy} ${pt.x} ${pt.y}`;
  }, "");

  // Sample radar positions for 4 entrants
  const radarPins = [
    { x: 90, y: 270, name: "C. Beaumont" },
    { x: 65, y: 240, name: "T. Chen" },
    { x: 55, y: 200, name: "M. Vasquez" },
    { x: 80, y: 260, name: "B. Fitzgerald" },
  ];

  return (
    <div
      style={{
        width: "100%",
        aspectRatio: "4/3",
        backgroundColor: "var(--primary)",
        borderRadius: 16,
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Subtle grid texture */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.04,
          backgroundImage: `
            linear-gradient(rgba(250,248,244,0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(250,248,244,0.3) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />

      <svg
        viewBox="0 0 360 320"
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Ocean area (left side) */}
        <rect x="0" y="0" width="30" height="320" fill="var(--primary)" opacity="0.6" />
        <text
          x="15"
          y="310"
          fill="var(--bg)"
          opacity="0.15"
          fontSize="8"
          textAnchor="middle"
          fontFamily="var(--body-font)"
          transform="rotate(-90, 15, 310)"
        >
          PACIFIC OCEAN
        </text>

        {/* Route line (dashed background) */}
        <path
          d={pathD}
          fill="none"
          stroke="var(--bg)"
          strokeWidth="1.5"
          strokeDasharray="4,4"
          opacity="0.15"
        />

        {/* Route line (accent) */}
        <path
          d={pathD}
          fill="none"
          stroke="var(--accent)"
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="0.8"
        />

        {/* Waypoint dots + labels */}
        {routePoints.map((pt, i) => {
          const isActive = i === currentStop;
          const wp = waypoints[i];
          return (
            <g key={i}>
              {/* Pulse ring for active */}
              {isActive && (
                <circle cx={pt.x} cy={pt.y} r="14" fill="var(--accent)" opacity="0.15">
                  <animate
                    attributeName="r"
                    values="10;18;10"
                    dur="2s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="0.2;0.05;0.2"
                    dur="2s"
                    repeatCount="indefinite"
                  />
                </circle>
              )}
              {/* Dot */}
              <circle
                cx={pt.x}
                cy={pt.y}
                r={isActive ? 7 : 5}
                fill={i <= currentStop ? "var(--accent)" : "var(--bg)"}
                stroke={isActive ? "var(--bg)" : "var(--accent)"}
                strokeWidth={isActive ? 2 : 1}
                opacity={i <= currentStop ? 1 : 0.4}
              />
              {/* Label */}
              <text
                x={pt.x + (pt.x > 200 ? -8 : 12)}
                y={pt.y + (pt.y < 100 ? 18 : -10)}
                fill="var(--bg)"
                fontSize="8"
                fontFamily="var(--body-font)"
                opacity={i <= currentStop ? 0.8 : 0.35}
                textAnchor={pt.x > 200 ? "end" : "start"}
              >
                {wp?.name || `Stop ${i + 1}`}
              </text>
            </g>
          );
        })}

        {/* Radar pins */}
        {showRadar &&
          radarPins.map((pin, i) => (
            <g key={`radar-${i}`}>
              <circle cx={pin.x} cy={pin.y} r="4" fill="var(--accent)" opacity="0.6" />
              <circle cx={pin.x} cy={pin.y} r="2" fill="var(--bg)" />
              <text
                x={pin.x + 7}
                y={pin.y + 3}
                fill="var(--accent)"
                fontSize="7"
                fontFamily="var(--body-font)"
                opacity="0.7"
              >
                {pin.name}
              </text>
            </g>
          ))}

        {/* "You are here" label */}
        {routePoints[currentStop] && (
          <text
            x={routePoints[currentStop].x}
            y={routePoints[currentStop].y + 22}
            fill="var(--accent)"
            fontSize="7"
            fontFamily="var(--body-font)"
            fontWeight="600"
            textAnchor="middle"
            letterSpacing="0.08em"
          >
            YOU ARE HERE
          </text>
        )}

        {/* La Jolla label */}
        <text
          x="75"
          y="300"
          fill="var(--bg)"
          opacity="0.25"
          fontSize="9"
          fontFamily="var(--heading-font)"
          textAnchor="middle"
          fontStyle="italic"
        >
          La Jolla
        </text>

        {/* Rancho Santa Fe label */}
        <text
          x="300"
          y="145"
          fill="var(--bg)"
          opacity="0.25"
          fontSize="9"
          fontFamily="var(--heading-font)"
          textAnchor="middle"
          fontStyle="italic"
        >
          Rancho Santa Fe
        </text>

        {/* Del Mar label */}
        <text
          x="60"
          y="150"
          fill="var(--bg)"
          opacity="0.25"
          fontSize="9"
          fontFamily="var(--heading-font)"
          textAnchor="middle"
          fontStyle="italic"
        >
          Del Mar
        </text>
      </svg>

      {/* Map attribution placeholder */}
      <div
        style={{
          position: "absolute",
          bottom: 8,
          right: 12,
          fontSize: 8,
          color: "var(--bg)",
          opacity: 0.2,
          fontFamily: "var(--body-font)",
        }}
      >
        Map: Production uses Mapbox GL
      </div>
    </div>
  );
}

// ─── Screen 4: Navigate ──────────────────────────────────────────────────────

export default function NavigatePage() {
  const router = useRouter();
  const [brandConfig, setBrandConfig] = useState<any>(null);
  const [waypoints, setWaypoints] = useState<Waypoint[]>([]);
  const [currentStop, setCurrentStop] = useState(0);
  const [showRadar, setShowRadar] = useState(false);
  const [entrants, setEntrants] = useState<Entrant[]>([]);

  useEffect(() => {
    // Load fonts
    const link = document.createElement("link");
    link.href =
      "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Inter:wght@300;400;500;600&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);

    // Load brand config and data
    const config = getBrandConfig();
    applyBrandConfig(config);
    setBrandConfig(config);
    setWaypoints(getWaypoints(config.tenant_id));
    setEntrants(getEntrants(config.tenant_id));
  }, []);

  if (!brandConfig) return null;

  const handleBack = () => {
    router.push("/home");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--bg)",
        fontFamily: "var(--body-font)",
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
            onClick={handleBack}
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
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--bg)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
          </button>
          <div>
            <div
              style={{
                fontFamily: "var(--heading-font)",
                fontSize: 16,
                color: "var(--bg)",
                fontWeight: 400,
              }}
            >
              Tour d'Elegance
            </div>
            <div
              style={{
                fontSize: 11,
                color: "var(--bg)",
                opacity: 0.5,
              }}
            >
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
            backgroundColor: showRadar
              ? "var(--accent)"
              : "rgba(250, 248, 244, 0.1)",
            color: showRadar ? "var(--primary)" : "var(--bg)",
            border: showRadar
              ? "none"
              : "1px solid rgba(250, 248, 244, 0.2)",
            borderRadius: 20,
            fontFamily: "var(--body-font)",
            fontSize: 11,
            fontWeight: 500,
            cursor: "pointer",
            transition: "all 0.2s",
          }}
          aria-pressed={showRadar}
          aria-label="Toggle radar view"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="2" />
            <path d="M16.24 7.76a6 6 0 0 1 0 8.49" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
          </svg>
          Radar {showRadar ? "On" : "Off"}
        </button>
      </div>

      {/* ── Map ── */}
      <div style={{ padding: "16px 16px 0" }}>
        <TourMap
          waypoints={waypoints}
          currentStop={currentStop}
          showRadar={showRadar}
          entrants={entrants}
        />
      </div>

      {/* ── Stop Counter ── */}
      <div
        style={{
          textAlign: "center",
          padding: "16px 24px 8px",
        }}
      >
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "var(--accent)",
          }}
        >
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
                borderBottom:
                  i < waypoints.length - 1
                    ? "1px solid rgba(27, 42, 74, 0.06)"
                    : "none",
                opacity: isPast ? 0.45 : 1,
                cursor: "pointer",
                transition: "opacity 0.2s",
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  setCurrentStop(i);
                }
              }}
            >
              {/* Timeline dot + line */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  width: 24,
                  flexShrink: 0,
                  paddingTop: 2,
                }}
              >
                <div
                  style={{
                    width: isActive ? 16 : 10,
                    height: isActive ? 16 : 10,
                    borderRadius: "50%",
                    backgroundColor: isActive
                      ? "var(--accent)"
                      : isPast
                        ? "var(--accent)"
                        : "transparent",
                    border: `2px solid var(--accent)`,
                    transition: "all 0.2s",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {isPast && (
                    <svg
                      width="8"
                      height="8"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="var(--primary)"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 12l5 5L20 7" />
                    </svg>
                  )}
                </div>
              </div>

              {/* Content */}
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <h4
                    style={{
                      fontFamily: isActive
                        ? "var(--heading-font)"
                        : "var(--body-font)",
                      fontSize: isActive ? 19 : 15,
                      fontWeight: isActive ? 500 : 500,
                      color: "var(--primary)",
                      margin: 0,
                    }}
                  >
                    {wp.name}
                  </h4>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 500,
                      color: isActive ? "var(--accent)" : "var(--text)",
                      opacity: isActive ? 1 : 0.4,
                      whiteSpace: "nowrap",
                      marginLeft: 12,
                    }}
                  >
                    {wp.time}
                  </span>
                </div>
                <p
                  style={{
                    fontSize: 13,
                    color: "var(--text)",
                    opacity: 0.5,
                    margin: "3px 0 0",
                  }}
                >
                  {wp.location}
                </p>
                {isActive && (
                  <p
                    style={{
                      fontSize: 13,
                      color: "var(--text)",
                      opacity: 0.65,
                      lineHeight: 1.5,
                      marginTop: 8,
                      fontStyle: "italic",
                    }}
                  >
                    {wp.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Bottom Controls ── */}
      <div
        style={{
          position: "sticky",
          bottom: 0,
          backgroundColor: "var(--bg)",
          borderTop: "1px solid rgba(27, 42, 74, 0.08)",
          padding: "16px 20px",
          display: "flex",
          gap: 12,
        }}
      >
        <button
          onClick={() => setCurrentStop(Math.max(0, currentStop - 1))}
          disabled={currentStop === 0}
          style={{
            flex: 1,
            padding: "14px",
            backgroundColor: "transparent",
            color:
              currentStop === 0
                ? "rgba(44, 44, 44, 0.2)"
                : "var(--accent)",
            border: `1.5px solid ${
              currentStop === 0
                ? "rgba(44, 44, 44, 0.1)"
                : "var(--accent)"
            }`,
            borderRadius: 8,
            fontFamily: "var(--body-font)",
            fontSize: 14,
            fontWeight: 600,
            cursor: currentStop === 0 ? "not-allowed" : "pointer",
            transition: "all 0.2s",
          }}
          aria-label="Go to previous stop"
        >
          ← Previous
        </button>
        <button
          onClick={() =>
            setCurrentStop(Math.min(waypoints.length - 1, currentStop + 1))
          }
          disabled={currentStop === waypoints.length - 1}
          style={{
            flex: 1,
            padding: "14px",
            backgroundColor:
              currentStop === waypoints.length - 1
                ? "rgba(44, 44, 44, 0.08)"
                : "var(--accent)",
            color:
              currentStop === waypoints.length - 1
                ? "rgba(44, 44, 44, 0.3)"
                : "var(--primary)",
            border: "none",
            borderRadius: 8,
            fontFamily: "var(--body-font)",
            fontSize: 14,
            fontWeight: 600,
            cursor:
              currentStop === waypoints.length - 1
                ? "not-allowed"
                : "pointer",
            transition: "all 0.2s",
          }}
          aria-label="Go to next stop"
        >
          Next Stop →
        </button>
      </div>

      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
        button:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
      `}</style>
    </div>
  );
}
