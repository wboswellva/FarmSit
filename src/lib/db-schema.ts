import { sql } from "~/db";

/**
 * All CREATE TABLE statements for the FarmSit marketplace.
 * Call `runMigrations()` to apply any not-yet-applied tables.
 * Safe to run multiple times (uses IF NOT EXISTS).
 */

const MIGRATIONS = [
  /* ───────── users ───────── */
  `CREATE TABLE IF NOT EXISTS users (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email         TEXT NOT NULL UNIQUE,
    name          TEXT NOT NULL,
    role          TEXT NOT NULL CHECK (role IN ('farmer', 'sitter')),
    password_hash TEXT NOT NULL DEFAULT '',
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,

  /* ───────── sitter_profiles ───────── */
  `CREATE TABLE IF NOT EXISTS sitter_profiles (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id            UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    bio                TEXT NOT NULL DEFAULT '',
    skills             TEXT[] NOT NULL DEFAULT '{}',
    experience_years   INTEGER NOT NULL DEFAULT 0,
    has_vehicle        BOOLEAN NOT NULL DEFAULT false,
    background_checked BOOLEAN NOT NULL DEFAULT false,
    "references"       TEXT NOT NULL DEFAULT ''
  )`,

  /* ───────── listings ───────── */
  `CREATE TABLE IF NOT EXISTS listings (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title              TEXT NOT NULL,
    description        TEXT NOT NULL DEFAULT '',
    start_date         DATE NOT NULL,
    end_date           DATE NOT NULL,
    animals            TEXT[] NOT NULL DEFAULT '{}',
    tasks              TEXT[] NOT NULL DEFAULT '{}',
    compensation_type  TEXT NOT NULL CHECK (compensation_type IN ('paid', 'free_stay', 'negotiable')),
    compensation_amount DECIMAL(10,2),
    status             TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'filled', 'cancelled')),
    created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,

  /* ───────── applications ───────── */
  `CREATE TABLE IF NOT EXISTS applications (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id  UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    sitter_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message     TEXT NOT NULL DEFAULT '',
    status      TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(listing_id, sitter_id)
  )`,

  /* ───────── reviews ───────── */
  `CREATE TABLE IF NOT EXISTS reviews (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id   UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    reviewer_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reviewee_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating       INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment      TEXT NOT NULL DEFAULT '',
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,

  /* ───────── subscriptions ───────── */
  `CREATE TABLE IF NOT EXISTS subscriptions (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_type             TEXT NOT NULL CHECK (plan_type IN ('per_listing', 'monthly', 'yearly')),
    stripe_subscription_id TEXT,
    status                TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'expired')),
    start_date            TIMESTAMPTZ NOT NULL DEFAULT now(),
    end_date              TIMESTAMPTZ
  )`,
] as const;

export const MIGRATION_NAMES = [
  "users",
  "sitter_profiles",
  "listings",
  "applications",
  "reviews",
  "subscriptions",
] as const;

const ADDITIONAL_MIGRATIONS = [
  // Add password_hash column if it doesn't exist (for existing databases)
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT NOT NULL DEFAULT ''`,
] as const;

/**
 * Run all pending migrations. Safe to call on every app boot — each
 * statement uses IF NOT EXISTS so it is idempotent.
 *
 * Returns a list of table names that were actually created (empty if
 * all already existed).
 */
export async function runMigrations(): Promise<string[]> {
  const db = sql();
  const created: string[] = [];

  for (let i = 0; i < MIGRATIONS.length; i++) {
    const sqlText = MIGRATIONS[i];
    const tableName = MIGRATION_NAMES[i];

    // Check if table already exists
    const [{ exists }] = await db`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = ${tableName}
      ) as exists
    `;

    if (!exists) {
      await db.query(sqlText);
      created.push(tableName);
    }
  }

  // Run additional migrations (column additions, etc.)
  for (const sqlText of ADDITIONAL_MIGRATIONS) {
    await db.query(sqlText);
  }

  return created;
}