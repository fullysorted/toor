"use client";

import { useEffect } from "react";
import { getBrandConfig, applyBrandConfig } from "@/lib/store";
import BottomNav from "@/components/BottomNav";

const SCHEDULE = [
  { time: "7:00 AM", end: "7:30 AM", title: "Driver Registration", location: null, highlight: false },
  { time: "7:00 AM", end: "8:10 AM", title: "Continental Breakfast", location: "La Valencia Hotel Ballroom", highlight: false },
  { time: "8:10 AM", end: "8:20 AM", title: "Drivers Meeting", location: null, highlight: false },
  { time: "8:30 AM", end: null, title: "Tour Starts", location: "Drivers Start Your Engines", highlight: true },
  { time: "9:00 AM", end: "9:15 AM", title: "Arrival at Moonlight Beach", location: null, highlight: false },
  { time: "9:15 AM", end: "9:30 AM", title: "Photo Opp / Car Talk", location: "Leave Moonlight Beach", highlight: false },
  { time: "9:30 AM", end: "10:30 AM", title: "Car Parade through Rancho Santa Fe", location: "Cars and Coffee", highlight: false },
  { time: "10:30 AM", end: "11:45 AM", title: "Arrival at Private Estate", location: "Private Car Collection and Refreshments", highlight: false },
  { time: "11:45 AM", end: "12:00 PM", title: "Drive to Go Cart Track", location: null, highlight: false },
  { time: "12:00 PM", end: "2:00 PM", title: "Catered Lunch", location: "Awards and Entertainment", highlight: true },
];

export default function SchedulePage() {
  useEffect(() => {
    const brand = getBrandConfig();
    if (brand) applyBrandConfig(brand);
  }, []);

  return (
    <div style={{ minHeight: "100dvh", backgroundColor: "var(--bg, #FAF8F4)", display: "flex", flexDirection: "column", paddingBottom: 72 }}>
      {/* Header */}
      <div style={{ backgroundColor: "var(--primary, #1B2A4A)", padding: "20px 16px 16px" }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, margin: 0, color: "#FFFFFF", fontFamily: 'var(--heading-font, "Cormorant Garamond", serif)', letterSpacing: "0.5px" }}>Tour Schedule</h1>
        <p style={{ fontSize: 12, color: "rgba(250,248,244,0.6)", margin: "4px 0 0", fontFamily: "var(--body-font, Inter, sans-serif)" }}>Saturday, April 25, 2026</p>
      </div>

      {/* Timeline */}
      <div style={{ flex: 1, padding: "16px 16px 8px", overflow: "auto" }}>
        {SCHEDULE.map((item, i) => (
          <div key={i} style={{ display: "flex", gap: 12, position: "relative", paddingBottom: i < SCHEDULE.length - 1 ? 0 : 8 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 20, flexShrink: 0 }}>
              <div style={{ width: item.highlight ? 14 : 10, height: item.highlight ? 14 : 10, borderRadius: "50%", backgroundColor: item.highlight ? "var(--accent, #C9A84C)" : "var(--primary, #1B2A4A)", border: item.highlight ? "2px solid rgba(201,168,76,0.3)" : "none", flexShrink: 0, marginTop: 4 }} />
              {i < SCHEDULE.length - 1 && <div style={{ width: 2, flex: 1, minHeight: 24, backgroundColor: "rgba(27,42,74,0.12)" }} />}
            </div>
            <div style={{ flex: 1, paddingBottom: 20, borderBottom: i < SCHEDULE.length - 1 ? "1px solid rgba(27,42,74,0.06)" : "none", marginBottom: i < SCHEDULE.length - 1 ? 4 : 0 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: item.highlight ? "var(--accent, #C9A84C)" : "rgba(27,42,74,0.45)", fontFamily: "var(--body-font, Inter, sans-serif)", letterSpacing: "0.03em", textTransform: "uppercase" }}>
                {item.time}{item.end ? ` - ${item.end}` : ""}
              </div>
              <div style={{ fontSize: item.highlight ? 17 : 15, fontWeight: item.highlight ? 700 : 600, color: "var(--primary, #1B2A4A)", fontFamily: 'var(--heading-font, "Cormorant Garamond", serif)', marginTop: 2, lineHeight: 1.3 }}>{item.title}</div>
              {item.location && <div style={{ fontSize: 12, color: "rgba(27,42,74,0.5)", fontFamily: "var(--body-font, Inter, sans-serif)", marginTop: 2, fontStyle: item.highlight ? "normal" : "italic" }}>{item.location}</div>}
            </div>
          </div>
        ))}
      </div>

      <div style={{ padding: "10px 16px", backgroundColor: "rgba(27,42,74,0.03)", borderTop: "1px solid rgba(27,42,74,0.06)", fontSize: 11, fontStyle: "italic", color: "rgba(27,42,74,0.35)", fontFamily: "var(--body-font, Inter, sans-serif)", textAlign: "center" }}>
        Please maintain safe following distances and obey all traffic laws.
      </div>

      <BottomNav active="schedule" />
    </div>
  );
}
