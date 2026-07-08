import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <div className="flex min-h-dvh flex-col">
      {/* ──────────── Navigation ──────────── */}
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-950/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <a href="/" className="text-xl font-bold tracking-tight text-green-700 dark:text-green-400">
            FarmSit
          </a>
          <nav className="flex items-center gap-4 text-sm font-medium">
            <a href="#how-it-works" className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100">
              How It Works
            </a>
            <a href="#for-farmers" className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100">
              For Farmers
            </a>
            <a href="#for-sitters" className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100">
              For Sitters
            </a>
            <a
              href="/login"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
            >
              Log in
            </a>
            <a
              href="/signup"
              className="rounded-full bg-green-600 px-4 py-2 text-white hover:bg-green-700 transition-colors"
            >
              Sign Up
            </a>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* ──────────── Hero ──────────── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-green-50 via-white to-amber-50 px-6 py-24 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
          <div className="relative mx-auto max-w-4xl text-center">
            <span className="inline-block rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700 dark:bg-green-900/50 dark:text-green-300">
              Trusted farm-sitting marketplace
            </span>
            <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
              <span className="text-gray-900 dark:text-white">Find Trusted Help for Your Farm.</span>{" "}
              <span className="text-green-700 dark:text-green-400">Find Your Next Adventure.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600 dark:text-gray-400">
              FarmSit connects farmers with reliable, vetted farm-sitters so you can
              leave your property without worry — while sitters earn income or enjoy
              free accommodation in exchange for caring for animals and land.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <a
                href="#for-farmers"
                className="rounded-full bg-green-600 px-8 py-3 text-base font-semibold text-white shadow-sm hover:bg-green-700 transition-colors"
              >
                I Need a Farm-Sitter
              </a>
              <a
                href="#for-sitters"
                className="rounded-full border border-gray-300 bg-white px-8 py-3 text-base font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition-colors dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                I Want to Farm-Sit
              </a>
            </div>
          </div>
        </section>

        {/* ──────────── How It Works ──────────── */}
        <section id="how-it-works" className="px-6 py-20">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              How It Works
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-center text-gray-600 dark:text-gray-400">
              A simple, secure marketplace that works for both sides.
            </p>
            <div className="mt-12 grid gap-8 md:grid-cols-3">
              <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-gray-900">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400">
                  <span className="text-xl font-bold">1</span>
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">Post or Browse</h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Farmers post their needs with dates, animals, and tasks. Sitters browse
                  opportunities that match their skills and availability.
                </p>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-gray-900">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400">
                  <span className="text-xl font-bold">2</span>
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">Connect &amp; Choose</h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Sitters apply to listings they love. Farmers review profiles,
                  experience, and references — then choose who to work with.
                </p>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-gray-900">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400">
                  <span className="text-xl font-bold">3</span>
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">Sit with Confidence</h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Farmers travel worry-free knowing their farm is in good hands.
                  Sitters enjoy paid work or free stays in beautiful locations.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ──────────── For Farmers ──────────── */}
        <section id="for-farmers" className="bg-gray-50 px-6 py-20 dark:bg-gray-900/50">
          <div className="mx-auto max-w-6xl">
            <div className="grid items-center gap-12 md:grid-cols-2">
              <div>
                <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700 dark:bg-green-900/50 dark:text-green-300">
                  For Farmers
                </span>
                <h2 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                  Need a Farm-Sitter?
                </h2>
                <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
                  Take time off without the stress. Whether it's a weekend away or an
                  extended trip, find someone you can trust to care for your animals
                  and property.
                </p>
                <ul className="mt-6 space-y-3">
                  {[
                    "Vetted sitters with real experience",
                    "Flexible listings — paid gigs or free stays",
                    "You choose who to work with",
                    "Simple post-and-review workflow",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                      <svg className="mt-0.5 h-5 w-5 shrink-0 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href="#"
                  className="mt-8 inline-block rounded-full bg-green-600 px-8 py-3 text-base font-semibold text-white shadow-sm hover:bg-green-700 transition-colors"
                >
                  Post a Listing
                </a>
              </div>
              <div className="rounded-2xl bg-white p-8 shadow-sm dark:bg-gray-800">
                <div className="aspect-video rounded-xl bg-gradient-to-br from-green-100 to-amber-100 flex items-center justify-center dark:from-green-900/30 dark:to-amber-900/30">
                  <div className="text-center">
                    <div className="text-5xl">🐄</div>
                    <p className="mt-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                      Your farm, in good hands
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ──────────── For Sitters ──────────── */}
        <section id="for-sitters" className="px-6 py-20">
          <div className="mx-auto max-w-6xl">
            <div className="grid items-center gap-12 md:grid-cols-2">
              <div className="order-last md:order-first">
                <div className="rounded-2xl bg-white p-8 shadow-sm dark:bg-gray-800">
                  <div className="aspect-video rounded-xl bg-gradient-to-br from-amber-100 to-green-100 flex items-center justify-center dark:from-amber-900/30 dark:to-green-900/30">
                    <div className="text-center">
                      <div className="text-5xl">🌄</div>
                      <p className="mt-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                        Work from wherever the road takes you
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-700 dark:bg-amber-900/50 dark:text-amber-300">
                  For Sitters
                </span>
                <h2 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                  Want to Farm-Sit?
                </h2>
                <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
                  Combine your love of animals with travel. Get paid work or free
                  accommodation at beautiful farms across the country — and make a
                  real difference for farmers who need a break.
                </p>
                <ul className="mt-6 space-y-3">
                  {[
                    "Free stays in stunning locations",
                    "Paid gigs for experienced sitters",
                    "Build your reputation with reviews",
                    "Meet amazing animals and people",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                      <svg className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href="#"
                  className="mt-8 inline-block rounded-full bg-amber-600 px-8 py-3 text-base font-semibold text-white shadow-sm hover:bg-amber-700 transition-colors"
                >
                  Browse Listings
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ──────────── Features ──────────── */}
        <section className="bg-gray-50 px-6 py-20 dark:bg-gray-900/50">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Built for Trust
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-center text-gray-600 dark:text-gray-400">
              Everything you need to sit with confidence or travel without worry.
            </p>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { icon: "🛡️", title: "Vetted Profiles", desc: "Sitters showcase their experience, skills, references, and background checks so farmers know exactly who they're inviting." },
                { icon: "🐓", title: "Flexible Listings", desc: "Short or long sits, paid or free stays, any kind of animal — farmers set the terms that work for them." },
                { icon: "🤝", title: "You Choose", desc: "Farmers review every applicant and decide who to accept. No autopilot, no surprises." },
                { icon: "⭐", title: "Ratings & Reviews", desc: "Both sides rate each other after each sit, building trust and reputation over time." },
                { icon: "💬", title: "Direct Messaging", desc: "Chat with applicants or farmers directly before committing to a sit." },
                { icon: "💰", title: "Fair Pricing", desc: "Farmers pay per listing or subscribe for unlimited posts. Sitters join free and keep what they earn." },
              ].map(({ icon, title, desc }) => (
                <div key={title} className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
                  <div className="text-3xl">{icon}</div>
                  <h3 className="mt-3 text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ──────────── CTA ──────────── */}
        <section className="px-6 py-20">
          <div className="mx-auto max-w-3xl rounded-3xl bg-gradient-to-r from-green-600 to-green-700 px-8 py-16 text-center text-white shadow-lg">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Ready to Get Started?
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-lg text-green-100">
              Join the FarmSit community today. Farmers find peace of mind — sitters
              find their next adventure.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <a
                href="#for-farmers"
                className="rounded-full bg-white px-8 py-3 text-base font-semibold text-green-700 shadow-sm hover:bg-green-50 transition-colors"
              >
                Sign Up as a Farmer
              </a>
              <a
                href="#for-sitters"
                className="rounded-full border border-white/30 px-8 py-3 text-base font-semibold text-white hover:bg-white/10 transition-colors"
              >
                Sign Up as a Sitter
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* ──────────── Footer ──────────── */}
      <footer className="border-t border-gray-200 bg-white px-6 py-8 dark:border-gray-800 dark:bg-gray-950">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-gray-500 dark:text-gray-500">
            &copy; {new Date().getFullYear()} FarmSit. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-500">
            <a href="#" className="hover:text-gray-700 dark:hover:text-gray-300">Privacy</a>
            <a href="#" className="hover:text-gray-700 dark:hover:text-gray-300">Terms</a>
            <a href="#" className="hover:text-gray-700 dark:hover:text-gray-300">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
