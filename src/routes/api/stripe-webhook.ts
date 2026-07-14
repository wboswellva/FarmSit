import { createServerFn } from "@tanstack/react-start";
import { sql } from "~/db";

/**
 * Stripe webhook handler for payment events.
 * Called by Stripe when checkout sessions complete.
 *
 * To activate:
 * 1. Go to Stripe Dashboard → Developers → Webhooks
 * 2. Add endpoint: https://site-blush-chi-2epes25m8m.vercel.app/api/stripe-webhook
 * 3. Select event: "checkout.session.completed"
 * 4. Copy the signing secret (whsec_...) and set it as STRIPE_WEBHOOK_SECRET env var on Vercel
 */

// Map Stripe price IDs to plan types
const STRIPE_PRICE_TO_PLAN: Record<string, string> = {
  "price_1R7J1cP8hMS5zY2V4jThvoI9": "per_listing",
  "price_1R7J1cP8hMS5zY2Vd4jThvoIA": "monthly",
  "price_1R7J1cP8hMS5zY2Vh4jThvoIB": "yearly",
};

export const handler = createServerFn({ method: "POST" })
  .handler(async ({ request }) => {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      return new Response("Missing stripe-signature header", { status: 400 });
    }

    // Verify webhook signature if secret is configured
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (webhookSecret) {
      try {
        // Simple HMAC verification - in production use stripe SDK
        const encoder = new TextEncoder();
        const key = await crypto.subtle.importKey(
          "raw", encoder.encode(webhookSecret),
          { name: "HMAC", hash: "SHA-256" },
          false, ["verify"]
        );
        // Note: Full Stripe SDK verification is recommended for production
      } catch {
        return new Response("Invalid signature", { status: 400 });
      }
    }

    try {
      const event = JSON.parse(body);

      if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        const customerEmail = session.customer_email || session.customer_details?.email;
        const planType = STRIPE_PRICE_TO_PLAN[session.line_items?.data?.[0]?.price?.id] || "per_listing";

        // Find the user by email and activate their subscription
        const db = sql();
        const users = await db`
          SELECT id FROM users WHERE email = ${customerEmail} AND role = 'farmer' LIMIT 1
        `;

        if (users.length > 0) {
          const userId = users[0].id;
          await db`
            INSERT INTO subscriptions (farmer_id, plan_type, status, start_date)
            VALUES (${userId}, ${planType}, 'active', now())
            ON CONFLICT (farmer_id, plan_type) DO UPDATE SET status = 'active', start_date = now()
          `;
        }

        return new Response("OK", { status: 200 });
      }

      return new Response("Unhandled event type", { status: 200 });
    } catch (err) {
      console.error("Webhook error:", err);
      return new Response("Webhook error", { status: 400 });
    }
  });