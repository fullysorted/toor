"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { seedIfNeeded, getBrandConfig, applyBrandConfig } from "@/lib/store";

export default function SplashPage() {
  const router = useRouter();

  useEffect(() => {
    seedIfNeeded();
    const config = getBrandConfig();
    applyBrandConfig(config);

    // Auto-redirect to home after a brief splash
    const timer = setTimeout(() => {
      router.push("/home");
    }, 1800);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "var(--primary, #1B2A4A)",
      fontFamily: "var(--body-font, Inter, sans-serif)",
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
        backgroundImage: "repeating-linear-gradient(-35deg, transparent, transparent 40px, var(--accent, #C9A84C) 40px, var(--accent, #C9A84C) 41px)",
      }} />

      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 360, textAlign: "center" }}>
        {/* Toor wordmark */}
        <div style={{
          fontSize: 10, fontWeight: 600, letterSpacing: "0.3em",
          textTransform: "uppercase", color: "var(--accent, #C9A84C)", opacity: 0.5,
          marginBottom: 32,
        }}>
          Toor
        </div>

        {/* Event name */}
        <h1 style={{
          fontFamily: 'var(--heading-font, "Cormorant Garamond", serif)',
          fontSize: "clamp(32px, 8vw, 44px)",
          fontWeight: 400,
          color: "var(--bg, #FAF8F4)",
          lineHeight: 1.05,
          margin: 0,
        }}>
          La Jolla<br />
          Concours<br />
          d&apos;Elegance
        </h1>

        <div style={{
          fontSize: 12, fontWeight: 500, letterSpacing: "0.15em",
          textTransform: "uppercase", color: "var(--accent, #C9A84C)",
          marginTop: 16, opacity: 0.7,
        }}>
          20th Anniversary
        </div>

        <p style={{
          fontFamily: 'var(--heading-font, "Cormorant Garamond", serif)',
          fontSize: 15, fontStyle: "italic",
          color: "var(--bg, #FAF8F4)", opacity: 0.45,
          marginTop: 8,
        }}>
          April 24{"\u2013"}26, 2026
        </p>

        {/* Presented by */}
        <div style={{ marginTop: 24, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
          <div style={{
            fontSize: 9, fontWeight: 500, letterSpacing: "0.12em",
            textTransform: "uppercase", color: "var(--bg, #FAF8F4)", opacity: 0.3,
          }}>
            Presented by
          </div>
          <img
            src="/sdam-logo.svg"
            alt="San Diego Automotive Museum"
            style={{ height: 24, filter: "brightness(0) invert(1)", opacity: 0.4 }}
          />
        </div>

        {/* Loading indicator */}
        <div style={{ marginTop: 48, display: "flex", justifyContent: "center" }}>
          <div style={{
            width: 24, height: 24, borderRadius: "50%",
            border: "2px solid rgba(201, 168, 76, 0.2)",
            borderTopColor: "var(--accent, #C9A84C)",
            animation: "spin 0.8s linear infinite",
          }} />
        </div>

        {/* Footer */}
        <p style={{
          fontSize: 10, color: "var(--bg, #FAF8F4)", opacity: 0.15,
          marginTop: 48, letterSpacing: "0.06em",
        }}>
          Powered by Toor {"\u00b7"} A Fully Sorted Company
        </p>
      </div>

      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { -webkit-font-smoothing: antialiased; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
