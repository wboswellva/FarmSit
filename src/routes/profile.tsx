import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { getMyProfile, saveProfile } from "~/lib/listings";
import type { SitterProfile } from "~/lib/listings";
export const Route = createFileRoute("/profile")({ component: ProfilePage });
function getToken() { const m = document.cookie.match(/farmsit_token=([^;]+)/); return m ? m[1] : null; }
function ProfilePage() {
  const navigate = useNavigate();
  const [p, setP] = useState<Partial<SitterProfile>>({bio:"",skills:[],experience_years:0,has_vehicle:false,background_checked:false,references:""});
  const [sk, setSk] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [dbP, setDbP] = useState(false);
  useEffect(() => {
    const t = getToken();
    if (!t) { navigate({ to: "/login" }); return; }
    (async () => {
      const r = await getMyProfile({ data: { token: t } });
      if (r && "ok" in r && !r.ok) setDbP(true);
      else if (r) setP(r as any);
      setLoading(false);
    })();
  }, []);
  const addSk = () => { const s = sk.trim(); if (s && !p.skills!.includes(s)) setP({...p, skills: [...p.skills!, s]}); setSk(""); };
  const remSk = (s: string) => setP({...p, skills: p.skills!.filter((x) => x !== s)});
  const save = async () => { setSaving(true); setMsg(""); const r = await saveProfile({ data: { token: getToken()!, ...p } as any }); if (r.ok) setMsg("Saved!"); else setMsg(r.message); setSaving(false); };
  if (loading) return <div className="flex min-h-dvh items-center justify-center"><p className="text-gray-500">Loading...</p></div>;
  return (
    <div className="min-h-dvh bg-gray-50 px-6 py-12 dark:bg-gray-950">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Your Sitter Profile</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Show farmers who you are.</p>
        {dbP && <div className="mt-6 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700">Database setup pending.</div>}
        <div className="mt-8 space-y-6 rounded-2xl border border-gray-200 bg-white p-8 dark:border-gray-800 dark:bg-gray-900">
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Bio</label><textarea value={p.bio} onChange={(e) => setP({...p, bio: e.target.value})} rows={4} className="mt-1 block w-full rounded-xl border border-gray-300 px-4 py-2.5 dark:border-gray-700 dark:bg-gray-800 dark:text-white" placeholder="Tell farmers about yourself..." /></div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Skills</label>
            <div className="mt-1 flex flex-wrap gap-2">{p.skills!.map((s) => (<span key={s} className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-sm text-green-700">{s}<button onClick={() => remSk(s)} className="ml-1 hover:text-green-900">&times;</button></span>))}</div>
            <div className="mt-2 flex gap-2"><input value={sk} onChange={(e) => setSk(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSk())} className="block flex-1 rounded-xl border border-gray-300 px-4 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white" placeholder="e.g. Horse care" /><button onClick={addSk} className="rounded-xl bg-gray-100 px-4 py-2 text-sm font-medium hover:bg-gray-200">Add</button></div>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Years experience</label><input type="number" min={0} value={p.experience_years} onChange={(e) => setP({...p, experience_years: parseInt(e.target.value) || 0})} className="mt-1 block w-full rounded-xl border border-gray-300 px-4 py-2.5 dark:border-gray-700 dark:bg-gray-800 dark:text-white" /></div>
            <div className="flex items-end pb-2"><label className="flex cursor-pointer items-center gap-3"><input type="checkbox" checked={p.has_vehicle} onChange={(e) => setP({...p, has_vehicle: e.target.checked})} className="h-5 w-5 rounded border-gray-300 text-green-600 focus:ring-green-500" /><span className="text-sm font-medium text-gray-700 dark:text-gray-300">I have a vehicle</span></label></div>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">References</label><textarea value={p.references} onChange={(e) => setP({...p, references: e.target.value})} rows={3} className="mt-1 block w-full rounded-xl border border-gray-300 px-4 py-2.5 dark:border-gray-700 dark:bg-gray-800 dark:text-white" placeholder="List any references..." /></div>
          {msg && <div className={`rounded-xl px-4 py-3 text-sm ${msg.includes("Saved") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>{msg}</div>}
          <button onClick={save} disabled={saving} className="w-full rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50">{saving ? "Saving..." : "Save Profile"}</button>
        </div>
      </div>
    </div>
  );
}