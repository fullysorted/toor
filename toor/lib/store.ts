/**
 * TOOR — Client-Side Data Store
 *
 * localStorage wrapper with tenant-scoped keys.
 * In production, replace these functions with Neon/Drizzle queries.
 * The API is the same — only the storage backend changes.
 */

import { SEED_BRAND_CONFIG, SEED_EVENTS, SEED_TOUR_WAYPOINTS, SEED_CLASSES, SEED_ENTRANTS } from "./seed-data";

// ─── Key Builder ─────────────────────────────────────────────────────────────

function key(tenantId: string, dataType: string) {
  return `toor_${tenantId}_${dataType}`;
}

// ─── Brand Config ────────────────────────────────────────────────────────────

export function getActiveTenantId(): string {
  if (typeof window === "undefined") return "lajolla-2026";
  return localStorage.getItem("toor_platform_active_tenant") || "lajolla-2026";
}

export function getBrandConfig() {
  const tenantId = getActiveTenantId();
  const raw = localStorage.getItem(key(tenantId, "brand_config"));
  if (raw) return JSON.parse(raw);
  return SEED_BRAND_CONFIG;
}

export function applyBrandConfig(config: typeof SEED_BRAND_CONFIG) {
  const root = document.documentElement;
  root.style.setProperty("--primary", config.primary_color);
  root.style.setProperty("--accent", config.accent_color);
  root.style.setProperty("--bg", config.background_color);
  root.style.setProperty("--text", config.text_color);
  root.style.setProperty("--heading-font", `'${config.heading_font}', serif`);
  root.style.setProperty("--body-font", `'${config.body_font}', sans-serif`);
}

// ─── Seed ────────────────────────────────────────────────────────────────────

export function seedIfNeeded() {
  const tenantId = SEED_BRAND_CONFIG.tenant_id;

  if (!localStorage.getItem(key(tenantId, "brand_config"))) {
    localStorage.setItem(key(tenantId, "brand_config"), JSON.stringify(SEED_BRAND_CONFIG));
  }
  if (!localStorage.getItem("toor_platform_tenants")) {
    localStorage.setItem("toor_platform_tenants", JSON.stringify([{ tenant_id: tenantId, active: true }]));
  }
  if (!localStorage.getItem("toor_platform_active_tenant")) {
    localStorage.setItem("toor_platform_active_tenant", tenantId);
  }
  if (!localStorage.getItem(key(tenantId, "events"))) {
    localStorage.setItem(key(tenantId, "events"), JSON.stringify(SEED_EVENTS));
  }
  if (!localStorage.getItem(key(tenantId, "tour_waypoints"))) {
    localStorage.setItem(key(tenantId, "tour_waypoints"), JSON.stringify(SEED_TOUR_WAYPOINTS));
  }
  if (!localStorage.getItem(key(tenantId, "classes"))) {
    localStorage.setItem(key(tenantId, "classes"), JSON.stringify(SEED_CLASSES));
  }
  if (!localStorage.getItem(key(tenantId, "entrants"))) {
    localStorage.setItem(key(tenantId, "entrants"), JSON.stringify(SEED_ENTRANTS));
  }
}

// ─── User ────────────────────────────────────────────────────────────────────

export function getCurrentUser() {
  const raw = localStorage.getItem("toor_platform_current_user");
  if (raw) return JSON.parse(raw);
  return null;
}

export function setCurrentUser(user: any) {
  localStorage.setItem("toor_platform_current_user", JSON.stringify(user));
  // Persist a backup so profile survives sign-out/sign-in cycles
  if (user && user.name) {
    localStorage.setItem("toor_platform_user_profile_backup", JSON.stringify(user));
  }
}

export function signOut() {
  // Remove the session but keep the profile backup for re-login
  localStorage.removeItem("toor_platform_current_user");
}

// ─── User Entry (tenant-scoped) ──────────────────────────────────────────────

export function getUserEntry(tenantIdOverride?: string) {
  const tenantId = tenantIdOverride || getActiveTenantId();
  const raw = localStorage.getItem(key(tenantId, "user_entry"));
  if (raw) return JSON.parse(raw);
  return null;
}

export function setUserEntry(entry: any) {
  const tenantId = getActiveTenantId();
  localStorage.setItem(key(tenantId, "user_entry"), JSON.stringify(entry));
}

// ─── Events ──────────────────────────────────────────────────────────────────

export function getEvents() {
  const tenantId = getActiveTenantId();
  const raw = localStorage.getItem(key(tenantId, "events"));
  if (raw) return JSON.parse(raw);
  return SEED_EVENTS;
}

// ─── Tour Waypoints ──────────────────────────────────────────────────────────

export function getWaypoints(tenantIdOverride?: string) {
  const tenantId = tenantIdOverride || getActiveTenantId();
  const raw = localStorage.getItem(key(tenantId, "tour_waypoints"));
  if (raw) return JSON.parse(raw);
  return SEED_TOUR_WAYPOINTS;
}

export function saveWaypoints(waypoints: any[]) {
  const tenantId = getActiveTenantId();
  localStorage.setItem(key(tenantId, "tour_waypoints"), JSON.stringify(waypoints));
}

// ─── Sponsors ────────────────────────────────────────────────────────────────

export function getSponsors() {
  const tenantId = getActiveTenantId();
  const raw = localStorage.getItem(key(tenantId, "sponsors"));
  if (raw) return JSON.parse(raw);
  return [];
}

export function saveSponsors(sponsors: any[]) {
  const tenantId = getActiveTenantId();
  localStorage.setItem(key(tenantId, "sponsors"), JSON.stringify(sponsors));
}

// ─── Program Pages ───────────────────────────────────────────────────────────

export function getProgramPages() {
  const tenantId = getActiveTenantId();
  const raw = localStorage.getItem(key(tenantId, "program_pages"));
  if (raw) return JSON.parse(raw);
  return [];
}

export function saveProgramPages(pages: any[]) {
  const tenantId = getActiveTenantId();
  localStorage.setItem(key(tenantId, "program_pages"), JSON.stringify(pages));
}

// ─── Brand Config (save) ─────────────────────────────────────────────────────

export function saveBrandConfig(config: any) {
  const tenantId = getActiveTenantId();
  localStorage.setItem(key(tenantId, "brand_config"), JSON.stringify(config));
  applyBrandConfig(config);
}

// ─── Classes ─────────────────────────────────────────────────────────────────

export function getClasses() {
  const tenantId = getActiveTenantId();
  const raw = localStorage.getItem(key(tenantId, "classes"));
  if (raw) return JSON.parse(raw);
  return SEED_CLASSES;
}

// ─── Entrants ────────────────────────────────────────────────────────────────

export function getEntrants(tenantIdOverride?: string) {
  const tenantId = tenantIdOverride || getActiveTenantId();
  const raw = localStorage.getItem(key(tenantId, "entrants"));
  if (raw) return JSON.parse(raw);
  return SEED_ENTRANTS;
}

export function saveEntrants(entrants: any[]) {
  const tenantId = getActiveTenantId();
  localStorage.setItem(key(tenantId, "entrants"), JSON.stringify(entrants));
}

// ─── Messages ────────────────────────────────────────────────────────────────

export function getMessages(tenantIdOrRecipientId: string, recipientId?: string) {
  const tenantId = recipientId ? tenantIdOrRecipientId : getActiveTenantId();
  const recipient = recipientId || tenantIdOrRecipientId;
  const k1 = key(tenantId, `messages_user-current_${recipient}`);
  const raw = localStorage.getItem(k1);
  if (raw) return JSON.parse(raw);
  const k2 = key(tenantId, `messages_${recipient}_user-current`);
  const raw2 = localStorage.getItem(k2);
  if (raw2) return JSON.parse(raw2);
  return [];
}

export function saveMessage(tenantIdOrRecipientId: string, recipientIdOrMessage: any, messageArg?: any) {
  const tenantId = messageArg ? tenantIdOrRecipientId : getActiveTenantId();
  const recipientId = messageArg ? recipientIdOrMessage : tenantIdOrRecipientId;
  const message = messageArg || recipientIdOrMessage;
  const k = key(tenantId, `messages_user-current_${recipientId}`);
  const existing = getMessages(tenantId, recipientId);
  existing.push(message);
  localStorage.setItem(k, JSON.stringify(existing));
  return existing;
}

// ─── Collection (platform-level) ─────────────────────────────────────────────

export function getCollection() {
  const raw = localStorage.getItem("toor_platform_user_collection");
  if (raw) return JSON.parse(raw);
  return [];
}

export function saveCollection(collection: any[]) {
  localStorage.setItem("toor_platform_user_collection", JSON.stringify(collection));
}
