"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  getBrandConfig,
  applyBrandConfig,
  getEntrants,
  getMessages,
  saveMessage,
} from "@/lib/store";
import BottomNav from "@/components/BottomNav";

// ─── Types ───────────────────────────────────────────────────────────────

interface Car {
  year: number;
  make: string;
  model: string;
  color: string;
}

interface Entrant {
  user_id: string;
  name: string;
  hometown: string;
  years_collecting: number;
  entry_class: string;
  entry_number: number;
  car: Car;
  bio: string;
}

interface BrandConfig {
  tenant_id: string;
  event_name: string;
  primary_color: string;
  accent_color: string;
  background_color: string;
  text_color: string;
  heading_font: string;
  body_font: string;
}

interface Message {
  from: string;
  to: string;
  text: string;
  timestamp: string;
}

// ─── Connect Page ────────────────────────────────────────────────────────

export default function ConnectPage() {
  const router = useRouter();
  const [brandConfig, setBrandConfig] = useState<BrandConfig | null>(null);
  const [entrants, setEntrants] = useState<Entrant[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedEntrant, setSelectedEntrant] = useState<Entrant | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [contactExchanged, setContactExchanged] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load branding and entrant data
  useEffect(() => {
    const config = getBrandConfig();
    applyBrandConfig(config);
    setBrandConfig(config);
    setEntrants(getEntrants(config.tenant_id));
  }, []);

  // Auto-scroll to latest message
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages]);

  if (!brandConfig) return null;

  // Get unique classes that have entrants
  const classesWithEntrants = [...new Set(entrants.map((e) => e.entry_class))];

  // Filter entrants by search and class
  const filtered = entrants.filter((e) => {
    const matchesSearch =
      searchQuery === "" ||
      e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.car.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.car.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.hometown.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === "All" || e.entry_class === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedEntrant) return;
    const msg: Message = {
      from: "user-current",
      to: selectedEntrant.user_id,
      text: newMessage.trim(),
      timestamp: new Date().toISOString(),
    };
    const updated = saveMessage(brandConfig.tenant_id, selectedEntrant.user_id, msg);
    setChatMessages(updated);
    setNewMessage("");
  };

  const openChat = (entrant: Entrant) => {
    setShowChat(true);
    setChatMessages(getMessages(brandConfig.tenant_id, entrant.user_id));
    setContactExchanged(false);
  };

  // ── Chat View ──
  if (showChat && selectedEntrant) {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "var(--bg)",
          fontFamily: "var(--body-font)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Chat Header */}
        <div
          style={{
            position: "sticky",
            top: 0,
            zIndex: 10,
            backgroundColor: "var(--primary)",
            padding: "14px 20px",
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <button
            onClick={() => setShowChat(false)}
            style={{
              backgroundColor: "transparent",
              border: "none",
              cursor: "pointer",
              padding: 4,
              display: "flex",
              alignItems: "center",
            }}
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
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              backgroundColor: "var(--accent)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 13,
              fontWeight: 600,
              color: "var(--primary)",
            }}
          >
            {selectedEntrant.name.charAt(0)}
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 500, color: "var(--bg)" }}>
              {selectedEntrant.name}
            </div>
            <div style={{ fontSize: 11, color: "var(--bg)", opacity: 0.5 }}>
              {selectedEntrant.car.year} {selectedEntrant.car.make}{" "}
              {selectedEntrant.car.model}
            </div>
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, padding: "20px", overflowY: "auto" }}>
          {chatMessages.length === 0 && (
            <div style={{ textAlign: "center", padding: "40px 20px" }}>
              <p
                style={{
                  fontFamily: "var(--heading-font)",
                  fontSize: 20,
                  color: "var(--primary)",
                  fontWeight: 400,
                  marginBottom: 8,
                }}
              >
                Start a conversation
              </p>
              <p
                style={{
                  fontSize: 13,
                  color: "var(--text)",
                  opacity: 0.4,
                  lineHeight: 1.5,
                }}
              >
                Say hello to {selectedEntrant.name.split(" ")[0]} — fellow
                collectors are always happy to connect.
              </p>
            </div>
          )}
          {chatMessages.map((msg, i) => {
            const isMine = msg.from === "user-current";
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: isMine ? "flex-end" : "flex-start",
                  marginBottom: 10,
                }}
              >
                <div
                  style={{
                    maxWidth: "75%",
                    padding: "10px 14px",
                    borderRadius: 14,
                    borderBottomRightRadius: isMine ? 4 : 14,
                    borderBottomLeftRadius: isMine ? 14 : 4,
                    backgroundColor: isMine ? "var(--primary)" : "#FFFFFF",
                    color: isMine ? "var(--bg)" : "var(--text)",
                    fontSize: 14,
                    lineHeight: 1.45,
                    boxShadow: isMine ? "none" : "0 1px 2px rgba(0,0,0,0.05)",
                  }}
                >
                  {msg.text}
                </div>
              </div>
            );
          })}
          <div ref={chatEndRef} />
        </div>

        {/* Input */}
        <div
          style={{
            position: "sticky",
            bottom: 0,
            backgroundColor: "var(--bg)",
            borderTop: "1px solid rgba(27, 42, 74, 0.08)",
            padding: "12px 16px",
            display: "flex",
            gap: 10,
          }}
        >
          <input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder="Type a message..."
            style={{
              flex: 1,
              padding: "12px 16px",
              border: "1px solid rgba(27, 42, 74, 0.12)",
              borderRadius: 24,
              fontFamily: "var(--body-font)",
              fontSize: 14,
              outline: "none",
              backgroundColor: "#FFFFFF",
              color: "var(--text)",
            }}
          />
          <button
            onClick={handleSendMessage}
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              backgroundColor: newMessage.trim()
                ? "var(--accent)"
                : "rgba(27, 42, 74, 0.08)",
              border: "none",
              cursor: newMessage.trim() ? "pointer" : "default",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "background-color 0.2s",
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke={
                newMessage.trim()
                  ? "var(--primary)"
                  : "rgba(44,44,44,0.3)"
              }
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>

        <style>{`
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
          html { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
          button:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
          input::placeholder { color: rgba(44, 44, 44, 0.3); }
          input:focus { border-color: var(--accent) !important; }
        `}</style>
      </div>
    );
  }

  // ── Profile Modal View ──
  if (selectedEntrant) {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "var(--bg)",
          fontFamily: "var(--body-font)",
        }}
      >
        {/* Header */}
        <div
          style={{
            position: "sticky",
            top: 0,
            zIndex: 10,
            backgroundColor: "var(--primary)",
            padding: "14px 20px",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <button
            onClick={() => {
              setSelectedEntrant(null);
              setContactExchanged(false);
            }}
            style={{
              backgroundColor: "transparent",
              border: "none",
              cursor: "pointer",
              padding: 4,
              display: "flex",
              alignItems: "center",
            }}
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
          <span
            style={{
              fontFamily: "var(--heading-font)",
              fontSize: 16,
              color: "var(--bg)",
            }}
          >
            Entrant Profile
          </span>
        </div>

        <div style={{ padding: "32px 24px" }}>
          {/* Avatar + Name */}
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                backgroundColor: "var(--primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
                fontSize: 28,
                fontFamily: "var(--heading-font)",
                color: "var(--accent)",
              }}
            >
              {selectedEntrant.name.charAt(0)}
            </div>
            <h2
              style={{
                fontFamily: "var(--heading-font)",
                fontSize: 28,
                fontWeight: 400,
                color: "var(--primary)",
                margin: 0,
              }}
            >
              {selectedEntrant.name}
            </h2>
            <p
              style={{
                fontSize: 13,
                color: "var(--text)",
                opacity: 0.5,
                marginTop: 4,
              }}
            >
              {selectedEntrant.hometown} · Collecting{" "}
              {selectedEntrant.years_collecting} years
            </p>
          </div>

          {/* Car Card */}
          <div
            style={{
              backgroundColor: "var(--primary)",
              borderRadius: 12,
              padding: "20px",
              marginBottom: 20,
            }}
          >
            <div
              style={{
                display: "inline-block",
                padding: "3px 10px",
                backgroundColor: "var(--accent)",
                borderRadius: 4,
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--primary)",
                marginBottom: 12,
              }}
            >
              {selectedEntrant.entry_class.split(" (")[0]}
            </div>
            <h3
              style={{
                fontFamily: "var(--heading-font)",
                fontSize: 22,
                color: "var(--bg)",
                fontWeight: 400,
                margin: 0,
              }}
            >
              {selectedEntrant.car.year} {selectedEntrant.car.make}
            </h3>
            <p
              style={{
                fontFamily: "var(--heading-font)",
                fontSize: 18,
                fontStyle: "italic",
                color: "var(--bg)",
                opacity: 0.7,
                margin: "2px 0 0",
              }}
            >
              {selectedEntrant.car.model}
            </p>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: 14,
                paddingTop: 14,
                borderTop: "1px solid rgba(250,248,244,0.1)",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 9,
                    color: "var(--bg)",
                    opacity: 0.4,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                  }}
                >
                  Color
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: "var(--bg)",
                    marginTop: 2,
                  }}
                >
                  {selectedEntrant.car.color}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div
                  style={{
                    fontSize: 9,
                    color: "var(--bg)",
                    opacity: 0.4,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                  }}
                >
                  Entry
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: "var(--accent)",
                    fontWeight: 600,
                    marginTop: 2,
                  }}
                >
                  #{String(selectedEntrant.entry_number).padStart(3, "0")}
                </div>
              </div>
            </div>
          </div>

          {/* Bio */}
          <div style={{ marginBottom: 28 }}>
            <p
              style={{
                fontSize: 15,
                color: "var(--text)",
                lineHeight: 1.65,
                fontStyle: "italic",
                opacity: 0.7,
              }}
            >
              "{selectedEntrant.bio}"
            </p>
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", gap: 12 }}>
            <button
              onClick={() => openChat(selectedEntrant)}
              style={{
                flex: 1,
                padding: "14px",
                backgroundColor: "var(--accent)",
                color: "var(--primary)",
                border: "none",
                borderRadius: 8,
                fontFamily: "var(--body-font)",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              Send Message
            </button>
            <button
              onClick={() => setContactExchanged(!contactExchanged)}
              style={{
                flex: 1,
                padding: "14px",
                backgroundColor: contactExchanged
                  ? "rgba(27, 42, 74, 0.05)"
                  : "transparent",
                color: contactExchanged ? "var(--accent)" : "var(--primary)",
                border: contactExchanged
                  ? "none"
                  : "1.5px solid var(--primary)",
                borderRadius: 8,
                fontFamily: "var(--body-font)",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              {contactExchanged ? (
                <>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--accent)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12l5 5L20 7" />
                  </svg>
                  Exchanged
                </>
              ) : (
                <>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="8.5" cy="7" r="4" />
                    <line x1="20" y1="8" x2="20" y2="14" />
                    <line x1="23" y1="11" x2="17" y2="11" />
                  </svg>
                  Exchange Contact
                </>
              )}
            </button>
          </div>
        </div>

        <style>{`
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
          html { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
          button:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
          input::placeholder { color: rgba(44, 44, 44, 0.3); }
          input:focus { border-color: var(--accent) !important; }
        `}</style>
      </div>
    );
  }

  // ── Directory View (Main) ──
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--bg)",
        fontFamily: "var(--body-font)",
        paddingBottom: 80,
      }}
    >
      {/* Top Bar */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          backgroundColor: "var(--primary)",
          padding: "14px 20px",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
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
            Connect
          </div>
          <div
            style={{
              fontSize: 11,
              color: "var(--bg)",
              opacity: 0.5,
            }}
          >
            {entrants.length} Entrants · {brandConfig.event_name}
          </div>
        </div>
      </div>

      {/* Search */}
      <div style={{ padding: "16px 20px 0" }}>
        <div style={{ position: "relative" }}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--text)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              position: "absolute",
              left: 14,
              top: "50%",
              transform: "translateY(-50%)",
              opacity: 0.3,
            }}
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, car, or hometown..."
            style={{
              width: "100%",
              padding: "13px 16px 13px 42px",
              border: "1px solid rgba(27, 42, 74, 0.1)",
              borderRadius: 10,
              fontFamily: "var(--body-font)",
              fontSize: 14,
              backgroundColor: "#FFFFFF",
              color: "var(--text)",
              outline: "none",
            }}
          />
        </div>
      </div>

      {/* Filter Chips */}
      <div
        style={{
          padding: "12px 20px",
          overflowX: "auto",
          display: "flex",
          gap: 8,
          WebkitOverflowScrolling: "touch" as any,
        }}
      >
        <button
          onClick={() => setActiveFilter("All")}
          style={{
            padding: "7px 16px",
            backgroundColor:
              activeFilter === "All" ? "var(--primary)" : "transparent",
            color: activeFilter === "All" ? "var(--bg)" : "var(--text)",
            border:
              activeFilter === "All"
                ? "none"
                : "1px solid rgba(27, 42, 74, 0.12)",
            borderRadius: 20,
            fontFamily: "var(--body-font)",
            fontSize: 12,
            fontWeight: 500,
            cursor: "pointer",
            whiteSpace: "nowrap",
            transition: "all 0.15s",
          }}
        >
          All Classes
        </button>
        {classesWithEntrants.map((cls) => (
          <button
            key={cls}
            onClick={() =>
              setActiveFilter(activeFilter === cls ? "All" : cls)
            }
            style={{
              padding: "7px 16px",
              backgroundColor:
                activeFilter === cls ? "var(--primary)" : "transparent",
              color: activeFilter === cls ? "var(--bg)" : "var(--text)",
              border:
                activeFilter === cls
                  ? "none"
                  : "1px solid rgba(27, 42, 74, 0.12)",
              borderRadius: 20,
              fontFamily: "var(--body-font)",
              fontSize: 12,
              fontWeight: 500,
              cursor: "pointer",
              whiteSpace: "nowrap",
              transition: "all 0.15s",
            }}
          >
            {cls.split(" (")[0]}
          </button>
        ))}
      </div>

      {/* Results count */}
      <div style={{ padding: "0 20px 8px" }}>
        <span
          style={{
            fontSize: 12,
            color: "var(--text)",
            opacity: 0.35,
          }}
        >
          {filtered.length} entrant{filtered.length !== 1 ? "s" : ""}
          {activeFilter !== "All" && ` in ${activeFilter.split(" (")[0]}`}
        </span>
      </div>

      {/* Entrant Grid */}
      <div
        style={{
          padding: "0 20px 32px",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
        }}
      >
        {filtered.map((entrant) => (
          <button
            key={entrant.user_id}
            onClick={() => setSelectedEntrant(entrant)}
            style={{
              display: "flex",
              flexDirection: "column",
              padding: "16px",
              backgroundColor: "#FFFFFF",
              border: "1px solid rgba(27, 42, 74, 0.06)",
              borderRadius: 12,
              cursor: "pointer",
              textAlign: "left",
              transition: "all 0.2s",
              boxShadow: "0 1px 3px rgba(27, 42, 74, 0.04)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.boxShadow =
                "0 4px 12px rgba(27, 42, 74, 0.08)";
              (e.currentTarget as HTMLButtonElement).style.transform =
                "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.boxShadow =
                "0 1px 3px rgba(27, 42, 74, 0.04)";
              (e.currentTarget as HTMLButtonElement).style.transform =
                "translateY(0)";
            }}
          >
            {/* Avatar */}
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                backgroundColor: "var(--primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 16,
                fontFamily: "var(--heading-font)",
                color: "var(--accent)",
                marginBottom: 10,
              }}
            >
              {entrant.name.charAt(0)}
            </div>

            {/* Name */}
            <div
              style={{
                fontFamily: "var(--heading-font)",
                fontSize: 15,
                fontWeight: 500,
                color: "var(--primary)",
                lineHeight: 1.2,
                marginBottom: 4,
              }}
            >
              {entrant.name}
            </div>

            {/* Car */}
            <div
              style={{
                fontSize: 12,
                color: "var(--text)",
                opacity: 0.6,
                lineHeight: 1.3,
                marginBottom: 6,
              }}
            >
              {entrant.car.year} {entrant.car.make} {entrant.car.model}
            </div>

            {/* Hometown */}
            <div
              style={{
                fontSize: 11,
                color: "var(--text)",
                opacity: 0.35,
                marginBottom: 8,
              }}
            >
              {entrant.hometown}
            </div>

            {/* Class Badge */}
            <div
              style={{
                display: "inline-block",
                padding: "3px 8px",
                backgroundColor: "rgba(201, 168, 76, 0.1)",
                borderRadius: 4,
                fontSize: 9,
                fontWeight: 600,
                letterSpacing: "0.05em",
                color: "var(--accent)",
                textTransform: "uppercase",
                alignSelf: "flex-start",
              }}
            >
              {entrant.entry_class.split(" (")[0]}
            </div>
          </button>
        ))}
      </div>

      {/* Footer */}
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

      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
        button:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
        input::placeholder { color: rgba(44, 44, 44, 0.3); }
        input:focus { border-color: var(--accent) !important; }
      `}</style>
      <BottomNav active="connect" />
    </div>
  );
}
