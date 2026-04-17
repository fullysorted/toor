"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  seedIfNeeded,
  getBrandConfig,
  applyBrandConfig,
  getCurrentUser,
  setCurrentUser,
  setUserEntry,
  lookupInviteCode,
} from "@/lib/store";

export default function SplashPage() {
  const router = useRouter();
  const [brandConfig, setBrandConfig] = useState<any>(null);
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    seedIfNeeded();
    const config = getBrandConfig();
    applyBrandConfig(config);
    setBrandConfig(config);

    // If already logged in, go straight to home
    const existingUser = getCurrentUser();
    if (existingUser && existingUser.name) {
      router.push("/home");
      return;
    }

    // Check backup profile
    const backupRaw = localStorage.getItem("toor_platform_user_profile_backup");
    if (backupRaw) {
      const backup = JSON.parse(backupRaw);
      if (backup && backup.name) {
        setCurrentUser(backup);
        router.push("/home");
        return;
      }
    }

    setChecking(false);
  }, [router]);

  const handleInviteCode = () => {
    if (!inviteCode.trim()) {
      setError("Please enter your entry number or last name");
      return;
    }

    setLoading(true);
    setError("");

    setTimeout(() => {
      const entrant = lookupInviteCode(inviteCode);

      if (!entrant) {
        setError("No entrant found. Try your entry number (e.g. 101) or last name.");
        setLoading(false);
        return;
      }

      setCurrentUser({
        user_id: entrant.user_id,
        name: entrant.name,
        hometown: entrant.hometown,
        bio: entrant.bio,
        years_collecting: entrant.years_collecting,
        photo_url: "",
        auth_method: "invite_code",
        created_at: new Date().toISOString(),
      });

      setUserEntry({
        car: entrant.car,
        entry_class: entrant.entry_class,
        entry_number: entrant.entry_number,
        status: entrant.status,
      });

      setLoading(false);
      router.push("/home");
    }, 600);
  };

  if (checking || !brandConfig) {
    return (
      <div style={{
        minHeight: "100vh",
        backgroundColor: "var(--primary, #1B2A4A)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <div style={{
          width: 24, height: 24, borderRadius: "50%",
          border: "2px solid rgba(201, 168, 76, 0.3)",
          borderTopColor: "var(--accent, #C9A84C)",
          animation: "spin 0.8s linear infinite",
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "var(--primary)",
      fontFamily: "var(--body-font)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "40px 32px",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Subtle diagonal texture */}
      <div style={{
        position: "absolute", inset: 0, opacity: 0.03, pointerEvents: "none",
        backgroundImage: "repeating-linear-gradient(-35deg, transparent, transparent 40px, var(--accent) 40px, var(--accent) 41px)",
      }} />

      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 360, textAlign: "center" }}>
        {/* Toor wordmark */}
        <div style={{
          fontSize: 10, fontWeight: 600, letterSpacing: "0.3em",
          textTransform: "uppercase", color: "var(--accent)", opacity: 0.5,
          marginBottom: 32,
        }}>
          Toor
        </div>

        {/* Event name */}
        <h1 style={{
          fontFamily: "var(--heading-font)",
          fontSize: "clamp(32px, 8vw, 44px)",
          fontWeight: 400,
          color: "var(--bg)",
          lineHeight: 1.05,
          margin: 0,
        }}>
          La Jolla<br />
          Concours<br />
          d&apos;Elegance
        </h1>

        <div style={{
          fontSize: 12, fontWeight: 500, letterSpacing: "0.15em",
          textTransform: "uppercase", color: "var(--accent)",
          marginTop: 16, opacity: 0.7,
        }}>
          {brandConfig.anniversary_note}
        </div>

        <p style={{
          fontFamily: "var(--heading-font)",
          fontSize: 15, fontStyle: "italic",
          color: "var(--bg)", opacity: 0.45,
          marginTop: 8,
        }}>
          April 24{"\u2013"}26, 2026
        </p>

        {/* Presented by */}
        <div style={{ marginTop: 24, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
          <div style={{
            fontSize: 9, fontWeight: 500, letterSpacing: "0.12em",
            textTransform: "uppercase", color: "var(--bg)", opacity: 0.3,
          }}>
            Presented by
          </div>
          <img
            src="/sdam-logo.svg"
            alt="San Diego Automotive Museum"
            style={{ height: 24, filter: "brightness(0) invert(1)", opacity: 0.4 }}
          />
        </div>

        {/* Divider */}
        <div style={{
          width: 40, height: 1,
          backgroundColor: "var(--accent)", opacity: 0.25,
          margin: "28px auto",
        }} />

        {/* Invite code section */}
        <div style={{
          fontSize: 10, fontWeight: 600, letterSpacing: "0.15em",
          textTransform: "uppercase", color: "var(--bg)", opacity: 0.35,
          marginBottom: 14,
        }}>
          Entrant Access
        </div>

        <input
          type="text"
          placeholder="Entry # or last name"
          value={inviteCode}
          onChange={(e) => { setInviteCode(e.target.value); setError(""); }}
          onKeyDown={(e) => { if (e.key === "Enter") handleInviteCode(); }}
          style={{
            width: "100%",
            padding: "16px 20px",
            fontSize: 16,
            fontFamily: "var(--body-font)",
            backgroundColor: "rgba(250, 248, 244, 0.08)",
            border: error ? "1px solid rgba(180, 74, 74, 0.6)" : "1px solid rgba(250, 248, 244, 0.12)",
            borderRadius: 10,
            color: "var(--bg)",
            outline: "none",
            textAlign: "center",
            letterSpacing: "0.05em",
            transition: "border-color 0.2s",
          }}
        />

        {error && (
          <p style={{
            fontSize: 12, color: "#E07A5F", marginTop: 10, lineHeight: 1.4,
          }}>
            {error}
          </p>
        )}

        <button
          onClick={handleInviteCode}
          disabled={loading}
          style={{
            width: "100%",
            padding: "16px 24px",
            marginTop: 12,
            backgroundColor: "var(--accent)",
            color: "var(--primary)",
            border: "none",
            borderRadius: 10,
            fontSize: 14,
            fontWeight: 600,
            fontFamily: "var(--body-font)",
            letterSpacing: "0.04em",
            cursor: loading ? "wait" : "pointer",
            opacity: loading ? 0.7 : 1,
            transition: "opacity 0.2s",
          }}
        >
          {loading ? "Looking you up\u2026" : "Enter as Entrant"}
        </button>

        {/* Footer */}
        <p style={{
          fontSize: 10, color: "var(--bg)", opacity: 0.15,
          marginTop: 48, letterSpacing: "0.06em",
        }}>
          Powered by Toor {"\u00b7"} A Fully Sorted Company
        </p>
      </div>

      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { -webkit-font-smoothing: antialiased; }
        input::placeholder { color: rgba(250, 248, 244, 0.25); }
        input:focus { border-color: var(--accent) !important; }
      `}</style>
    </div>
  );
}
