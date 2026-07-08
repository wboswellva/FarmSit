import { createServerFn } from "@tanstack/react-start";
import { sql } from "~/db";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { runMigrations } from "./db-schema";

/* ─────────── Types ─────────── */

export type Session = {
  userId: string;
  email: string;
  name: string;
  role: "farmer" | "sitter";
};

/* ─────────── Password Hashing (Node crypto - scrypt) ─────────── */

const TOKEN_BYTES = 32;
const KEY_LENGTH = 64;
const SALT_PREFIX = "farmsit_v1:";

function hashPassword(password: string): string {
  const salt = randomBytes(TOKEN_BYTES).toString("hex");
  const hash = scryptSync(password, salt, KEY_LENGTH).toString("hex");
  return `${SALT_PREFIX}${salt}:${hash}`;
}

function verifyPassword(password: string, stored: string): boolean {
  if (!stored.startsWith(SALT_PREFIX)) return false;
  const rest = stored.slice(SALT_PREFIX.length);
  const [salt, hash] = rest.split(":");
  const derived = scryptSync(password, salt, KEY_LENGTH);
  const expected = Buffer.from(hash, "hex");
  if (derived.length !== expected.length) return false;
  return timingSafeEqual(derived, expected);
}

/* ─────────── Session Store ─────────── */

function generateToken(): string {
  return randomBytes(TOKEN_BYTES).toString("hex");
}

const sessionStore = new Map<string, Session>();

export function lookupSession(token: string): Session | null {
  return sessionStore.get(token) ?? null;
}

function createSessionStore(userId: string, email: string, name: string, role: "farmer" | "sitter"): string {
  const token = generateToken();
  sessionStore.set(token, { userId, email, name, role });
  return token;
}

function destroySessionStore(token: string) {
  sessionStore.delete(token);
}

/* ─────────── Helpers ─────────── */

export function serializeSessionCookie(token: string, maxAgeSeconds: number): string {
  return `farmsit_token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSeconds}`;
}

export function clearSessionCookie(): string {
  return `farmsit_token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

export function getTokenFromCookies(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  for (const part of cookieHeader.split(";")) {
    const eq = part.indexOf("=");
    if (eq === -1) continue;
    if (part.slice(0, eq).trim() === "farmsit_token") {
      return part.slice(eq + 1).trim();
    }
  }
  return null;
}

/* ─────────── Server Functions ─────────── */

export const ensureDb = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const created = await runMigrations();
    return {
      ok: true,
      message: created.length > 0 ? `Created tables: ${created.join(", ")}` : "All tables exist",
    };
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : "Unknown DB error" };
  }
});

export const signup = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    const d = data as Record<string, string>;
    if (!d.email || !d.name || !d.password || !d.role) throw new Error("All fields required");
    if (d.role !== "farmer" && d.role !== "sitter") throw new Error("Role must be farmer or sitter");
    if (d.password.length < 8) throw new Error("Password must be at least 8 characters");
    return { email: d.email.toLowerCase().trim(), name: d.name.trim(), password: d.password, role: d.role as "farmer" | "sitter" };
  })
  .handler(async ({ data }) => {
    const db = sql();
    const { email, name, password, role } = data;
    const existing = await db`SELECT id FROM users WHERE email = ${email}`;
    if ((existing as any[]).length > 0) return { ok: false as const, message: "Email already registered" };
    const hashed = hashPassword(password);
    const result = await db`
      INSERT INTO users (email, name, role, password_hash, created_at)
      VALUES (${email}, ${name}, ${role}, ${hashed}, now())
      RETURNING id, email, name, role
    `;
    const user = (result as any[])[0];
    const token = createSessionStore(user.id, user.email, user.name, user.role);
    return { ok: true as const, token, user: { id: user.id, email: user.email, name: user.name, role: user.role } };
  });

export const login = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    const d = data as Record<string, string>;
    if (!d.email || !d.password) throw new Error("Email and password required");
    return { email: d.email.toLowerCase().trim(), password: d.password };
  })
  .handler(async ({ data }) => {
    const db = sql();
    const { email, password } = data;
    const rows = await db`SELECT id, email, name, role, password_hash FROM users WHERE email = ${email}`;
    const users = rows as any[];
    if (users.length === 0) return { ok: false as const, message: "Invalid email or password" };
    const user = users[0];
    if (!verifyPassword(password, user.password_hash)) return { ok: false as const, message: "Invalid email or password" };
    const token = createSessionStore(user.id, user.email, user.name, user.role);
    return { ok: true as const, token, user: { id: user.id, email: user.email, name: user.name, role: user.role } };
  });

export const validateToken = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    const d = data as { token?: string };
    if (!d.token) throw new Error("Token required");
    return { token: d.token };
  })
  .handler(async ({ data }) => {
    const session = lookupSession(data.token);
    if (!session) return null;
    return { userId: session.userId, email: session.email, name: session.name, role: session.role };
  });

export const logout = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    const d = data as { token?: string };
    return { token: d.token ?? "" };
  })
  .handler(async ({ data }) => {
    if (data.token) destroySessionStore(data.token);
    return { ok: true };
  });