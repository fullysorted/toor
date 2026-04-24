'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import BottomNav from '@/components/BottomNav';
import { getBrandConfig, applyBrandConfig } from '@/lib/store';

// Types
interface MapStop {
  name: string;
  lat: number;
  lng: number;
  label: string;
}

interface Step {
  number: number;
  action: string;
  detail: string;
  directionType: 'left' | 'right' | 'straight' | 'continue' | 'arrive' | 'depart';
}

interface Stage {
  number: number;
  name: string;
  depart: string;
  departAddress: string;
  destination: string;
  destAddress: string;
  departureTime: string;
  steps: Step[];
}

// 5 key locations for map markers
const MAP_STOPS: MapStop[] = [
  { name: 'La Valencia Hotel', lat: 32.8495, lng: -117.2740, label: 'S' },
  { name: 'Moonlight Beach', lat: 33.0441, lng: -117.2957, label: '1' },
  { name: 'Harvest Ranch Market', lat: 33.0360, lng: -117.2386, label: '2' },
  { name: 'Private Estate', lat: 33.0147, lng: -117.1890, label: '3' },
  { name: 'RSF Karting Club', lat: 33.0451, lng: -117.1757, label: 'F' },
];

// Detailed waypoints for OSRM to follow the exact tour route through coastal roads and RSF
const ROUTE_WAYPOINTS = [
  // Stage 1: La Jolla to Moonlight Beach (coastal Hwy 101)
  { lat: 32.8495, lng: -117.2740 },  // Start: La Valencia Hotel
  { lat: 32.8780, lng: -117.2690 },  // Torrey Pines Rd north
  { lat: 32.9220, lng: -117.2640 },  // S Camino Del Mar / Hwy 101
  { lat: 32.9590, lng: -117.2650 },  // Del Mar coast (Hwy 101)
  { lat: 32.9850, lng: -117.2710 },  // Solana Beach Hwy 101
  { lat: 33.0150, lng: -117.2850 },  // Cardiff-by-the-Sea Hwy 101
  { lat: 33.0441, lng: -117.2957 },  // Moonlight Beach

  // Stage 2: Moonlight Beach to Harvest Ranch Market (east on Encinitas Blvd)
  { lat: 33.0420, lng: -117.2800 },  // Encinitas Blvd heading east
  { lat: 33.0400, lng: -117.2600 },  // Encinitas Blvd midpoint
  { lat: 33.0360, lng: -117.2386 },  // Harvest Ranch Market

  // Stage 3: Harvest Ranch to Private Estate (winding through RSF)
  { lat: 33.0283, lng: -117.2304 },  // La Bajada
  { lat: 33.0240, lng: -117.2100 },  // Los Morros / La Granada north
  { lat: 33.0202, lng: -117.2029 },  // La Granada & Paseo Delicias (village center)
  { lat: 33.0201, lng: -117.2046 },  // Ave De Acacias / El Tordo intersection
  { lat: 33.0120, lng: -117.2120 },  // Linea Del Cielo area
  { lat: 33.0150, lng: -117.2050 },  // Paseo Delicias south loop
  { lat: 33.0180, lng: -117.2000 },  // La Granada south
  { lat: 33.0228, lng: -117.1991 },  // Via De La Valle & Las Colinas
  { lat: 33.0147, lng: -117.1890 },  // Private Estate (16503 Los Barbos)

  // Stage 4: Private Estate to RSF Karting Club (north through El Camino Del Norte)
  { lat: 33.0190, lng: -117.1940 },  // Los Barbos north
  { lat: 33.0202, lng: -117.2029 },  // Back through La Granada & Paseo Delicias
  { lat: 33.0270, lng: -117.2080 },  // El Camino Del Norte start
  { lat: 33.0370, lng: -117.1950 },  // El Camino Del Norte mid
  { lat: 33.0430, lng: -117.1830 },  // El Camino Del Norte north
  { lat: 33.0451, lng: -117.1757 },  // Finish: RSF Karting Club (18029 Pacifica Ranch Dr)
];

// 4 Tour Stages from the official program
const STAGES: Stage[] = [
  {
    number: 1,
    name: 'La Jolla to Moonlight Beach',
    depart: 'La Valencia Hotel',
    departAddress: '1132 Prospect St, La Jolla',
    destination: 'Moonlight Beach',
    destAddress: '351 C St, Encinitas (parking lot)',
    departureTime: '8:30 AM',
    steps: [
      { number: 1, action: 'Depart La Valencia Hotel', detail: 'Head south on Prospect St, then left on Prospect Place', directionType: 'depart' },
      { number: 2, action: 'Left on Torrey Pines Rd', detail: 'Head north', directionType: 'left' },
      { number: 3, action: 'Continue north', detail: 'Torrey Pines Rd becomes N. Torrey Pines Rd, then S. Camino del Mar / Hwy 101  - coastal route, no freeway', directionType: 'straight' },
      { number: 4, action: 'Left on D St', detail: 'Into Encinitas', directionType: 'left' },
      { number: 5, action: 'Right on 4th St', detail: 'Arrive at Moonlight Beach, 351 C St, Encinitas', directionType: 'arrive' },
    ],
  },
  {
    number: 2,
    name: 'Moonlight Beach to Harvest Ranch',
    depart: 'Moonlight Beach',
    departAddress: '351 C St, Encinitas (parking lot)',
    destination: 'Harvest Ranch Market',
    destAddress: '162 S Rancho Santa Fe Rd, Encinitas',
    departureTime: '9:30 AM',
    steps: [
      { number: 1, action: 'Right', detail: 'Depart Moonlight Beach, 351 C St, Encinitas', directionType: 'depart' },
      { number: 2, action: 'Left on C St', detail: 'Continue south', directionType: 'left' },
      { number: 3, action: 'Left on 3rd St', detail: '', directionType: 'left' },
      { number: 4, action: 'Right on B St', detail: 'Becomes Encinitas Blvd', directionType: 'right' },
      { number: 5, action: 'Continue on Encinitas Blvd', detail: 'Becomes South Rancho Santa Fe Farms Rd', directionType: 'straight' },
      { number: 6, action: 'Right', detail: 'Arrive at Harvest Ranch Market  - 162 S Rancho Santa Fe Rd, Encinitas', directionType: 'arrive' },
    ],
  },
  {
    number: 3,
    name: 'Harvest Ranch to Private Estate',
    depart: 'Harvest Ranch Market',
    departAddress: '162 S Rancho Santa Fe Rd, Encinitas',
    destination: 'Private Estate',
    destAddress: '16503 Los Barbos, Rancho Santa Fe',
    departureTime: '10:30 AM',
    steps: [
      { number: 1, action: 'Right', detail: 'Depart Harvest Ranch Market  - 162 S Rancho Santa Fe Rd, Encinitas', directionType: 'depart' },
      { number: 2, action: 'Right on La Bajada', detail: 'Into Rancho Santa Fe', directionType: 'right' },
      { number: 3, action: 'Continue on Los Morros', detail: '', directionType: 'straight' },
      { number: 4, action: 'Continue on La Granada', detail: '', directionType: 'straight' },
      { number: 5, action: 'Right on Paseo Delicias', detail: '', directionType: 'right' },
      { number: 6, action: 'Right on Ave De Acacias', detail: '', directionType: 'right' },
      { number: 7, action: 'Left on El Tordo', detail: '', directionType: 'left' },
      { number: 8, action: 'Left on Linea Del Cielo', detail: '', directionType: 'left' },
      { number: 9, action: 'Left on Paseo Delicias', detail: '', directionType: 'left' },
      { number: 10, action: 'Right on La Granada', detail: '', directionType: 'right' },
      { number: 11, action: 'Left on Via De La Valle', detail: '', directionType: 'left' },
      { number: 12, action: 'Right on Las Colinas', detail: '', directionType: 'right' },
      { number: 13, action: 'Right on Los Barbos', detail: 'Arrive at 16503 Los Barbos, Rancho Santa Fe', directionType: 'arrive' },
    ],
  },
  {
    number: 4,
    name: 'Private Estate to RSF Karting Club',
    depart: 'Private Estate',
    departAddress: '16503 Los Barbos, Rancho Santa Fe',
    destination: 'RSF Karting Club',
    destAddress: '18029 Pacifica Ranch Dr, Rancho Santa Fe',
    departureTime: '11:45 AM',
    steps: [
      { number: 1, action: 'Right on Los Barbos', detail: '16503 Los Barbos, Rancho Santa Fe', directionType: 'depart' },
      { number: 2, action: 'Depart north on Los Barbos', detail: '', directionType: 'straight' },
      { number: 3, action: 'Right on La Granada', detail: '', directionType: 'right' },
      { number: 4, action: 'Continue on La Granada', detail: '', directionType: 'straight' },
      { number: 5, action: 'Right on Paseo Delicias', detail: '', directionType: 'right' },
      { number: 6, action: 'North on El Camino Del Norte', detail: 'Scenic rolling hills through the ranch', directionType: 'straight' },
      { number: 7, action: 'Right on Pacifica Ranch Dr', detail: '', directionType: 'right' },
      { number: 8, action: 'FINISH  - RSF Karting Club', detail: '18029 Pacifica Ranch Dr', directionType: 'arrive' },
    ],
  },
];

// Direction arrow icons
function DirectionIcon({ type }: { type: Step['directionType'] }) {
  const size = 18;
  const sw = 2;
  if (type === 'left') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 12H5M12 19l-7-7 7-7" />
      </svg>
    );
  }
  if (type === 'right') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12h14M12 5l7 7-7 7" />
      </svg>
    );
  }
  if (type === 'arrive') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
        <circle cx="12" cy="9" r="2.5" />
      </svg>
    );
  }
  if (type === 'depart') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
      </svg>
    );
  }
  // straight / continue
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 19V5M5 12l7-7 7 7" />
    </svg>
  );
}

// Leaflet Map Component
function MapComponent() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);

  useEffect(() => {
    const loadLeaflet = async () => {
      const L = (window as any).L;
      if (!L) {
        const leafletScript = document.createElement('script');
        leafletScript.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        leafletScript.async = true;
        document.head.appendChild(leafletScript);
        leafletScript.onload = () => {
          const leafletCss = document.createElement('link');
          leafletCss.rel = 'stylesheet';
          leafletCss.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          document.head.appendChild(leafletCss);
          initMap();
        };
      } else {
        initMap();
      }
    };

    const initMap = () => {
      const L = (window as any).L;
      if (!mapContainer.current) return;

      map.current = L.map(mapContainer.current, { zoomControl: false }).setView([33.015, -117.22], 11);

      L.tileLayer('https://basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        maxZoom: 20,
      }).addTo(map.current);

      L.control.zoom({ position: 'bottomright' }).addTo(map.current);

      fetchRoute(L);
      addMarkers(L);
    };

    const fetchRoute = async (L: any) => {
      try {
        const coords = ROUTE_WAYPOINTS.map((wp) => `${wp.lng},${wp.lat}`).join(';');
        const response = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`
        );
        if (!response.ok) throw new Error('OSRM request failed');
        const data = await response.json();

        if (data.routes && data.routes[0]) {
          const route = data.routes[0];
          const coordinates = route.geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]]);

          // Navy backdrop
          L.polyline(coordinates, { color: '#1B2A4A', weight: 7, opacity: 1, lineCap: 'round', lineJoin: 'round' }).addTo(map.current);
          // Gold route on top
          L.polyline(coordinates, { color: '#C9A84C', weight: 4, opacity: 1, lineCap: 'round', lineJoin: 'round' }).addTo(map.current);

          const group = L.featureGroup([...coordinates.map((coord: any) => L.marker(coord))]);
          map.current.fitBounds(group.getBounds().pad(0.08));
        }
      } catch (error) {
        console.error('OSRM error:', error);
        const coordinates = MAP_STOPS.map((s) => [s.lat, s.lng]);
        L.polyline(coordinates, { color: '#1B2A4A', weight: 6, opacity: 1 }).addTo(map.current);
        L.polyline(coordinates, { color: '#C9A84C', weight: 4, opacity: 1 }).addTo(map.current);
        const group = L.featureGroup(coordinates.map((c: any) => L.marker(c)));
        map.current.fitBounds(group.getBounds().pad(0.08));
      }
    };

    const addMarkers = (L: any) => {
      MAP_STOPS.forEach((stop) => {
        const isTerminal = stop.label === 'S' || stop.label === 'F';
        const size = isTerminal ? 44 : 36;
        const fontSize = isTerminal ? '16px' : '14px';

        const html = `
          <div style="
            width: ${size}px; height: ${size}px;
            background-color: #1B2A4A;
            border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            color: #C9A84C; font-weight: bold; font-size: ${fontSize};
            border: 2.5px solid #C9A84C;
            box-shadow: 0 2px 8px rgba(0,0,0,0.25);
            font-family: var(--body-font, 'Inter', sans-serif);
          ">${stop.label}</div>
        `;

        const marker = L.marker([stop.lat, stop.lng], {
          icon: L.divIcon({ html, iconSize: [size, size], iconAnchor: [size / 2, size / 2], className: 'custom-marker' }),
        }).addTo(map.current);

        marker.bindPopup(`<strong>${stop.name}</strong>`);
      });
    };

    loadLeaflet();
    return () => { if (map.current) { map.current.remove(); map.current = null; } };
  }, []);

  return <div ref={mapContainer} style={{ width: '100%', height: '100%', backgroundColor: '#FAF8F4' }} />;
}

// Stage header component
function StageHeader({ stage, isActive, onToggle }: { stage: Stage; isActive: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      style={{
        width: '100%',
        padding: '14px 16px',
        backgroundColor: isActive ? '#1B2A4A' : '#FAF8F4',
        color: isActive ? '#FFFFFF' : '#1B2A4A',
        border: 'none',
        borderBottom: '1px solid #E0DDD4',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'all 0.2s ease',
        fontFamily: 'var(--body-font, "Inter", sans-serif)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '28px', height: '28px', borderRadius: '50%',
            backgroundColor: isActive ? '#C9A84C' : '#1B2A4A',
            color: isActive ? '#1B2A4A' : '#C9A84C',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 'bold', fontSize: '13px', flexShrink: 0,
          }}>
            {stage.number}
          </div>
          <div>
            <div style={{
              fontFamily: 'var(--heading-font, "Cormorant Garamond", serif)',
              fontWeight: '600', fontSize: '16px', lineHeight: '1.2',
            }}>
              Stage {stage.number}
            </div>
            <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '2px' }}>
              {stage.depart} {"\u2192"} {stage.destination}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            fontSize: '12px', fontWeight: '600',
            color: isActive ? '#C9A84C' : '#666',
          }}>
            {stage.departureTime}
          </span>
          <span style={{ fontSize: '14px', transition: 'transform 0.2s', transform: isActive ? 'rotate(180deg)' : 'rotate(0deg)' }}>
            â¾
          </span>
        </div>
      </div>
    </button>
  );
}

// Step item component
function StepItem({ step, isLast }: { step: Step; isLast: boolean }) {
  const isArrival = step.directionType === 'arrive';
  const isDeparture = step.directionType === 'depart';
  const isSpecial = isArrival || isDeparture;

  return (
    <div style={{
      display: 'flex', gap: '12px', padding: '10px 16px',
      backgroundColor: isArrival ? 'rgba(201, 168, 76, 0.08)' : 'transparent',
      borderBottom: isLast ? 'none' : '1px solid #F0EDE6',
    }}>
      <div style={{
        flexShrink: 0, width: '28px', height: '28px', borderRadius: '50%',
        backgroundColor: isSpecial ? '#C9A84C' : '#1B2A4A',
        color: isSpecial ? '#1B2A4A' : '#C9A84C',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '11px', fontWeight: 'bold',
        fontFamily: 'var(--body-font, "Inter", sans-serif)',
      }}>
        {step.number}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: '13px', fontWeight: '600', color: '#2C2C2C',
          fontFamily: 'var(--body-font, "Inter", sans-serif)', lineHeight: '1.4',
        }}>
          {step.action}
        </div>
        {step.detail && (
          <div style={{
            fontSize: '12px', color: '#666', marginTop: '2px',
            fontFamily: 'var(--body-font, "Inter", sans-serif)', lineHeight: '1.4',
          }}>
            {step.detail}
          </div>
        )}
      </div>

      <div style={{
        flexShrink: 0, color: isSpecial ? '#C9A84C' : '#1B2A4A',
        display: 'flex', alignItems: 'center', paddingTop: '2px',
      }}>
        <DirectionIcon type={step.directionType} />
      </div>
    </div>
  );
}

// Directions panel
function DirectionsPanel() {
  const [activeStage, setActiveStage] = useState(0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#FFFFFF' }}>
      {STAGES.map((stage, idx) => (
        <div key={stage.number}>
          <StageHeader
            stage={stage}
            isActive={activeStage === idx}
            onToggle={() => setActiveStage(activeStage === idx ? -1 : idx)}
          />
          {activeStage === idx && (
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {/* Stage info bar */}
              <div style={{
                padding: '10px 16px', backgroundColor: '#FAF8F4',
                borderBottom: '1px solid #E0DDD4', fontSize: '11px', color: '#666',
                fontFamily: 'var(--body-font, "Inter", sans-serif)',
              }}>
                <div><strong>From:</strong> {stage.departAddress}</div>
                <div><strong>To:</strong> {stage.destAddress}</div>
              </div>
              {/* Steps */}
              {stage.steps.map((step, stepIdx) => (
                <StepItem key={step.number} step={step} isLast={stepIdx === stage.steps.length - 1} />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// Main page
export default function NavigatePage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const brand = getBrandConfig();
    applyBrandConfig(brand);
  }, []);

  if (!mounted) return null;

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100vh',
      backgroundColor: '#FAF8F4',
      fontFamily: 'var(--body-font, "Inter", sans-serif)',
    }}>
      {/* Top Bar */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 100,
        backgroundColor: '#1B2A4A', color: '#FFFFFF',
        padding: '14px 16px',
        display: 'flex', alignItems: 'center', gap: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      }}>
        <Link
          href="/home"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: '32px', height: '32px', borderRadius: '6px',
            backgroundColor: 'rgba(255,255,255,0.1)', color: '#FFFFFF',
            textDecoration: 'none', fontSize: '18px', lineHeight: 1,
          }}
        >{"\u2190"}</Link>
        <div style={{ flex: 1 }}>
          <h1 style={{
            fontSize: '22px', fontWeight: '600', margin: 0,
            fontFamily: 'var(--heading-font, "Cormorant Garamond", serif)',
            letterSpacing: '0.5px',
          }}>
            Tour d&apos;Elegance
          </h1>
          <div style={{ fontSize: '11px', opacity: 0.7, marginTop: '1px' }}>
            Saturday, April 25, 2026 {"\u00B7"} 4 Stages
          </div>
        </div>
      </div>

      {/* Map */}
      <div style={{ height: '45vh', minHeight: '250px', overflow: 'hidden' }}>
        <MapComponent />
      </div>

      {/* Directions */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
        <DirectionsPanel />
      </div>

      {/* Safety footer */}
      <div style={{
        padding: '8px 16px', backgroundColor: '#FAF8F4',
        borderTop: '1px solid #E0DDD4',
        fontSize: '11px', fontStyle: 'italic', color: '#888',
        fontFamily: 'var(--body-font, "Inter", sans-serif)',
        textAlign: 'center',
      }}>
        Please maintain safe following distances and obey all traffic laws.
      </div>

      <BottomNav active="navigate" />
    </div>
  );
}
