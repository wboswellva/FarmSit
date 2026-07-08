import { createServerFn } from "@tanstack/react-start";
import { sql } from "~/db";
import { lookupSession } from "./auth";

/**
 * Stripe pricing for FarmSit.
 * Uses pre-built Stripe payment links — no secret keys needed.
 */

export const PRICING_TIERS = [
  {
    id: "per_listing",
    name: "Pay Per Listing",
    price: 1000,
    description: "Post one listing at a time",
    link: "https://buy.stripe.com/00w14n8FWgVFfwa5PE38402",
    features: ["Single listing post", "7-day listing duration", "Standard visibility"],
  },
  {
    id: "monthly",
    name: "Monthly",
    price: 2500,
    description: "For active farmers",
    link: "https://buy.stripe.com/bJe4gze0gfRB4Rw6TI38400",
    features: ["Unlimited listings", "Priority support", "Cancel anytime"],
  },
  {
    id: "yearly",
    name: "Yearly",
    price: 20000,
    description: "Best value for frequent travelers",
    link: "https://buy.stripe.com/fZu7sL09qbBl3Ns2Ds38401",
    features: ["Everything in Monthly", "2 months free", "Featured listings", "Dedicated support"],
    popular: true,
  },
] as const;

/**
 * Record a subscription purchase in the database.
 * Called after the farmer returns from Stripe checkout.
 */
export const recordSubscription = createServerFn({ method: "POST" })
  .validator((d: unknown) => {
    const { token, planType } = d as { token: string; planType: string };
    if (!token) throw new Error("Authentication required");
    if (!PRICING_TIERS.find((t) => t.id === planType)) throw new Error("Invalid plan type");
    return { token, planType: planType as typeof PRICING_TIERS[number]["id"] };
  })
  .handler(async ({ data }) => {
    const sess = lookupSession(data.token);
    if (!sess) return { ok: false as const, message: "Not authenticated" };

    try {
      const db = sql();
      await db`
        INSERT INTO subscriptions (farmer_id, plan_type, status, start_date)
        VALUES (${sess.userId}, ${data.planType}, 'active', now())
        ON CONFLICT (farmer_id, plan_type) DO UPDATE SET status = 'active', start_date = now()
      `;
      return { ok: true as const };
    } catch {
      return { ok: false as const, message: "Database unavailable" };
    }
  });

/**
 * Check if the current farmer has an active subscription.
 */
export const getMySubscription = createServerFn({ method: "POST" })
  .validator((d: unknown) => ({ token: (d as { token: string }).token }))
  .handler(async ({ data }) => {
    const sess = lookupSession(data.token);
    if (!sess) return null;
    try {
      const db = sql();
      const rows = await db`
        SELECT * FROM subscriptions
        WHERE farmer_id = ${sess.userId} AND status = 'active'
        ORDER BY start_date DESC LIMIT 1
      `;
      return (rows as any[])[0] ?? null;
    } catch {
      return null;
    }
  });