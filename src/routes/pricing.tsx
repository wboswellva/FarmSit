import { createFileRoute } from "@tanstack/react-router";
import { PRICING_TIERS } from "~/lib/stripe";

export const Route = createFileRoute("/pricing")({ component: PricingPage });

function PricingPage() {

  return (
    <div className="min-h-dvh bg-gray-50 px-6 py-16 dark:bg-gray-950">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Simple, Transparent Pricing</h1>
          <p className="mt-3 text-lg text-gray-600 dark:text-gray-400">Choose the plan that fits how often you travel.</p>
        </div>

        {error && (
          <div className="mx-auto mt-8 max-w-md rounded-xl bg-red-50 px-4 py-3 text-center text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {PRICING_TIERS.map((tier) => (
            <div
              key={tier.id}
              className={`relative flex flex-col rounded-2xl border bg-white p-8 shadow-sm transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-gray-900 ${
                tier.popular ? "border-green-500 ring-2 ring-green-500" : "border-gray-200"
              }`}
            >
              {tier.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-green-600 px-4 py-1 text-xs font-semibold text-white">
                  Most Popular
                </span>
              )}
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{tier.name}</h2>
                <p className="mt-1 text-sm text-gray-500">{tier.description}</p>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900 dark:text-white">${(tier.price / 100).toFixed(0)}</span>
                <span className="text-gray-500">/{tier.id === "yearly" ? "year" : tier.id === "per_listing" ? "listing" : "month"}</span>
              </div>
              <ul className="mb-8 space-y-3 flex-1">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                    <svg className="h-4 w-4 flex-shrink-0 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    {f}
                  </li>
                ))}
              </ul>
              <a
                href={tier.link}
                target="_blank"
                rel="noopener noreferrer"
                className={`block w-full rounded-xl px-4 py-3 text-center text-sm font-semibold text-white transition ${
                  tier.popular ? "bg-green-600 hover:bg-green-700" : "bg-gray-800 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600"
                }`}
              >
                Get Started — ${(tier.price / 100).toFixed(0)}
              </a>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-2xl border border-gray-200 bg-white p-8 dark:border-gray-800 dark:bg-gray-900">
          <p className="text-center text-sm text-gray-500">
            All plans include a full listing on our platform. Listings are visible to our community of verified farm-sitters.
            Payments are processed securely via Stripe. Cancel anytime.
          </p>
        </div>
      </div>
    </div>
  );
}