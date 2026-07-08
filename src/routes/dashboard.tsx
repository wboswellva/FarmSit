import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { getMyListings, getApplicants, updateApplicationStatus } from "~/lib/listings";
import type { Listing, Application } from "~/lib/listings";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
});

function getToken() {
  const m = document.cookie.match(/farmsit_token=([^;]+)/);
  return m ? m[1] : null;
}

function DashboardPage() {
  const navigate = useNavigate();
  const [listings, setListings] = useState<Listing[]>([]);
  const [applicants, setApplicants] = useState<Record<string, Application[]>>({});
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [dbPending, setDbPending] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) { navigate({ to: "/login" }); return; }
    (async () => {
      const result = await getMyListings({ data: { token } });
      if (result && "ok" in result && !result.ok) setDbPending(true);
      else setListings(result as any);
      setLoading(false);
    })();
  }, []);

  const loadApplicants = async (listingId: string) => {
    if (expanded === listingId) { setExpanded(null); return; }
    setExpanded(listingId);
    const token = getToken()!;
    const result = await getApplicants({ data: { token, listing_id: listingId } });
    setApplicants({ ...applicants, [listingId]: result as any });
  };

  const handleStatus = async (appId: string, status: "accepted" | "declined") => {
    const token = getToken()!;
    await updateApplicationStatus({ data: { token, application_id: appId, status } });
    // Reload
    setExpanded(null);
    const result = await getMyListings({ data: { token } });
    setListings(result as any);
  };

  return (
    <div className="min-h-dvh bg-gray-50 px-6 py-12 dark:bg-gray-950">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Farmer Dashboard</h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Manage your listings and review applicants.</p>
          </div>
          <Link to="/dashboard/listings/new" className="rounded-full bg-green-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-green-700">Post a Listing</Link>
        </div>

        {dbPending && (
          <div className="mt-6 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700">Database setup pending.</div>
        )}

        {loading ? <p className="mt-8 text-gray-500">Loading...</p> : listings.length === 0 && !dbPending ? (
          <div className="mt-12 text-center">
            <div className="text-4xl">📋</div>
            <p className="mt-4 text-gray-600">You haven't posted any listings yet.</p>
            <Link to="/dashboard/listings/new" className="mt-4 inline-block rounded-full bg-green-600 px-6 py-2.5 text-sm font-semibold text-white">Post Your First Listing</Link>
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            {listings.map((l) => (
              <div key={l.id} className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
                <button onClick={() => loadApplicants(l.id)} className="flex w-full items-center justify-between p-6 text-left">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{l.title}</h3>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${l.status === "open" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>{l.status}</span>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">{l.start_date} — {l.end_date} &middot; {l.compensation_type.replace("_", " ")}</p>
                  </div>
                  <svg className={`h-5 w-5 text-gray-400 transition-transform ${expanded === l.id ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
                {expanded === l.id && (
                  <div className="border-t border-gray-200 px-6 py-4 dark:border-gray-800">
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Applicants</h4>
                    {!applicants[l.id]?.length ? (
                      <p className="mt-2 text-sm text-gray-500">No applicants yet.</p>
                    ) : (
                      <div className="mt-3 space-y-3">
                        {applicants[l.id].map((a) => (
                          <div key={a.id} className="rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-gray-900 dark:text-white">{a.sitter_name}</span>
                              <span className={`text-xs font-medium ${a.status === "pending" ? "text-amber-600" : a.status === "accepted" ? "text-green-600" : "text-red-600"}`}>{a.status}</span>
                            </div>
                            {a.message && <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{a.message}</p>}
                            {a.status === "pending" && (
                              <div className="mt-3 flex gap-2">
                                <button onClick={() => handleStatus(a.id, "accepted")} className="rounded-full bg-green-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-green-700">Accept</button>
                                <button onClick={() => handleStatus(a.id, "declined")} className="rounded-full border border-red-300 px-4 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50">Decline</button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}