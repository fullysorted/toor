"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  getBrandConfig,
  applyBrandConfig,
  setCurrentUser,
  getCurrentUser,
  getUserEntry,
  setUserEntry,
  getActiveTenantId,
  getClasses,
} from "@/lib/store";

export default function ProfilePage() {
  const router = useRouter();
  const [brandConfig, setBrandConfig] = useState<any>(null);
  const [step, setStep] = useState(1); // 1 = personal, 2 = event entry
  const [isSaving, setIsSaving] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  // Personal profile fields
  const [name, setName] = useState("");
  const [hometown, setHometown] = useState("");
  const [yearsCollecting, setYearsCollecting] = useState("");
  const [bio, setBio] = useState("");

  // Event entry fields
  const [carYear, setCarYear] = useState("");
  const [carMake, setCarMake] = useState("");
  const [carModel, setCarModel] = useState("");
  const [carColor, setCarColor] = useState("");
  const [entryClass, setEntryClass] = useState("");
  const [entryNumber, setEntryNumber] = useState("");

  const [classes, setClasses] = useState<string[]>([]);

  // Photo state
  const [profilePhoto, setProfilePhoto] = useState<string>("");
  const [carPhoto, setCarPhoto] = useState<string>("");
  const profilePhotoRef = useRef<HTMLInputElement>(null);
  const carPhotoRef = useRef<HTMLInputElement>(null);

  const handlePhotoSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (val: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Resize to max 600px and compress
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX = 600;
        let w = img.width;
        let h = img.height;
        if (w > MAX || h > MAX) {
          if (w > h) { h = (h / w) * MAX; w = MAX; }
          else { w = (w / h) * MAX; h = MAX; }
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, w, h);
        setter(canvas.toDataURL("image/jpeg", 0.8));
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    // Load brand config and apply
    const config = getBrandConfig();
    applyBrandConfig(config);
    setBrandConfig(config);

    // Load classes from store
    const classList = getClasses();
    setClasses(classList);

    // Pre-fill if user has existing profile data
    const existingUser = getCurrentUser();
    if (existingUser) {
      if (existingUser.name) setName(existingUser.name);
      if (existingUser.hometown) setHometown(existingUser.hometown);
      if (existingUser.years_collecting) setYearsCollecting(String(existingUser.years_collecting));
      if (existingUser.bio) setBio(existingUser.bio);
      if (existingUser.photo_url) setProfilePhoto(existingUser.photo_url);
    }

    // Pre-fill event entry if exists
    const existingEntry = getUserEntry();
    if (existingEntry && existingEntry.car) {
      if (existingEntry.car.year) setCarYear(String(existingEntry.car.year));
      if (existingEntry.car.make) setCarMake(existingEntry.car.make);
      if (existingEntry.car.model) setCarModel(existingEntry.car.model);
      if (existingEntry.car.color) setCarColor(existingEntry.car.color);
      if (existingEntry.entry_class) setEntryClass(existingEntry.entry_class);
      if (existingEntry.entry_number) setEntryNumber(String(existingEntry.entry_number));
      if (existingEntry.photo_url) setCarPhoto(existingEntry.photo_url);
    }
  }, []);

  useEffect(() => {
    if (formRef.current) {
      formRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [step]);

  const handleNext = () => {
    if (!name.trim()) return;
    setStep(2);
  };

  const handleComplete = () => {
    setIsSaving(true);
    const tenantId = getActiveTenantId();

    // Save platform-level user profile
    const userProfile = {
      user_id: "user-current",
      name: name.trim(),
      hometown: hometown.trim(),
      years_collecting: parseInt(yearsCollecting) || 0,
      bio: bio.trim(),
      photo_url: profilePhoto,
      updated_at: new Date().toISOString(),
    };
    setCurrentUser(userProfile);

    // Save tenant+event scoped entry
    const eventEntry = {
      user_id: "user-current",
      tenant_id: tenantId,
      event_id: `${tenantId}-main`,
      car: {
        year: parseInt(carYear) || null,
        make: carMake.trim(),
        model: carModel.trim(),
        color: carColor.trim(),
      },
      entry_class: entryClass,
      entry_number: entryNumber.trim(),
      photo_url: carPhoto,
      status: "Pending",
      created_at: new Date().toISOString(),
    };
    setUserEntry(eventEntry);

    setTimeout(() => {
      setIsSaving(false);
      setIsComplete(true);
      // Navigate to home after completion animation
      setTimeout(() => {
        router.push("/home");
      }, 1500);
    }, 1000);
  };

  if (!brandConfig) return null;

  // ── Shared Styles ──
  const labelStyle = {
    display: "block" as const,
    fontFamily: "var(--body-font)",
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.1em",
    textTransform: "uppercase" as const,
    color: "var(--text)",
    opacity: 0.5,
    marginBottom: 6,
  };

  const inputStyle = {
    width: "100%",
    padding: "13px 16px",
    backgroundColor: "transparent",
    border: "1px solid rgba(27, 42, 74, 0.15)",
    borderRadius: 8,
    fontFamily: "var(--body-font)",
    fontSize: 15,
    color: "var(--text)",
    outline: "none",
    transition: "border-color 0.2s",
  };

  // ── Completion State ──
  if (isComplete) {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "var(--bg)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 32,
          textAlign: "center",
        }}
      >
        {/* Animated checkmark */}
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            border: "2px solid var(--accent)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 32,
            animation: "scaleIn 0.4s ease-out",
          }}
        >
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
            <path
              d="M8 18l8 8 12-12"
              stroke="var(--accent)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <h2
          style={{
            fontFamily: "var(--heading-font)",
            fontSize: 32,
            fontWeight: 400,
            color: "var(--primary)",
            margin: 0,
            lineHeight: 1.2,
          }}
        >
          You're all set, {name.split(" ")[0]}.
        </h2>

        <p
          style={{
            fontFamily: "var(--body-font)",
            fontSize: 15,
            color: "var(--text)",
            opacity: 0.6,
            marginTop: 12,
            maxWidth: 280,
            lineHeight: 1.5,
          }}
        >
          {carYear && carMake ? (
            <>
              Your {carYear} {carMake} {carModel} is registered
              {entryClass ? ` in ${entryClass.split(" (")[0]}` : ""}. See you at
              the Concours.
            </>
          ) : (
            <>Your profile is ready. Welcome to the weekend.</>
          )}
        </p>

        {/* Thin divider */}
        <div
          style={{
            width: 48,
            height: 1,
            backgroundColor: "var(--accent)",
            margin: "28px 0",
            opacity: 0.4,
          }}
        />

        <p
          style={{
            fontFamily: "var(--body-font)",
            fontSize: 12,
            color: "var(--text)",
            opacity: 0.35,
            letterSpacing: "0.04em",
          }}
        >
          Proceeding to your weekend hub…
        </p>

        <style>{`
          @keyframes scaleIn {
            from { transform: scale(0.7); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div
      ref={formRef}
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--bg)",
        fontFamily: "var(--body-font)",
        overflowY: "auto",
      }}
    >
      {/* ── Top Bar ── */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          backgroundColor: "var(--bg)",
          borderBottom: "1px solid rgba(27, 42, 74, 0.08)",
          padding: "16px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <div
            style={{
              fontSize: 10,
              fontWeight: 500,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "var(--accent)",
              marginBottom: 2,
            }}
          >
            Toor
          </div>
          <div
            style={{
              fontFamily: "var(--heading-font)",
              fontSize: 16,
              color: "var(--primary)",
              fontWeight: 500,
            }}
          >
            {brandConfig.event_name}
          </div>
        </div>

        {/* Step Indicator */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: "50%",
              backgroundColor: step >= 1 ? "var(--accent)" : "transparent",
              border: `1.5px solid var(--accent)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 11,
              fontWeight: 600,
              color: step >= 1 ? "var(--primary)" : "var(--accent)",
            }}
          >
            1
          </div>
          <div
            style={{
              width: 20,
              height: 1,
              backgroundColor: "var(--accent)",
              opacity: step >= 2 ? 1 : 0.25,
            }}
          />
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: "50%",
              backgroundColor: step >= 2 ? "var(--accent)" : "transparent",
              border: `1.5px solid var(--accent)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 11,
              fontWeight: 600,
              color: step >= 2 ? "var(--primary)" : "var(--accent)",
              opacity: step >= 2 ? 1 : 0.4,
            }}
          >
            2
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ padding: "32px 24px 100px", maxWidth: 480, margin: "0 auto" }}>
        {step === 1 && (
          <div style={{ animation: "fadeUp 0.35s ease-out" }}>
            {/* Section Header */}
            <div style={{ marginBottom: 8 }}>
              <h1
                style={{
                  fontFamily: "var(--heading-font)",
                  fontSize: 32,
                  fontWeight: 400,
                  color: "var(--primary)",
                  margin: 0,
                  lineHeight: 1.15,
                }}
              >
                Tell us about yourself
              </h1>
            </div>
            <p
              style={{
                fontSize: 14,
                color: "var(--text)",
                opacity: 0.5,
                lineHeight: 1.5,
                marginBottom: 36,
              }}
            >
              Your profile travels with you to every Toor event — one identity,
              every concours.
            </p>

            {/* Photo Upload */}
            <input
              ref={profilePhotoRef}
              type="file"
              accept="image/*"
              capture="user"
              style={{ display: "none" }}
              onChange={(e) => handlePhotoSelect(e, setProfilePhoto)}
            />
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginBottom: 36,
              }}
            >
              <div
                onClick={() => profilePhotoRef.current?.click()}
                style={{
                  width: 96,
                  height: 96,
                  borderRadius: "50%",
                  backgroundColor: "var(--primary)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  position: "relative",
                  overflow: "hidden",
                  transition: "opacity 0.2s",
                }}
              >
                {profilePhoto ? (
                  <img
                    src={profilePhoto}
                    alt="Profile"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      position: "absolute",
                      inset: 0,
                    }}
                  />
                ) : (
                  <>
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
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    <span
                      style={{
                        fontSize: 9,
                        fontWeight: 500,
                        letterSpacing: "0.08em",
                        color: "var(--accent)",
                        marginTop: 4,
                        textTransform: "uppercase",
                      }}
                    >
                      Add Photo
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Name */}
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Full Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. William Harrington III"
                style={inputStyle}
                onFocus={(e) =>
                  (e.currentTarget.style.borderColor = "var(--accent)")
                }
                onBlur={(e) =>
                  (e.currentTarget.style.borderColor = "rgba(27, 42, 74, 0.15)")
                }
              />
            </div>

            {/* Hometown */}
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Hometown</label>
              <input
                type="text"
                value={hometown}
                onChange={(e) => setHometown(e.target.value)}
                placeholder="e.g. Greenwich, CT"
                style={inputStyle}
                onFocus={(e) =>
                  (e.currentTarget.style.borderColor = "var(--accent)")
                }
                onBlur={(e) =>
                  (e.currentTarget.style.borderColor = "rgba(27, 42, 74, 0.15)")
                }
              />
            </div>

            {/* Years Collecting */}
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Years Collecting</label>
              <input
                type="number"
                value={yearsCollecting}
                onChange={(e) => setYearsCollecting(e.target.value)}
                placeholder="e.g. 15"
                style={inputStyle}
                onFocus={(e) =>
                  (e.currentTarget.style.borderColor = "var(--accent)")
                }
                onBlur={(e) =>
                  (e.currentTarget.style.borderColor = "rgba(27, 42, 74, 0.15)")
                }
              />
            </div>

            {/* Bio */}
            <div style={{ marginBottom: 32 }}>
              <label style={labelStyle}>About You</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="What draws you to collecting? Share your story — the cars, the memories, the obsession."
                rows={4}
                style={{
                  ...inputStyle,
                  resize: "vertical",
                  minHeight: 100,
                  lineHeight: 1.5,
                }}
                onFocus={(e) =>
                  (e.currentTarget.style.borderColor = "var(--accent)")
                }
                onBlur={(e) =>
                  (e.currentTarget.style.borderColor = "rgba(27, 42, 74, 0.15)")
                }
              />
              <p
                style={{
                  fontSize: 12,
                  color: "var(--text)",
                  opacity: 0.35,
                  marginTop: 6,
                  fontStyle: "italic",
                }}
              >
                This will be visible to other entrants in the event directory.
              </p>
            </div>

            {/* Next Button */}
            <button
              onClick={handleNext}
              disabled={!name.trim()}
              style={{
                width: "100%",
                padding: "16px 24px",
                backgroundColor: name.trim()
                  ? "var(--accent)"
                  : "rgba(27, 42, 74, 0.1)",
                color: name.trim() ? "var(--primary)" : "var(--text)",
                border: "none",
                borderRadius: 8,
                fontFamily: "var(--body-font)",
                fontSize: 15,
                fontWeight: 600,
                letterSpacing: "0.02em",
                cursor: name.trim() ? "pointer" : "not-allowed",
                opacity: name.trim() ? 1 : 0.5,
                transition: "all 0.2s",
              }}
            >
              Next — Add Your Car
            </button>

            <button
              onClick={() => {
                setStep(2);
              }}
              style={{
                width: "100%",
                padding: "14px 24px",
                backgroundColor: "transparent",
                color: "var(--text)",
                border: "none",
                fontFamily: "var(--body-font)",
                fontSize: 13,
                opacity: 0.4,
                cursor: "pointer",
                marginTop: 12,
              }}
            >
              Skip for now — I'm just attending
            </button>
          </div>
        )}

        {step === 2 && (
          <div style={{ animation: "fadeUp 0.35s ease-out" }}>
            {/* Section Header */}
            <div style={{ marginBottom: 8 }}>
              <h1
                style={{
                  fontFamily: "var(--heading-font)",
                  fontSize: 32,
                  fontWeight: 400,
                  color: "var(--primary)",
                  margin: 0,
                  lineHeight: 1.15,
                }}
              >
                Your entry
              </h1>
            </div>
            <p
              style={{
                fontSize: 14,
                color: "var(--text)",
                opacity: 0.5,
                lineHeight: 1.5,
                marginBottom: 36,
              }}
            >
              Register the automobile you're bringing to {brandConfig.event_name}
              . This is tied to this event only.
            </p>

            {/* Car Photo Upload */}
            <input
              ref={carPhotoRef}
              type="file"
              accept="image/*"
              capture="environment"
              style={{ display: "none" }}
              onChange={(e) => handlePhotoSelect(e, setCarPhoto)}
            />
            <div
              onClick={() => carPhotoRef.current?.click()}
              style={{
                width: "100%",
                height: 180,
                borderRadius: 12,
                backgroundColor: "var(--primary)",
                marginBottom: 32,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                overflow: "hidden",
                cursor: "pointer",
              }}
            >
              {carPhoto ? (
                <img
                  src={carPhoto}
                  alt="Car entry"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    position: "absolute",
                    inset: 0,
                  }}
                />
              ) : (
                <>
                  {/* Subtle diagonal lines */}
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      opacity: 0.06,
                      backgroundImage: `repeating-linear-gradient(-35deg, transparent, transparent 20px, var(--accent) 20px, var(--accent) 21px)`,
                    }}
                  />
                  <svg
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--accent)"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ position: "relative", zIndex: 1 }}
                  >
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 500,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      color: "var(--accent)",
                      marginTop: 8,
                      position: "relative",
                      zIndex: 1,
                      opacity: 0.7,
                    }}
                  >
                    Tap to add a photo of your entry
                  </span>
                </>
              )}
            </div>

            {/* Year + Make Row */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 2fr",
                gap: 12,
                marginBottom: 20,
              }}
            >
              <div>
                <label style={labelStyle}>Year</label>
                <input
                  type="number"
                  value={carYear}
                  onChange={(e) => setCarYear(e.target.value)}
                  placeholder="1967"
                  style={inputStyle}
                  onFocus={(e) =>
                    (e.currentTarget.style.borderColor = "var(--accent)")
                  }
                  onBlur={(e) =>
                    (e.currentTarget.style.borderColor =
                      "rgba(27, 42, 74, 0.15)")
                  }
                />
              </div>
              <div>
                <label style={labelStyle}>Make</label>
                <input
                  type="text"
                  value={carMake}
                  onChange={(e) => setCarMake(e.target.value)}
                  placeholder="Lamborghini"
                  style={inputStyle}
                  onFocus={(e) =>
                    (e.currentTarget.style.borderColor = "var(--accent)")
                  }
                  onBlur={(e) =>
                    (e.currentTarget.style.borderColor =
                      "rgba(27, 42, 74, 0.15)")
                  }
                />
              </div>
            </div>

            {/* Model */}
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Model</label>
              <input
                type="text"
                value={carModel}
                onChange={(e) => setCarModel(e.target.value)}
                placeholder="Miura P400"
                style={inputStyle}
                onFocus={(e) =>
                  (e.currentTarget.style.borderColor = "var(--accent)")
                }
                onBlur={(e) =>
                  (e.currentTarget.style.borderColor = "rgba(27, 42, 74, 0.15)")
                }
              />
            </div>

            {/* Color */}
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Color</label>
              <input
                type="text"
                value={carColor}
                onChange={(e) => setCarColor(e.target.value)}
                placeholder="Arancio Miura"
                style={inputStyle}
                onFocus={(e) =>
                  (e.currentTarget.style.borderColor = "var(--accent)")
                }
                onBlur={(e) =>
                  (e.currentTarget.style.borderColor = "rgba(27, 42, 74, 0.15)")
                }
              />
            </div>

            {/* Entry Class Dropdown */}
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Entry Class</label>
              <div style={{ position: "relative" }}>
                <select
                  value={entryClass}
                  onChange={(e) => setEntryClass(e.target.value)}
                  style={{
                    ...inputStyle,
                    appearance: "none",
                    paddingRight: 40,
                    backgroundColor: "var(--bg)",
                    color: entryClass
                      ? "var(--text)"
                      : "rgba(44, 44, 44, 0.4)",
                  }}
                  onFocus={(e) =>
                    (e.currentTarget.style.borderColor = "var(--accent)")
                  }
                  onBlur={(e) =>
                    (e.currentTarget.style.borderColor =
                      "rgba(27, 42, 74, 0.15)")
                  }
                >
                  <option value="" disabled>
                    Select your class
                  </option>
                  {classes.map((cls) => (
                    <option key={cls} value={cls}>
                      {cls}
                    </option>
                  ))}
                </select>
                {/* Chevron */}
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--accent)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{
                    position: "absolute",
                    right: 14,
                    top: "50%",
                    transform: "translateY(-50%)",
                    pointerEvents: "none",
                  }}
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </div>
            </div>

            {/* Entry Number */}
            <div style={{ marginBottom: 40 }}>
              <label style={labelStyle}>Entry Number</label>
              <input
                type="text"
                value={entryNumber}
                onChange={(e) => setEntryNumber(e.target.value)}
                placeholder="e.g. 204"
                style={{ ...inputStyle, maxWidth: 140 }}
                onFocus={(e) =>
                  (e.currentTarget.style.borderColor = "var(--accent)")
                }
                onBlur={(e) =>
                  (e.currentTarget.style.borderColor = "rgba(27, 42, 74, 0.15)")
                }
              />
              <p
                style={{
                  fontSize: 12,
                  color: "var(--text)",
                  opacity: 0.35,
                  marginTop: 6,
                  fontStyle: "italic",
                }}
              >
                Assigned by the concours — check your entry confirmation.
              </p>
            </div>

            {/* Complete Button */}
            <button
              onClick={handleComplete}
              disabled={isSaving}
              style={{
                width: "100%",
                padding: "16px 24px",
                backgroundColor: "var(--accent)",
                color: "var(--primary)",
                border: "none",
                borderRadius: 8,
                fontFamily: "var(--body-font)",
                fontSize: 15,
                fontWeight: 600,
                letterSpacing: "0.02em",
                cursor: isSaving ? "wait" : "pointer",
                opacity: isSaving ? 0.7 : 1,
                transition: "all 0.2s",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              {isSaving ? (
                <>
                  <div
                    style={{
                      width: 16,
                      height: 16,
                      border: "2px solid transparent",
                      borderTopColor: "var(--primary)",
                      borderRadius: "50%",
                      animation: "spin 0.8s linear infinite",
                    }}
                  />
                  Saving…
                </>
              ) : (
                "Complete My Profile"
              )}
            </button>

            {/* Back Link */}
            <button
              onClick={() => setStep(1)}
              style={{
                width: "100%",
                padding: "14px 24px",
                backgroundColor: "transparent",
                color: "var(--text)",
                border: "none",
                fontFamily: "var(--body-font)",
                fontSize: 13,
                opacity: 0.4,
                cursor: "pointer",
                marginTop: 12,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
              }}
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
                <path d="M19 12H5M12 5l-7 7 7 7" />
              </svg>
              Back to profile
            </button>
          </div>
        )}
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
        input::placeholder, textarea::placeholder { color: rgba(44, 44, 44, 0.3); }
        input::-webkit-outer-spin-button, input::-webkit-inner-spin-button {
          -webkit-appearance: none; margin: 0;
        }
        input[type=number] { -moz-appearance: textfield; }
        button:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
