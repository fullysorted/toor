'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import BottomNav from '@/components/BottomNav';
import { getBrandConfig, applyBrandConfig } from '@/lib/store';

// Types
interface Waypoint {
  name: string;
  lat: number;
  lng: number;
  label: string;
}

interface Direction {
  stepNumber: number;
  text: string;
  mainAction: string;
  detail: string;
  isWaypoint: boolean;
  waypointName?: string;
  directionType: 'left' | 'right' | 'straight' | 'continue';
}

// Major stops for routing and markers
const MAJOR_STOPS: Waypoint[] = [
  {
    name: 'La Valencia Hotel',
    lat: 32.8495,
    lng: -117.2740,
    label: 'S',
  },
  {
    name: 'Moonlight Beach',
    lat: 33.0441,
    lng: -117.2957,
    label: '1',
  },
  {
    name: 'Harvest Ranch Market',
    lat: 33.0370,
    lng: -117.2715,
    label: '2',
  },
  {
    name: 'Private Estate',
    lat: 33.0130,
    lng: -117.1900,
    label: '3',
  },
  {
    name: 'RSF Karting Club',
    lat: 33.0190,
    lng: -117.1450,
    label: 'F',
  },
];

// All 27 turn-by-turn directions
const DIRECTIONS: Direction[] = [
  {
    stepNumber: 1,
    text: 'Depart La Valencia Hotel â Head south on Prospect St, then left on Prospect Place',
    mainAction: 'Depart La Valencia Hotel',
    detail: 'Head south on Prospect St, then left on Prospect Place',
    isWaypoint: false,
    directionType: 'straight',
  },
  {
    stepNumber: 2,
    text: 'Left on Torrey Pines Rd â Head north',
    mainAction: 'Left on Torrey Pines Rd',
    detail: 'Head north',
    isWaypoint: false,
    directionType: 'left',
  },
  {
    stepNumber: 3,
    text: 'Continue north â Torrey Pines Rd becomes N. Torrey Pines Rd, then South Camino del Mar / Hwy 101 â coastal route, no freeway',
    mainAction: 'Continue north',
    detail: 'Torrey Pines Rd becomes N. Torrey Pines Rd, then South Camino del Mar / Hwy 101 â coastal route, no freeway',
    isWaypoint: false,
    directionType: 'straight',
  },
  {
    stepNumber: 4,
    text: 'Left on D St â Into Encinitas',
    mainAction: 'Left on D St',
    detail: 'Into Encinitas',
    isWaypoint: false,
    directionType: 'left',
  },
  {
    stepNumber: 5,
    text: 'WAYPOINT 1 â Moonlight Beach, 351 C St, Encinitas â Right on 4th St',
    mainAction: 'WAYPOINT 1 â Moonlight Beach',
    detail: '351 C St, Encinitas â Right on 4th St',
    isWaypoint: true,
    waypointName: 'Moonlight Beach',
    directionType: 'right',
  },
  {
    stepNumber: 6,
    text: 'Left on C St â Continue south',
    mainAction: 'Left on C St',
    detail: 'Continue south',
    isWaypoint: false,
    directionType: 'left',
  },
  {
    stepNumber: 7,
    text: 'Left on 3rd St',
    mainAction: 'Left on 3rd St',
    detail: '',
    isWaypoint: false,
    directionType: 'left',
  },
  {
    stepNumber: 8,
    text: 'Right on B St â Becomes Encinitas Blvd',
    mainAction: 'Right on B St',
    detail: 'Becomes Encinitas Blvd',
    isWaypoint: false,
    directionType: 'right',
  },
  {
    stepNumber: 9,
    text: 'Continue on Encinitas Blvd â Becomes South Rancho Santa Fe Farms Rd',
    mainAction: 'Continue on Encinitas Blvd',
    detail: 'Becomes South Rancho Santa Fe Farms Rd',
    isWaypoint: false,
    directionType: 'straight',
  },
  {
    stepNumber: 10,
    text: 'WAYPOINT 2 â Harvest Ranch Market â Right',
    mainAction: 'WAYPOINT 2 â Harvest Ranch Market',
    detail: 'Right',
    isWaypoint: true,
    waypointName: 'Harvest Ranch Market',
    directionType: 'right',
  },
  {
    stepNumber: 11,
    text: 'Right on La Bajada â Into Rancho Santa Fe',
    mainAction: 'Right on La Bajada',
    detail: 'Into Rancho Santa Fe',
    isWaypoint: false,
    directionType: 'right',
  },
  {
    stepNumber: 12,
    text: 'Continue on Los Morros',
    mainAction: 'Continue on Los Morros',
    detail: '',
    isWaypoint: false,
    directionType: 'straight',
  },
  {
    stepNumber: 13,
    text: 'Continue on La Granada',
    mainAction: 'Continue on La Granada',
    detail: '',
    isWaypoint: false,
    directionType: 'straight',
  },
  {
    stepNumber: 14,
    text: 'Right on Paseo Delicias',
    mainAction: 'Right on Paseo Delicias',
    detail: '',
    isWaypoint: false,
    directionType: 'right',
  },
  {
    stepNumber: 15,
    text: 'Right on Ave De Acacias',
    mainAction: 'Right on Ave De Acacias',
    detail: '',
    isWaypoint: false,
    directionType: 'right',
  },
  {
    stepNumber: 16,
    text: 'Left on El Tordo',
    mainAction: 'Left on El Tordo',
    detail: '',
    isWaypoint: false,
    directionType: 'left',
  },
  {
    stepNumber: 17,
    text: 'Left on Linea Del Cielo',
    mainAction: 'Left on Linea Del Cielo',
    detail: '',
    isWaypoint: false,
    directionType: 'left',
  },
  {
    stepNumber: 18,
    text: 'Left on Paseo Delicias',
    mainAction: 'Left on Paseo Delicias',
    detail: '',
    isWaypoint: false,
    directionType: 'left',
  },
  {
    stepNumber: 19,
    text: 'Right on La Granada',
    mainAction: 'Right on La Granada',
    detail: '',
    isWaypoint: false,
    directionType: 'right',
  },
  {
    stepNumber: 20,
    text: 'Left on Via De La Valle',
    mainAction: 'Left on Via De La Valle',
    detail: '',
    isWaypoint: false,
    directionType: 'left',
  },
  {
    stepNumber: 21,
    text: 'Right on Las Colinas',
    mainAction: 'Right on Las Colinas',
    detail: '',
    isWaypoint: false,
    directionType: 'right',
  },
  {
    stepNumber: 22,
    text: 'WAYPOINT 3 â 16503 Los Barbos, Rancho Santa Fe â Right on Los Barbos',
    mainAction: 'WAYPOINT 3 â Private Estate',
    detail: '16503 Los Barbos, Rancho Santa Fe â Right on Los Barbos',
    isWaypoint: true,
    waypointName: 'Private Estate',
    directionType: 'right',
  },
  {
    stepNumber: 23,
    text: 'Depart north on Los Barbos â Left on Las Colinas, right on Via De La Valle',
    mainAction: 'Depart north on Los Barbos',
    detail: 'Left on Las Colinas, right on Via De La Valle',
    isWaypoint: false,
    directionType: 'straight',
  },
  {
    stepNumber: 24,
    text: 'Right on La Granada â Through RSF village core on Paseo Delicias',
    mainAction: 'Right on La Granada',
    detail: 'Through RSF village core on Paseo Delicias',
    isWaypoint: false,
    directionType: 'right',
  },
  {
    stepNumber: 25,
    text: 'Right on Paseo Delicias',
    mainAction: 'Right on Paseo Delicias',
    detail: '',
    isWaypoint: false,
    directionType: 'right',
  },
  {
    stepNumber: 26,
    text: 'North on El Camino Del Norte â Scenic rolling hills through the ranch',
    mainAction: 'North on El Camino Del Norte',
    detail: 'Scenic rolling hills through the ranch',
    isWaypoint: false,
    directionType: 'straight',
  },
  {
    stepNumber: 27,
    text: 'FINISH â RSF Karting Club, 18029 Pacifica Ranch Dr â Right on Pacifica Ranch Dr',
    mainAction: 'FINISH â RSF Karting Club',
    detail: '18029 Pacifica Ranch Dr â Right on Pacifica Ranch Dr',
    isWaypoint: true,
    waypointName: 'RSF Karting Club',
    directionType: 'right',
  },
];

// Direction icon component
function DirectionIcon({ type }: { type: 'left' | 'right' | 'straight' | 'continue' }) {
  const svgSize = 20;
  const strokeWidth = 2;

  if (type === 'left') {
    return (
      <svg
        width={svgSize}
        height={svgSize}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M19 12H5M12 19l-7-7 7-7" />
      </svg>
    );
  }

  if (type === 'right') {
    return (
      <svg
        width={svgSize}
        height={svgSize}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M5 12h14M12 5l7 7-7 7" />
      </svg>
    );
  }

  return (
    <svg
      width={svgSize}
      height={svgSize}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 5v14" />
    </svg>
  );
}

// Leaflet Map Component
function MapComponent() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const leaflet = useRef<any>(null);

  useEffect(() => {
    // Load Leaflet dynamically
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
      leaflet.current = L;

      if (!mapContainer.current) return;

      // Create map
      map.current = L.map(mapContainer.current).setView([33.015, -117.22], 11);

      // CartoDB Voyager tiles
      L.tileLayer('https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        maxZoom: 20,
      }).addTo(map.current);

      // Fetch route from OSRM
      fetchRoute(L);

      // Add markers for major stops
      addMarkers(L);

      // Add zoom controls
      map.current.zoomControl.setPosition('bottomright');
    };

    const fetchRoute = async (L: any) => {
      try {
        const coords = MAJOR_STOPS.map((stop) => `${stop.lng},${stop.lat}`).join(';');
        const response = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`
        );

        if (!response.ok) throw new Error('OSRM request failed');

        const data = await response.json();

        if (data.routes && data.routes[0]) {
          const route = data.routes[0];
          const coordinates = route.geometry.coordinates.map((coord: [number, number]) => [
            coord[1],
            coord[0],
          ]);

          // Draw navy backdrop polyline
          L.polyline(coordinates, {
            color: '#1B2A4A',
            weight: 6,
            opacity: 1,
            lineCap: 'round',
            lineJoin: 'round',
          }).addTo(map.current);

          // Draw gold route polyline on top
          L.polyline(coordinates, {
            color: '#C9A84C',
            weight: 4,
            opacity: 1,
            lineCap: 'round',
            lineJoin: 'round',
          }).addTo(map.current);

          // Fit bounds to route with padding
          const group = L.featureGroup([
            ...coordinates.map((coord: any) => L.marker(coord)),
          ]);
          map.current.fitBounds(group.getBounds().pad(0.1));
        }
      } catch (error) {
        console.error('Error fetching route from OSRM:', error);
        // Fallback: draw straight polyline between major stops
        const coordinates = MAJOR_STOPS.map((stop) => [stop.lat, stop.lng]);
        L.polyline(coordinates, {
          color: '#1B2A4A',
          weight: 6,
          opacity: 1,
        }).addTo(map.current);

        L.polyline(coordinates, {
          color: '#C9A84C',
          weight: 4,
          opacity: 1,
        }).addTo(map.current);

        const group = L.featureGroup(coordinates.map((coord: any) => L.marker(coord)));
        map.current.fitBounds(group.getBounds().pad(0.1));
      }
    };

    const addMarkers = (L: any) => {
      MAJOR_STOPS.forEach((stop, index) => {
        const html = `
          <div style="
            width: 40px;
            height: 40px;
            background-color: #1B2A4A;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #C9A84C;
            font-weight: bold;
            font-size: 16px;
            border: 2px solid #C9A84C;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            font-family: var(--body-font, 'Inter', sans-serif);
            animation: pulse 2s infinite;
          ">
            ${stop.label}
          </div>
        `;

        const marker = L.marker([stop.lat, stop.lng], {
          icon: L.divIcon({
            html: html,
            iconSize: [40, 40],
            iconAnchor: [20, 20],
            className: 'custom-marker',
          }),
        }).addTo(map.current);

        marker.bindPopup(`<strong>${stop.name}</strong>`);
      });
    };

    loadLeaflet();

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  return (
    <div
      ref={mapContainer}
      style={{
        width: '100%',
        height: '55vh',
        backgroundColor: '#FAF8F4',
        borderRadius: '0 0 12px 12px',
      }}
    />
  );
}

// Progress bar component
function ProgressBar({ activeIndex }: { activeIndex: number }) {
  const progressLabels = ['Start', 'WP1', 'WP2', 'WP3', 'Finish'];

  const handleDotClick = (index: number) => {
    const element = document.getElementById(`direction-${DIRECTIONS[index * 6].stepNumber}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  return (
    <div
      style={{
        padding: '16px',
        backgroundColor: '#FAF8F4',
        borderBottom: '1px solid #E0DDD4',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        justifyContent: 'space-between',
      }}
    >
      {progressLabels.map((label, index) => (
        <div key={index} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
          <button
            onClick={() => handleDotClick(index)}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              border: 'none',
              backgroundColor: index <= activeIndex ? '#C9A84C' : '#E0DDD4',
              color: index <= activeIndex ? '#1B2A4A' : '#999',
              fontSize: '11px',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontFamily: 'var(--body-font, "Inter", sans-serif)',
              transition: 'all 0.3s ease',
              boxShadow: index === activeIndex ? '0 0 8px rgba(201, 168, 76, 0.6)' : 'none',
            }}
          >
            {label}
          </button>
          {index < progressLabels.length - 1 && (
            <div
              style={{
                flex: 1,
                height: '2px',
                backgroundColor: index < activeIndex ? '#C9A84C' : '#E0DDD4',
                margin: '0 8px',
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// Directions list component
function DirectionsList() {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollContainer = useRef<HTMLDivElement>(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <ProgressBar activeIndex={activeIndex} />

      <div
        ref={scrollContainer}
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '12px',
          backgroundColor: '#FFFFFF',
        }}
        onScroll={() => {
          // Update active index based on scroll position
          if (scrollContainer.current) {
            const scrollTop = scrollContainer.current.scrollTop;
            const estimatedIndex = Math.floor(scrollTop / 80);
            setActiveIndex(Math.min(estimatedIndex, 4));
          }
        }}
      >
        {DIRECTIONS.map((direction, idx) => (
          <div
            key={direction.stepNumber}
            id={`direction-${direction.stepNumber}`}
            style={{
              marginBottom: '12px',
              borderRadius: '8px',
              overflow: 'hidden',
              backgroundColor: direction.isWaypoint ? '#FAF8F4' : 'transparent',
              border: direction.isWaypoint ? '2px solid #C9A84C' : 'none',
              padding: direction.isWaypoint ? '12px' : '0',
            }}
          >
            {direction.isWaypoint ? (
              // Waypoint card
              <div>
                <div
                  style={{
                    fontSize: '14px',
                    fontWeight: 'bold',
                    color: '#C9A84C',
                    fontFamily: 'var(--heading-font, "Cormorant Garamond", serif)',
                    marginBottom: '8px',
                  }}
                >
                  {direction.waypointName}
                </div>
                <div
                  style={{
                    fontSize: '12px',
                    color: '#2C2C2C',
                    fontFamily: 'var(--body-font, "Inter", sans-serif)',
                    lineHeight: '1.5',
                  }}
                >
                  <strong>{direction.mainAction}</strong>
                  {direction.detail && (
                    <>
                      <br />
                      {direction.detail}
                    </>
                  )}
                </div>
              </div>
            ) : (
              // Regular direction card
              <div
                style={{
                  display: 'flex',
                  gap: '12px',
                  padding: '8px 0',
                }}
              >
                <div
                  style={{
                    flexShrink: 0,
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: '#1B2A4A',
                    color: '#C9A84C',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    fontFamily: 'var(--body-font, "Inter", sans-serif)',
                  }}
                >
                  {direction.stepNumber}
                </div>

                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: '13px',
                      color: '#2C2C2C',
                      fontFamily: 'var(--body-font, "Inter", sans-serif)',
                      lineHeight: '1.6',
                    }}
                  >
                    <strong>{direction.mainAction}</strong>
                    {direction.detail && (
                      <>
                        <br />
                        <span style={{ fontWeight: 'normal' }}>{direction.detail}</span>
                      </>
                    )}
                  </div>
                </div>

                <div
                  style={{
                    flexShrink: 0,
                    color: '#1B2A4A',
                    display: 'flex',
                    alignItems: 'center',
                    paddingTop: '2px',
                  }}
                >
                  <DirectionIcon type={direction.directionType} />
                </div>
              </div>
            )}
          </div>
        ))}

        <div style={{ height: '24px' }} />
      </div>
    </div>
  );
}

// Main page component
export default function NavigatePage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const brand = getBrandConfig();
    applyBrandConfig(brand);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        backgroundColor: '#FAF8F4',
        fontFamily: 'var(--body-font, "Inter", sans-serif)',
      }}
    >
      {/* Top Bar */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          backgroundColor: '#1B2A4A',
          color: '#FFFFFF',
          padding: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        <Link
          href="/home"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            borderRadius: '6px',
            backgroundColor: 'rgba(255,255,255,0.1)',
            color: '#FFFFFF',
            textDecoration: 'none',
            cursor: 'pointer',
            transition: 'background-color 0.2s',
            fontSize: '18px',
            lineHeight: 1,
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as any).style.backgroundColor = 'rgba(255,255,255,0.2)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as any).style.backgroundColor = 'rgba(255,255,255,0.1)';
          }}
        >
          â
        </Link>

        <h1
          style={{
            fontSize: '24px',
            fontWeight: '600',
            margin: 0,
            flex: 1,
            fontFamily: 'var(--heading-font, "Cormorant Garamond", serif)',
            letterSpacing: '0.5px',
          }}
        >
          Tour d'Elegance
        </h1>
      </div>

      {/* Map */}
      <div style={{ height: '55vh', overflow: 'hidden', borderRadius: '0 0 12px 12px' }}>
        <MapComponent />
      </div>

      {/* Directions List */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <DirectionsList />
      </div>

      {/* Footer Note */}
      <div
        style={{
          padding: '12px 16px',
          backgroundColor: '#FAF8F4',
          borderTop: '1px solid #E0DDD4',
          fontSize: '12px',
          fontStyle: 'italic',
          color: '#666666',
          fontFamily: 'var(--body-font, "Inter", sans-serif)',
          textAlign: 'center',
        }}
      >
        Please maintain safe following distances and obey all traffic laws. Stay with the group
        and enjoy the drive.
      </div>

      {/* Bottom Nav */}
      <BottomNav active="navigate" />
    </div>
  );
}
