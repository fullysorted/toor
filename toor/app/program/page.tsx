"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { getBrandConfig, applyBrandConfig } from "@/lib/store";
import BottomNav from "@/components/BottomNav";

const PDF_URL = "/tour-program.pdf";
const PDF_JS_CDN = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.2.67/pdf.min.mjs";
const PDF_WORKER_CDN = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.2.67/pdf.worker.min.mjs";

export default function ProgramPage() {
  const [totalPages, setTotalPages] = useState(0);
  const [current, setCurrent] = useState(0);
  const [flipping, setFlipping] = useState(false);
  const [flipDir, setFlipDir] = useState<"next" | "prev">("next");
  const [zoomed, setZoomed] = useState(false);
  const [pageImages, setPageImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  useEffect(() => { const brand = getBrandConfig(); if (brand) applyBrandConfig(brand); }, []);

  useEffect(() => {
    let cancelled = false;
    async function loadPdf() {
      try {
        const pdfjsLib = await import(/* webpackIgnore: true */ PDF_JS_CDN);
        pdfjsLib.GlobalWorkerOptions.workerSrc = PDF_WORKER_CDN;
        const pdf = await pdfjsLib.getDocument(PDF_URL).promise;
        if (cancelled) return;
        setTotalPages(pdf.numPages);
        const images: string[] = [];
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 2 });
          const canvas = document.createElement("canvas");
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const ctx = canvas.getContext("2d")!;
          await page.render({ canvasContext: ctx, viewport }).promise;
          images.push(canvas.toDataURL("image/jpeg", 0.85));
        }
        if (!cancelled) { setPageImages(images); setLoading(false); }
      } catch (err: unknown) {
        if (!cancelled) { setLoadError(err instanceof Error ? err.message : "Failed to load"); setLoading(false); }
      }
    }
    loadPdf();
    return () => { cancelled = true; };
  }, []);

  const goTo = useCallback((dir: "next" | "prev") => {
    if (flipping) return;
    if (dir === "next" && current >= totalPages - 1) return;
    if (dir === "prev" && current <= 0) return;
    setFlipDir(dir); setFlipping(true);
    setTimeout(() => { setCurrent(c => dir === "next" ? c + 1 : c - 1); setFlipping(false); }, 400);
  }, [flipping, current, totalPages]);

  const onTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; touchStartY.current = e.touches[0].clientY; };
  const onTouchEnd = (e: React.TouchEvent) => { if (zoomed) return; const dx = e.changedTouches[0].clientX - touchStartX.current; const dy = e.changedTouches[0].clientY - touchStartY.current; if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) { if (dx < 0) goTo("next"); else goTo("prev"); } };
  useEffect(() => { const handler = (e: KeyboardEvent) => { if (e.key === "ArrowRight" || e.key === "ArrowDown") goTo("next"); if (e.key === "ArrowLeft" || e.key === "ArrowUp") goTo("prev"); if (e.key === "Escape") setZoomed(false); }; window.addEventListener("keydown", handler); return () => window.removeEventListener("keydown", handler); }, [goTo]);
  const onPageClick = (e: React.MouseEvent) => { if (zoomed) { setZoomed(false); return; } const rect = (e.currentTarget as HTMLElement).getBoundingClientRect(); const x = e.clientX - rect.left; if (x < rect.width * 0.35) goTo("prev"); else if (x > rect.width * 0.65) goTo("next"); else setZoomed(true); };

  return (
    <>
      <div style={{ minHeight: "100dvh", backgroundColor: "var(--bg, #FAF8F4)", display: "flex", flexDirection: "column", paddingBottom: 72 }}>
        <div style={{ backgroundColor: "var(--primary, #1B2A4A)", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ color: "var(--accent, #C9A84C)", fontSize: 15, fontWeight: 600, letterSpacing: "0.04em", fontFamily: "var(--body-font)" }}>Tour Program</span>
          {totalPages > 0 && <span style={{ color: "rgba(250,248,244,0.5)", fontSize: 12, fontFamily: "var(--body-font)" }}>{current + 1} / {totalPages}</span>}
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "12px 8px", perspective: "1200px", overflow: "hidden" }} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
              <div style={{ width: 36, height: 36, border: "3px solid rgba(27,42,74,0.1)", borderTopColor: "var(--accent, #C9A84C)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
              <span style={{ fontSize: 13, color: "rgba(27,42,74,0.4)", fontFamily: "var(--body-font)" }}>Loading program...</span>
            </div>
          ) : loadError ? (
            <div style={{ textAlign: "center", padding: 32, color: "rgba(27,42,74,0.5)", fontFamily: "var(--body-font)" }}>
              <p style={{ fontSize: 14 }}>Could not load program</p>
              <p style={{ fontSize: 12, marginTop: 8 }}>{loadError}</p>
            </div>
          ) : (
            <>
              <div onClick={onPageClick} style={{ position: "relative", width: "100%", maxWidth: 500, aspectRatio: "666 / 792", borderRadius: 6, overflow: zoomed ? "auto" : "hidden", boxShadow: "0 8px 32px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.10)", cursor: zoomed ? "zoom-out" : "pointer", transformStyle: "preserve-3d" }}>
                <img src={pageImages[current]} alt={`Program page ${current + 1}`} style={{ width: zoomed ? "200%" : "100%", height: "auto", display: "block", animation: flipping ? (flipDir === "next" ? "flipOutRight 0.4s ease-in-out" : "flipOutLeft 0.4s ease-in-out") : "flipIn 0.3s ease-out", transformOrigin: flipDir === "next" ? "left center" : "right center" }} draggable={false} />
                {!zoomed && <div style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: "30%", background: "linear-gradient(to left, rgba(0,0,0,0.06) 0%, transparent 100%)", pointerEvents: "none" }} />}
                {!zoomed && !flipping && (
                  <>
                    {current > 0 && <div style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", width: 32, height: 32, borderRadius: "50%", backgroundColor: "rgba(27,42,74,0.5)", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0.6, pointerEvents: "none" }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg></div>}
                    {current < totalPages - 1 && <div style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", width: 32, height: 32, borderRadius: "50%", backgroundColor: "rgba(27,42,74,0.5)", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0.6, pointerEvents: "none" }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg></div>}
                  </>
                )}
              </div>
              {!zoomed && <p style={{ marginTop: 10, fontSize: 11, color: "rgba(27,42,74,0.35)", textAlign: "center", fontFamily: "var(--body-font)" }}>Swipe or tap edges to flip &middot; Tap center to zoom</p>}
            </>
          )}
        </div>
        {!loading && !loadError && (
          <div style={{ display: "flex", justifyContent: "center", gap: 8, padding: "8px 0 4px" }}>
            {pageImages.map((_, i) => (
              <button key={i} onClick={() => { if (i !== current && !flipping) { setFlipDir(i > current ? "next" : "prev"); setFlipping(true); setTimeout(() => { setCurrent(i); setFlipping(false); }, 400); } }} style={{ width: i === current ? 18 : 8, height: 8, borderRadius: 4, border: "none", backgroundColor: i === current ? "var(--accent, #C9A84C)" : "rgba(27,42,74,0.15)", cursor: "pointer", transition: "all 0.3s ease", padding: 0 }} aria-label={`Go to page ${i + 1}`} />
            ))}
          </div>
        )}
        <BottomNav active="program" />
      </div>
      <style>{`
        @keyframes flipOutRight { 0% { transform: rotateY(0deg); opacity: 1; } 100% { transform: rotateY(-15deg) translateX(-8%); opacity: 0.3; } }
        @keyframes flipOutLeft { 0% { transform: rotateY(0deg); opacity: 1; } 100% { transform: rotateY(15deg) translateX(8%); opacity: 0.3; } }
        @keyframes flipIn { 0% { transform: rotateY(8deg); opacity: 0.5; } 100% { transform: rotateY(0deg); opacity: 1; } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </>
  );
}
