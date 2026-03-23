/**
 * TOOR â Client-Side Data Store
 *
 * localStorage wrapper with tenant-scoped keys.
 * In production, replace these functions with Neon/Drizzle queries.
 * The API is the same â only the storage backend changes.
 */

import { SEED_BRAND_CONFIG, SEED_EVENTS, SEED_TOUR_WAYPOINTS, SEED_CLASSES, SEED_ENTRANTS } from "./seed-data";

// âââ Key Builder âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

function key(tenantId: string, dataType: string) {
  return `toor_${tenantId}_${dataType}`;
}

// âââ Brand Config ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

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

// âââ Seed ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

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

// âââ Invite Code Lookup âââââââââââââââââââââââââââââââââââââââââââââââââââââ

export function lookupInviteCode(code: string): any | null {
  const entrants = getEntrants();
  const normalized = code.trim().toLowerCase();

  // Match by entry number (e.g. "101", "442")
  const byNumber = entrants.find((e: any) => String(e.entry_number) === normalized);
  if (byNumber) return byNumber;

  // Match by last name (case-insensitive)
  const byName = entrants.find((e: any) => {
    const lastName = e.name.split(" ").pop()?.toLowerCase();
    return lastName === normalized;
  });
  if (byName) return byName;

  // Match by user_id (e.g. "ent-001")
  const byId = entrants.find((e: any) => e.user_id === normalized);
  if (byId) return byId;

  return null;
}

// âââ User ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

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

// âââ User Entry (tenant-scoped) ââââââââââââââââââââââââââââââââââââââââââââââ

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

// âââ Events ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

export function getEvents() {
  const tenantId = getActiveTenantId();
  const raw = localStorage.getItem(key(tenantId, "events"));
  if (raw) return JSON.parse(raw);
  return SEED_EVENTS;
}

// âââ Tour Waypoints ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

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

// âââ Sponsors ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

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

// âââ Program Pages âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

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

// âââ Brand Config (save) âââââââââââââââââââââââââââââââââââââââââââââââââââââ

export function saveBrandConfig(config: any) {
  const tenantId = getActiveTenantId();
  localStorage.setItem(key(tenantId, "brand_config"), JSON.stringify(config));
  applyBrandConfig(config);
}

// âââ Classes âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

export function getClasses() {
  const tenantId = getActiveTenantId();
  const raw = localStorage.getItem(key(tenantId, "classes"));
  if (raw) return JSON.parse(raw);
  return SEED_CLASSES;
}

// âââ Entrants ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

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

// âââ Messages ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
 * TOOR â Client-Side Data Store
 *
 * localStorage wrapper with tenant-scoped keys.
 * In production, replace these functions with Neon/Drizzle queries.
 * The API is the same â only the storage backend changes.
 */

import { SEED_BRAND_CONFIG, SEED_EVENTS, SEED_TOUR_WAYPOINTS, SEED_CLASSES, SEED_ENTRANTS } from "./seed-data";

// âââ Key Builder âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

function key(tenantId: string, dataType: string) {
  return `toor_${tenantId}_${dataType}`;
}

// âââ Brand Config ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

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

// âââ Seed ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

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

// âââ Invite Code Lookup âââââââââââââââââââââââââââââââââââââââââââââââââââââ

export function lookupInviteCode(code: string): any | null {
  const entrants = getEntrants();
  const normalized = code.trim().toLowerCase();

  // Match by entry number (e.g. "101", "442")
  const byNumber = entrants.find((e: any) => String(e.entry_number) === normalized);
  if (byNumber) return byNumber;

  // Match by last name (case-insensitive)
  const byName = entrants.find((e: any) => {
    const lastName = e.name.split(" ").pop()?.toLowerCase();
    return lastName === normalized;
  });
  if (byName) return byName;

  // Match by user_id (e.g. "ent-001")
  const byId = entrants.find((e: any) => e.user_id === normalized);
  if (byId) return byId;

  return null;
}

// âââ User ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

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

// âââ User Entry (tenant-scoped) ââââââââââââââââââââââââââââââââââââââââââââââ

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

// âââ Events ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

export function getEvents() {
  const tenantId = getActiveTenantId();
  const raw = localStorage.getItem(key(tenantId, "events"));
  if (raw) return JSON.parse(raw);
  return SEED_EVENTS;
}

// âââ Tour Waypoints ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

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

// âââ Sponsors ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

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

// âââ Program Pages âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

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

// âââ Brand Config (save) âââââââââââââââââââââââââââââââââââââââââââââââââââââ

export function saveBrandConfig(config: any) {
  const tenantId = getActiveTenantId();
  localStorage.setItem(key(tenantId, "brand_config"), JSON.stringify(config));
  applyBrandConfig(config);
}

// âââ Classes âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

export function getClasses() {
  const tenantId = getActiveTenantId();
  const raw = localStorage.getItem(key(tenantId, "classes"));
  if (raw) return JSON.parse(raw);
  return SEED_CLASSES;
}

// âââ Entrants ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

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

// âââ Messages ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

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

// âââ Collection (platform-level) âââââââââââââââââââââââââââââââââââââââââââââ

export function getCollection() {
  const raw = localStorage.getItem("toor_platform_user_collection");
  if (raw) return JSON.parse(raw);
  return [];
}

export function saveCollection(collection: any[]) {
  localStorage.setItem("toor_platform_user_collection", JSON.stringify(collection));
}
