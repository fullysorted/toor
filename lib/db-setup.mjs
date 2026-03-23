/**
 * TOOR — Neon Database Setup Script
 *
 * Run: npm run db:setup
 *
 * Creates all tables and seeds the La Jolla 2026 data.
 * Requires DATABASE_URL in .env.local
 *
 * This is the production schema. The localStorage prototype mirrors this structure.
 */

import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";

config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL);

async function setup() {
  console.log("🔧 Creating Toor database schema...\n");

  // ── Tenants (brand config) ──
  await sql`
    CREATE TABLE IF NOT EXISTS tenants (
      tenant_id TEXT PRIMARY KEY,
      event_name TEXT NOT NULL,
      tagline TEXT,
      primary_color TEXT DEFAULT '#1B2A4A',
      accent_color TEXT DEFAULT '#C9A84C',
      background_color TEXT DEFAULT '#FAF8F4',
      text_color TEXT DEFAULT '#2C2C2C',
      heading_font TEXT DEFAULT 'Cormorant Garamond',
      body_font TEXT DEFAULT 'Inter',
      logo_url TEXT,
      anniversary_note TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  console.log("✅ tenants table");

  // ── Users (platform-level) ──
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      user_id TEXT PRIMARY KEY,
      name TEXT,
      email TEXT UNIQUE,
      hometown TEXT,
      years_collecting INT DEFAULT 0,
      bio TEXT,
      photo_url TEXT,
      auth_provider TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  console.log("✅ users table");

  // ── Events (tenant-scoped) ──
  await sql`
    CREATE TABLE IF NOT EXISTS events (
      event_id TEXT PRIMARY KEY,
      tenant_id TEXT REFERENCES tenants(tenant_id),
      title TEXT NOT NULL,
      day TEXT,
      date TEXT,
      time TEXT,
      location TEXT,
      description TEXT
    )
  `;
  console.log("✅ events table");

  // ── Classes (tenant-scoped) ──
  await sql`
    CREATE TABLE IF NOT EXISTS classes (
      id SERIAL PRIMARY KEY,
      tenant_id TEXT REFERENCES tenants(tenant_id),
      name TEXT NOT NULL
    )
  `;
  console.log("✅ classes table");

  // ── Entries (tenant+event scoped — links user to their car at an event) ──
  await sql`
    CREATE TABLE IF NOT EXISTS entries (
      id SERIAL PRIMARY KEY,
      user_id TEXT REFERENCES users(user_id),
      tenant_id TEXT REFERENCES tenants(tenant_id),
      event_id TEXT REFERENCES events(event_id),
      car_year INT,
      car_make TEXT,
      car_model TEXT,
      car_color TEXT,
      entry_class TEXT,
      entry_number INT,
      status TEXT DEFAULT 'Pending',
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  console.log("✅ entries table");

  // ── Tour Waypoints (tenant-scoped) ──
  await sql`
    CREATE TABLE IF NOT EXISTS tour_waypoints (
      id SERIAL PRIMARY KEY,
      tenant_id TEXT REFERENCES tenants(tenant_id),
      stop INT,
      name TEXT,
      location TEXT,
      time TEXT,
      description TEXT,
      sort_order INT
    )
  `;
  console.log("✅ tour_waypoints table");

  // ── Messages (tenant-scoped) ──
  await sql`
    CREATE TABLE IF NOT EXISTS messages (
      id SERIAL PRIMARY KEY,
      tenant_id TEXT REFERENCES tenants(tenant_id),
      from_user_id TEXT REFERENCES users(user_id),
      to_user_id TEXT REFERENCES users(user_id),
      text TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  console.log("✅ messages table");

  // ── Collection (platform-level — user's personal garage) ──
  await sql`
    CREATE TABLE IF NOT EXISTS collection (
      id SERIAL PRIMARY KEY,
      user_id TEXT REFERENCES users(user_id),
      car_year INT,
      car_make TEXT,
      car_model TEXT,
      car_color TEXT,
      notes TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  console.log("✅ collection table");

  // ── Seed La Jolla 2026 ──
  console.log("\n🌱 Seeding La Jolla 2026 data...\n");

  await sql`
    INSERT INTO tenants (tenant_id, event_name, tagline, primary_color, accent_color, background_color, text_color, heading_font, body_font, anniversary_note)
    VALUES ('lajolla-2026', 'La Jolla Concours d''Elegance', 'Icons of Speed — April 24–26, 2026', '#1B2A4A', '#C9A84C', '#FAF8F4', '#2C2C2C', 'Cormorant Garamond', 'Inter', 'Celebrating 20 Years')
    ON CONFLICT (tenant_id) DO NOTHING
  `;
  console.log("✅ Tenant seeded");

  // Seed events
  const events = [
    ["lajolla-2026-fri", "lajolla-2026", "Motorvault VIP Opening Soirée", "Friday", "April 24, 2026", "6PM–10PM", "Ellen Browning Scripps Park", "Hosted bar, live entertainment, rare vintage automobiles, and auction."],
    ["lajolla-2026-sat-am", "lajolla-2026", "Tour d'Elegance", "Saturday", "April 25, 2026", "7AM–2PM", "Departs Prospect Street", "Private collection visits, a scenic San Diego coastal drive, and a private luncheon."],
    ["lajolla-2026-sat-pm", "lajolla-2026", "Porsches & Power on Prospect", "Saturday", "April 25, 2026", "5PM–9PM", "Prospect Street", "Open-air Porsche showcase with live music, gallery receptions, and dining."],
    ["lajolla-2026-sun", "lajolla-2026", "The Concours d'Elegance", "Sunday", "April 26, 2026", "9AM–4PM", "Ellen Browning Scripps Park", "Over 200 collector automobiles across 16 classes."],
  ];
  for (const e of events) {
    await sql`INSERT INTO events (event_id, tenant_id, title, day, date, time, location, description) VALUES (${e[0]}, ${e[1]}, ${e[2]}, ${e[3]}, ${e[4]}, ${e[5]}, ${e[6]}, ${e[7]}) ON CONFLICT (event_id) DO NOTHING`;
  }
  console.log("✅ Events seeded");

  console.log("\n🎉 Database setup complete! Your Toor instance is ready.\n");
}

setup().catch(console.error);
