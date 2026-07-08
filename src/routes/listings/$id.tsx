import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { getListing, applyToListing } from "~/lib/listings";
import type { Listing } from "~/lib/listings";

export const Route = createFileRoute("/listings/$id")({ component: ListingDetail });

function getToken() { const m = document.cookie.match(/farmsit_token=([^;]+)/); return m ? m[1] : null; }

function ListingDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [dbPending, setDbPending] = useState(false);
  const [msg, setMsg] = useState("");
  const [applying, setApplying] = useState(false);
  const [applyMsg, setApplyMsg] = useState("");

  useEffect(() => {
    (async () => {
      const r = await getListing({ data: { id } });
      if (r && "ok" in r && !r.ok) setDbPending(true);
      else if (r) setListing(r as any);
      setLoading(false);
    })();
  }, [id]);

  const handleApply = async () => {
    const token = getToken();
    if (!token) { navigate({ to: "/login" }); return; }
    setApplying(true);
    const r = await applyToListing({ data: { token, listing_id: id, message: applyMsg } });
    if (r.ok) setMsg("Application submitted!"); else setMsg(r.message);
    setApplying(false);
  };

  if (loading) return <div className="flex min-h-dvh items-center justify-center"><p className="text-gray-500">Loading...</p></div>;
  if (dbPending) return <div className="flex min-h-dvh items-center justify-center"><div className="rounded-xl bg-amber-50 px-6 py-4 text-amber-700">Database setup pending.</div></div>;
  if (!listing) return <div className="flex min-h-dvh items-center justify-center"><p className="text-gray-500">Listing not found.</p></div>;

  return (
    <div className="min-h-dvh bg-gray-50 px-6 py-12 dark:bg-gray-950">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-2xl border border-gray-200 bg-white p-8 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-start justify-between">
            <div>
              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">{listing.compensation_type.replace("_", " ")}</span>
              <h1 className="mt-3 text-3xl font-bold text-gray-900 dark:text-white">{listing.title}</h1>
              <p className="mt-1 text-sm text-gray-500">Posted by {listing.farmer_name}</p>
            </div>
            {listing.compensation_amount && <div className="text-2xl font-bold text-green-700">${listing.compensation_amount}</div>}
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4 rounded-xl bg-gray-50 p-4 text-sm dark:bg-gray-800">
            <div><span className="font-medium text-gray-700">Start</span><p className="text-gray-600">{listing.start_date}</p></div>
            <div><span className="font-medium text-gray-700">End</span><p className="text-gray-600">{listing.end_date}</p></div>
          </div>
          <div className="mt-6">
            <h2 className="font-semibold text-gray-900 dark:text-white">Description</h2>
            <p className="mt-1 text-gray-600 whitespace-pre-wrap">{listing.description}</p>
          </div>
          <div className="mt-6">
            <h2 className="font-semibold text-gray-900 dark:text-white">Animals</h2>
            <div className="mt-2 flex flex-wrap gap-2">{listing.animals?.map((a) => <span key={a} className="rounded-full bg-amber-100 px-3 py-1 text-sm text-amber-700">{a}</span>)}</div>
          </div>
          <div className="mt-6">
            <h2 className="font-semibold text-gray-900 dark:text-white">Tasks</h2>
            <ul className="mt-2 list-inside list-disc space-y-1 text-gray-600">{listing.tasks?.map((t) => <li key={t}>{t}</li>)}</ul>
          </div>
          {listing.status === "open" && (
            <div className="mt-8 border-t border-gray-200 pt-6 dark:border-gray-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Apply for this sit</h2>
              <textarea value={applyMsg} onChange={(e) => setApplyMsg(e.target.value)} rows={3} className="mt-2 block w-full rounded-xl border border-gray-300 px-4 py-2.5 dark:border-gray-700 dark:bg-gray-800 dark:text-white" placeholder="Tell the farmer why you'd be a great fit..." />
              <button onClick={handleApply} disabled={applying} className="mt-3 rounded-xl bg-green-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50">{applying ? "Applying..." : "Apply Now"}</button>
              {msg && <p className={`mt-2 text-sm ${msg.includes("submitted") ? "text-green-600" : "text-red-600"}`}>{msg}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}