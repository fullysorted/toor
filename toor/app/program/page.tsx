"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getBrandConfig, applyBrandConfig, getSponsors, getProgramPages } from "@/lib/store";

// ─── Program Content ─────────────────────────────────────────────────────────

const PROGRAM_CONTENT = {
  welcome:
    "On behalf of our organizing committee, volunteers, judges, and sponsors, welcome to the twentieth La Jolla Concours d'Elegance. For two decades, this event has brought together the finest collector automobiles and the most passionate enthusiasts in the world against the incomparable backdrop of La Jolla Cove. Whether you are a first-time attendee or have stood on this field every year since our founding, we are honored to share this weekend with you.",

  themeTitle: "Icons of Speed",
  themeBody1:
    "The 2026 theme, Icons of Speed, celebrates the automobiles that defined the boundaries of velocity, engineering, and human courage across six decades of motorsport and road car innovation. From the supercharged pre-war Grand Prix machines that thundered through European villages to the mid-engine prototypes that rewrote the physics of cornering at Le Mans, these are the cars that changed what we believed was possible.",
  themeBody2:
    "Our featured class spans 1935 to 1996 — from the era of riding mechanics and leather helmets to the dawn of carbon fiber and active aerodynamics. Each car on display this weekend carries a story of ambition, ingenuity, and the relentless pursuit of speed. We invite you to look beyond the coachwork and consider the men and women who designed, built, and drove these machines at the very edge of their ability.",

  classes: [
    {
      name: "Icons of Speed",
      years: "1935–1996",
      desc: "The featured class of 2026, celebrating six decades of the world's fastest and most significant competition and road cars. From pre-war Auto Union racers to the McLaren F1, these are the machines that defined the outer limits of automotive performance and forever changed the relationship between driver and machine.",
    },
    {
      name: "Pre-War American",
      years: "1925–1939",
      desc: "The golden age of American coachbuilding, when Duesenberg, Packard, Pierce-Arrow, and Cadillac produced automobiles of extraordinary power and refinement. These cars were built for a clientele that demanded both mechanical excellence and bespoke elegance in equal measure.",
    },
    {
      name: "Pre-War European",
      years: "1925–1939",
      desc: "The grand tourers and racing machines of interwar Europe — Bugatti, Bentley, Alfa Romeo, and Talbot-Lago among them. Born in an era of aristocratic patronage and Continental grand prix circuits, these automobiles represent the highest expression of European automotive artistry before the Second World War.",
    },
    {
      name: "European with American Heart",
      years: "1950–1969",
      desc: "A celebration of the transatlantic hybrids that married European chassis design with American V8 power. Facel Vega, Jensen, Bristol, Iso Grifo, and the AC Cobra proved that the best of both worlds could coexist in a single magnificent automobile.",
    },
    {
      name: "European Sports Cars",
      years: "1960–1980",
      desc: "The sports cars that defined a generation of enthusiast driving — from the Alpine-Renault A110 to the Lotus Europa, the Lancia Fulvia to the Matra Djet. Lightweight, purposeful, and engineered for the joy of the road rather than the showroom.",
    },
    {
      name: "American Muscle",
      years: "1960–1972",
      desc: "The thundering heart of American automotive culture. Hemi Cudas, Boss Mustangs, LS6 Chevelles, and GTO Judges — these cars were born on the drag strips of Detroit and Woodward Avenue and remain the most visceral expression of straight-line speed ever produced in volume.",
    },
    {
      name: "Italian Exotica",
      years: "1955–1975",
      desc: "The dream cars of Modena, Maranello, and Sant'Agata Bolognese. Ferrari, Lamborghini, Maserati, and De Tomaso created automobiles that transcended transportation entirely — they were rolling sculptures powered by engines that sang like orchestras and broke hearts with their beauty.",
    },
    {
      name: "British Sports Cars",
      years: "1950–1975",
      desc: "From the MG T-series to the Jaguar E-Type, British sports cars democratized the joy of open-air motoring. Wire wheels, leather-rimmed steering wheels, and the smell of Castrol R defined an era when the journey mattered infinitely more than the destination.",
    },
    {
      name: "German Precision",
      years: "1950–1980",
      desc: "The engineering philosophy of Stuttgart, Munich, and Zuffenhausen made manifest in steel and aluminum. Mercedes-Benz Gullwings, BMW 507s, and Porsche 356s embody the German ideal of mechanical perfection — every component precisely calculated, beautifully executed, and built to endure.",
    },
    {
      name: "Japanese Classics",
      years: "1965–1985",
      desc: "The cars that proved Japan could match and surpass European performance standards. The Toyota 2000GT, Datsun 240Z, Mazda Cosmo, and Honda S800 announced Japan's arrival on the world stage and established a tradition of reliability, innovation, and engineering courage.",
    },
    {
      name: "Porsche",
      years: "all years",
      desc: "An entire marque deserving of its own class. From the first 356 to leave Gmünd to the latest GT3 RS, Porsche has maintained an unbroken lineage of rear-engine, air-cooled (and now water-cooled) excellence that no other manufacturer can claim. Every Porsche tells a story of evolution, not revolution.",
    },
    {
      name: "Ferrari",
      years: "all years",
      desc: "The prancing horse needs no introduction, but each Ferrari deserves one. From Enzo Ferrari's first road car, the 1947 125 S, through the great V12 berlinettas of the 1960s to the modern hybrid hypercar era, Ferrari represents the pinnacle of Italian automotive passion, competition heritage, and design.",
    },
    {
      name: "American Luxury",
      years: "1950–1970",
      desc: "The era when Cadillac, Lincoln, Imperial, and Packard defined what luxury meant to the world. Soaring tailfins, pillarless hardtops, and interiors the size of living rooms — these automobiles were rolling declarations of American optimism, prosperity, and unapologetic grandeur.",
    },
    {
      name: "Coachbuilt Customs",
      years: "all years",
      desc: "Automobiles that began as a chassis and an engine and became something singular through the hands of master coachbuilders. Pininfarina, Zagato, Bertone, Figoni et Falaschi, and their American counterparts created one-of-one masterpieces that exist at the intersection of engineering and fine art.",
    },
    {
      name: "Open Class",
      years: "all years",
      desc: "For the exceptional automobiles that transcend categorization. The Open Class welcomes any collector car of distinction that does not fit neatly into our defined classes but merits display alongside the finest examples of automotive history.",
    },
    {
      name: "Tour d'Elegance Participants",
      years: "",
      desc: "The automobiles that will traverse San Diego County on Saturday's Tour d'Elegance, from La Jolla through Del Mar to Rancho Santa Fe. These cars are not just shown — they are driven, as their makers intended.",
    },
  ],

  weekendEvents: [
    {
      day: "Friday, April 24",
      title: "Motorvault VIP Opening Soirée",
      time: "6:00 PM – 10:00 PM",
      loc: "Ellen Browning Scripps Park",
      desc: "Hosted bar, live entertainment, rare vintage automobiles, and auction. An evening celebrating Masterpieces of Motion, Mystique, and Mastery.",
    },
    {
      day: "Saturday, April 25",
      title: "Tour d'Elegance",
      time: "7:00 AM – 2:00 PM",
      loc: "Departs Prospect Street",
      desc: "A scenic drive through San Diego's most beautiful coastal and inland routes, with private collection visits and a luncheon in Rancho Santa Fe.",
    },
    {
      day: "Saturday, April 25",
      title: "Porsches & Power on Prospect",
      time: "5:00 PM – 9:00 PM",
      loc: "Prospect Street",
      desc: "Open-air Porsche showcase with live music, gallery receptions, and dining along La Jolla's most celebrated boulevard.",
    },
    {
      day: "Sunday, April 26",
      title: "The Concours d'Elegance",
      time: "9:00 AM – 4:00 PM",
      loc: "Ellen Browning Scripps Park",
      desc: "Over 200 collector automobiles across 16 classes judged on the bluffs above La Jolla Cove. Chief Judge: Nigel Matthews. Emcee: Justin Bell.",
    },
  ],

  judgingCriteria: [
    {
      name: "Elegance",
      desc: "The overall aesthetic impression of the automobile — its lines, proportions, color harmony, and the intangible quality of visual rightness that distinguishes a beautiful car from a merely well-made one. Elegance is not extravagance; it is the art of achieving maximum effect with minimum ostentation.",
    },
    {
      name: "Technical Merit",
      desc: "The mechanical condition, authenticity of components, quality of restoration or preservation, and correctness of specification. Judges evaluate whether the automobile faithfully represents its original manufacture or a documented period modification, with particular attention to engine, chassis, and running gear.",
    },
    {
      name: "Historical Significance",
      desc: "The provenance, competition record, ownership history, and cultural importance of the automobile. A car that competed at Le Mans, was owned by a notable figure, or represents a pivotal moment in automotive history carries weight that no restoration can replicate.",
    },
  ],

  chiefJudge: {
    name: "Nigel Matthews",
    initials: "NM",
    bio: "Nigel Matthews brings four decades of international concours judging experience to the 2026 La Jolla Concours d'Elegance. A former chief judge at the Concours of Elegance at Hampton Court Palace and senior judge at Pebble Beach, Villa d'Este, and Chantilly Arts et Elegance, Matthews is recognized as one of the foremost authorities on pre-war European coachwork and competition car authenticity. A Fellow of the Royal Automobile Club and author of two definitive reference works on Bugatti coachbuilding, he approaches every automobile with the same exacting standard: fidelity to the original vision of its creators.",
  },

  emcee: {
    name: "Justin Bell",
    initials: "JB",
    bio: "Justin Bell needs no introduction to motorsport enthusiasts. The son of five-time Le Mans winner Derek Bell, Justin forged his own distinguished racing career with victories at the 24 Hours of Daytona and class wins at Le Mans driving for Porsche and McLaren. Since retiring from competition, Bell has become one of the most respected voices in automotive media — a longtime presenter for Petrolicious, Spike Feresten's hosting partner on Spike's Car Radio, and a commentator whose deep technical knowledge is matched only by his genuine warmth and wit. His ability to engage with collectors, enthusiasts, and casual spectators alike makes him the ideal voice for a weekend dedicated to the art and soul of the automobile.",
  },
};

// ─── Section Divider Component ───────────────────────────────────────────────

function SectionDivider() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 0",
      }}
    >
      <div
        style={{
          flex: 1,
          height: 1,
          backgroundColor: "var(--accent)",
          opacity: 0.2,
        }}
      />
      <div
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          border: "1px solid var(--accent)",
          opacity: 0.3,
          margin: "0 16px",
        }}
      />
      <div
        style={{
          flex: 1,
          height: 1,
          backgroundColor: "var(--accent)",
          opacity: 0.2,
        }}
      />
    </div>
  );
}

// ─── Page Component ──────────────────────────────────────────────────────────

export default function ProgramPage() {
  const router = useRouter();
  const [brandConfig, setBrandConfig] = useState<any>(null);
  const [sponsors, setSponsors] = useState<any[]>([]);
  const [customPages, setCustomPages] = useState<any[]>([]);

  useEffect(() => {
    // Load and apply brand config
    const config = getBrandConfig();
    applyBrandConfig(config);
    setBrandConfig(config);

    // Load admin-managed data
    setSponsors(getSponsors());
    setCustomPages(getProgramPages());
  }, []);

  if (!brandConfig) return null;

  const sectionHeadingStyle: React.CSSProperties = {
    fontFamily: "var(--heading-font)",
    fontSize: 28,
    fontWeight: 400,
    color: "var(--primary)",
    margin: 0,
    lineHeight: 1.2,
  };

  const bodyStyle: React.CSSProperties = {
    fontFamily: "var(--body-font)",
    fontSize: 15,
    color: "var(--text)",
    lineHeight: 1.75,
    opacity: 0.75,
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
          onClick={() => router.push("/home")}
          style={{
            backgroundColor: "transparent",
            border: "none",
            cursor: "pointer",
            padding: 4,
            display: "flex",
            alignItems: "center",
          }}
          aria-label="Back to home"
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
          Official Program
        </div>
      </div>

      {/* Program Cover */}
      <div
        style={{
          backgroundColor: "var(--primary)",
          padding: "48px 32px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.04,
            backgroundImage: `repeating-linear-gradient(-35deg, transparent, transparent 40px, var(--accent) 40px, var(--accent) 41px)`,
          }}
        />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div
            style={{
              display: "inline-block",
              padding: "5px 16px",
              border: "1px solid var(--accent)",
              borderRadius: 100,
              fontSize: 10,
              fontWeight: 500,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "var(--accent)",
              marginBottom: 24,
            }}
          >
            {brandConfig.anniversary_note}
          </div>
          <h1
            style={{
              fontFamily: "var(--heading-font)",
              fontSize: "clamp(32px, 7vw, 48px)",
              fontWeight: 400,
              color: "var(--bg)",
              margin: 0,
              lineHeight: 1.1,
            }}
          >
            La Jolla
            <br />
            <span style={{ fontStyle: "italic", fontWeight: 300 }}>
              Concours d'Elegance
            </span>
          </h1>
          <div
            style={{
              width: 48,
              height: 1,
              backgroundColor: "var(--accent)",
              margin: "20px auto",
              opacity: 0.5,
            }}
          />
          <p
            style={{
              fontFamily: "var(--body-font)",
              fontSize: 14,
              letterSpacing: "0.08em",
              color: "var(--bg)",
              opacity: 0.6,
            }}
          >
            April 24–26, 2026 · La Jolla, California
          </p>
          <p
            style={{
              fontFamily: "var(--heading-font)",
              fontSize: 18,
              fontStyle: "italic",
              color: "var(--accent)",
              marginTop: 12,
              opacity: 0.8,
            }}
          >
            Icons of Speed
          </p>
        </div>
      </div>

      {/* Program Body */}
      <div style={{ padding: "0 28px", maxWidth: 640, margin: "0 auto" }}>
        {/* Welcome */}
        <SectionDivider />
        <h2 style={sectionHeadingStyle}>Welcome</h2>
        <p style={{ ...bodyStyle, marginTop: 16 }}>
          {PROGRAM_CONTENT.welcome}
        </p>

        {/* Theme */}
        <SectionDivider />
        <h2 style={sectionHeadingStyle}>
          <span style={{ fontStyle: "italic" }}>
            {PROGRAM_CONTENT.themeTitle}
          </span>
          <br />
          <span style={{ fontSize: 16, opacity: 0.5, fontWeight: 400 }}>
            The 2026 Featured Theme
          </span>
        </h2>
        <p style={{ ...bodyStyle, marginTop: 16 }}>
          {PROGRAM_CONTENT.themeBody1}
        </p>
        <p style={{ ...bodyStyle, marginTop: 14 }}>
          {PROGRAM_CONTENT.themeBody2}
        </p>

        {/* Weekend at a Glance */}
        <SectionDivider />
        <h2 style={sectionHeadingStyle}>The Weekend at a Glance</h2>
        <div style={{ marginTop: 20 }}>
          {PROGRAM_CONTENT.weekendEvents.map((evt, i) => (
            <div
              key={i}
              style={{
                padding: "18px 0",
                borderBottom:
                  i < PROGRAM_CONTENT.weekendEvents.length - 1
                    ? "1px solid rgba(27, 42, 74, 0.06)"
                    : "none",
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  color: "var(--accent)",
                  marginBottom: 4,
                }}
              >
                {evt.day}
              </div>
              <h3
                style={{
                  fontFamily: "var(--heading-font)",
                  fontSize: 20,
                  fontWeight: 500,
                  color: "var(--primary)",
                  margin: "0 0 4px",
                }}
              >
                {evt.title}
              </h3>
              <div
                style={{
                  fontSize: 13,
                  color: "var(--text)",
                  opacity: 0.45,
                  marginBottom: 6,
                }}
              >
                {evt.time} · {evt.loc}
              </div>
              <p
                style={{
                  fontSize: 14,
                  color: "var(--text)",
                  opacity: 0.6,
                  lineHeight: 1.55,
                  margin: 0,
                }}
              >
                {evt.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Class Listings */}
        <SectionDivider />
        <h2 style={sectionHeadingStyle}>Class Listings</h2>
        <div style={{ marginTop: 20 }}>
          {PROGRAM_CONTENT.classes.map((cls, i) => (
            <div
              key={i}
              style={{
                padding: "18px 0",
                borderBottom:
                  i < PROGRAM_CONTENT.classes.length - 1
                    ? "1px solid rgba(27, 42, 74, 0.06)"
                    : "none",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                }}
              >
                <h3
                  style={{
                    fontFamily: "var(--heading-font)",
                    fontSize: 19,
                    fontWeight: 500,
                    color: "var(--primary)",
                    margin: 0,
                  }}
                >
                  {cls.name}
                </h3>
                {cls.years && (
                  <span
                    style={{
                      fontSize: 11,
                      color: "var(--accent)",
                      fontWeight: 500,
                      whiteSpace: "nowrap",
                      marginLeft: 12,
                    }}
                  >
                    {cls.years}
                  </span>
                )}
              </div>
              <p
                style={{
                  fontSize: 14,
                  color: "var(--text)",
                  opacity: 0.6,
                  lineHeight: 1.6,
                  margin: "8px 0 0",
                }}
              >
                {cls.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Judging Criteria */}
        <SectionDivider />
        <h2 style={sectionHeadingStyle}>Judging Criteria</h2>
        <div style={{ marginTop: 20 }}>
          {PROGRAM_CONTENT.judgingCriteria.map((crit, i) => (
            <div
              key={i}
              style={{
                padding: "16px 0",
                borderBottom:
                  i < PROGRAM_CONTENT.judgingCriteria.length - 1
                    ? "1px solid rgba(27, 42, 74, 0.06)"
                    : "none",
              }}
            >
              <h3
                style={{
                  fontFamily: "var(--heading-font)",
                  fontSize: 20,
                  fontWeight: 500,
                  fontStyle: "italic",
                  color: "var(--primary)",
                  margin: 0,
                }}
              >
                {crit.name}
              </h3>
              <p
                style={{
                  fontSize: 14,
                  color: "var(--text)",
                  opacity: 0.6,
                  lineHeight: 1.6,
                  margin: "8px 0 0",
                }}
              >
                {crit.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Chief Judge */}
        <SectionDivider />
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              backgroundColor: "var(--primary)",
              margin: "0 auto 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 26,
              fontFamily: "var(--heading-font)",
              color: "var(--accent)",
            }}
          >
            {PROGRAM_CONTENT.chiefJudge.initials}
          </div>
          <div
            style={{
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--accent)",
              marginBottom: 4,
            }}
          >
            Chief Judge
          </div>
          <h2 style={{ ...sectionHeadingStyle, fontSize: 26 }}>
            {PROGRAM_CONTENT.chiefJudge.name}
          </h2>
        </div>
        <p style={bodyStyle}>{PROGRAM_CONTENT.chiefJudge.bio}</p>

        {/* Emcee */}
        <SectionDivider />
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              backgroundColor: "var(--primary)",
              margin: "0 auto 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 26,
              fontFamily: "var(--heading-font)",
              color: "var(--accent)",
            }}
          >
            {PROGRAM_CONTENT.emcee.initials}
          </div>
          <div
            style={{
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--accent)",
              marginBottom: 4,
            }}
          >
            Emcee
          </div>
          <h2 style={{ ...sectionHeadingStyle, fontSize: 26 }}>
            {PROGRAM_CONTENT.emcee.name}
          </h2>
        </div>
        <p style={bodyStyle}>{PROGRAM_CONTENT.emcee.bio}</p>

        {/* Sponsors */}
        <SectionDivider />
        <h2 style={{ ...sectionHeadingStyle, textAlign: "center" }}>
          Our Sponsors
        </h2>
        <p style={{ ...bodyStyle, textAlign: "center", marginTop: 12 }}>
          The La Jolla Concours d'Elegance is made possible by the generous
          support of our sponsors and partners.
        </p>
        <div
          style={{
            marginTop: 24,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
          }}
        >
          {sponsors.length > 0
            ? sponsors.map((sponsor: any, i: number) => (
                <div
                  key={sponsor.id || i}
                  style={{
                    padding: "24px 16px",
                    border: "1px solid rgba(27, 42, 74, 0.08)",
                    borderRadius: 8,
                    textAlign: "center",
                  }}
                >
                  {sponsor.photo ? (
                    <img
                      src={sponsor.photo}
                      alt={sponsor.name}
                      style={{
                        maxWidth: "100%",
                        maxHeight: 60,
                        objectFit: "contain",
                        marginBottom: 8,
                      }}
                    />
                  ) : null}
                  <div
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: "var(--accent)",
                      opacity: 0.6,
                    }}
                  >
                    {sponsor.tier || "Sponsor"}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: "var(--primary)",
                      fontWeight: 500,
                      marginTop: 4,
                    }}
                  >
                    {sponsor.name}
                  </div>
                </div>
              ))
            : [
                "Presenting Sponsor",
                "Platinum Sponsor",
                "Gold Sponsor",
                "Gold Sponsor",
                "Silver Sponsor",
                "Silver Sponsor",
              ].map((tier, i) => (
                <div
                  key={i}
                  style={{
                    padding: "24px 16px",
                    border: "1px dashed rgba(27, 42, 74, 0.1)",
                    borderRadius: 8,
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: "var(--accent)",
                      opacity: 0.6,
                    }}
                  >
                    {tier}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "var(--text)",
                      opacity: 0.25,
                      marginTop: 6,
                    }}
                  >
                    Logo Placeholder
                  </div>
                </div>
              ))}
        </div>

        {/* Admin-Managed Program Content */}
        {customPages.length > 0 && (
          <>
            <SectionDivider />
            <h2 style={sectionHeadingStyle}>Additional Information</h2>
            {customPages.map((page: any, i: number) => (
              <div key={page.id || i} style={{ marginTop: 20 }}>
                <h3
                  style={{
                    fontFamily: "var(--heading-font)",
                    fontSize: 22,
                    fontWeight: 500,
                    color: "var(--primary)",
                    margin: "0 0 12px",
                  }}
                >
                  {page.title}
                </h3>
                {page.photo && (
                  <img
                    src={page.photo}
                    alt={page.title}
                    style={{
                      width: "100%",
                      borderRadius: 8,
                      marginBottom: 14,
                    }}
                  />
                )}
                <p style={{ ...bodyStyle, whiteSpace: "pre-wrap" }}>
                  {page.content}
                </p>
              </div>
            ))}
          </>
        )}

        {/* Closing */}
        <SectionDivider />
        <div style={{ textAlign: "center", paddingBottom: 40 }}>
          <p
            style={{
              fontFamily: "var(--heading-font)",
              fontSize: 20,
              fontStyle: "italic",
              color: "var(--primary)",
              lineHeight: 1.4,
            }}
          >
            Thank you for joining us for twenty years of elegance on the bluffs
            above La Jolla Cove.
          </p>
          <div
            style={{
              width: 48,
              height: 1,
              backgroundColor: "var(--accent)",
              margin: "20px auto",
              opacity: 0.4,
            }}
          />
          <p
            style={{
              fontSize: 11,
              color: "var(--text)",
              opacity: 0.3,
              letterSpacing: "0.06em",
            }}
          >
            Powered by Toor · A Fully Sorted Company
          </p>
        </div>
      </div>

      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
        button:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
      `}</style>
    </div>
  );
}
