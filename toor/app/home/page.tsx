"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  getBrandConfig,
  applyBrandConfig,
  getEvents,
  getWaypoints,
} from "@/lib/store";
import BottomNav from "@/components/BottomNav";

// âââ Day mapping âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

const EVENT_DATE_MAP: Record<string, string> = {
  Friday: "2026-04-24",
  Saturday: "2026-04-25",
  Sunday: "2026-04-26",
};

function getEventDay(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const dateStr = `${y}-${m}-${d}`;
  for (const [day, date] of Object.entries(EVENT_DATE_MAP)) {
    if (dateStr === date) return day;
  }
  return "";
}

// âââ Icons âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

function ClockIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function MapPinIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}

function CompassIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88" fill="var(--accent)" fillOpacity="0.15" stroke="var(--accent)" />
    </svg>
  );
}

function BookIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

// âââ Home Page ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

export default function HomePage() {
  const router = useRouter();
  const [brandConfig, setBrandConfig] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [waypoints, setWaypointsList] = useState<any[]>([]);

  useEffect(() => {
    const config = getBrandConfig();
    applyBrandConfig(config);
    setBrandConfig(config);
    setEvents(getEvents());
    setWaypointsList(getWaypoints());
  }, []);

  if (!brandConfig) return null;

  const today = getEventDay();
  const todayEvents = events.filter((e: any) => e.day === today);
  const allDays = ["Friday", "Saturday", "Sunday"];
  const nextEvent = todayEvents[0] || events[0];
  const nextStop = waypoints[0];

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg)", fontFamily: "var(--body-font)", paddingBottom: 80 }}>

      {/* ââ Top Bar ââ */}
      <div style={{
        position: "sticky", top: 0, zIndex: 30,
        backgroundColor: "var(--primary)",
        padding: "14px 20px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div>
          <div style={{ fontFamily: "var(--heading-font)", fontSize: 15, color: "var(--bg)", fontWeight: 400 }}>
            {brandConfig.event_name}
          </div>
          <div style={{ fontSize: 9, fontWeight: 500, letterSpacing: "0.05em", color: "var(--accent)", opacity: 0.7, marginTop: 2 }}>
            Presented by the San Diego Automotive Museum
          </div>
        </div>
      </div>

      {/* ââ Hero Header ââ */}
      <div style={{
        backgroundColor: "var(--primary)",
        padding: "4px 24px 28px",
      }}>
        <h1 style={{
          fontFamily: "var(--heading-font)",
          fontSize: "clamp(26px, 6vw, 36px)",
          fontWeight: 400,
          color: "var(--bg)",
          margin: 0, lineHeight: 1.1,
        }}>
          Tour d&apos;Elegance
        </h1>
        <p style={{
          fontFamily: "var(--heading-font)",
          fontSize: 14, fontStyle: "italic",
          color: "var(--bg)", opacity: 0.45,
          marginTop: 6,
        }}>
          April 24{"\u2013"}26, 2026 {"\u00b7"} La Jolla, California
        </p>
      </div>

      {/* ââ Up Next Card ââ */}
      {nextEvent && (
        <div style={{ padding: "24px 24px 0" }}>
          <div style={{
            fontSize: 9, fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase",
            color: "var(--text)", opacity: 0.35, marginBottom: 12,
          }}>
            Up Next
          </div>
          <div style={{
            backgroundColor: "#FFFFFF",
            borderRadius: 14,
            padding: "20px 20px 18px",
            border: "1px solid rgba(27, 42, 74, 0.06)",
            boxShadow: "0 2px 8px rgba(27, 42, 74, 0.05)",
            borderLeft: "4px solid var(--accent)",
          }}>
            <h3 style={{
              fontFamily: "var(--heading-font)", fontSize: 20, fontWeight: 500,
              color: "var(--primary)", margin: 0, lineHeight: 1.2,
            }}>
              {nextEvent.title}
            </h3>
            <div style={{ display: "flex", gap: 16, marginTop: 10, fontSize: 13, color: "var(--text)" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 5, opacity: 0.6 }}>
                <ClockIcon /> {nextEvent.time}
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 5, opacity: 0.6 }}>
                <MapPinIcon /> {nextEvent.location}
              </span>
            </div>
            <p style={{ fontSize: 13, color: "var(--text)", opacity: 0.5, lineHeight: 1.5, marginTop: 10 }}>
              {nextEvent.description}
            </p>
            {nextEvent.event_id.includes("sat-am") && (
              <button
                onClick={() => router.push("/navigate")}
                style={{
                  marginTop: 14, width: "100%", padding: 12,
                  backgroundColor: "var(--accent)", color: "var(--primary)",
                  border: "none", borderRadius: 8,
                  fontFamily: "var(--body-font)", fontSize: 13, fontWeight: 600, cursor: "pointer",
                }}
              >
                Open Tour Navigator
              </button>
            )}
          </div>
        </div>
      )}

      {/* ââ Weekend Schedule ââ */}
      <div style={{ padding: "28px 24px 0" }}>
        <div style={{
          fontSize: 9, fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase",
          color: "var(--text)", opacity: 0.35, marginBottom: 14,
        }}>
          Weekend Schedule
        </div>

        {allDays.map((day) => {
          const dayEvents = events.filter((e: any) => e.day === day);
          const shortDay = day.slice(0, 3);
          const dateMap: Record<string, string> = { Friday: "APR 24", Saturday: "APR 25", Sunday: "APR 26" };
          const isToday = day === today;

          return (
            <div key={day} style={{ marginBottom: 20 }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 10, marginBottom: 10,
              }}>
                <div style={{
                  fontFamily: "var(--heading-font)", fontSize: 14, fontWeight: 500,
                  color: isToday ? "var(--accent)" : "var(--primary)",
                }}>
                  {shortDay}
                </div>
                <div style={{ fontSize: 10, color: "var(--text)", opacity: 0.3, letterSpacing: "0.05em" }}>
                  {dateMap[day]}
                </div>
                {isToday && (
                  <div style={{
                    fontSize: 8, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
                    color: "#FFFFFF", backgroundColor: "var(--accent)",
                    padding: "2px 7px", borderRadius: 4,
                  }}>
                    Today
                  </div>
                )}
                <div style={{ flex: 1, height: 1, backgroundColor: "rgba(27, 42, 74, 0.06)" }} />
              </div>

              {dayEvents.map((event: any) => (
                <div key={event.event_id} style={{
                  display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 12, paddingLeft: 4,
                }}>
                  <div style={{
                    fontSize: 11, color: "var(--text)", opacity: 0.35, minWidth: 62, paddingTop: 2,
                    fontVariantNumeric: "tabular-nums",
                  }}>
                    {event.time.split("\u2013")[0]}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: 14, fontWeight: 500, color: "var(--primary)", lineHeight: 1.3,
                    }}>
                      {event.title}
                    </div>
                    <div style={{
                      fontSize: 12, color: "var(--text)", opacity: 0.4, marginTop: 2,
                      display: "flex", alignItems: "center", gap: 4,
                    }}>
                      <MapPinIcon size={10} /> {event.location}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* ââ Tour Route Preview ââ */}
      {nextStop && (
        <div style={{ padding: "0 24px 24px" }}>
          <button
            onClick={() => router.push("/navigate")}
            style={{
              width: "100%",
              backgroundColor: "var(--primary)",
              borderRadius: 14,
              padding: "20px 20px",
              border: "none",
              cursor: "pointer",
              textAlign: "left",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div style={{
              position: "absolute", inset: 0, opacity: 0.04, pointerEvents: "none",
              backgroundImage: "repeating-linear-gradient(-35deg, transparent, transparent 40px, var(--accent) 40px, var(--accent) 41px)",
            }} />
            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{
                fontSize: 9, fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase",
                color: "var(--accent)", marginBottom: 10,
              }}>
                Tour d&apos;Elegance Route
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontFamily: "var(--heading-font)", fontSize: 18, color: "var(--bg)", fontWeight: 400 }}>
                    {waypoints.length} stops {"\u00b7"} La Jolla to Rancho Santa Fe
                  </div>
                  <div style={{ fontSize: 12, color: "var(--bg)", opacity: 0.4, marginTop: 4 }}>
                    Saturday, April 25 {"\u00b7"} Departs 8:30 AM
                  </div>
                </div>
                <div style={{ color: "var(--accent)", flexShrink: 0 }}>
                  <ChevronRight />
                </div>
              </div>
            </div>
          </button>
        </div>
      )}

      {/* ââ Quick Links ââ */}
      <div style={{ padding: "0 24px 28px" }}>
        <div style={{
          fontSize: 9, fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase",
          color: "var(--text)", opacity: 0.35, marginBottom: 12,
        }}>
          Quick Access
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          {[
            { label: "Navigate", icon: <CompassIcon />, screen: "navigate" },
            { label: "Schedule", icon: <CalendarIcon />, screen: "schedule" },
            { label: "Program", icon: <BookIcon />, screen: "program" },
          ].map((tile) => (
            <button
              key={tile.screen}
              onClick={() => router.push(`/${tile.screen}`)}
              style={{
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                padding: "18px 12px 14px", backgroundColor: "#FFFFFF",
                border: "1px solid rgba(27, 42, 74, 0.06)", borderRadius: 12,
                cursor: "pointer", gap: 8,
                boxShadow: "0 1px 3px rgba(27, 42, 74, 0.04)",
              }}
            >
              {tile.icon}
              <div style={{
                fontFamily: "var(--heading-font)", fontSize: 14, fontWeight: 500,
                color: "var(--primary)",
              }}>
                {tile.label}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ââ Presented By + Footer ââ */}
      <div style={{ textAlign: "center", padding: "20px 24px 8px", borderTop: "1px solid rgba(27, 42, 74, 0.06)" }}>
        <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text)", opacity: 0.3, marginBottom: 10 }}>
          Presented by
        </div>
        <img
          src="/sdam-logo.svg"
          alt="San Diego Automotive Museum"
          style={{ height: 28, opacity: 0.5, marginBottom: 16 }}
        />
        <p style={{ fontSize: 10, color: "var(--text)", opacity: 0.2, letterSpacing: "0.06em" }}>
          Powered by Toor {"\u00b7"} A Fully Sorted Company
        </p>
      </div>

      <BottomNav active="home" />

      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
        button:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
      `}</style>
    </div>
  );
}
