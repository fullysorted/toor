"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  getBrandConfig,
  applyBrandConfig,
  getCurrentUser,
  getUserEntry,
  getEvents,
  getEntrants,
  signOut,
} from "@/lib/store";
import BottomNav from "@/components/BottomNav";

// âââ Day Mapping âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

const DAYS = [
  { key: "Friday", short: "Fri", label: "Friday", date: "APR 24" },
  { key: "Saturday", short: "Sat", label: "Saturday", date: "APR 25" },
  { key: "Sunday", short: "Sun", label: "Sunday", date: "APR 26" },
];

// âââ Hero Photos (Unsplash â free to use) ââââââââââââââââââââââââââââââââââââ

const HERO_IMAGES = [
  "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&q=80",
  "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80",
  "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&q=80",
];

const GALLERY_IMAGES = [
  { src: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400&q=80", caption: "Concours on the Bluffs" },
  { src: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&q=80", caption: "Tour d'Elegance" },
  { src: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&q=80", caption: "Icons of Speed" },
  { src: "https://images.unsplash.com/photo-1504215680853-026ed2a45def?w=400&q=80", caption: "La Jolla Cove" },
];

// âââ Icons âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

function CompassIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88" fill="var(--accent)" fillOpacity="0.15" stroke="var(--accent)" />
    </svg>
  );
}

function PeopleIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function CarIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 17h14M5 17a2 2 0 0 1-2-2v-2a1 1 0 0 1 1-1h1l2.5-4.5A1 1 0 0 1 8.4 7h7.2a1 1 0 0 1 .9.5L19 12h1a1 1 0 0 1 1 1v2a2 2 0 0 1-2 2M5 17a2 2 0 1 0 4 0M15 17a2 2 0 1 0 4 0M9 17h6" />
    </svg>
  );
}

function BookIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      <line x1="8" y1="7" x2="16" y2="7" />
      <line x1="8" y1="11" x2="13" y2="11" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.4 }}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function MapPinIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.4 }}>
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

// âââ Countdown Component âââââââââââââââââââââââââââââââââââââââââââââââââââââ

function Countdown() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const eventDate = new Date("2026-04-24T18:00:00-07:00");
    const update = () => {
      const now = new Date();
      const diff = eventDate.getTime() - now.getTime();
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const units = [
    { label: "Days", value: timeLeft.days },
    { label: "Hours", value: timeLeft.hours },
    { label: "Min", value: timeLeft.minutes },
    { label: "Sec", value: timeLeft.seconds },
  ];

  return (
    <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
      {units.map((u) => (
        <div key={u.label} style={{ textAlign: "center", minWidth: 56 }}>
          <div style={{
            fontFamily: "var(--heading-font)",
            fontSize: 28,
            fontWeight: 400,
            color: "var(--accent)",
            lineHeight: 1.1,
          }}>
            {String(u.value).padStart(2, "0")}
          </div>
          <div style={{
            fontSize: 9,
            fontWeight: 600,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: "var(--bg)",
            opacity: 0.5,
            marginTop: 4,
          }}>
            {u.label}
          </div>
        </div>
      ))}
    </div>
  );
}

// âââ Home Page âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

export default function HomePage() {
  const router = useRouter();
  const [brandConfig, setBrandConfig] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [entry, setEntry] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [activeDay, setActiveDay] = useState("Friday");
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [heroIndex, setHeroIndex] = useState(0);
  const [entrantCount, setEntrantCount] = useState(0);

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

    const entrants = getEntrants();
    setEntrantCount(entrants.length);

    // Hero image rotation
    const heroInterval = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 5000);
    return () => clearInterval(heroInterval);
  }, []);

  if (!brandConfig || !user) return null;

  const firstName = user.name ? user.name.split(" ")[0] : "Guest";
  const carName = entry?.car
    ? `${entry.car.year || ""} ${entry.car.make || ""} ${entry.car.model || ""}`.trim()
    : null;

  const dayEvents = events.filter((e: any) => e.day === activeDay);

  const navTiles = [
    { label: "Navigate", subtitle: "Tour Route", icon: <CompassIcon />, screen: "navigate" },
    { label: "Connect", subtitle: "Entrant Directory", icon: <PeopleIcon />, screen: "connect" },
    { label: "Garage", subtitle: "Your Cars", icon: <CarIcon />, screen: "garage" },
    { label: "Program", subtitle: "Digital Program", icon: <BookIcon />, screen: "program" },
  ];

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg)", fontFamily: "var(--body-font)", paddingBottom: 80 }}>

      {/* ââ Top Bar ââ */}
      <div style={{
        position: "sticky",
        top: 0,
        zIndex: 30,
        backgroundColor: "var(--primary)",
        padding: "14px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <div>
          <div style={{ fontSize: 9, fontWeight: 500, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--accent)", opacity: 0.7 }}>
            Toor
          </div>
          <div style={{ fontFamily: "var(--heading-font)", fontSize: 15, color: "var(--bg)", fontWeight: 400, marginTop: 1 }}>
            {brandConfig.event_name}
          </div>
        </div>
        {/* User Avatar + Menu */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            style={{
              width: 36, height: 36, borderRadius: "50%", backgroundColor: "var(--accent)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 14, fontWeight: 600, color: "var(--primary)", fontFamily: "var(--body-font)",
              border: "none", cursor: "pointer", overflow: "hidden",
            }}
          >
            {user.photo_url ? (
              <img src={user.photo_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              firstName.charAt(0).toUpperCase()
            )}
          </button>
          {showUserMenu && (
            <>
              <div onClick={() => setShowUserMenu(false)} style={{ position: "fixed", inset: 0, zIndex: 19 }} />
              <div style={{
                position: "absolute", top: 44, right: 0, backgroundColor: "#FFFFFF",
                borderRadius: 12, boxShadow: "0 8px 24px rgba(27, 42, 74, 0.15)",
                border: "1px solid rgba(27, 42, 74, 0.08)", overflow: "hidden",
                zIndex: 20, minWidth: 200, animation: "fadeUp 0.15s ease-out",
              }}>
                <div style={{ padding: "14px 16px", borderBottom: "1px solid rgba(27, 42, 74, 0.06)" }}>
                  <div style={{ fontFamily: "var(--heading-font)", fontSize: 16, fontWeight: 500, color: "var(--primary)" }}>
                    {user.name || "Guest"}
                  </div>
                  {carName && (
                    <div style={{ fontSize: 12, color: "var(--accent)", fontStyle: "italic", marginTop: 2 }}>
                      {carName}
                    </div>
                  )}
                </div>
                {[
                  { label: "Edit Profile", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z", href: "/profile" },
                  { label: "My Garage", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5", href: "/garage" },
                  { label: "Admin Panel", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z", href: "/admin" },
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={() => { setShowUserMenu(false); router.push(item.href); }}
                    style={{
                      display: "flex", alignItems: "center", gap: 10, width: "100%",
                      padding: "12px 16px", backgroundColor: "transparent", border: "none",
                      borderBottom: "1px solid rgba(27, 42, 74, 0.04)",
                      fontFamily: "var(--body-font)", fontSize: 14, color: "var(--text)", cursor: "pointer", textAlign: "left",
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.4 }}>
                      <path d={item.icon} />
                    </svg>
                    {item.label}
                  </button>
                ))}
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    signOut();
                    router.push("/");
                  }}
                  style={{
                    display: "flex", alignItems: "center", gap: 10, width: "100%",
                    padding: "12px 16px", backgroundColor: "transparent", border: "none",
                    fontFamily: "var(--body-font)", fontSize: 14, color: "#B44A4A", cursor: "pointer", textAlign: "left",
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#B44A4A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.6 }}>
                    <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ââ Hero Banner with Rotating Images ââ */}
      <div style={{
        position: "relative",
        height: 280,
        overflow: "hidden",
        backgroundColor: "var(--primary)",
      }}>
        {HERO_IMAGES.map((src, i) => (
          <div key={i} style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url(${src})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: heroIndex === i ? 1 : 0,
            transition: "opacity 1.2s ease-in-out",
          }} />
        ))}
        {/* Gradient overlay */}
        <div style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to bottom, rgba(27, 42, 74, 0.3) 0%, rgba(27, 42, 74, 0.85) 100%)",
        }} />
        {/* Hero content */}
        <div style={{
          position: "relative",
          zIndex: 2,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: "0 24px 28px",
        }}>
          <div style={{
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "var(--accent)",
            marginBottom: 8,
          }}>
            {brandConfig.anniversary_note}
          </div>
          <h1 style={{
            fontFamily: "var(--heading-font)",
            fontSize: "clamp(28px, 6vw, 40px)",
            fontWeight: 400,
            color: "var(--bg)",
            margin: 0,
            lineHeight: 1.1,
          }}>
            Welcome, {firstName}.
          </h1>
          {carName && (
            <p style={{
              fontFamily: "var(--heading-font)",
              fontSize: 16,
              fontStyle: "italic",
              color: "var(--accent)",
              marginTop: 6,
              opacity: 0.9,
            }}>
              {carName}
            </p>
          )}
          {!carName && (
            <p style={{ fontSize: 14, color: "var(--bg)", opacity: 0.6, marginTop: 6 }}>
              {brandConfig.tagline}
            </p>
          )}
        </div>
        {/* Hero image dots */}
        <div style={{
          position: "absolute",
          bottom: 12,
          right: 24,
          display: "flex",
          gap: 6,
          zIndex: 3,
        }}>
          {HERO_IMAGES.map((_, i) => (
            <div key={i} style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              backgroundColor: heroIndex === i ? "var(--accent)" : "rgba(250, 248, 244, 0.3)",
              transition: "background-color 0.3s",
            }} />
          ))}
        </div>
      </div>

      {/* ââ Countdown Section ââ */}
      <div style={{
        backgroundColor: "var(--primary)",
        padding: "20px 24px 24px",
        textAlign: "center",
      }}>
        <div style={{
          fontSize: 9,
          fontWeight: 600,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "var(--bg)",
          opacity: 0.4,
          marginBottom: 12,
        }}>
          Countdown to the Concours
        </div>
        <Countdown />
      </div>

      {/* ââ At a Glance Stats ââ */}
      <div style={{
        display: "flex",
        margin: "0 24px",
        transform: "translateY(-1px)",
      }}>
        {[
          { value: "200+", label: "Automobiles" },
          { value: "16", label: "Classes" },
          { value: `${entrantCount}`, label: "Entrants" },
          { value: "3", label: "Days" },
        ].map((stat, i) => (
          <div key={i} style={{
            flex: 1,
            padding: "16px 8px",
            textAlign: "center",
            backgroundColor: "#FFFFFF",
            borderBottom: "1px solid rgba(27, 42, 74, 0.06)",
            borderRight: i < 3 ? "1px solid rgba(27, 42, 74, 0.06)" : "none",
          }}>
            <div style={{
              fontFamily: "var(--heading-font)",
              fontSize: 22,
              fontWeight: 400,
              color: "var(--primary)",
              lineHeight: 1,
            }}>
              {stat.value}
            </div>
            <div style={{
              fontSize: 9,
              fontWeight: 600,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--text)",
              opacity: 0.35,
              marginTop: 4,
            }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* ââ Schedule Section ââ */}
      <div style={{ padding: "28px 24px 8px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <h2 style={{
            fontFamily: "var(--heading-font)",
            fontSize: 24,
            fontWeight: 400,
            color: "var(--primary)",
            margin: 0,
          }}>
            Weekend Schedule
          </h2>
        </div>

        {/* Day Tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          {DAYS.map((day) => (
            <button
              key={day.key}
              onClick={() => { setActiveDay(day.key); setExpandedEvent(null); }}
              style={{
                flex: 1,
                padding: "10px 8px",
                backgroundColor: activeDay === day.key ? "var(--primary)" : "transparent",
                color: activeDay === day.key ? "var(--bg)" : "var(--text)",
                border: activeDay === day.key ? "none" : "1px solid rgba(27, 42, 74, 0.1)",
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
              }}
            >
              <span style={{ fontSize: 10, opacity: activeDay === day.key ? 0.7 : 0.4, letterSpacing: "0.05em" }}>
                {day.date}
              </span>
              <span>{day.short}</span>
            </button>
          ))}
        </div>

        {/* Event Cards */}
        {dayEvents.length === 0 && (
          <p style={{ fontSize: 14, color: "var(--text)", opacity: 0.4, textAlign: "center", padding: "24px 0" }}>
            No events scheduled for this day.
          </p>
        )}
        {dayEvents.map((event: any) => (
          <div key={event.event_id} style={{
            backgroundColor: "#FFFFFF",
            borderRadius: 12,
            padding: 20,
            marginBottom: 12,
            border: "1px solid rgba(27, 42, 74, 0.06)",
            boxShadow: "0 1px 3px rgba(27, 42, 74, 0.04)",
          }}>
            <h3 style={{
              fontFamily: "var(--heading-font)",
              fontSize: 20,
              fontWeight: 500,
              color: "var(--primary)",
              margin: 0,
              lineHeight: 1.2,
            }}>
              {event.title}
            </h3>
            <div style={{
              display: "flex", flexWrap: "wrap", gap: 14, marginTop: 10,
              fontSize: 13, color: "var(--text)",
            }}>
              <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <ClockIcon /> {event.time}
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <MapPinIcon /> {event.location}
              </span>
            </div>
            <p style={{
              fontSize: 14, color: "var(--text)", opacity: 0.6, lineHeight: 1.5, marginTop: 12,
            }}>
              {event.description}
            </p>
            <button
              onClick={() => setExpandedEvent(expandedEvent === event.event_id ? null : event.event_id)}
              style={{
                display: "inline-flex", alignItems: "center", gap: 4, marginTop: 14,
                padding: 0, backgroundColor: "transparent", border: "none",
                fontFamily: "var(--body-font)", fontSize: 13, fontWeight: 600,
                color: "var(--accent)", cursor: "pointer", letterSpacing: "0.02em",
              }}
            >
              {expandedEvent === event.event_id ? "Close" : "View Details"} <ChevronRight />
            </button>

            {expandedEvent === event.event_id && (
              <div style={{
                marginTop: 16, paddingTop: 16,
                borderTop: "1px solid rgba(27, 42, 74, 0.08)",
                animation: "fadeUp 0.25s ease-out",
              }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div style={{ padding: 12, backgroundColor: "var(--bg)", borderRadius: 8 }}>
                    <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text)", opacity: 0.4, marginBottom: 4 }}>Date</div>
                    <div style={{ fontSize: 14, color: "var(--text)", fontWeight: 500 }}>{event.date}</div>
                  </div>
                  <div style={{ padding: 12, backgroundColor: "var(--bg)", borderRadius: 8 }}>
                    <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text)", opacity: 0.4, marginBottom: 4 }}>Time</div>
                    <div style={{ fontSize: 14, color: "var(--text)", fontWeight: 500 }}>{event.time}</div>
                  </div>
                </div>
                <div style={{ marginTop: 12, padding: 12, backgroundColor: "var(--bg)", borderRadius: 8 }}>
                  <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text)", opacity: 0.4, marginBottom: 4 }}>Location</div>
                  <div style={{ fontSize: 14, color: "var(--text)", fontWeight: 500 }}>{event.location}</div>
                </div>
                {event.event_id.includes("sat-am") && (
                  <button
                    onClick={() => router.push("/navigate")}
                    style={{
                      marginTop: 14, width: "100%", padding: 12,
                      backgroundColor: "var(--accent)", color: "var(--primary)",
                      border: "none", borderRadius: 8,
                      fontFamily: "var(--body-font)", fontSize: 14, fontWeight: 600, cursor: "pointer",
                    }}
                  >
                    Open Tour Navigator â
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ââ Photo Gallery ââ */}
      <div style={{ padding: "20px 0 8px" }}>
        <div style={{ padding: "0 24px", marginBottom: 14 }}>
          <h2 style={{
            fontFamily: "var(--heading-font)",
            fontSize: 24,
            fontWeight: 400,
            color: "var(--primary)",
            margin: 0,
          }}>
            Scenes from La Jolla
          </h2>
          <p style={{ fontSize: 13, color: "var(--text)", opacity: 0.45, marginTop: 4 }}>
            Past moments from the Concours
          </p>
        </div>
        <div style={{
          display: "flex",
          gap: 12,
          overflowX: "auto",
          padding: "0 24px 16px",
          scrollSnapType: "x mandatory",
          WebkitOverflowScrolling: "touch",
        }}>
          {GALLERY_IMAGES.map((img, i) => (
            <div key={i} style={{
              minWidth: 200,
              maxWidth: 200,
              scrollSnapAlign: "start",
              borderRadius: 12,
              overflow: "hidden",
              position: "relative",
              flexShrink: 0,
            }}>
              <img
                src={img.src}
                alt={img.caption}
                style={{
                  width: "100%",
                  height: 150,
                  objectFit: "cover",
                  display: "block",
                }}
              />
              <div style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                padding: "24px 12px 10px",
                background: "linear-gradient(transparent, rgba(27, 42, 74, 0.8))",
              }}>
                <span style={{
                  fontSize: 11,
                  fontWeight: 500,
                  color: "#FFFFFF",
                  letterSpacing: "0.03em",
                }}>
                  {img.caption}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ââ Fun Facts / Did You Know ââ */}
      <div style={{ padding: "12px 24px 24px" }}>
        <div style={{
          backgroundColor: "var(--primary)",
          borderRadius: 16,
          padding: "24px 20px",
          position: "relative",
          overflow: "hidden",
        }}>
          {/* Diagonal texture */}
          <div style={{
            position: "absolute",
            inset: 0,
            opacity: 0.04,
            backgroundImage: "repeating-linear-gradient(-35deg, transparent, transparent 40px, var(--accent) 40px, var(--accent) 41px)",
            pointerEvents: "none",
          }} />
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{
              fontSize: 9,
              fontWeight: 600,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "var(--accent)",
              marginBottom: 12,
            }}>
              Did You Know?
            </div>
            <p style={{
              fontFamily: "var(--heading-font)",
              fontSize: 20,
              fontWeight: 400,
              color: "var(--bg)",
              lineHeight: 1.4,
              margin: 0,
            }}>
              The La Jolla Concours d'Elegance has been held on the bluffs above La Jolla Cove for 20 years, making it one of the premier automotive events on the West Coast.
            </p>
            <div style={{
              marginTop: 20,
              display: "flex",
              gap: 16,
              flexWrap: "wrap",
            }}>
              {[
                { emoji: "ð", fact: "200+ collector automobiles" },
                { emoji: "ð", fact: "Ocean-view setting above La Jolla Cove" },
                { emoji: "ð", fact: "16 curated competition classes" },
              ].map((item, i) => (
                <div key={i} style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 13,
                  color: "var(--bg)",
                  opacity: 0.7,
                }}>
                  <span style={{ fontSize: 16 }}>{item.emoji}</span>
                  {item.fact}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ââ Quick Access Tiles ââ */}
      <div style={{ padding: "0 24px 24px" }}>
        <p style={{
          fontSize: 10, fontWeight: 600, letterSpacing: "0.15em",
          textTransform: "uppercase", color: "var(--text)", opacity: 0.35, marginBottom: 14,
        }}>
          Quick Access
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {navTiles.map((tile) => (
            <button
              key={tile.screen}
              onClick={() => router.push(`/${tile.screen}`)}
              style={{
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                padding: "22px 16px 18px", backgroundColor: "#FFFFFF",
                border: "1px solid rgba(27, 42, 74, 0.06)", borderRadius: 12,
                cursor: "pointer", transition: "all 0.2s",
                boxShadow: "0 1px 3px rgba(27, 42, 74, 0.04)", gap: 8,
              }}
            >
              {tile.icon}
              <div style={{ textAlign: "center" }}>
                <div style={{
                  fontFamily: "var(--heading-font)", fontSize: 16, fontWeight: 500,
                  color: "var(--primary)", lineHeight: 1.2,
                }}>
                  {tile.label}
                </div>
                <div style={{ fontSize: 11, color: "var(--text)", opacity: 0.4, marginTop: 2 }}>
                  {tile.subtitle}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ââ Featured Entrant Spotlight ââ */}
      <div style={{ padding: "0 24px 28px" }}>
        <div style={{
          backgroundColor: "#FFFFFF",
          borderRadius: 16,
          overflow: "hidden",
          border: "1px solid rgba(27, 42, 74, 0.06)",
          boxShadow: "0 2px 8px rgba(27, 42, 74, 0.05)",
        }}>
          <div style={{
            height: 140,
            backgroundImage: "url(https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=600&q=80)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            position: "relative",
          }}>
            <div style={{
              position: "absolute", inset: 0,
              background: "linear-gradient(transparent 40%, rgba(27, 42, 74, 0.7))",
            }} />
            <div style={{
              position: "absolute", bottom: 12, left: 16,
              fontSize: 9, fontWeight: 600, letterSpacing: "0.15em",
              textTransform: "uppercase", color: "var(--accent)",
            }}>
              Featured Entrant
            </div>
          </div>
          <div style={{ padding: "16px 16px 20px" }}>
            <h3 style={{
              fontFamily: "var(--heading-font)", fontSize: 20,
              fontWeight: 500, color: "var(--primary)", margin: 0,
            }}>
              Robert Fitzgerald
            </h3>
            <p style={{
              fontSize: 13, color: "var(--accent)", fontStyle: "italic", marginTop: 4,
            }}>
              1966 Ford GT40 Mk I â Gulf Blue
            </p>
            <p style={{
              fontSize: 13, color: "var(--text)", opacity: 0.6,
              lineHeight: 1.5, marginTop: 10,
            }}>
              Entry #1 in Icons of Speed. Bobby Fitz has been showing his genuine Le Mans race chassis since 1989.
            </p>
            <button
              onClick={() => router.push("/connect")}
              style={{
                marginTop: 14, display: "inline-flex", alignItems: "center", gap: 6,
                padding: "10px 16px", backgroundColor: "var(--primary)",
                color: "var(--bg)", borderRadius: 8, border: "none",
                fontFamily: "var(--body-font)", fontSize: 13, fontWeight: 600,
                cursor: "pointer", letterSpacing: "0.02em",
              }}
            >
              View All Entrants <ChevronRight />
            </button>
          </div>
        </div>
      </div>

      {/* ââ Contact Organizers ââ */}
      <div style={{ padding: "0 24px 20px" }}>
        <a
          href={`mailto:${brandConfig.contact_email || "chris@fullysorted.com"}?subject=${encodeURIComponent(brandConfig.event_name + " â Attendee Question")}`}
          style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            width: "100%", padding: "16px 20px",
            backgroundColor: "var(--primary)", color: "var(--bg)", borderRadius: 12,
            fontFamily: "var(--body-font)", fontSize: 14, fontWeight: 500,
            letterSpacing: "0.03em", textDecoration: "none",
            boxShadow: "0 2px 8px rgba(27, 42, 74, 0.12)",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
          Contact Organizers
        </a>
      </div>

      {/* ââ Footer ââ */}
      <div style={{ textAlign: "center", padding: "16px 24px 24px", borderTop: "1px solid rgba(27, 42, 74, 0.06)" }}>
        <p style={{ fontSize: 10, color: "var(--text)", opacity: 0.25, letterSpacing: "0.06em" }}>
          Powered by Toor Â· A Fully Sorted Company
        </p>
      </div>

      {/* ââ Bottom Navigation ââ */}
      <BottomNav active="home" />

      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
        button:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        /* Hide scrollbar for gallery */
        div::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
