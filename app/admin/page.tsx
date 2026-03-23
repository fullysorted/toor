"use client";

import { useState, useEffect, useRef } from "react";
import {
  getBrandConfig,
  applyBrandConfig,
  saveBrandConfig,
  getEntrants,
  saveEntrants,
  getWaypoints,
  saveWaypoints,
  getSponsors,
  saveSponsors,
  getProgramPages,
  saveProgramPages,
  getClasses,
} from "@/lib/store";

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
  const [classes, setClasses] = useState<any[]>([]);
  const [sponsors, setSponsors] = useState<any[]>([]);
  const [programPages, setProgramPages] = useState<any[]>([]);
  const [addingEntrant, setAddingEntrant] = useState(false);
  const [editingEntrantId, setEditingEntrantId] = useState<string | null>(null);
  const [editingWaypointIdx, setEditingWaypointIdx] = useState<number | null>(null);
  const [addingWaypoint, setAddingWaypoint] = useState(false);
  const [editingSponsorId, setEditingSponsorId] = useState<string | null>(null);
  const [addingSponsor, setAddingSponsor] = useState(false);
  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [addingPage, setAddingPage] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: "entrant" | "waypoint" | "sponsor" | "page";
    id: string | number;
  } | null>(null);
  const [csvPreview, setCsvPreview] = useState<any[] | null>(null);
  const [csvError, setCsvError] = useState("");
  const [csvSuccess, setCsvSuccess] = useState("");
  const [linkCopied, setLinkCopied] = useState(false);
  const waypointFileInputRef = useRef<HTMLInputElement>(null);
  const sponsorFileInputRef = useRef<HTMLInputElement>(null);
  const pageFileInputRef = useRef<HTMLInputElement>(null);
  const csvFileInputRef = useRef<HTMLInputElement>(null);

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
    setClasses(getClasses());
    setSponsors(getSponsors());
    setProgramPages(getProgramPages());
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

  // ── CSV Parsing ──
  const parseCSV = (text: string): string[][] => {
    const rows: string[][] = [];
    let current = "";
    let inQuotes = false;
    let row: string[] = [];
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (inQuotes) {
        if (ch === '"' && text[i + 1] === '"') {
          current += '"';
          i++;
        } else if (ch === '"') {
          inQuotes = false;
        } else {
          current += ch;
        }
      } else {
        if (ch === '"') {
          inQuotes = true;
        } else if (ch === ",") {
          row.push(current.trim());
          current = "";
        } else if (ch === "\n" || ch === "\r") {
          if (ch === "\r" && text[i + 1] === "\n") i++;
          row.push(current.trim());
          if (row.some((c) => c !== "")) rows.push(row);
          row = [];
          current = "";
        } else {
          current += ch;
        }
      }
    }
    row.push(current.trim());
    if (row.some((c) => c !== "")) rows.push(row);
    return rows;
  };

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvError("");
    setCsvSuccess("");
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const text = ev.target?.result as string;
        const rows = parseCSV(text);
        if (rows.length < 2) {
          setCsvError("CSV must have a header row and at least one data row.");
          return;
        }
        const headers = rows[0].map((h) => h.toLowerCase().replace(/[^a-z0-9]/g, "_"));
        const dataRows = rows.slice(1);

        // Map columns flexibly
        const findCol = (names: string[]) =>
          headers.findIndex((h) => names.some((n) => h.includes(n)));
        const nameIdx = findCol(["name", "entrant", "owner"]);
        const hometownIdx = findCol(["hometown", "city", "location", "from"]);
        const yearIdx = findCol(["year"]);
        const makeIdx = findCol(["make", "manufacturer", "brand"]);
        const modelIdx = findCol(["model"]);
        const colorIdx = findCol(["color", "colour"]);
        const classIdx = findCol(["class", "category"]);
        const numberIdx = findCol(["number", "entry_number", "num", "entry_num", "entry__"]);
        const bioIdx = findCol(["bio", "biography", "about", "description"]);
        const statusIdx = findCol(["status"]);

        if (nameIdx === -1) {
          setCsvError("Could not find a 'Name' column. Please include a column header with 'Name'.");
          return;
        }

        const parsed = dataRows.map((row, i) => ({
          user_id: `csv-${Date.now()}-${i}`,
          name: row[nameIdx] || "",
          hometown: hometownIdx >= 0 ? row[hometownIdx] || "" : "",
          years_collecting: 0,
          bio: bioIdx >= 0 ? row[bioIdx] || "" : "",
          car: {
            year: yearIdx >= 0 ? (parseInt(row[yearIdx]) || row[yearIdx] || "") : "",
            make: makeIdx >= 0 ? row[makeIdx] || "" : "",
            model: modelIdx >= 0 ? row[modelIdx] || "" : "",
            color: colorIdx >= 0 ? row[colorIdx] || "" : "",
          },
          entry_class: classIdx >= 0 ? row[classIdx] || "" : "",
          entry_number: numberIdx >= 0 ? (parseInt(row[numberIdx]) || i + 1) : i + 1,
          status: statusIdx >= 0 && row[statusIdx] ? row[statusIdx] : "Confirmed",
        })).filter((e) => e.name);

        if (parsed.length === 0) {
          setCsvError("No valid entrants found in CSV.");
          return;
        }

        setCsvPreview(parsed);
      } catch (err) {
        setCsvError("Failed to parse CSV. Please check the file format.");
      }
    };
    reader.readAsText(file);
    // Reset so the same file can be re-uploaded
    e.target.value = "";
  };

  const confirmCSVImport = (mode: "replace" | "append") => {
    if (!csvPreview) return;
    const newEntrants = mode === "replace" ? csvPreview : [...entrants, ...csvPreview];
    setEntrants(newEntrants);
    saveEntrants(newEntrants);
    setCsvSuccess(`${csvPreview.length} entrants ${mode === "replace" ? "imported" : "added"}!`);
    setCsvPreview(null);
    setTimeout(() => setCsvSuccess(""), 4000);
  };

  const exportCSV = () => {
    const headers = ["Entry Number", "Name", "Hometown", "Car Year", "Car Make", "Car Model", "Car Color", "Class", "Status", "Bio"];
    const rows = entrants.map((e) => [
      e.entry_number,
      `"${(e.name || "").replace(/"/g, '""')}"`,
      `"${(e.hometown || "").replace(/"/g, '""')}"`,
      e.car?.year || "",
      `"${(e.car?.make || "").replace(/"/g, '""')}"`,
      `"${(e.car?.model || "").replace(/"/g, '""')}"`,
      `"${(e.car?.color || "").replace(/"/g, '""')}"`,
      `"${(e.entry_class || "").replace(/"/g, '""')}"`,
      e.status || "",
      `"${(e.bio || "").replace(/"/g, '""')}"`,
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `entrants-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadSeedFile = () => {
    const entrantsJson = JSON.stringify(entrants, null, 2);
    const code = `// Generated entrants data — paste into lib/seed-data.ts to update deployed app\nexport const SEED_ENTRANTS = ${entrantsJson};\n`;
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "seed-entrants.ts";
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText("https://toor.vercel.app").then(() => {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 3000);
    });
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

  // ── Helper: Convert file to base64 ──
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let { width, height } = img;
          if (width > 600) {
            height = (height * 600) / width;
            width = 600;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", 0.9));
        };
        img.onerror = () => reject(new Error("Image load failed"));
        img.src = result;
      };
      reader.onerror = () => reject(new Error("File read failed"));
      reader.readAsDataURL(file);
    });
  };

  // ── Admin Dashboard ──
  const tabs = [
    { key: "dashboard", label: "Dashboard" },
    { key: "entrants", label: "Entrants" },
    { key: "tour", label: "Tour" },
    { key: "program", label: "Program" },
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
                { label: "Send push notification to all entrants", action: () => {} },
                { label: "Export entrant list as CSV", action: () => exportCSV() },
                { label: "Copy attendee link", action: () => copyShareLink() },
              ].map((item, i) => (
                <button
                  key={i}
                  onClick={item.action}
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
                  {i === 2 && linkCopied ? "Link Copied!" : item.label}
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
            {/* Share Link Banner */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 16px",
                marginBottom: 16,
                backgroundColor: "rgba(201, 168, 76, 0.08)",
                borderRadius: 8,
                borderLeft: "3px solid var(--accent)",
              }}
            >
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--primary)" }}>
                  Attendee Link
                </div>
                <div style={{ fontSize: 11, color: "var(--text)", opacity: 0.5, marginTop: 2 }}>
                  toor.vercel.app
                </div>
              </div>
              <button
                onClick={copyShareLink}
                style={{
                  padding: "8px 16px",
                  backgroundColor: linkCopied ? "#2E7D32" : "var(--primary)",
                  color: "var(--bg)",
                  border: "none",
                  borderRadius: 6,
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "var(--body-font)",
                  transition: "all 0.2s",
                }}
              >
                {linkCopied ? "Copied!" : "Copy Link"}
              </button>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
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
                  margin: 0,
                }}
              >
                {entrants.length} Registered Entrants
              </p>
              <div style={{ display: "flex", gap: 6 }}>
                <button
                  onClick={() => setAddingEntrant(!addingEntrant)}
                  style={{
                    padding: "8px 14px",
                    backgroundColor: addingEntrant ? "rgba(27,42,74,0.1)" : "var(--accent)",
                    color: addingEntrant ? "var(--text)" : "var(--primary)",
                    border: "none",
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "var(--body-font)",
                  }}
                >
                  {addingEntrant ? "Cancel" : "Add Entrant"}
                </button>
              </div>
            </div>

            {/* CSV Import / Export Row */}
            <div
              style={{
                display: "flex",
                gap: 8,
                marginBottom: 16,
                flexWrap: "wrap",
              }}
            >
              <input
                type="file"
                ref={csvFileInputRef}
                accept=".csv,.tsv,.txt"
                onChange={handleCSVUpload}
                style={{ display: "none" }}
              />
              <button
                onClick={() => csvFileInputRef.current?.click()}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "10px 16px",
                  backgroundColor: "#FFFFFF",
                  border: "1px solid rgba(27, 42, 74, 0.12)",
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: "pointer",
                  fontFamily: "var(--body-font)",
                  color: "var(--primary)",
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                Import CSV
              </button>
              <button
                onClick={exportCSV}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "10px 16px",
                  backgroundColor: "#FFFFFF",
                  border: "1px solid rgba(27, 42, 74, 0.12)",
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: "pointer",
                  fontFamily: "var(--body-font)",
                  color: "var(--primary)",
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Export CSV
              </button>
              <button
                onClick={downloadSeedFile}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "10px 16px",
                  backgroundColor: "#FFFFFF",
                  border: "1px solid rgba(27, 42, 74, 0.12)",
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: "pointer",
                  fontFamily: "var(--body-font)",
                  color: "var(--primary)",
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
                Seed File
              </button>
            </div>

            {/* CSV Error */}
            {csvError && (
              <div
                style={{
                  padding: "10px 14px",
                  marginBottom: 12,
                  backgroundColor: "rgba(211, 47, 47, 0.08)",
                  borderRadius: 8,
                  borderLeft: "3px solid #D32F2F",
                  fontSize: 12,
                  color: "#D32F2F",
                }}
              >
                {csvError}
              </div>
            )}

            {/* CSV Success */}
            {csvSuccess && (
              <div
                style={{
                  padding: "10px 14px",
                  marginBottom: 12,
                  backgroundColor: "rgba(76, 175, 80, 0.08)",
                  borderRadius: 8,
                  borderLeft: "3px solid #2E7D32",
                  fontSize: 12,
                  color: "#2E7D32",
                }}
              >
                {csvSuccess}
              </div>
            )}

            {/* CSV Preview */}
            {csvPreview && (
              <div
                style={{
                  padding: 16,
                  marginBottom: 16,
                  backgroundColor: "#FFFFFF",
                  border: "2px solid var(--accent)",
                  borderRadius: 10,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "var(--primary)" }}>
                      Preview: {csvPreview.length} entrants found
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text)", opacity: 0.5, marginTop: 2 }}>
                      Review the data below, then choose to replace or append.
                    </div>
                  </div>
                  <button
                    onClick={() => { setCsvPreview(null); setCsvError(""); }}
                    style={{
                      padding: "4px 10px",
                      backgroundColor: "rgba(27,42,74,0.08)",
                      border: "none",
                      borderRadius: 4,
                      fontSize: 11,
                      cursor: "pointer",
                      fontFamily: "var(--body-font)",
                      color: "var(--text)",
                    }}
                  >
                    Cancel
                  </button>
                </div>

                <div style={{ overflowX: "auto", maxHeight: 240, overflowY: "auto", marginBottom: 12 }}>
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      fontFamily: "var(--body-font)",
                      fontSize: 11,
                    }}
                  >
                    <thead>
                      <tr style={{ borderBottom: "1px solid rgba(27, 42, 74, 0.1)" }}>
                        {["#", "Name", "Car", "Class", "Status"].map((h) => (
                          <th
                            key={h}
                            style={{
                              padding: "6px 8px",
                              textAlign: "left",
                              fontSize: 9,
                              fontWeight: 600,
                              letterSpacing: "0.08em",
                              textTransform: "uppercase",
                              color: "var(--text)",
                              opacity: 0.4,
                              whiteSpace: "nowrap",
                              position: "sticky",
                              top: 0,
                              backgroundColor: "#FFFFFF",
                            }}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {csvPreview.slice(0, 50).map((ent, i) => (
                        <tr key={i} style={{ borderBottom: "1px solid rgba(27, 42, 74, 0.04)" }}>
                          <td style={{ padding: "6px 8px", color: "var(--accent)", fontWeight: 600 }}>
                            {ent.entry_number}
                          </td>
                          <td style={{ padding: "6px 8px", whiteSpace: "nowrap" }}>
                            <div style={{ fontWeight: 500, color: "var(--primary)" }}>{ent.name}</div>
                            <div style={{ fontSize: 10, opacity: 0.4 }}>{ent.hometown}</div>
                          </td>
                          <td style={{ padding: "6px 8px", whiteSpace: "nowrap" }}>
                            {ent.car.year} {ent.car.make} {ent.car.model}
                          </td>
                          <td style={{ padding: "6px 8px", fontSize: 10 }}>
                            {(ent.entry_class || "").split(" (")[0] || "—"}
                          </td>
                          <td style={{ padding: "6px 8px", fontSize: 10, color: ent.status === "Confirmed" ? "#2E7D32" : "#E65100" }}>
                            {ent.status}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {csvPreview.length > 50 && (
                    <div style={{ textAlign: "center", padding: 8, fontSize: 11, opacity: 0.5 }}>
                      ...and {csvPreview.length - 50} more
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={() => confirmCSVImport("replace")}
                    style={{
                      flex: 1,
                      padding: "12px",
                      backgroundColor: "var(--accent)",
                      color: "var(--primary)",
                      border: "none",
                      borderRadius: 8,
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                      fontFamily: "var(--body-font)",
                    }}
                  >
                    Replace All ({csvPreview.length})
                  </button>
                  <button
                    onClick={() => confirmCSVImport("append")}
                    style={{
                      flex: 1,
                      padding: "12px",
                      backgroundColor: "var(--primary)",
                      color: "var(--bg)",
                      border: "none",
                      borderRadius: 8,
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                      fontFamily: "var(--body-font)",
                    }}
                  >
                    Append to Existing
                  </button>
                </div>
              </div>
            )}

            {addingEntrant && (
              <EntrantForm
                onSave={(entrant) => {
                  const newEntrants = [...entrants, entrant];
                  setEntrants(newEntrants);
                  saveEntrants(newEntrants);
                  setAddingEntrant(false);
                }}
                classes={classes}
              />
            )}

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
                    {["#", "Entrant", "Car", "Class", "Status", "Actions"].map((h) => (
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
                      <td style={{ padding: "12px 8px", whiteSpace: "nowrap" }}>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button
                            onClick={() =>
                              editingEntrantId === ent.user_id
                                ? setEditingEntrantId(null)
                                : setEditingEntrantId(ent.user_id)
                            }
                            style={{
                              padding: "4px 8px",
                              backgroundColor: "rgba(201, 168, 76, 0.1)",
                              color: "var(--accent)",
                              border: "none",
                              borderRadius: 4,
                              fontSize: 10,
                              fontWeight: 600,
                              cursor: "pointer",
                              fontFamily: "var(--body-font)",
                            }}
                          >
                            {editingEntrantId === ent.user_id ? "Done" : "Edit"}
                          </button>
                          <button
                            onClick={() =>
                              setDeleteConfirm({
                                type: "entrant",
                                id: ent.user_id,
                              })
                            }
                            style={{
                              padding: "4px 8px",
                              backgroundColor: "rgba(229, 115, 115, 0.1)",
                              color: "#D32F2F",
                              border: "none",
                              borderRadius: 4,
                              fontSize: 10,
                              fontWeight: 600,
                              cursor: "pointer",
                              fontFamily: "var(--body-font)",
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {deleteConfirm?.type === "entrant" && (
              <ConfirmDialog
                message="Delete this entrant? This action cannot be undone."
                onConfirm={() => {
                  const updated = entrants.filter(
                    (e) => e.user_id !== deleteConfirm.id
                  );
                  setEntrants(updated);
                  saveEntrants(updated);
                  setDeleteConfirm(null);
                }}
                onCancel={() => setDeleteConfirm(null)}
              />
            )}

            {editingEntrantId && (
              <EntrantForm
                entrant={entrants.find((e) => e.user_id === editingEntrantId)}
                onSave={(updated) => {
                  const newEntrants = entrants.map((e) =>
                    e.user_id === editingEntrantId ? updated : e
                  );
                  setEntrants(newEntrants);
                  saveEntrants(newEntrants);
                  setEditingEntrantId(null);
                }}
                classes={classes}
              />
            )}
          </div>
        )}


        {/* ── Tour Tab ── */}
        {activeTab === "tour" && (
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <h3
                style={{
                  fontFamily: "var(--heading-font)",
                  fontSize: 22,
                  fontWeight: 400,
                  color: "var(--primary)",
                  margin: 0,
                }}
              >
                Tour Stops
              </h3>
              <button
                onClick={() => setAddingWaypoint(!addingWaypoint)}
                style={{
                  padding: "8px 14px",
                  backgroundColor: addingWaypoint ? "rgba(27,42,74,0.1)" : "var(--accent)",
                  color: addingWaypoint ? "var(--text)" : "var(--primary)",
                  border: "none",
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "var(--body-font)",
                }}
              >
                {addingWaypoint ? "Cancel" : "Add Stop"}
              </button>
            </div>

            {addingWaypoint && (
              <WaypointForm
                onSave={(waypoint) => {
                  const newWaypoints = [...waypoints, waypoint];
                  setWaypoints(newWaypoints);
                  saveWaypoints(newWaypoints);
                  setAddingWaypoint(false);
                }}
                waypointFileInputRef={waypointFileInputRef}
                fileToBase64={fileToBase64}
              />
            )}

            {waypoints.map((wp, i) => (
              <div key={i}>
                {editingWaypointIdx === i ? (
                  <WaypointForm
                    waypoint={wp}
                    onSave={(updated) => {
                      const newWaypoints = waypoints.map((w, idx) =>
                        idx === i ? updated : w
                      );
                      setWaypoints(newWaypoints);
                      saveWaypoints(newWaypoints);
                      setEditingWaypointIdx(null);
                    }}
                    waypointFileInputRef={waypointFileInputRef}
                    fileToBase64={fileToBase64}
                  />
                ) : (
                  <div
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
                      {i + 1}
                    </div>
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
                      {wp.photo && (
                        <img
                          src={wp.photo}
                          alt={wp.name}
                          style={{
                            marginTop: 8,
                            maxWidth: 200,
                            maxHeight: 100,
                            borderRadius: 4,
                          }}
                        />
                      )}
                    </div>
                    <div style={{ display: "flex", gap: 6, flexDirection: "column", flexShrink: 0 }}>
                      <button
                        onClick={() => setEditingWaypointIdx(i)}
                        style={{
                          padding: "4px 8px",
                          backgroundColor: "rgba(201, 168, 76, 0.1)",
                          color: "var(--accent)",
                          border: "none",
                          borderRadius: 4,
                          fontSize: 10,
                          fontWeight: 600,
                          cursor: "pointer",
                          fontFamily: "var(--body-font)",
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() =>
                          setDeleteConfirm({
                            type: "waypoint",
                            id: i,
                          })
                        }
                        style={{
                          padding: "4px 8px",
                          backgroundColor: "rgba(229, 115, 115, 0.1)",
                          color: "#D32F2F",
                          border: "none",
                          borderRadius: 4,
                          fontSize: 10,
                          fontWeight: 600,
                          cursor: "pointer",
                          fontFamily: "var(--body-font)",
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {deleteConfirm?.type === "waypoint" && (
              <ConfirmDialog
                message="Delete this tour stop? This action cannot be undone."
                onConfirm={() => {
                  const updated = waypoints.filter(
                    (_, idx) => idx !== deleteConfirm.id
                  );
                  setWaypoints(updated);
                  saveWaypoints(updated);
                  setDeleteConfirm(null);
                }}
                onCancel={() => setDeleteConfirm(null)}
              />
            )}
          </div>
        )}

        {/* ── Program Tab ── */}
        {activeTab === "program" && (
          <div>
            {/* Sponsors Section */}
            <div style={{ marginBottom: 40 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 20,
                }}
              >
                <h3
                  style={{
                    fontFamily: "var(--heading-font)",
                    fontSize: 20,
                    fontWeight: 400,
                    color: "var(--primary)",
                    margin: 0,
                  }}
                >
                  Sponsors
                </h3>
                <button
                  onClick={() => setAddingSponsor(!addingSponsor)}
                  style={{
                    padding: "8px 14px",
                    backgroundColor: addingSponsor ? "rgba(27,42,74,0.1)" : "var(--accent)",
                    color: addingSponsor ? "var(--text)" : "var(--primary)",
                    border: "none",
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "var(--body-font)",
                  }}
                >
                  {addingSponsor ? "Cancel" : "Add Sponsor"}
                </button>
              </div>

              {addingSponsor && (
                <SponsorForm
                  onSave={(sponsor) => {
                    const newSponsors = [...sponsors, sponsor];
                    setSponsors(newSponsors);
                    saveSponsors(newSponsors);
                    setAddingSponsor(false);
                  }}
                  fileToBase64={fileToBase64}
                  sponsorFileInputRef={sponsorFileInputRef}
                />
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {sponsors.map((sponsor) => (
                  <div key={sponsor.id}>
                    {editingSponsorId === sponsor.id ? (
                      <SponsorForm
                        sponsor={sponsor}
                        onSave={(updated) => {
                          const newSponsors = sponsors.map((s) =>
                            s.id === sponsor.id ? updated : s
                          );
                          setSponsors(newSponsors);
                          saveSponsors(newSponsors);
                          setEditingSponsorId(null);
                        }}
                        fileToBase64={fileToBase64}
                        sponsorFileInputRef={sponsorFileInputRef}
                      />
                    ) : (
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "14px 16px",
                          backgroundColor: "#FFFFFF",
                          border: "1px solid rgba(27, 42, 74, 0.06)",
                          borderRadius: 8,
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              fontSize: 14,
                              fontWeight: 500,
                              color: "var(--primary)",
                            }}
                          >
                            {sponsor.name}
                          </div>
                          <div
                            style={{
                              fontSize: 11,
                              color: "var(--text)",
                              opacity: 0.4,
                            }}
                          >
                            {sponsor.tier}
                            {sponsor.website && ` · ${sponsor.website}`}
                          </div>
                          {sponsor.logo && (
                            <img
                              src={sponsor.logo}
                              alt={sponsor.name}
                              style={{
                                marginTop: 8,
                                maxWidth: 120,
                                maxHeight: 60,
                                borderRadius: 4,
                              }}
                            />
                          )}
                        </div>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button
                            onClick={() => setEditingSponsorId(sponsor.id)}
                            style={{
                              padding: "4px 8px",
                              backgroundColor: "rgba(201, 168, 76, 0.1)",
                              color: "var(--accent)",
                              border: "none",
                              borderRadius: 4,
                              fontSize: 10,
                              fontWeight: 600,
                              cursor: "pointer",
                              fontFamily: "var(--body-font)",
                            }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() =>
                              setDeleteConfirm({
                                type: "sponsor",
                                id: sponsor.id,
                              })
                            }
                            style={{
                              padding: "4px 8px",
                              backgroundColor: "rgba(229, 115, 115, 0.1)",
                              color: "#D32F2F",
                              border: "none",
                              borderRadius: 4,
                              fontSize: 10,
                              fontWeight: 600,
                              cursor: "pointer",
                              fontFamily: "var(--body-font)",
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {deleteConfirm?.type === "sponsor" && (
                <ConfirmDialog
                  message="Delete this sponsor? This action cannot be undone."
                  onConfirm={() => {
                    const updated = sponsors.filter(
                      (s) => s.id !== deleteConfirm.id
                    );
                    setSponsors(updated);
                    saveSponsors(updated);
                    setDeleteConfirm(null);
                  }}
                  onCancel={() => setDeleteConfirm(null)}
                />
              )}
            </div>

            {/* Program Pages Section */}
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 20,
                }}
              >
                <h3
                  style={{
                    fontFamily: "var(--heading-font)",
                    fontSize: 20,
                    fontWeight: 400,
                    color: "var(--primary)",
                    margin: 0,
                  }}
                >
                  Program Pages
                </h3>
                <button
                  onClick={() => setAddingPage(!addingPage)}
                  style={{
                    padding: "8px 14px",
                    backgroundColor: addingPage ? "rgba(27,42,74,0.1)" : "var(--accent)",
                    color: addingPage ? "var(--text)" : "var(--primary)",
                    border: "none",
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "var(--body-font)",
                  }}
                >
                  {addingPage ? "Cancel" : "Add Page"}
                </button>
              </div>

              {addingPage && (
                <PageForm
                  onSave={(page) => {
                    const newPages = [...programPages, page];
                    setProgramPages(newPages);
                    saveProgramPages(newPages);
                    setAddingPage(false);
                  }}
                  fileToBase64={fileToBase64}
                  pageFileInputRef={pageFileInputRef}
                />
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {programPages.map((page) => (
                  <div key={page.id}>
                    {editingPageId === page.id ? (
                      <PageForm
                        page={page}
                        onSave={(updated) => {
                          const newPages = programPages.map((p) =>
                            p.id === page.id ? updated : p
                          );
                          setProgramPages(newPages);
                          saveProgramPages(newPages);
                          setEditingPageId(null);
                        }}
                        fileToBase64={fileToBase64}
                        pageFileInputRef={pageFileInputRef}
                      />
                    ) : (
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          padding: "14px 16px",
                          backgroundColor: "#FFFFFF",
                          border: "1px solid rgba(27, 42, 74, 0.06)",
                          borderRadius: 8,
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              fontSize: 14,
                              fontWeight: 500,
                              color: "var(--primary)",
                            }}
                          >
                            {page.title}
                          </div>
                          <div
                            style={{
                              fontSize: 12,
                              color: "var(--text)",
                              opacity: 0.5,
                              marginTop: 4,
                              lineHeight: 1.4,
                            }}
                          >
                            {page.body.substring(0, 100)}
                            {page.body.length > 100 ? "..." : ""}
                          </div>
                          {page.photo && (
                            <img
                              src={page.photo}
                              alt={page.title}
                              style={{
                                marginTop: 8,
                                maxWidth: 150,
                                maxHeight: 80,
                                borderRadius: 4,
                              }}
                            />
                          )}
                        </div>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button
                            onClick={() => setEditingPageId(page.id)}
                            style={{
                              padding: "4px 8px",
                              backgroundColor: "rgba(201, 168, 76, 0.1)",
                              color: "var(--accent)",
                              border: "none",
                              borderRadius: 4,
                              fontSize: 10,
                              fontWeight: 600,
                              cursor: "pointer",
                              fontFamily: "var(--body-font)",
                            }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() =>
                              setDeleteConfirm({
                                type: "page",
                                id: page.id,
                              })
                            }
                            style={{
                              padding: "4px 8px",
                              backgroundColor: "rgba(229, 115, 115, 0.1)",
                              color: "#D32F2F",
                              border: "none",
                              borderRadius: 4,
                              fontSize: 10,
                              fontWeight: 600,
                              cursor: "pointer",
                              fontFamily: "var(--body-font)",
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {deleteConfirm?.type === "page" && (
                <ConfirmDialog
                  message="Delete this program page? This action cannot be undone."
                  onConfirm={() => {
                    const updated = programPages.filter(
                      (p) => p.id !== deleteConfirm.id
                    );
                    setProgramPages(updated);
                    saveProgramPages(updated);
                    setDeleteConfirm(null);
                  }}
                  onCancel={() => setDeleteConfirm(null)}
                />
              )}
            </div>
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
              onClick={() => {
                saveBrandConfig(editBrand);
                setShowPreview(!showPreview);
              }}
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
              {showPreview ? "Hide Preview" : "Preview & Save"}
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

// ─── Helper Components ────────────────────────────────────────────────

function ConfirmDialog({ message, onConfirm, onCancel }: any) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: 12,
          padding: 24,
          maxWidth: 360,
          boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)",
        }}
      >
        <p
          style={{
            fontSize: 14,
            color: "var(--text)",
            marginBottom: 20,
            lineHeight: 1.5,
          }}
        >
          {message}
        </p>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              padding: "10px 16px",
              backgroundColor: "rgba(27,42,74,0.08)",
              color: "var(--text)",
              border: "none",
              borderRadius: 6,
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "var(--body-font)",
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1,
              padding: "10px 16px",
              backgroundColor: "#D32F2F",
              color: "#FFFFFF",
              border: "none",
              borderRadius: 6,
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "var(--body-font)",
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function EntrantForm({ entrant, onSave, classes }: any) {
  const [form, setForm] = useState(
    entrant || {
      name: "",
      hometown: "",
      car: { year: "", make: "", model: "", color: "" },
      entry_class: "",
      entry_number: "",
      status: "Pending",
      user_id: Math.random().toString(36).substr(2, 9),
    }
  );

  return (
    <div
      style={{
        backgroundColor: "#FFFFFF",
        border: "1px solid rgba(27, 42, 74, 0.06)",
        borderRadius: 8,
        padding: 16,
        marginBottom: 16,
      }}
    >
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
        <div>
          <label style={{ fontSize: 10, fontWeight: 600, color: "var(--text)", opacity: 0.5 }}>
            Name
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            style={{
              width: "100%",
              marginTop: 4,
              padding: "8px 12px",
              border: "1px solid rgba(27, 42, 74, 0.12)",
              borderRadius: 6,
              fontFamily: "var(--body-font)",
              fontSize: 13,
              outline: "none",
            }}
          />
        </div>
        <div>
          <label style={{ fontSize: 10, fontWeight: 600, color: "var(--text)", opacity: 0.5 }}>
            Hometown
          </label>
          <input
            type="text"
            value={form.hometown}
            onChange={(e) => setForm({ ...form, hometown: e.target.value })}
            style={{
              width: "100%",
              marginTop: 4,
              padding: "8px 12px",
              border: "1px solid rgba(27, 42, 74, 0.12)",
              borderRadius: 6,
              fontFamily: "var(--body-font)",
              fontSize: 13,
              outline: "none",
            }}
          />
        </div>
        <div>
          <label style={{ fontSize: 10, fontWeight: 600, color: "var(--text)", opacity: 0.5 }}>
            Car Year
          </label>
          <input
            type="text"
            value={form.car.year}
            onChange={(e) => setForm({ ...form, car: { ...form.car, year: e.target.value } })}
            style={{
              width: "100%",
              marginTop: 4,
              padding: "8px 12px",
              border: "1px solid rgba(27, 42, 74, 0.12)",
              borderRadius: 6,
              fontFamily: "var(--body-font)",
              fontSize: 13,
              outline: "none",
            }}
          />
        </div>
        <div>
          <label style={{ fontSize: 10, fontWeight: 600, color: "var(--text)", opacity: 0.5 }}>
            Car Make
          </label>
          <input
            type="text"
            value={form.car.make}
            onChange={(e) => setForm({ ...form, car: { ...form.car, make: e.target.value } })}
            style={{
              width: "100%",
              marginTop: 4,
              padding: "8px 12px",
              border: "1px solid rgba(27, 42, 74, 0.12)",
              borderRadius: 6,
              fontFamily: "var(--body-font)",
              fontSize: 13,
              outline: "none",
            }}
          />
        </div>
        <div>
          <label style={{ fontSize: 10, fontWeight: 600, color: "var(--text)", opacity: 0.5 }}>
            Car Model
          </label>
          <input
            type="text"
            value={form.car.model}
            onChange={(e) => setForm({ ...form, car: { ...form.car, model: e.target.value } })}
            style={{
              width: "100%",
              marginTop: 4,
              padding: "8px 12px",
              border: "1px solid rgba(27, 42, 74, 0.12)",
              borderRadius: 6,
              fontFamily: "var(--body-font)",
              fontSize: 13,
              outline: "none",
            }}
          />
        </div>
        <div>
          <label style={{ fontSize: 10, fontWeight: 600, color: "var(--text)", opacity: 0.5 }}>
            Car Color
          </label>
          <input
            type="text"
            value={form.car.color}
            onChange={(e) => setForm({ ...form, car: { ...form.car, color: e.target.value } })}
            style={{
              width: "100%",
              marginTop: 4,
              padding: "8px 12px",
              border: "1px solid rgba(27, 42, 74, 0.12)",
              borderRadius: 6,
              fontFamily: "var(--body-font)",
              fontSize: 13,
              outline: "none",
            }}
          />
        </div>
        <div>
          <label style={{ fontSize: 10, fontWeight: 600, color: "var(--text)", opacity: 0.5 }}>
            Class
          </label>
          <select
            value={form.entry_class}
            onChange={(e) => setForm({ ...form, entry_class: e.target.value })}
            style={{
              width: "100%",
              marginTop: 4,
              padding: "8px 12px",
              border: "1px solid rgba(27, 42, 74, 0.12)",
              borderRadius: 6,
              fontFamily: "var(--body-font)",
              fontSize: 13,
              outline: "none",
            }}
          >
            <option value="">Select Class</option>
            {classes.map((c: any) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label style={{ fontSize: 10, fontWeight: 600, color: "var(--text)", opacity: 0.5 }}>
            Entry #
          </label>
          <input
            type="text"
            value={form.entry_number}
            onChange={(e) => setForm({ ...form, entry_number: e.target.value })}
            style={{
              width: "100%",
              marginTop: 4,
              padding: "8px 12px",
              border: "1px solid rgba(27, 42, 74, 0.12)",
              borderRadius: 6,
              fontFamily: "var(--body-font)",
              fontSize: 13,
              outline: "none",
            }}
          />
        </div>
      </div>
      <button
        onClick={() => onSave(form)}
        style={{
          width: "100%",
          padding: "10px",
          backgroundColor: "var(--accent)",
          color: "var(--primary)",
          border: "none",
          borderRadius: 6,
          fontSize: 12,
          fontWeight: 600,
          cursor: "pointer",
          fontFamily: "var(--body-font)",
        }}
      >
        {entrant ? "Save Changes" : "Add Entrant"}
      </button>
    </div>
  );
}

function WaypointForm({ waypoint, onSave, waypointFileInputRef, fileToBase64 }: any) {
  const [form, setForm] = useState(
    waypoint || {
      stop: 1,
      name: "",
      time: "",
      location: "",
      description: "",
      photo: null,
      id: Math.random().toString(36).substr(2, 9),
    }
  );

  const handleFileInput = async (file: File) => {
    const base64 = await fileToBase64(file);
    setForm({ ...form, photo: base64 });
  };

  return (
    <div
      style={{
        backgroundColor: "#FFFFFF",
        border: "1px solid rgba(27, 42, 74, 0.06)",
        borderRadius: 8,
        padding: 16,
        marginBottom: 16,
      }}
    >
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
        <div>
          <label style={{ fontSize: 10, fontWeight: 600, color: "var(--text)", opacity: 0.5 }}>
            Stop Name
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            style={{
              width: "100%",
              marginTop: 4,
              padding: "8px 12px",
              border: "1px solid rgba(27, 42, 74, 0.12)",
              borderRadius: 6,
              fontFamily: "var(--body-font)",
              fontSize: 13,
              outline: "none",
            }}
          />
        </div>
        <div>
          <label style={{ fontSize: 10, fontWeight: 600, color: "var(--text)", opacity: 0.5 }}>
            Time
          </label>
          <input
            type="text"
            value={form.time}
            onChange={(e) => setForm({ ...form, time: e.target.value })}
            placeholder="10:30 AM"
            style={{
              width: "100%",
              marginTop: 4,
              padding: "8px 12px",
              border: "1px solid rgba(27, 42, 74, 0.12)",
              borderRadius: 6,
              fontFamily: "var(--body-font)",
              fontSize: 13,
              outline: "none",
            }}
          />
        </div>
        <div style={{ gridColumn: "1 / -1" }}>
          <label style={{ fontSize: 10, fontWeight: 600, color: "var(--text)", opacity: 0.5 }}>
            Location
          </label>
          <input
            type="text"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            style={{
              width: "100%",
              marginTop: 4,
              padding: "8px 12px",
              border: "1px solid rgba(27, 42, 74, 0.12)",
              borderRadius: 6,
              fontFamily: "var(--body-font)",
              fontSize: 13,
              outline: "none",
            }}
          />
        </div>
        <div style={{ gridColumn: "1 / -1" }}>
          <label style={{ fontSize: 10, fontWeight: 600, color: "var(--text)", opacity: 0.5 }}>
            Description
          </label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
            style={{
              width: "100%",
              marginTop: 4,
              padding: "8px 12px",
              border: "1px solid rgba(27, 42, 74, 0.12)",
              borderRadius: 6,
              fontFamily: "var(--body-font)",
              fontSize: 13,
              outline: "none",
              resize: "vertical",
            }}
          />
        </div>
        <div style={{ gridColumn: "1 / -1" }}>
          <label style={{ fontSize: 10, fontWeight: 600, color: "var(--text)", opacity: 0.5 }}>
            Photo
          </label>
          <input
            type="file"
            ref={waypointFileInputRef}
            accept="image/*"
            onChange={(e) => {
              const file = e.currentTarget.files?.[0];
              if (file) handleFileInput(file);
            }}
            style={{ display: "none" }}
          />
          <button
            onClick={() => waypointFileInputRef?.current?.click()}
            style={{
              width: "100%",
              marginTop: 4,
              padding: "8px 12px",
              backgroundColor: "rgba(27,42,74,0.06)",
              border: "1px solid rgba(27, 42, 74, 0.12)",
              borderRadius: 6,
              fontFamily: "var(--body-font)",
              fontSize: 13,
              cursor: "pointer",
              color: "var(--text)",
            }}
          >
            {form.photo ? "Change Photo" : "Upload Photo"}
          </button>
          {form.photo && (
            <img
              src={form.photo}
              alt="Preview"
              style={{
                marginTop: 8,
                maxWidth: 200,
                maxHeight: 100,
                borderRadius: 4,
              }}
            />
          )}
        </div>
      </div>
      <button
        onClick={() => onSave(form)}
        style={{
          width: "100%",
          padding: "10px",
          backgroundColor: "var(--accent)",
          color: "var(--primary)",
          border: "none",
          borderRadius: 6,
          fontSize: 12,
          fontWeight: 600,
          cursor: "pointer",
          fontFamily: "var(--body-font)",
        }}
      >
        {waypoint ? "Save Changes" : "Add Stop"}
      </button>
    </div>
  );
}

function SponsorForm({ sponsor, onSave, fileToBase64, sponsorFileInputRef }: any) {
  const [form, setForm] = useState(
    sponsor || {
      name: "",
      tier: "Gold",
      logo: null,
      website: "",
      id: Math.random().toString(36).substr(2, 9),
    }
  );

  const handleFileInput = async (file: File) => {
    const base64 = await fileToBase64(file);
    setForm({ ...form, logo: base64 });
  };

  return (
    <div
      style={{
        backgroundColor: "#FFFFFF",
        border: "1px solid rgba(27, 42, 74, 0.06)",
        borderRadius: 8,
        padding: 16,
        marginBottom: 16,
      }}
    >
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
        <div>
          <label style={{ fontSize: 10, fontWeight: 600, color: "var(--text)", opacity: 0.5 }}>
            Sponsor Name
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            style={{
              width: "100%",
              marginTop: 4,
              padding: "8px 12px",
              border: "1px solid rgba(27, 42, 74, 0.12)",
              borderRadius: 6,
              fontFamily: "var(--body-font)",
              fontSize: 13,
              outline: "none",
            }}
          />
        </div>
        <div>
          <label style={{ fontSize: 10, fontWeight: 600, color: "var(--text)", opacity: 0.5 }}>
            Tier
          </label>
          <select
            value={form.tier}
            onChange={(e) => setForm({ ...form, tier: e.target.value })}
            style={{
              width: "100%",
              marginTop: 4,
              padding: "8px 12px",
              border: "1px solid rgba(27, 42, 74, 0.12)",
              borderRadius: 6,
              fontFamily: "var(--body-font)",
              fontSize: 13,
              outline: "none",
            }}
          >
            <option>Presenting</option>
            <option>Gold</option>
            <option>Silver</option>
            <option>Bronze</option>
          </select>
        </div>
        <div style={{ gridColumn: "1 / -1" }}>
          <label style={{ fontSize: 10, fontWeight: 600, color: "var(--text)", opacity: 0.5 }}>
            Website
          </label>
          <input
            type="text"
            value={form.website}
            onChange={(e) => setForm({ ...form, website: e.target.value })}
            placeholder="https://example.com"
            style={{
              width: "100%",
              marginTop: 4,
              padding: "8px 12px",
              border: "1px solid rgba(27, 42, 74, 0.12)",
              borderRadius: 6,
              fontFamily: "var(--body-font)",
              fontSize: 13,
              outline: "none",
            }}
          />
        </div>
        <div style={{ gridColumn: "1 / -1" }}>
          <label style={{ fontSize: 10, fontWeight: 600, color: "var(--text)", opacity: 0.5 }}>
            Logo
          </label>
          <input
            type="file"
            ref={sponsorFileInputRef}
            accept="image/*"
            onChange={(e) => {
              const file = e.currentTarget.files?.[0];
              if (file) handleFileInput(file);
            }}
            style={{ display: "none" }}
          />
          <button
            onClick={() => sponsorFileInputRef?.current?.click()}
            style={{
              width: "100%",
              marginTop: 4,
              padding: "8px 12px",
              backgroundColor: "rgba(27,42,74,0.06)",
              border: "1px solid rgba(27, 42, 74, 0.12)",
              borderRadius: 6,
              fontFamily: "var(--body-font)",
              fontSize: 13,
              cursor: "pointer",
              color: "var(--text)",
            }}
          >
            {form.logo ? "Change Logo" : "Upload Logo"}
          </button>
          {form.logo && (
            <img
              src={form.logo}
              alt="Logo Preview"
              style={{
                marginTop: 8,
                maxWidth: 120,
                maxHeight: 60,
                borderRadius: 4,
              }}
            />
          )}
        </div>
      </div>
      <button
        onClick={() => onSave(form)}
        style={{
          width: "100%",
          padding: "10px",
          backgroundColor: "var(--accent)",
          color: "var(--primary)",
          border: "none",
          borderRadius: 6,
          fontSize: 12,
          fontWeight: 600,
          cursor: "pointer",
          fontFamily: "var(--body-font)",
        }}
      >
        {sponsor ? "Save Changes" : "Add Sponsor"}
      </button>
    </div>
  );
}

function PageForm({ page, onSave, fileToBase64, pageFileInputRef }: any) {
  const [form, setForm] = useState(
    page || {
      title: "",
      body: "",
      photo: null,
      id: Math.random().toString(36).substr(2, 9),
    }
  );

  const handleFileInput = async (file: File) => {
    const base64 = await fileToBase64(file);
    setForm({ ...form, photo: base64 });
  };

  return (
    <div
      style={{
        backgroundColor: "#FFFFFF",
        border: "1px solid rgba(27, 42, 74, 0.06)",
        borderRadius: 8,
        padding: 16,
        marginBottom: 16,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 12 }}>
        <div>
          <label style={{ fontSize: 10, fontWeight: 600, color: "var(--text)", opacity: 0.5 }}>
            Page Title
          </label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            style={{
              width: "100%",
              marginTop: 4,
              padding: "8px 12px",
              border: "1px solid rgba(27, 42, 74, 0.12)",
              borderRadius: 6,
              fontFamily: "var(--body-font)",
              fontSize: 13,
              outline: "none",
            }}
          />
        </div>
        <div>
          <label style={{ fontSize: 10, fontWeight: 600, color: "var(--text)", opacity: 0.5 }}>
            Body Text
          </label>
          <textarea
            value={form.body}
            onChange={(e) => setForm({ ...form, body: e.target.value })}
            rows={5}
            style={{
              width: "100%",
              marginTop: 4,
              padding: "8px 12px",
              border: "1px solid rgba(27, 42, 74, 0.12)",
              borderRadius: 6,
              fontFamily: "var(--body-font)",
              fontSize: 13,
              outline: "none",
              resize: "vertical",
            }}
          />
        </div>
        <div>
          <label style={{ fontSize: 10, fontWeight: 600, color: "var(--text)", opacity: 0.5 }}>
            Photo
          </label>
          <input
            type="file"
            ref={pageFileInputRef}
            accept="image/*"
            onChange={(e) => {
              const file = e.currentTarget.files?.[0];
              if (file) handleFileInput(file);
            }}
            style={{ display: "none" }}
          />
          <button
            onClick={() => pageFileInputRef?.current?.click()}
            style={{
              width: "100%",
              marginTop: 4,
              padding: "8px 12px",
              backgroundColor: "rgba(27,42,74,0.06)",
              border: "1px solid rgba(27, 42, 74, 0.12)",
              borderRadius: 6,
              fontFamily: "var(--body-font)",
              fontSize: 13,
              cursor: "pointer",
              color: "var(--text)",
            }}
          >
            {form.photo ? "Change Photo" : "Upload Photo"}
          </button>
          {form.photo && (
            <img
              src={form.photo}
              alt="Photo Preview"
              style={{
                marginTop: 8,
                maxWidth: 200,
                maxHeight: 100,
                borderRadius: 4,
              }}
            />
          )}
        </div>
      </div>
      <button
        onClick={() => onSave(form)}
        style={{
          width: "100%",
          padding: "10px",
          backgroundColor: "var(--accent)",
          color: "var(--primary)",
          border: "none",
          borderRadius: 6,
          fontSize: 12,
          fontWeight: 600,
          cursor: "pointer",
          fontFamily: "var(--body-font)",
        }}
      >
        {page ? "Save Changes" : "Add Page"}
      </button>
    </div>
  );
}
