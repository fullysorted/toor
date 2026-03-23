"use client";

/**
 * TOOR — Screen 1: Splash / Login
 * Route: /
 */

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { seedIfNeeded, getBrandConfig, applyBrandConfig, setCurrentUser, getCurrentUser, getActiveTenantId } from "@/lib/store";

export default function SplashPage() {
  const router = useRouter();
  const [brandConfig, setBrandConfig] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loginState, setLoginState] = useState<"idle" | "authenticating" | "done">("idle");

  useEffect(() => {
    seedIfNeeded();
    const config = getBrandConfig();
    applyBrandConfig(config);
    setBrandConfig(config);

    // If user already exists with a name, skip to home
    const existingUser = getCurrentUser();
    if (existingUser && existingUser.name) {
      router.push("/home");
      return;
    }
    // Also check backup profile (in case they signed out but came back)
    const backupRaw = localStorage.getItem("toor_platform_user_profile_backup");
    if (backupRaw) {
      const backup = JSON.parse(backupRaw);
      if (backup && backup.name) {
        // Restore and skip to home
        setCurrentUser(backup);
        router.push("/home");
        return;
      }
    }

    setTimeout(() => setIsLoading(false), 600);
  }, []);

  const handleSignIn = (method: string) => {
    setLoginState("authenticating");

    // Check if returning user — look at both current user AND backup profile
    const existingUser = getCurrentUser();
    const backupRaw = typeof window !== "undefined" ? localStorage.getItem("toor_platform_user_profile_backup") : null;
    const backupUser = backupRaw ? JSON.parse(backupRaw) : null;
    const returningUser = (existingUser && existingUser.name) ? existingUser : (backupUser && backupUser.name) ? backupUser : null;

    if (returningUser) {
      // Restore the user profile (handles sign-out + sign-back-in flow)
      setCurrentUser({ ...returningUser, auth_method: method });
    } else {
      setCurrentUser({
        user_id: "user-current",
        name: "",
        hometown: "",
        bio: "",
        years_collecting: 0,
        photo_url: "",
        auth_method: method,
        created_at: new Date().toISOString(),
      });
    }

    setTimeout(() => {
      setLoginState("done");
      setTimeout(() => router.push(returningUser ? "/home" : "/profile"), 800);
    }, 1200);
  };

  if (isLoading || !brandConfig) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--primary)" }}>
        <div className="w-10 h-10 border-2 border-transparent rounded-full" style={{ borderTopColor: "var(--accent)", animation: "spin 1s linear infinite" }} />
      </div>
    );
  }

  if (loginState === "done") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ backgroundColor: "var(--primary)", color: "var(--bg)" }}>
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="24" r="23" stroke="var(--accent)" strokeWidth="2" />
          <path d="M14 24l7 7 13-13" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <p style={{ fontFamily: "var(--heading-font)", fontSize: 22 }}>Welcome to {brandConfig.event_name}</p>
        <p className="text-sm opacity-70">{getCurrentUser()?.name ? "Welcome back\u2026" : "Proceeding to profile setup\u2026"}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center" style={{ backgroundColor: "var(--primary)" }}>
      {/* Diagonal speed texture */}
      <div className="absolute inset-0 pointer-events-none" style={{ opacity: 0.06, backgroundImage: "repeating-linear-gradient(-35deg, transparent, transparent 40px, var(--accent) 40px, var(--accent) 41px)" }} />
      <div className="absolute inset-0 pointer-events-none" style={{ opacity: 0.03, backgroundImage: "repeating-linear-gradient(-35deg, transparent, transparent 120px, var(--bg) 120px, var(--bg) 122px)" }} />

      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: "linear-gradient(90deg, transparent, var(--accent), transparent)" }} />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center px-8 max-w-[480px] w-full text-center">
        {/* Platform mark */}
        <div className="text-[11px] font-medium tracking-[0.25em] uppercase mb-12 opacity-80" style={{ color: "var(--accent)" }}>
          Toor
        </div>

        {/* Anniversary badge */}
        <div className="inline-flex items-center gap-2 px-5 py-1.5 rounded-full mb-8" style={{ border: "1px solid var(--accent)" }}>
          <span className="text-[11px] font-medium tracking-[0.15em] uppercase" style={{ color: "var(--accent)" }}>
            {brandConfig.anniversary_note}
          </span>
        </div>

        {/* Event name */}
        <h1 style={{ fontFamily: "var(--heading-font)", fontSize: "clamp(36px, 8vw, 56px)", fontWeight: 400, lineHeight: 1.1, color: "var(--bg)" }}>
          La Jolla<br />
          <span className="italic font-light">Concours d'Elegance</span>
        </h1>

        {/* Gold divider */}
        <div className="w-16 h-px my-7 opacity-60" style={{ backgroundColor: "var(--accent)" }} />

        {/* Tagline */}
        <p className="text-[15px] tracking-[0.08em] opacity-75" style={{ color: "var(--bg)" }}>
          {brandConfig.tagline}
        </p>

        {/* Buttons */}
        <div className="mt-14 flex flex-col gap-3.5 w-full max-w-[320px]">
          <button
            onClick={() => handleSignIn("google")}
            disabled={loginState === "authenticating"}
            className="flex items-center justify-center gap-2.5 w-full py-4 px-6 rounded-md text-[15px] font-semibold tracking-wide transition-opacity"
            style={{ backgroundColor: "var(--accent)", color: "var(--primary)", opacity: loginState === "authenticating" ? 0.7 : 1 }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.26c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
              <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.997 8.997 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
            </svg>
            {loginState === "authenticating" ? "Signing In\u2026" : "Sign in with Google"}
          </button>

          <button
            onClick={() => handleSignIn("guest")}
            disabled={loginState === "authenticating"}
            className="w-full py-4 px-6 rounded-md text-[15px] tracking-wide transition-opacity"
            style={{ backgroundColor: "transparent", color: "var(--bg)", border: "1px solid rgba(250, 248, 244, 0.25)" }}
          >
            Continue as Guest
          </button>
        </div>

        {/* Footer */}
        <p className="mt-12 text-[11px] tracking-[0.06em] opacity-35" style={{ color: "var(--bg)" }}>
          Powered by Toor \u00b7 A Fully Sorted Company
        </p>
      </div>

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-[3px]" style={{ background: "linear-gradient(90deg, transparent, var(--accent), transparent)" }} />
    </div>
  );
}
