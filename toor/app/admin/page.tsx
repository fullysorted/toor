"use client";

import { useState, useEffect } from "react";
import { getBrandConfig, applyBrandConfig, getEntrants, saveEntrants, getWaypoints } from "@/lib/store";

// ─── Mock Stats ──────────────────────────────────────────────────────────────

const MOCK_STATS = {
  totalEntrants: 12,
  classesRepresented: 12,
  messagesSent: 47,
  appOpens: 284,
};

// ─── Newport Preview Config ──────────────────────────────────────────────────

const NEWPORT_CONFIG = {
  tenant_id: "newport-2026",
  event_name: "Newport Concours d'Elegance",
  tagline: "Heritage & Horsepower — September 12–13, 2026",
  primary_color: "#1A3C34",
  accent_color: "#D4A853",
  background_color: "#FFFEF9",
  text_color: "#1E1E1E",
};

// ─── Admin Panel Page ────────────────────────────────────────────────────────

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [brandConfig, setBrandConfig] = useState<any>(null);
  const [entrants, setEntrants] = useState<any[]>([]);
  const [waypoints, setWaypoints] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [notificationText, setNotificationText] = useState("");
  const [notificationSent, setNotificationSent] = useState(false);
  const [editBrand, setEditBrand] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    // Load Google Fonts
    const link = document.createElement("link");
    link.href =
      "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Inter:wght@300;400;500;600&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);

    // Load brand config and data
    const config = getBrandConfig();
    applyBrandConfig(config);
    setBrandConfig(config);
    setEditBrand({ ...config });
    setEntrants(getEntrants());
    setWaypoints(getWaypoints());
  }, []);

  const handleLogin = () => {
    if (email === "chris@fullysorted.com" && password === "Cactus1982!!") {
      setIsLoggedIn(true);
      setLoginError("");
    } else {
      setLoginError("Invalid credentials.");
    }
  };

  const toggleEntrantStatus = (userId: string) => {
    const updated = entrants.map((e) =>
      e.user_id === userId
        ? { ...e, status: e.status === "Confirmed" ? "Pending" : "Confirmed" }
        : e
    );
    setEntrants(updated);
    if (brandConfig) saveEntrants(updated);
  };

  const handleSendNotification = () => {
    if (!notificationText.trim()) return;
    setNotificationSent(true);
    setTimeout(() => {
      setNotificationSent(false);
      setNotificationText("");
    }, 3000);
  };

  if (!brandConfig) return null;

  // ── Login Screen ──
  if (!isLoggedIn) {
    return (
      <div style={{
        minHeight: "100vh",
        backgroundColor: "var(--primary)",
        fontFamily: "var(--body-font)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
      }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.04,
            backgroundImage: `repeating-linear-gradient(-35deg, transparent, transparent 40px, var(--accent) 40px, var(--accent) 41px)`,
          }}
        />
        <div
          style={{
            position: "relative",
            zIndex: 1,
            width: "100%",
            maxWidth: 380,
            padding: "0 24px",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <div
              style={{
                fontSize: 10,
                fontWeight: 500,
                letterSpacing: "0.25em",
                textTransform: "uppercase",
                color: "var(--accent)",
                marginBottom: 16,
                opacity: 0.7,
              }}
            >
              Toor Admin
            </div>
            <h1
              style={{
                fontFamily: "var(--heading-font)",
                fontSize: 28,
                fontWeight: 400,
                color: "var(--bg)",
                margin: 0,
              }}
            >
              Organizer Portal
            </h1>
            <p
              style={{
                fontSize: 13,
                color: "var(--bg)",
                opacity: 0.4,
                marginTop: 6,
              }}
            >
              {brandConfig.event_name}
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@lajollaconcours.com"
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              style={{
                width: "100%",
                padding: "14px 16px",
                backgroundColor: "rgba(250, 248, 244, 0.08)",
                border: "1px solid rgba(250, 248, 244, 0.15)",
                borderRadius: 8,
                fontFamily: "var(--body-font)",
                fontSize: 14,
                color: "var(--bg)",
                outline: "none",
              }}
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              style={{
                width: "100%",
                padding: "14px 16px",
                backgroundColor: "rgba(250, 248, 244, 0.08)",
                border: "1px solid rgba(250, 248, 244, 0.15)",
                borderRadius: 8,
                fontFamily: "var(--body-font)",
                fontSize: 14,
                color: "var(--bg)",
                outline: "none",
              }}
            />
            {loginError && (
              <p style={{ fontSize: 12, color: "#E57373", textAlign: "center" }}>
                {loginError}
              </p>
            )}
            <button
              onClick={handleLogin}
              style={{
                width: "100%",
                padding: "15px",
                backgroundColor: "var(--accent)",
                color: "var(--primary)",
                border: "none",
                borderRadius: 8,
                fontFamily: "var(--body-font)",
                fontSize: 15,
                fontWeight: 600,
                cursor: "pointer",
                marginTop: 8,
              }}
            >
              Sign In
            </button>
          </div>

          <p
            style={{
              fontSize: 10,
              color: "var(--bg)",
              opacity: 0.2,
              textAlign: "center",
              marginTop: 32,
              letterSpacing: "0.06em",
            }}
          >
            Powered by Toor · A Fully Sorted Company
          </p>
        </div>
      </div>
    );
  }

  // ── Admin Dashboard ──
  const tabs = [
    { key: "dashboard", label: "Dashboard" },
    { key: "entrants", label: "Entrants" },
    { key: "notifications", label: "Notify" },
    { key: "tour", label: "Tour" },
    { key: "brand", label: "Brand" },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--bg)",
        fontFamily: "var(--body-font)",
      }}
    >
      {/* Top Bar */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          backgroundColor: "var(--primary)",
          padding: "12px 20px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
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
              Toor Admin
            </div>
            <div
              style={{
                fontFamily: "var(--heading-font)",
                fontSize: 15,
                color: "var(--bg)",
                marginTop: 1,
              }}
            >
              {brandConfig.event_name}
            </div>
          </div>
          <button
            onClick={() => setIsLoggedIn(false)}
            style={{
              padding: "6px 12px",
              backgroundColor: "rgba(250,248,244,0.08)",
              border: "1px solid rgba(250,248,244,0.15)",
              borderRadius: 6,
              fontSize: 11,
              color: "var(--bg)",
              cursor: "pointer",
              fontFamily: "var(--body-font)",
            }}
          >
            Sign Out
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, overflowX: "auto" }}>
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: "8px 14px",
                backgroundColor:
                  activeTab === tab.key
                    ? "var(--accent)"
                    : "rgba(250,248,244,0.06)",
                color:
                  activeTab === tab.key ? "var(--primary)" : "var(--bg)",
                border: "none",
                borderRadius: 6,
                fontFamily: "var(--body-font)",
                fontSize: 12,
                fontWeight: activeTab === tab.key ? 600 : 400,
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "all 0.15s",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: "24px 20px 40px" }}>
        {/* ── Dashboard Tab ── */}
        {activeTab === "dashboard" && (
          <div>
            {/* Stats Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
                marginBottom: 28,
              }}
            >
              {[
                { label: "Total Entrants", value: MOCK_STATS.totalEntrants, icon: "👤" },
                {
                  label: "Classes Represented",
                  value: MOCK_STATS.classesRepresented,
                  icon: "🏛",
                },
                { label: "Messages Sent", value: MOCK_STATS.messagesSent, icon: "💬" },
                { label: "App Opens", value: MOCK_STATS.appOpens, icon: "📱" },
              ].map((stat, i) => (
                <div
                  key={i}
                  style={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: 12,
                    padding: "20px 16px",
                    border: "1px solid rgba(27, 42, 74, 0.06)",
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontSize: 28, marginBottom: 6 }}>{stat.icon}</div>
                  <div
                    style={{
                      fontFamily: "var(--heading-font)",
                      fontSize: 32,
                      fontWeight: 500,
                      color: "var(--primary)",
                    }}
                  >
                    {stat.value}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "var(--text)",
                      opacity: 0.4,
                      marginTop: 2,
                      letterSpacing: "0.04em",
                    }}
                  >
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <p
              style={{
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "var(--text)",
                opacity: 0.35,
                marginBottom: 12,
              }}
            >
              Quick Actions
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                "Send push notification to all entrants",
                "Export entrant list as CSV",
                "View app analytics dashboard",
              ].map((action, i) => (
                <button
                  key={i}
                  onClick={() =>
                    setActiveTab(i === 0 ? "notifications" : "dashboard")
                  }
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "14px 16px",
                    backgroundColor: "#FFFFFF",
                    border: "1px solid rgba(27, 42, 74, 0.06)",
                    borderRadius: 8,
                    fontFamily: "var(--body-font)",
                    fontSize: 14,
                    color: "var(--text)",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  {action}
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--accent)"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Entrants Tab ── */}
        {activeTab === "entrants" && (
          <div>
            <p
              style={{
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "var(--text)",
                opacity: 0.35,
                marginBottom: 14,
              }}
            >
              {entrants.length} Registered Entrants
            </p>
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontFamily: "var(--body-font)",
                  fontSize: 13,
                }}
              >
                <thead>
                  <tr style={{ borderBottom: "2px solid rgba(27, 42, 74, 0.1)" }}>
                    {["#", "Entrant", "Car", "Class", "Status"].map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: "10px 8px",
                          textAlign: "left",
                          fontSize: 10,
                          fontWeight: 600,
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                          color: "var(--text)",
                          opacity: 0.4,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {entrants.map((ent) => (
                    <tr
                      key={ent.user_id}
                      style={{
                        borderBottom: "1px solid rgba(27, 42, 74, 0.05)",
                      }}
                    >
                      <td
                        style={{
                          padding: "12px 8px",
                          color: "var(--accent)",
                          fontWeight: 600,
                          fontSize: 12,
                        }}
                      >
                        {String(ent.entry_number).padStart(3, "0")}
                      </td>
                      <td style={{ padding: "12px 8px", whiteSpace: "nowrap" }}>
                        <div style={{ fontWeight: 500, color: "var(--primary)" }}>
                          {ent.name}
                        </div>
                        <div style={{ fontSize: 11, opacity: 0.4 }}>
                          {ent.hometown}
                        </div>
                      </td>
                      <td style={{ padding: "12px 8px", whiteSpace: "nowrap" }}>
                        <div>
                          {ent.car.year} {ent.car.make}
                        </div>
                        <div style={{ fontSize: 11, opacity: 0.4 }}>
                          {ent.car.model}
                        </div>
                      </td>
                      <td style={{ padding: "12px 8px" }}>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "2px 8px",
                            backgroundColor: "rgba(201, 168, 76, 0.1)",
                            borderRadius: 4,
                            fontSize: 10,
                            fontWeight: 500,
                            color: "var(--accent)",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {ent.entry_class.split(" (")[0]}
                        </span>
                      </td>
                      <td style={{ padding: "12px 8px" }}>
                        <button
                          onClick={() => toggleEntrantStatus(ent.user_id)}
                          style={{
                            padding: "4px 12px",
                            backgroundColor:
                              ent.status === "Confirmed"
                                ? "rgba(76, 175, 80, 0.1)"
                                : "rgba(255, 152, 0, 0.1)",
                            color:
                              ent.status === "Confirmed"
                                ? "#2E7D32"
                                : "#E65100",
                            border: "none",
                            borderRadius: 4,
                            fontSize: 11,
                            fontWeight: 600,
                            cursor: "pointer",
                            fontFamily: "var(--body-font)",
                          }}
                        >
                          {ent.status}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Notifications Tab ── */}
        {activeTab === "notifications" && (
          <div>
            <h3
              style={{
                fontFamily: "var(--heading-font)",
                fontSize: 22,
                fontWeight: 400,
                color: "var(--primary)",
                margin: "0 0 6px",
              }}
            >
              Push Notification
            </h3>
            <p
              style={{
                fontSize: 13,
                color: "var(--text)",
                opacity: 0.45,
                marginBottom: 20,
              }}
            >
              Send a message to all {entrants.length} registered entrants.
            </p>
            <textarea
              value={notificationText}
              onChange={(e) => setNotificationText(e.target.value)}
              placeholder="e.g. Reminder: Tour d'Elegance departs at 7:00 AM sharp from Prospect Street. Please stage by 6:30 AM."
              rows={4}
              style={{
                width: "100%",
                padding: "14px 16px",
                border: "1px solid rgba(27, 42, 74, 0.12)",
                borderRadius: 8,
                fontFamily: "var(--body-font)",
                fontSize: 14,
                color: "var(--text)",
                resize: "vertical",
                outline: "none",
                lineHeight: 1.5,
                backgroundColor: "#FFFFFF",
              }}
            />
            <button
              onClick={handleSendNotification}
              disabled={!notificationText.trim() || notificationSent}
              style={{
                marginTop: 14,
                width: "100%",
                padding: "14px",
                backgroundColor: notificationSent
                  ? "#4CAF50"
                  : notificationText.trim()
                    ? "var(--accent)"
                    : "rgba(27, 42, 74, 0.08)",
                color: notificationSent
                  ? "#FFFFFF"
                  : notificationText.trim()
                    ? "var(--primary)"
                    : "var(--text)",
                border: "none",
                borderRadius: 8,
                fontFamily: "var(--body-font)",
                fontSize: 14,
                fontWeight: 600,
                cursor:
                  notificationText.trim() && !notificationSent
                    ? "pointer"
                    : "default",
                opacity: notificationText.trim() || notificationSent ? 1 : 0.4,
                transition: "all 0.3s",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              {notificationSent ? (
                <>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  >
                    <path d="M5 12l5 5L20 7" />
                  </svg>
                  Sent to {entrants.length} Entrants
                </>
              ) : (
                "Send to All Entrants"
              )}
            </button>
          </div>
        )}

        {/* ── Tour Tab ── */}
        {activeTab === "tour" && (
          <div>
            <h3
              style={{
                fontFamily: "var(--heading-font)",
                fontSize: 22,
                fontWeight: 400,
                color: "var(--primary)",
                margin: "0 0 6px",
              }}
            >
              Tour Route Editor
            </h3>
            <p
              style={{
                fontSize: 13,
                color: "var(--text)",
                opacity: 0.45,
                marginBottom: 20,
              }}
            >
              Reorder waypoints for the Tour d'Elegance route.
            </p>
            {waypoints.map((wp, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "14px 16px",
                  marginBottom: 8,
                  backgroundColor: "#FFFFFF",
                  border: "1px solid rgba(27, 42, 74, 0.06)",
                  borderRadius: 8,
                }}
              >
                {/* Drag Handle */}
                <div style={{ cursor: "grab", opacity: 0.25, flexShrink: 0 }}>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="var(--text)"
                  >
                    <circle cx="8" cy="6" r="1.5" />
                    <circle cx="16" cy="6" r="1.5" />
                    <circle cx="8" cy="12" r="1.5" />
                    <circle cx="16" cy="12" r="1.5" />
                    <circle cx="8" cy="18" r="1.5" />
                    <circle cx="16" cy="18" r="1.5" />
                  </svg>
                </div>
                {/* Stop Number */}
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    backgroundColor: "var(--accent)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    fontWeight: 700,
                    color: "var(--primary)",
                    flexShrink: 0,
                  }}
                >
                  {wp.stop}
                </div>
                {/* Content */}
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 500,
                      color: "var(--primary)",
                    }}
                  >
                    {wp.name}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "var(--text)",
                      opacity: 0.4,
                    }}
                  >
                    {wp.time} · {wp.location}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Brand Tab ── */}
        {activeTab === "brand" && editBrand && (
          <div>
            <h3
              style={{
                fontFamily: "var(--heading-font)",
                fontSize: 22,
                fontWeight: 400,
                color: "var(--primary)",
                margin: "0 0 6px",
              }}
            >
              Brand Configuration
            </h3>
            <div
              style={{
                padding: "10px 14px",
                marginBottom: 20,
                backgroundColor: "rgba(201, 168, 76, 0.08)",
                borderRadius: 8,
                borderLeft: "3px solid var(--accent)",
              }}
            >
              <p
                style={{
                  fontSize: 12,
                  color: "var(--text)",
                  lineHeight: 1.5,
                  opacity: 0.7,
                }}
              >
                White-label configuration — licensed events can fully customize
                branding without code changes.
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                { key: "event_name", label: "Event Name", type: "text" },
                { key: "tagline", label: "Tagline", type: "text" },
                {
                  key: "anniversary_note",
                  label: "Anniversary Note",
                  type: "text",
                },
                { key: "primary_color", label: "Primary Color", type: "color" },
                { key: "accent_color", label: "Accent Color", type: "color" },
                {
                  key: "background_color",
                  label: "Background Color",
                  type: "color",
                },
                { key: "text_color", label: "Text Color", type: "color" },
                { key: "heading_font", label: "Heading Font", type: "text" },
                { key: "body_font", label: "Body Font", type: "text" },
              ].map((field) => (
                <div key={field.key}>
                  <label
                    style={{
                      display: "block",
                      fontSize: 10,
                      fontWeight: 600,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: "var(--text)",
                      opacity: 0.45,
                      marginBottom: 5,
                    }}
                  >
                    {field.label}
                  </label>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    {field.type === "color" && (
                      <input
                        type="color"
                        value={editBrand[field.key as keyof typeof editBrand]}
                        onChange={(e) =>
                          setEditBrand({
                            ...editBrand,
                            [field.key]: e.target.value,
                          })
                        }
                        style={{
                          width: 36,
                          height: 36,
                          border: "none",
                          borderRadius: 6,
                          cursor: "pointer",
                          padding: 0,
                        }}
                      />
                    )}
                    <input
                      type="text"
                      value={editBrand[field.key as keyof typeof editBrand]}
                      onChange={(e) =>
                        setEditBrand({
                          ...editBrand,
                          [field.key]: e.target.value,
                        })
                      }
                      style={{
                        flex: 1,
                        padding: "10px 14px",
                        border: "1px solid rgba(27, 42, 74, 0.12)",
                        borderRadius: 8,
                        fontFamily: "var(--body-font)",
                        fontSize: 13,
                        color: "var(--text)",
                        outline: "none",
                        backgroundColor: "#FFFFFF",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowPreview(!showPreview)}
              style={{
                marginTop: 20,
                width: "100%",
                padding: "14px",
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
              {showPreview ? "Hide Preview" : "Preview Changes"}
            </button>

            {showPreview && (
              <div
                style={{
                  marginTop: 16,
                  padding: "24px",
                  backgroundColor: editBrand.primary_color,
                  borderRadius: 12,
                  textAlign: "center",
                  animation: "fadeUp 0.25s ease-out",
                }}
              >
                <div
                  style={{
                    fontFamily: `'${editBrand.heading_font}', serif`,
                    fontSize: 24,
                    color: editBrand.background_color,
                    fontWeight: 400,
                  }}
                >
                  {editBrand.event_name}
                </div>
                <div
                  style={{
                    width: 40,
                    height: 1,
                    backgroundColor: editBrand.accent_color,
                    margin: "12px auto",
                    opacity: 0.5,
                  }}
                />
                <div
                  style={{
                    fontFamily: `'${editBrand.body_font}', sans-serif`,
                    fontSize: 12,
                    color: editBrand.background_color,
                    opacity: 0.6,
                    letterSpacing: "0.06em",
                  }}
                >
                  {editBrand.tagline}
                </div>
                <div
                  style={{
                    marginTop: 16,
                    padding: "8px 20px",
                    backgroundColor: editBrand.accent_color,
                    color: editBrand.primary_color,
                    borderRadius: 6,
                    display: "inline-block",
                    fontSize: 12,
                    fontWeight: 600,
                    fontFamily: `'${editBrand.body_font}', sans-serif`,
                  }}
                >
                  Sign in with Google
                </div>
              </div>
            )}

            {/* ── Multi-Tenant Preview: Newport ── */}
            <div
              style={{
                marginTop: 32,
                padding: "0",
              }}
            >
              <p
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "var(--text)",
                  opacity: 0.35,
                  marginBottom: 14,
                }}
              >
                Multi-Tenant Preview
              </p>
              <div
                style={{
                  padding: "24px",
                  backgroundColor: NEWPORT_CONFIG.primary_color,
                  borderRadius: 12,
                  textAlign: "center",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    opacity: 0.05,
                    backgroundImage: `repeating-linear-gradient(-35deg, transparent, transparent 40px, ${NEWPORT_CONFIG.accent_color} 40px, ${NEWPORT_CONFIG.accent_color} 41px)`,
                  }}
                />
                <div style={{ position: "relative", zIndex: 1 }}>
                  <div
                    style={{
                      fontSize: 9,
                      letterSpacing: "0.2em",
                      textTransform: "uppercase",
                      color: NEWPORT_CONFIG.accent_color,
                      marginBottom: 12,
                      opacity: 0.7,
                    }}
                  >
                    Toor
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--heading-font)",
                      fontSize: 22,
                      color: NEWPORT_CONFIG.background_color,
                      fontWeight: 400,
                    }}
                  >
                    Newport
                    <br />
                    <span style={{ fontStyle: "italic", fontWeight: 300 }}>
                      Concours d'Elegance
                    </span>
                  </div>
                  <div
                    style={{
                      width: 32,
                      height: 1,
                      backgroundColor: NEWPORT_CONFIG.accent_color,
                      margin: "12px auto",
                      opacity: 0.5,
                    }}
                  />
                  <div
                    style={{
                      fontSize: 11,
                      color: NEWPORT_CONFIG.background_color,
                      opacity: 0.5,
                      letterSpacing: "0.06em",
                    }}
                  >
                    {NEWPORT_CONFIG.tagline}
                  </div>
                  <div
                    style={{
                      marginTop: 16,
                      padding: "8px 20px",
                      backgroundColor: NEWPORT_CONFIG.accent_color,
                      color: NEWPORT_CONFIG.primary_color,
                      borderRadius: 6,
                      display: "inline-block",
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    Sign in with Google
                  </div>
                </div>
              </div>
              <p
                style={{
                  fontSize: 11,
                  color: "var(--text)",
                  opacity: 0.4,
                  fontStyle: "italic",
                  marginTop: 10,
                  lineHeight: 1.5,
                }}
              >
                Same platform, different brand_config. Every Toor deployment is
                a fully independent tenant with its own colors, fonts, content,
                and entrant data.
              </p>
            </div>
          </div>
        )}
      </div>

      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
        button:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
        input::placeholder, textarea::placeholder { color: rgba(44, 44, 44, 0.3); }
        input:focus, textarea:focus { border-color: var(--accent) !important; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
