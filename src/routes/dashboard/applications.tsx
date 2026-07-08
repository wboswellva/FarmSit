import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { getMyApplications } from "~/lib/listings";
import type { Application } from "~/lib/listings";

export const Route = createFileRoute("/dashboard/applications")({
  component: ApplicationsPage,
});

function getToken() {
  const m = document.cookie.match(/farmsit_token=([^;]+)/);
  return m ? m[1] : null;
}

function ApplicationsPage() {
  const navigate = useNavigate();
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [dbPending, setDbPending] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) { navigate({ to: "/login" }); return; }
    (async () => {
      const result = await getMyApplications({ data: { token } });
      if (result && "ok" in result && !result.ok) setDbPending(true);
      else setApps(result as any);
      setLoading(false);
    })();
  }, []);

  const statusColor = (s: string) =>
    s === "accepted" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" :
    s === "declined" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300" :
    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300";

  return (
    <div className="min-h-dvh bg-gray-50 px-6 py-12 dark:bg-gray-950">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Applications</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Track the farm-sits you've applied for.</p>

        {dbPending && (
          <div className="mt-6 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
            Database setup pending — your applications will appear here once connected.
          </div>
        )}

        {loading ? (
          <p className="mt-8 text-gray-500">Loading...</p>
        ) : apps.length === 0 && !dbPending ? (
          <div className="mt-12 text-center">
            <div className="text-4xl">📋</div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">You haven't applied to any listings yet.</p>
            <a href="/browse" className="mt-4 inline-block rounded-full bg-green-600 px-6 py-2.5 text-sm font-semibold text-white">Browse Listings</a>
          </div>
        ) : (
          <div className="mt-8 space-y-3">
            {apps.map((a) => (
              <div key={a.id} className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
                <div className="flex items-start justify-between">
                  <div>
                    <a href={`/listings/${a.listing_id}`} className="text-lg font-semibold text-gray-900 hover:text-green-700 dark:text-white dark:hover:text-green-400">{a.listing_title}</a>
                    <p className="mt-1 text-sm text-gray-500">{a.created_at}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusColor(a.status)}`}>{a.status}</span>
                </div>
                {a.message && <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">{a.message}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}