"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  getBrandConfig,
  applyBrandConfig,
  getCurrentUser,
  getUserEntry,
  getCollection,
  saveCollection,
} from "@/lib/store";

// ─── Document Upload Placeholder ─────────────────────────────────────────────

interface DocPlaceholderProps {
  label: string;
}

function DocPlaceholder({ label }: DocPlaceholderProps) {
  const [uploaded, setUploaded] = useState(false);

  return (
    <button
      onClick={() => setUploaded(!uploaded)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "12px 14px",
        backgroundColor: uploaded ? "rgba(201, 168, 76, 0.08)" : "#FFFFFF",
        border: `1px ${uploaded ? "solid" : "dashed"} ${
          uploaded ? "var(--accent)" : "rgba(27, 42, 74, 0.12)"
        }`,
        borderRadius: 8,
        cursor: "pointer",
        width: "100%",
        textAlign: "left",
        transition: "all 0.2s",
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 6,
          backgroundColor: uploaded
            ? "var(--accent)"
            : "rgba(27, 42, 74, 0.04)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {uploaded ? (
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--primary)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12l5 5L20 7" />
          </svg>
        ) : (
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--text)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.35"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        )}
      </div>
      <div>
        <div
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: uploaded ? "var(--accent)" : "var(--text)",
          }}
        >
          {uploaded ? `${label} ✓` : label}
        </div>
        <div style={{ fontSize: 11, color: "var(--text)", opacity: 0.35 }}>
          {uploaded ? "Tap to remove" : "Tap to upload"}
        </div>
      </div>
    </button>
  );
}

// ─── Type Definitions ────────────────────────────────────────────────────────

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

interface Car {
  year: number | string;
  make: string;
  model?: string;
  color?: string;
}

interface Entry {
  car: Car;
  entry_class?: string;
  entry_number?: string;
  status?: string;
}

interface CollectionCar extends Car {
  id: string;
  notes?: string;
  added_at?: string;
}

// ─── Screen 6: Garage ────────────────────────────────────────────────────────

export default function Garage() {
  const router = useRouter();
  const [brandConfig, setBrandConfig] = useState<BrandConfig | null>(null);
  const [user, setUser] = useState<{ name: string } | null>(null);
  const [entry, setEntry] = useState<Entry | null>(null);
  const [collection, setCollection] = useState<CollectionCar[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCar, setNewCar] = useState({
    year: "",
    make: "",
    model: "",
    color: "",
    notes: "",
  });

  useEffect(() => {
    // Load fonts
    const link = document.createElement("link");
    link.href =
      "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Inter:wght@300;400;500;600&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);

    // Load data
    const config = getBrandConfig();
    applyBrandConfig(config);
    setBrandConfig(config);
    setUser(getCurrentUser());
    setEntry(getUserEntry(config.tenant_id));
    setCollection(getCollection());
  }, []);

  const handleAddCar = () => {
    if (!newCar.year || !newCar.make) return;
    const car: CollectionCar = {
      id: `car-${Date.now()}`,
      year: parseInt(newCar.year),
      make: newCar.make,
      model: newCar.model,
      color: newCar.color,
      notes: newCar.notes,
      added_at: new Date().toISOString(),
    };
    const updated = [...collection, car];
    setCollection(updated);
    saveCollection(updated);
    setNewCar({ year: "", make: "", model: "", color: "", notes: "" });
    setShowAddForm(false);
  };

  const handleRemoveCar = (id: string) => {
    const updated = collection.filter((c) => c.id !== id);
    setCollection(updated);
    saveCollection(updated);
  };

  const handleBack = () => {
    router.push("/home");
  };

  if (!brandConfig) return null;

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px 14px",
    border: "1px solid rgba(27, 42, 74, 0.12)",
    borderRadius: 8,
    fontFamily: "var(--body-font)",
    fontSize: 14,
    color: "var(--text)",
    outline: "none",
    backgroundColor: "#FFFFFF",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: "var(--text)",
    opacity: 0.45,
    marginBottom: 5,
  };

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
          padding: "14px 20px",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
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
            fontFamily: "var(--heading-font)",
            fontSize: 16,
            color: "var(--bg)",
            fontWeight: 400,
          }}
        >
          My Garage
        </div>
      </div>

      <div style={{ padding: "24px 20px 32px" }}>
        {/* ── Event Entry Car (Featured) ── */}
        {entry && entry.car && entry.car.make && (
          <div style={{ marginBottom: 32 }}>
            <p
              style={{
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "var(--text)",
                opacity: 0.35,
                marginBottom: 12,
              }}
            >
              Your Event Entry
            </p>

            <div
              style={{
                backgroundColor: "var(--primary)",
                borderRadius: 16,
                overflow: "hidden",
              }}
            >
              {/* Car Photo Placeholder */}
              <div
                style={{
                  width: "100%",
                  height: 180,
                  backgroundColor: "var(--primary)",
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    opacity: 0.05,
                    backgroundImage: `repeating-linear-gradient(-35deg, transparent, transparent 20px, var(--accent) 20px, var(--accent) 21px)`,
                  }}
                />
                <svg
                  width="56"
                  height="56"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--accent)"
                  strokeWidth="1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ opacity: 0.4 }}
                >
                  <path d="M5 17h14M5 17a2 2 0 0 1-2-2v-2a1 1 0 0 1 1-1h1l2.5-4.5A1 1 0 0 1 8.4 7h7.2a1 1 0 0 1 .9.5L19 12h1a1 1 0 0 1 1 1v2a2 2 0 0 1-2 2M5 17a2 2 0 1 0 4 0M15 17a2 2 0 1 0 4 0M9 17h6" />
                </svg>
              </div>

              {/* Car Details */}
              <div style={{ padding: "20px" }}>
                {/* Class Badge */}
                <div
                  style={{
                    display: "inline-block",
                    padding: "4px 12px",
                    backgroundColor: "var(--accent)",
                    borderRadius: 4,
                    fontSize: 10,
                    fontWeight: 600,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "var(--primary)",
                    marginBottom: 14,
                  }}
                >
                  {entry.entry_class
                    ? entry.entry_class.split(" (")[0]
                    : "Unclassed"}
                </div>

                <h2
                  style={{
                    fontFamily: "var(--heading-font)",
                    fontSize: 26,
                    fontWeight: 400,
                    color: "var(--bg)",
                    margin: 0,
                  }}
                >
                  {entry.car.year} {entry.car.make}
                </h2>
                <p
                  style={{
                    fontFamily: "var(--heading-font)",
                    fontSize: 20,
                    fontStyle: "italic",
                    color: "var(--bg)",
                    opacity: 0.7,
                    margin: "2px 0 0",
                  }}
                >
                  {entry.car.model}
                </p>

                {/* Specs Grid */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: 12,
                    marginTop: 18,
                    paddingTop: 18,
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
                    <div style={{ fontSize: 13, color: "var(--bg)", marginTop: 3 }}>
                      {entry.car.color || "—"}
                    </div>
                  </div>
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
                      Entry #
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        color: "var(--accent)",
                        fontWeight: 600,
                        marginTop: 3,
                      }}
                    >
                      {entry.entry_number ? `#${entry.entry_number}` : "—"}
                    </div>
                  </div>
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
                      Status
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        color: "var(--accent)",
                        marginTop: 3,
                      }}
                    >
                      {entry.status || "Pending"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Documents for Entry Car */}
            <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 8 }}>
              <DocPlaceholder label="Title / Registration" />
              <DocPlaceholder label="Insurance Card" />
              <DocPlaceholder label="Service Records" />
            </div>
          </div>
        )}

        {/* ── Divider ── */}
        <div
          style={{
            height: 1,
            background: `linear-gradient(90deg, transparent, var(--accent), transparent)`,
            margin: "8px 0 28px",
            opacity: 0.2,
          }}
        />

        {/* ── My Collection ── */}
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
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "var(--text)",
              opacity: 0.35,
            }}
          >
            My Collection
          </p>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              padding: "7px 14px",
              backgroundColor: showAddForm
                ? "rgba(27, 42, 74, 0.06)"
                : "var(--accent)",
              color: showAddForm ? "var(--text)" : "var(--primary)",
              border: "none",
              borderRadius: 6,
              fontFamily: "var(--body-font)",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {showAddForm ? (
              "Cancel"
            ) : (
              <>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                >
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Add Car
              </>
            )}
          </button>
        </div>

        {/* Add Car Form */}
        {showAddForm && (
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 12,
              padding: "20px",
              marginBottom: 16,
              border: "1px solid rgba(27, 42, 74, 0.06)",
              animation: "fadeUp 0.25s ease-out",
            }}
          >
            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 10, marginBottom: 10 }}>
              <div>
                <label style={labelStyle}>Year</label>
                <input
                  type="number"
                  value={newCar.year}
                  onChange={(e) =>
                    setNewCar({ ...newCar, year: e.target.value })
                  }
                  placeholder="1965"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Make</label>
                <input
                  value={newCar.make}
                  onChange={(e) =>
                    setNewCar({ ...newCar, make: e.target.value })
                  }
                  placeholder="Porsche"
                  style={inputStyle}
                />
              </div>
            </div>
            <div style={{ marginBottom: 10 }}>
              <label style={labelStyle}>Model</label>
              <input
                value={newCar.model}
                onChange={(e) =>
                  setNewCar({ ...newCar, model: e.target.value })
                }
                placeholder="356 Speedster"
                style={inputStyle}
              />
            </div>
            <div style={{ marginBottom: 10 }}>
              <label style={labelStyle}>Color</label>
              <input
                value={newCar.color}
                onChange={(e) =>
                  setNewCar({ ...newCar, color: e.target.value })
                }
                placeholder="Silver"
                style={inputStyle}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Notes</label>
              <textarea
                value={newCar.notes}
                onChange={(e) =>
                  setNewCar({ ...newCar, notes: e.target.value })
                }
                placeholder="Matching numbers, acquired 2019..."
                rows={2}
                style={{ ...inputStyle, resize: "vertical" }}
              />
            </div>
            <button
              onClick={handleAddCar}
              disabled={!newCar.year || !newCar.make}
              style={{
                width: "100%",
                padding: "13px",
                backgroundColor:
                  newCar.year && newCar.make
                    ? "var(--accent)"
                    : "rgba(27, 42, 74, 0.08)",
                color:
                  newCar.year && newCar.make
                    ? "var(--primary)"
                    : "var(--text)",
                border: "none",
                borderRadius: 8,
                fontFamily: "var(--body-font)",
                fontSize: 14,
                fontWeight: 600,
                cursor: newCar.year && newCar.make ? "pointer" : "not-allowed",
                opacity: newCar.year && newCar.make ? 1 : 0.4,
              }}
            >
              Add to Collection
            </button>
          </div>
        )}

        {/* Collection Cards */}
        {collection.length === 0 && !showAddForm && (
          <div
            style={{
              textAlign: "center",
              padding: "40px 20px",
              backgroundColor: "#FFFFFF",
              borderRadius: 12,
              border: "1px dashed rgba(27, 42, 74, 0.12)",
            }}
          >
            <svg
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--text)"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ opacity: 0.2, marginBottom: 12 }}
            >
              <path d="M5 17h14M5 17a2 2 0 0 1-2-2v-2a1 1 0 0 1 1-1h1l2.5-4.5A1 1 0 0 1 8.4 7h7.2a1 1 0 0 1 .9.5L19 12h1a1 1 0 0 1 1 1v2a2 2 0 0 1-2 2M5 17a2 2 0 1 0 4 0M15 17a2 2 0 1 0 4 0M9 17h6" />
            </svg>
            <p
              style={{
                fontFamily: "var(--heading-font)",
                fontSize: 18,
                color: "var(--primary)",
                fontWeight: 400,
                marginBottom: 6,
              }}
            >
              Your collection starts here
            </p>
            <p
              style={{
                fontSize: 13,
                color: "var(--text)",
                opacity: 0.4,
                lineHeight: 1.5,
              }}
            >
              Add the cars in your garage — they'll travel with you to every Toor event.
            </p>
          </div>
        )}

        {collection.map((car) => (
          <div
            key={car.id}
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 12,
              padding: "18px",
              marginBottom: 12,
              border: "1px solid rgba(27, 42, 74, 0.06)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <div>
                <h4
                  style={{
                    fontFamily: "var(--heading-font)",
                    fontSize: 18,
                    fontWeight: 500,
                    color: "var(--primary)",
                    margin: 0,
                  }}
                >
                  {car.year} {car.make}
                </h4>
                <p
                  style={{
                    fontFamily: "var(--heading-font)",
                    fontSize: 15,
                    fontStyle: "italic",
                    color: "var(--text)",
                    opacity: 0.6,
                    margin: "2px 0 0",
                  }}
                >
                  {car.model}
                </p>
                {car.color && (
                  <p
                    style={{
                      fontSize: 12,
                      color: "var(--text)",
                      opacity: 0.4,
                      marginTop: 4,
                    }}
                  >
                    {car.color}
                  </p>
                )}
              </div>
              <button
                onClick={() => handleRemoveCar(car.id)}
                style={{
                  backgroundColor: "transparent",
                  border: "none",
                  cursor: "pointer",
                  padding: 4,
                  opacity: 0.3,
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--text)"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {car.notes && (
              <p
                style={{
                  fontSize: 13,
                  color: "var(--text)",
                  opacity: 0.5,
                  fontStyle: "italic",
                  marginTop: 8,
                  lineHeight: 1.4,
                }}
              >
                {car.notes}
              </p>
            )}

            {/* Document Uploads */}
            <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 6 }}>
              <DocPlaceholder label="Title / Registration" />
              <DocPlaceholder label="Insurance Card" />
              <DocPlaceholder label="Service Records" />
            </div>
          </div>
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
        input::placeholder, textarea::placeholder { color: rgba(44, 44, 44, 0.3); }
        input:focus, textarea:focus { border-color: var(--accent) !important; }
        input::-webkit-outer-spin-button, input::-webkit-inner-spin-button { -webkit-appearance: none; }
        input[type=number] { -moz-appearance: textfield; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
