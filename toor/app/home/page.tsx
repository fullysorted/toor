"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  getBrandConfig,
  applyBrandConfig,
  getCurrentUser,
  getUserEntry,
  getEvents,
} from "@/lib/store";

// ─── Day Mapping ─────────────────────────────────────────────────────────────

const DAYS = [
  { key: "Friday", short: "Fri", label: "Friday", date: "APR 24" },
  { key: "Saturday", short: "Sat", label: "Saturday", date: "APR 25" },
  { key: "Sunday", short: "Sun", label: "Sunday", date: "APR 26" },
];

// ─── Icons (inline SVG) ─────────────────────────────────────────────────────

function CompassIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--accent)"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polygon
        points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88"
        fill="var(--accent)"
        fillOpacity="0.15"
        stroke="var(--accent)"
      />
    </svg>
  );
}

function PeopleIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--accent)"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function CarIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--accent)"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 17h14M5 17a2 2 0 0 1-2-2v-2a1 1 0 0 1 1-1h1l2.5-4.5A1 1 0 0 1 8.4 7h7.2a1 1 0 0 1 .9.5L19 12h1a1 1 0 0 1 1 1v2a2 2 0 0 1-2 2M5 17a2 2 0 1 0 4 0M15 17a2 2 0 1 0 4 0M9 17h6" />
    </svg>
  );
}

function BookIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--accent)"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      <line x1="8" y1="7" x2="16" y2="7" />
      <line x1="8" y1="11" x2="13" y2="11" />
    </svg>
  );
}

function ChevronRight() {
  return (
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
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ opacity: 0.4 }}
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function MapPinIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ opacity: 0.4 }}
    >
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

// ─── Home / Weekend Hub ──────────────────────────────────────────────────────

export default function HomePage() {
  const router = useRouter();
  const [brandConfig, setBrandConfig] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [entry, setEntry] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [activeDay, setActiveDay] = useState("Friday");
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);

  useEffect(() => {
    const config = getBrandConfig();
    applyBrandConfig(config);
    setBrandConfig(config);

    const currentUser = getCurrentUser();
    setUser(currentUser);

    const userEntry = getUserEntry();
    setEntry(userEntry);

    const allEvents = getEvents();
    setEvents(allEvents);
  }, []);

  if (!brandConfig || !user) return null;

  const firstName = user.name ? user.name.split(" ")[0] : "Guest";
  const carName = entry?.car
    ? `${entry.car.year || ""} ${entry.car.make || ""} ${entry.car.model || ""}`.trim()
    : null;

  const dayEvents = events.filter((e) => e.day === activeDay);

  const navTiles = [
    { label: "Navigate", subtitle: "Tour Route", icon: <CompassIcon />, screen: "navigate" },
    { label: "Connect", subtitle: "Entrant Directory", icon: <PeopleIcon />, screen: "connect" },
    { label: "Garage", subtitle: "Your Cars", icon: <CarIcon />, screen: "garage" },
    { label: "Program", subtitle: "Digital Program", icon: <BookIcon />, screen: "program" },
  ];

  const handleNavTile = (screen: string) => {
    router.push(`/${screen}`);
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
        <div>
          <div
            style={{
              fontSize: 9,
              fontWeight: 500,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "var(--accent)",
              opacity: 0.7,
            }}
          >
            Toor
          </div>
          <div
            style={{
              fontFamily: "var(--heading-font)",
              fontSize: 15,
              color: "var(--bg)",
              fontWeight: 400,
              marginTop: 1,
            }}
          >
            {brandConfig.event_name}
          </div>
        </div>
        {/* User Avatar */}
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            backgroundColor: "var(--accent)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 14,
            fontWeight: 600,
            color: "var(--primary)",
            fontFamily: "var(--body-font)",
          }}
        >
          {firstName.charAt(0).toUpperCase()}
        </div>
      </div>

      {/* ── Hero Welcome ── */}
      <div
        style={{
          padding: "32px 24px 24px",
          textAlign: "left",
        }}
      >
        <h1
          style={{
            fontFamily: "var(--heading-font)",
            fontSize: 34,
            fontWeight: 400,
            color: "var(--primary)",
            margin: 0,
            lineHeight: 1.15,
          }}
        >
          Welcome, {firstName}.
        </h1>
        {carName && (
          <p
            style={{
              fontFamily: "var(--heading-font)",
              fontSize: 18,
              fontWeight: 400,
              fontStyle: "italic",
              color: "var(--accent)",
              marginTop: 6,
              opacity: 0.85,
            }}
          >
            {carName}
          </p>
        )}
        {!carName && (
          <p
            style={{
              fontSize: 14,
              color: "var(--text)",
              opacity: 0.45,
              marginTop: 6,
            }}
          >
            {brandConfig.tagline}
          </p>
        )}
      </div>

      {/* ── Thin Gold Divider ── */}
      <div
        style={{
          height: 1,
          background: `linear-gradient(90deg, transparent, var(--accent), transparent)`,
          margin: "0 24px",
          opacity: 0.25,
        }}
      />

      {/* ── Day Tabs ── */}
      <div
        style={{
          display: "flex",
          gap: 0,
          padding: "20px 24px 0",
        }}
      >
        {DAYS.map((day) => (
          <button
            key={day.key}
            onClick={() => {
              setActiveDay(day.key);
              setExpandedEvent(null);
            }}
            style={{
              flex: 1,
              padding: "12px 8px",
              backgroundColor: activeDay === day.key ? "var(--primary)" : "transparent",
              color: activeDay === day.key ? "var(--bg)" : "var(--text)",
              border:
                activeDay === day.key
                  ? "none"
                  : "1px solid rgba(27, 42, 74, 0.1)",
              borderRadius: 8,
              fontFamily: "var(--body-font)",
              fontSize: 13,
              fontWeight: activeDay === day.key ? 600 : 400,
              cursor: "pointer",
              transition: "all 0.2s",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
              marginRight: day.key !== "Sunday" ? 8 : 0,
            }}
          >
            <span
              style={{
                fontSize: 11,
                opacity: activeDay === day.key ? 0.7 : 0.4,
                letterSpacing: "0.05em",
              }}
            >
              {day.date}
            </span>
            <span>{day.short}</span>
          </button>
        ))}
      </div>

      {/* ── Event Cards ── */}
      <div style={{ padding: "16px 24px 8px" }}>
        {dayEvents.length === 0 && (
          <p
            style={{
              fontSize: 14,
              color: "var(--text)",
              opacity: 0.4,
              textAlign: "center",
              padding: "24px 0",
            }}
          >
            No events scheduled for this day.
          </p>
        )}
        {dayEvents.map((event) => (
          <div
            key={event.event_id}
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 12,
              padding: "20px",
              marginBottom: 12,
              border: "1px solid rgba(27, 42, 74, 0.06)",
              boxShadow: "0 1px 3px rgba(27, 42, 74, 0.04)",
              transition: "box-shadow 0.2s",
            }}
          >
            {/* Event Title */}
            <h3
              style={{
                fontFamily: "var(--heading-font)",
                fontSize: 22,
                fontWeight: 500,
                color: "var(--primary)",
                margin: 0,
                lineHeight: 1.2,
              }}
            >
              {event.title}
            </h3>

            {/* Time + Location */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 14,
                marginTop: 10,
                fontSize: 13,
                color: "var(--text)",
              }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <ClockIcon /> {event.time}
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <MapPinIcon /> {event.location}
              </span>
            </div>

            {/* Description (always visible) */}
            <p
              style={{
                fontSize: 14,
                color: "var(--text)",
                opacity: 0.6,
                lineHeight: 1.5,
                marginTop: 12,
                margin: "12px 0 0",
              }}
            >
              {event.description}
            </p>

            {/* View Details */}
            <button
              onClick={() =>
                setExpandedEvent(
                  expandedEvent === event.event_id ? null : event.event_id
                )
              }
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                marginTop: 14,
                padding: 0,
                backgroundColor: "transparent",
                border: "none",
                fontFamily: "var(--body-font)",
                fontSize: 13,
                fontWeight: 600,
                color: "var(--accent)",
                cursor: "pointer",
                letterSpacing: "0.02em",
              }}
            >
              {expandedEvent === event.event_id ? "Close" : "View Details"}{" "}
              <ChevronRight />
            </button>

            {/* Expanded Details */}
            {expandedEvent === event.event_id && (
              <div
                style={{
                  marginTop: 16,
                  paddingTop: 16,
                  borderTop: "1px solid rgba(27, 42, 74, 0.08)",
                  animation: "fadeUp 0.25s ease-out",
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 12,
                  }}
                >
                  <div
                    style={{
                      padding: "12px",
                      backgroundColor: "var(--bg)",
                      borderRadius: 8,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        color: "var(--text)",
                        opacity: 0.4,
                        marginBottom: 4,
                      }}
                    >
                      Date
                    </div>
                    <div
                      style={{
                        fontSize: 14,
                        color: "var(--text)",
                        fontWeight: 500,
                      }}
                    >
                      {event.date}
                    </div>
                  </div>
                  <div
                    style={{
                      padding: "12px",
                      backgroundColor: "var(--bg)",
                      borderRadius: 8,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        color: "var(--text)",
                        opacity: 0.4,
                        marginBottom: 4,
                      }}
                    >
                      Time
                    </div>
                    <div
                      style={{
                        fontSize: 14,
                        color: "var(--text)",
                        fontWeight: 500,
                      }}
                    >
                      {event.time}
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    marginTop: 12,
                    padding: "12px",
                    backgroundColor: "var(--bg)",
                    borderRadius: 8,
                  }}
                >
                  <div
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: "var(--text)",
                      opacity: 0.4,
                      marginBottom: 4,
                    }}
                  >
                    Location
                  </div>
                  <div
                    style={{
                      fontSize: 14,
                      color: "var(--text)",
                      fontWeight: 500,
                    }}
                  >
                    {event.location}
                  </div>
                </div>
                {event.event_id.includes("sat-am") && (
                  <button
                    style={{
                      marginTop: 14,
                      width: "100%",
                      padding: "12px",
                      backgroundColor: "var(--accent)",
                      color: "var(--primary)",
                      border: "none",
                      borderRadius: 8,
                      fontFamily: "var(--body-font)",
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Open Tour Navigator →
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── Thin Gold Divider ── */}
      <div
        style={{
          height: 1,
          background: `linear-gradient(90deg, transparent, var(--accent), transparent)`,
          margin: "8px 24px 20px",
          opacity: 0.2,
        }}
      />

      {/* ── Navigation Tiles (2x2) ── */}
      <div
        style={{
          padding: "0 24px 32px",
        }}
      >
        <p
          style={{
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: "var(--text)",
            opacity: 0.35,
            marginBottom: 14,
          }}
        >
          Quick Access
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
          }}
        >
          {navTiles.map((tile) => (
            <button
              key={tile.screen}
              onClick={() => handleNavTile(tile.screen)}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "24px 16px 20px",
                backgroundColor: "#FFFFFF",
                border: "1px solid rgba(27, 42, 74, 0.06)",
                borderRadius: 12,
                cursor: "pointer",
                transition: "all 0.2s",
                boxShadow: "0 1px 3px rgba(27, 42, 74, 0.04)",
                gap: 10,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow =
                  "0 4px 12px rgba(27, 42, 74, 0.08)";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow =
                  "0 1px 3px rgba(27, 42, 74, 0.04)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              {tile.icon}
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontFamily: "var(--heading-font)",
                    fontSize: 17,
                    fontWeight: 500,
                    color: "var(--primary)",
                    lineHeight: 1.2,
                  }}
                >
                  {tile.label}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--text)",
                    opacity: 0.4,
                    marginTop: 3,
                  }}
                >
                  {tile.subtitle}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── Footer ── */}
      <div
        style={{
          textAlign: "center",
          padding: "16px 24px 24px",
          borderTop: "1px solid rgba(27, 42, 74, 0.06)",
        }}
      >
        <p
          style={{
            fontSize: 10,
            color: "var(--text)",
            opacity: 0.25,
            letterSpacing: "0.06em",
          }}
        >
          Powered by Toor · A Fully Sorted Company
        </p>
      </div>

      {/* ── Bottom Accent Line ── */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          height: 2,
          background: `linear-gradient(90deg, transparent, var(--accent), transparent)`,
          opacity: 0.3,
        }}
      />

      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
        button:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
