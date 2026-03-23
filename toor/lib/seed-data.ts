/**
 * TOOR — Seed Data
 * All seed data for the La Jolla Concours d'Elegance 2026 deployment.
 * This file is the single source of truth for initial data — used by both
 * localStorage (prototype) and Neon database seeding (production).
 */

export const SEED_BRAND_CONFIG = {
  tenant_id: "lajolla-2026",
  event_name: "La Jolla Concours d'Elegance",
  tagline: "Icons of Speed — April 24–26, 2026",
  primary_color: "#1B2A4A",
  accent_color: "#C9A84C",
  background_color: "#FAF8F4",
  text_color: "#2C2C2C",
  heading_font: "Cormorant Garamond",
  body_font: "Inter",
  logo_url: "",
  anniversary_note: "Celebrating 20 Years",
};

export const SEED_EVENTS = [
  {
    event_id: "lajolla-2026-fri",
    tenant_id: "lajolla-2026",
    title: "Motorvault VIP Opening Soirée",
    day: "Friday",
    date: "April 24, 2026",
    time: "6PM–10PM",
    location: "Ellen Browning Scripps Park",
    description: "Hosted bar, live entertainment, rare vintage automobiles, and auction. An evening celebrating Masterpieces of Motion, Mystique, and Mastery.",
  },
  {
    event_id: "lajolla-2026-sat-am",
    tenant_id: "lajolla-2026",
    title: "Tour d'Elegance",
    day: "Saturday",
    date: "April 25, 2026",
    time: "7AM–2PM",
    location: "Departs Prospect Street",
    description: "Private collection visits, a scenic San Diego coastal drive, and a private luncheon in Rancho Santa Fe.",
  },
  {
    event_id: "lajolla-2026-sat-pm",
    tenant_id: "lajolla-2026",
    title: "Porsches & Power on Prospect",
    day: "Saturday",
    date: "April 25, 2026",
    time: "5PM–9PM",
    location: "Prospect Street",
    description: "Open-air Porsche showcase along Prospect Street with live music, gallery receptions, and fine dining.",
  },
  {
    event_id: "lajolla-2026-sun",
    tenant_id: "lajolla-2026",
    title: "The Concours d'Elegance",
    day: "Sunday",
    date: "April 26, 2026",
    time: "9AM–4PM",
    location: "Ellen Browning Scripps Park",
    description: "Over 200 collector automobiles across 16 classes on the bluffs above La Jolla Cove. Chief Judge: Nigel Matthews. Emcee: Justin Bell.",
  },
];

export const SEED_TOUR_WAYPOINTS = [
  { stop: 1, name: "Start", location: "Prospect Street, La Jolla", time: "7:00 AM", description: "Entrant staging and departure" },
  { stop: 2, name: "Collection Visit", location: "Private garage, Rancho Santa Fe", time: "8:30 AM", description: "Exclusive access to a significant private collection" },
  { stop: 3, name: "Scenic Stop", location: "Torrey Pines Gliderport", time: "9:45 AM", description: "Clifftop photo opportunity, Pacific Ocean views" },
  { stop: 4, name: "Drive", location: "Coast Highway through Del Mar", time: "10:30 AM", description: "Coastal boulevard, open windows, classic California" },
  { stop: 5, name: "Rest Stop", location: "San Dieguito Heritage Museum, Encinitas", time: "11:15 AM", description: "Light refreshments, car display on lawn" },
  { stop: 6, name: "Luncheon", location: "Private Estate, Rancho Santa Fe", time: "12:30 PM", description: "Sit-down lunch, awards, fellowship" },
];

export const SEED_CLASSES = [
  "Icons of Speed (1935–1996)", "Pre-War American (1925–1939)", "Pre-War European (1925–1939)",
  "European with American Heart (1950–1969)", "European Sports Cars (1960–1980)", "American Muscle (1960–1972)",
  "Italian Exotica (1955–1975)", "British Sports Cars (1950–1975)", "German Precision (1950–1980)",
  "Japanese Classics (1965–1985)", "Porsche (all years)", "Ferrari (all years)",
  "American Luxury (1950–1970)", "Coachbuilt Customs (all years)", "Open Class (all years)",
  "Tour d'Elegance Participants",
];

export const SEED_ENTRANTS = [
  { user_id: "ent-001", name: "William Harrington III", hometown: "Greenwich, CT", years_collecting: 32, bio: "Third-generation collector who inherited his love of pre-war automobiles from his grandfather, a Packard dealer in New England. His Duesenberg has been in the family since 1978.", car: { year: 1934, make: "Duesenberg", model: "Model J Dual-Cowl Phaeton", color: "Burgundy over Cream" }, entry_class: "Pre-War American (1925–1939)", entry_number: 101, status: "Confirmed" },
  { user_id: "ent-002", name: "Maria Elena Vasquez", hometown: "Scottsdale, AZ", years_collecting: 18, bio: "Former aerospace engineer turned full-time restorer. She spent four years bringing her Miura back from a barn find in Umbria to concours condition — doing much of the metal work herself.", car: { year: 1967, make: "Lamborghini", model: "Miura P400", color: "Arancio Miura" }, entry_class: "Italian Exotica (1955–1975)", entry_number: 204, status: "Confirmed" },
  { user_id: "ent-003", name: "Richard Tanaka", hometown: "Carmel, CA", years_collecting: 25, bio: "Silicon Valley veteran who has shown at Pebble Beach three times. His 300SL Gullwing is one of fewer than 1,400 produced and retains its matching-numbers engine.", car: { year: 1955, make: "Mercedes-Benz", model: "300SL Gullwing", color: "Silver Metallic" }, entry_class: "German Precision (1950–1980)", entry_number: 155, status: "Confirmed" },
  { user_id: "ent-004", name: "Catherine Beaumont", hometown: "Newport Beach, CA", years_collecting: 12, bio: "Catherine fell in love with Porsches at age sixteen watching her father race a 914 at Laguna Seca. Her 1973 RS is lightweight spec, one of 200 built for homologation.", car: { year: 1973, make: "Porsche", model: "911 Carrera RS 2.7", color: "Grand Prix White with Green Script" }, entry_class: "Porsche (all years)", entry_number: 311, status: "Confirmed" },
  { user_id: "ent-005", name: "James \"Big Jim\" Maddox", hometown: "Austin, TX", years_collecting: 20, bio: "Cattle rancher and lifelong Mopar enthusiast. His Hemi 'Cuda is a documented 1-of-14 in Plum Crazy with the 426 Hemi and four-speed. He drives it to every show — no trailers.", car: { year: 1971, make: "Plymouth", model: "Hemi 'Cuda Convertible", color: "Plum Crazy Purple" }, entry_class: "American Muscle (1960–1972)", entry_number: 442, status: "Confirmed" },
  { user_id: "ent-006", name: "Evelyn St. Claire", hometown: "Palm Beach, FL", years_collecting: 40, bio: "One of the most respected female collectors in America. Evelyn's Talbot-Lago was discovered in a French château in 1987 and has won Best of Show at three international concours.", car: { year: 1938, make: "Talbot-Lago", model: "T150 C SS Teardrop Coupé", color: "French Racing Blue" }, entry_class: "Pre-War European (1925–1939)", entry_number: 103, status: "Confirmed" },
  { user_id: "ent-007", name: "David Okonkwo", hometown: "Atlanta, GA", years_collecting: 8, bio: "Orthopedic surgeon and first-time concours entrant. David became obsessed with the E-Type after reading Philip Porter's book during residency. His Series I is a numbers-matching roadster.", car: { year: 1965, make: "Jaguar", model: "E-Type Series I Roadster", color: "Opalescent Silver Blue" }, entry_class: "British Sports Cars (1950–1975)", entry_number: 178, status: "Pending" },
  { user_id: "ent-008", name: "Thomas Chen", hometown: "San Francisco, CA", years_collecting: 15, bio: "Tom's 250 GT Lusso is considered one of the finest examples extant. A software founder, he approaches restoration with the same precision he brought to building his company — no shortcuts.", car: { year: 1963, make: "Ferrari", model: "250 GT Lusso", color: "Rosso Corsa" }, entry_class: "Ferrari (all years)", entry_number: 250, status: "Confirmed" },
  { user_id: "ent-009", name: "Patricia Holloway", hometown: "Bozeman, MT", years_collecting: 22, bio: "Ranch owner and long-distance rally veteran. Pat has driven her Facel Vega from Montana to Monterey four times. She believes cars were meant to be driven, not displayed — but makes an exception for La Jolla.", car: { year: 1961, make: "Facel Vega", model: "HK500", color: "Metallic Midnight Blue" }, entry_class: "European with American Heart (1950–1969)", entry_number: 167, status: "Confirmed" },
  { user_id: "ent-010", name: "Marcus Webb", hometown: "Detroit, MI", years_collecting: 28, bio: "Retired GM designer who spent 30 years in the styling studio. His 1967 Eldorado is a personal homage to the era he helped define — he knew the men who drew those lines.", car: { year: 1967, make: "Cadillac", model: "Eldorado Coupé", color: "Sable Black" }, entry_class: "American Luxury (1950–1970)", entry_number: 188, status: "Confirmed" },
  { user_id: "ent-011", name: "Kenji Yamamoto", hometown: "Portland, OR", years_collecting: 10, bio: "Kenji imported his Cosmo Sport from a retired dentist in Hiroshima. It's one of perhaps 50 survivors worldwide and the only one currently registered in Oregon. He rebuilt the rotary engine on his kitchen table.", car: { year: 1968, make: "Mazda", model: "Cosmo Sport 110S", color: "Marathon White" }, entry_class: "Japanese Classics (1965–1985)", entry_number: 210, status: "Pending" },
  { user_id: "ent-012", name: "Robert Fitzgerald", hometown: "Chicago, IL", years_collecting: 35, bio: "Bobby Fitz, as he's known at every major concours, has been showing his Ford GT40 since he acquired it from a Le Mans privateer team in 1989. It's a genuine race chassis, not a street car — and he has the logbook to prove it.", car: { year: 1966, make: "Ford", model: "GT40 Mk I", color: "Gulf Blue with Marigold Stripe" }, entry_class: "Icons of Speed (1935–1996)", entry_number: 1, status: "Confirmed" },
];
