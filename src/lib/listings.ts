import { createServerFn } from "@tanstack/react-start";
import { sql } from "~/db";
import { getTokenFromCookies, lookupSession } from "./auth";

/* ─────────── Types ─────────── */

export type Listing = {
  id: string;
  farmer_id: string;
  farmer_name: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  animals: string[];
  tasks: string[];
  compensation_type: "paid" | "free_stay" | "negotiable";
  compensation_amount: number | null;
  status: "open" | "filled" | "cancelled";
  created_at: string;
};

export type SitterProfile = {
  id: string;
  user_id: string;
  bio: string;
  skills: string[];
  experience_years: number;
  has_vehicle: boolean;
  background_checked: boolean;
  references: string;
};

export type Application = {
  id: string;
  listing_id: string;
  listing_title: string;
  sitter_id: string;
  sitter_name: string;
  message: string;
  status: "pending" | "accepted" | "declined";
  created_at: string;
};

/* ─────────── Helper ─────────── */

function dbUnavailable() {
  return { ok: false as const, message: "Database setup pending — check back soon." };
}

function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  return sql();
}

/* ─────────── Sitter Profile ─────────── */

export const getMyProfile = createServerFn({ method: "POST" })
  .validator((d: unknown) => ({ token: (d as { token: string }).token }))
  .handler(async ({ data }) => {
    const session = lookupSession(data.token);
    if (!session || session.role !== "sitter") return null;
    const db = getDb();
    if (!db) return dbUnavailable();
    const rows = await db`SELECT * FROM sitter_profiles WHERE user_id = ${session.userId}`;
    return (rows as any[])[0] ?? null;
  });

export const saveProfile = createServerFn({ method: "POST" })
  .validator((d: unknown) => d as SitterProfile & { token: string })
  .handler(async ({ data }) => {
    const session = lookupSession(data.token);
    if (!session || session.role !== "sitter") return { ok: false as const, message: "Not authenticated" };
    const db = getDb();
    if (!db) return dbUnavailable();
    const { token, ...profile } = data;
    const existing = await db`SELECT id FROM sitter_profiles WHERE user_id = ${session.userId}`;
    if ((existing as any[]).length > 0) {
      await db`
        UPDATE sitter_profiles SET bio=${profile.bio}, skills=${profile.skills}, experience_years=${profile.experience_years},
          has_vehicle=${profile.has_vehicle}, background_checked=${profile.background_checked}, "references"=${profile.references}
        WHERE user_id = ${session.userId}
      `;
    } else {
      await db`
        INSERT INTO sitter_profiles (user_id, bio, skills, experience_years, has_vehicle, background_checked, "references")
        VALUES (${session.userId}, ${profile.bio}, ${profile.skills}, ${profile.experience_years}, ${profile.has_vehicle}, ${profile.background_checked}, ${profile.references})
      `;
    }
    return { ok: true as const };
  });

/* ─────────── Listings ─────────── */

export const getListings = createServerFn({ method: "POST" })
  .validator((d: unknown) => ({ filter: (d as { filter?: string }).filter ?? "open" }))
  .handler(async ({ data }) => {
    const db = getDb();
    if (!db) return dbUnavailable();
    const rows = await db`
      SELECT l.*, u.name as farmer_name
      FROM listings l JOIN users u ON l.farmer_id = u.id
      WHERE l.status = ${data.filter}
      ORDER BY l.created_at DESC
    `;
    return (rows as any[]).map((r: any) => ({ ...r, created_at: String(r.created_at), start_date: String(r.start_date), end_date: String(r.end_date) }));
  });

export const getListing = createServerFn({ method: "POST" })
  .validator((d: unknown) => ({ id: (d as { id: string }).id }))
  .handler(async ({ data }) => {
    const db = getDb();
    if (!db) return dbUnavailable();
    const rows = await db`
      SELECT l.*, u.name as farmer_name FROM listings l JOIN users u ON l.farmer_id = u.id WHERE l.id = ${data.id}
    `;
    const listing = (rows as any[])[0];
    if (!listing) return null;
    return { ...listing, created_at: String(listing.created_at), start_date: String(listing.start_date), end_date: String(listing.end_date) };
  });

export const createListing = createServerFn({ method: "POST" })
  .validator((d: unknown) => d as { token: string; title: string; description: string; start_date: string; end_date: string; animals: string[]; tasks: string[]; compensation_type: string; compensation_amount?: number })
  .handler(async ({ data }) => {
    const session = lookupSession(data.token);
    if (!session || session.role !== "farmer") return { ok: false as const, message: "Only farmers can post listings" };
    const db = getDb();
    if (!db) return dbUnavailable();
    const result = await db`
      INSERT INTO listings (farmer_id, title, description, start_date, end_date, animals, tasks, compensation_type, compensation_amount)
      VALUES (${session.userId}, ${data.title}, ${data.description}, ${data.start_date}, ${data.end_date},
        ${data.animals}, ${data.tasks}, ${data.compensation_type}, ${data.compensation_amount ?? null})
      RETURNING id
    `;
    return { ok: true as const, id: (result as any[])[0].id };
  });

/* ─────────── Applications ─────────── */

export const applyToListing = createServerFn({ method: "POST" })
  .validator((d: unknown) => d as { token: string; listing_id: string; message: string })
  .handler(async ({ data }) => {
    const session = lookupSession(data.token);
    if (!session || session.role !== "sitter") return { ok: false as const, message: "Only sitters can apply" };
    const db = getDb();
    if (!db) return dbUnavailable();
    await db`
      INSERT INTO applications (listing_id, sitter_id, message) VALUES (${data.listing_id}, ${session.userId}, ${data.message})
    `;
    return { ok: true as const };
  });

export const getMyApplications = createServerFn({ method: "POST" })
  .validator((d: unknown) => ({ token: (d as { token: string }).token }))
  .handler(async ({ data }) => {
    const session = lookupSession(data.token);
    if (!session) return [];
    const db = getDb();
    if (!db) return dbUnavailable();
    const rows = await db`
      SELECT a.*, l.title as listing_title FROM applications a
      JOIN listings l ON a.listing_id = l.id
      WHERE a.sitter_id = ${session.userId}
      ORDER BY a.created_at DESC
    `;
    return (rows as any[]).map((r: any) => ({ ...r, created_at: String(r.created_at) }));
  });

export const getMyListings = createServerFn({ method: "POST" })
  .validator((d: unknown) => ({ token: (d as { token: string }).token }))
  .handler(async ({ data }) => {
    const session = lookupSession(data.token);
    if (!session) return [];
    const db = getDb();
    if (!db) return dbUnavailable();
    const rows = await db`
      SELECT * FROM listings WHERE farmer_id = ${session.userId} ORDER BY created_at DESC
    `;
    return (rows as any[]).map((r: any) => ({ ...r, created_at: String(r.created_at), start_date: String(r.start_date), end_date: String(r.end_date) }));
  });

export const getApplicants = createServerFn({ method: "POST" })
  .validator((d: unknown) => ({ token: (d as { token: string }).token, listing_id: (d as { listing_id: string }).listing_id }))
  .handler(async ({ data }) => {
    const session = lookupSession(data.token);
    if (!session) return [];
    const db = getDb();
    if (!db) return dbUnavailable();
    const rows = await db`
      SELECT a.*, u.name as sitter_name FROM applications a
      JOIN users u ON a.sitter_id = u.id
      WHERE a.listing_id = ${data.listing_id}
      ORDER BY a.created_at DESC
    `;
    return (rows as any[]).map((r: any) => ({ ...r, created_at: String(r.created_at) }));
  });

export const updateApplicationStatus = createServerFn({ method: "POST" })
  .validator((d: unknown) => d as { token: string; application_id: string; status: "accepted" | "declined" })
  .handler(async ({ data }) => {
    const session = lookupSession(data.token);
    if (!session || session.role !== "farmer") return { ok: false as const, message: "Unauthorized" };
    const db = getDb();
    if (!db) return dbUnavailable();
    await db`UPDATE applications SET status = ${data.status} WHERE id = ${data.application_id}`;
    if (data.status === "accepted") {
      // Mark listing as filled
      const app = (await db`SELECT listing_id FROM applications WHERE id = ${data.application_id}`) as any[];
      if (app.length > 0) {
        await db`UPDATE listings SET status = 'filled' WHERE id = ${app[0].listing_id}`;
      }
    }
    return { ok: true as const };
  });