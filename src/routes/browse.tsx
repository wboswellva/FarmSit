import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { getListings } from "~/lib/listings";
import type { Listing } from "~/lib/listings";

export const Route = createFileRoute("/browse")({
  component: BrowsePage,
});

function BrowsePage() {
  const navigate = useNavigate();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [dbPending, setDbPending] = useState(false);
  const [filter, setFilter] = useState("open");

  useEffect(() => {
    (async () => {
      const result = await getListings({ data: { filter } });
      if (result && "ok" in result && !result.ok) {
        setDbPending(true);
      } else if (Array.isArray(result)) {
        setListings(result as any);
      }
      setLoading(false);
    })();
  }, [filter]);

  return (
    <div className="min-h-dvh bg-gray-50 px-6 py-12 dark:bg-gray-950">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Browse Farm-Sits</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Find your next adventure on a farm.</p>

        {dbPending && (
          <div className="mt-6 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
            Database setup pending — listings will appear here once connected.
          </div>
        )}

        <div className="mt-6 flex gap-2">
          {["open", "filled"].map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`rounded-full px-4 py-2 text-sm font-medium ${filter === f ? "bg-green-600 text-white" : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700"}`}>
              {f === "open" ? "Open" : "Filled"}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="mt-8 text-gray-500">Loading...</p>
        ) : listings.length === 0 && !dbPending ? (
          <div className="mt-12 text-center">
            <div className="text-4xl">🔍</div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">No listings found.</p>
          </div>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((l) => (
              <Link key={l.id} to={`/listings/${l.id}`} className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow dark:border-gray-800 dark:bg-gray-900">
                <div className="flex items-start justify-between">
                  <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-300">{l.compensation_type.replace("_", " ")}</span>
                  {l.compensation_amount && <span className="text-sm font-semibold text-gray-900 dark:text-white">${l.compensation_amount}</span>}
                </div>
                <h3 className="mt-3 text-lg font-semibold text-gray-900 group-hover:text-green-700 dark:text-white dark:group-hover:text-green-400">{l.title}</h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{l.description}</p>
                <div className="mt-3 flex flex-wrap gap-1">
                  {l.animals?.slice(0, 3).map((a) => <span key={a} className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">{a}</span>)}
                  {l.animals?.length > 3 && <span className="text-xs text-gray-400">+{l.animals.length - 3}</span>}
                </div>
                <div className="mt-3 flex items-center gap-1 text-xs text-gray-500">
                  <span>{l.start_date} — {l.end_date}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}