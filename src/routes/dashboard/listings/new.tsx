import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { createListing } from "~/lib/listings";

export const Route = createFileRoute("/dashboard/listings/new")({
  component: NewListingPage,
});

function getToken() {
  const m = document.cookie.match(/farmsit_token=([^;]+)/);
  return m ? m[1] : null;
}

function NewListingPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [animalInput, setAnimalInput] = useState("");
  const [animals, setAnimals] = useState<string[]>([]);
  const [taskInput, setTaskInput] = useState("");
  const [tasks, setTasks] = useState<string[]>([]);
  const [compType, setCompType] = useState<"paid" | "free_stay" | "negotiable">("free_stay");
  const [compAmount, setCompAmount] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const addAnimal = () => { const s = animalInput.trim(); if (s && !animals.includes(s)) { setAnimals([...animals, s]); } setAnimalInput(""); };
  const addTask = () => { const s = taskInput.trim(); if (s && !tasks.includes(s)) { setTasks([...tasks, s]); } setTaskInput(""); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getToken();
    if (!token) { navigate({ to: "/login" }); return; }
    if (!title || !startDate || !endDate) { setError("Title, start date, and end date are required."); return; }
    setLoading(true);
    setError("");
    const result = await createListing({ data: { token, title, description, start_date: startDate, end_date: endDate, animals, tasks, compensation_type: compType, compensation_amount: compAmount ? parseFloat(compAmount) : undefined } });
    if (result.ok) navigate({ to: "/dashboard" });
    else setError(result.message);
    setLoading(false);
  };

  return (
    <div className="min-h-dvh bg-gray-50 px-6 py-12 dark:bg-gray-950">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Post a New Listing</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Tell sitters about your farm and what you need.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6 rounded-2xl border border-gray-200 bg-white p-8 dark:border-gray-800 dark:bg-gray-900">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
            <input required value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 block w-full rounded-xl border border-gray-300 px-4 py-2.5 dark:border-gray-700 dark:bg-gray-800 dark:text-white" placeholder="e.g. Weekend horse and chicken sitter needed" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="mt-1 block w-full rounded-xl border border-gray-300 px-4 py-2.5 dark:border-gray-700 dark:bg-gray-800 dark:text-white" placeholder="Describe your farm, the animals, daily tasks, and what sitters should expect..." />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Start date</label>
              <input type="date" required value={startDate} onChange={(e) => setStartDate(e.target.value)} className="mt-1 block w-full rounded-xl border border-gray-300 px-4 py-2.5 dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">End date</label>
              <input type="date" required value={endDate} onChange={(e) => setEndDate(e.target.value)} className="mt-1 block w-full rounded-xl border border-gray-300 px-4 py-2.5 dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Animals</label>
            <div className="mt-1 flex flex-wrap gap-2">
              {animals.map((a) => <span key={a} className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-sm text-amber-700">🐄 {a} <button type="button" onClick={() => setAnimals(animals.filter((x) => x !== a))} className="hover:text-amber-900">&times;</button></span>)}
            </div>
            <div className="mt-2 flex gap-2">
              <input value={animalInput} onChange={(e) => setAnimalInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addAnimal())} className="block flex-1 rounded-xl border border-gray-300 px-4 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white" placeholder="e.g. Horses, chickens..." />
              <button type="button" onClick={addAnimal} className="rounded-xl bg-gray-100 px-4 py-2 text-sm font-medium hover:bg-gray-200">Add</button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tasks</label>
            <div className="mt-1 flex flex-wrap gap-2">
              {tasks.map((t) => <span key={t} className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-sm text-green-700">{t} <button type="button" onClick={() => setTasks(tasks.filter((x) => x !== t))} className="hover:text-green-900">&times;</button></span>)}
            </div>
            <div className="mt-2 flex gap-2">
              <input value={taskInput} onChange={(e) => setTaskInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTask())} className="block flex-1 rounded-xl border border-gray-300 px-4 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white" placeholder="e.g. Feeding, watering, mucking..." />
              <button type="button" onClick={addTask} className="rounded-xl bg-gray-100 px-4 py-2 text-sm font-medium hover:bg-gray-200">Add</button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Compensation</label>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {(["free_stay", "paid", "negotiable"] as const).map((t) => (
                <button key={t} type="button" onClick={() => setCompType(t)} className={`rounded-xl border-2 px-3 py-2 text-sm font-medium ${compType === t ? "border-green-500 bg-green-50 text-green-700" : "border-gray-200 text-gray-600 hover:border-gray-300 dark:border-gray-700 dark:text-gray-400"}`}>
                  {t === "free_stay" ? "Free Stay" : t === "paid" ? "Paid" : "Negotiable"}
                </button>
              ))}
            </div>
            {compType === "paid" && (
              <input type="number" step="0.01" min="0" value={compAmount} onChange={(e) => setCompAmount(e.target.value)} className="mt-2 block w-full rounded-xl border border-gray-300 px-4 py-2 dark:border-gray-700 dark:bg-gray-800 dark:text-white" placeholder="Amount ($)" />
            )}
          </div>

          {error && <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

          <button type="submit" disabled={loading} className="w-full rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50">
            {loading ? "Posting..." : "Post Listing"}
          </button>
        </form>
      </div>
    </div>
  );
}