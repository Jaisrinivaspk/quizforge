"use client";

import { useState, FormEvent } from "react";

export default function GeneratePage() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [mcq, setMcq] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMcq(null);

    try {
      const res = await fetch("http://127.0.0.1:8000/generate-mcq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) {
        throw new Error("Backend error");
      }

      const data = await res.json();
      setMcq(data);
    } catch (err) {
      console.error(err);
      setError("Failed to generate question. Check backend logs.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
      <div className="max-w-2xl w-full p-6">
        <h1 className="text-3xl font-bold mb-4">Generate an MCQ</h1>
        <p className="mb-4 text-sm text-slate-300">
          Paste a paragraph of content below and click &quot;Generate&quot;.
        </p>

        <form onSubmit={handleGenerate} className="space-y-4">
          <textarea
            className="w-full h-40 rounded-md p-3 text-black"
            placeholder="Paste your content here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            required
          />

          <button
            type="submit"
            className="px-4 py-2 rounded-md bg-blue-500 hover:bg-blue-600 disabled:opacity-60"
            disabled={loading || !text}
          >
            {loading ? "Generating..." : "Generate MCQ"}
          </button>
        </form>

        {error && <p className="mt-4 text-red-400 text-sm">{error}</p>}

        {mcq && (
          <div className="mt-6 border border-slate-700 rounded-md p-4 bg-slate-800">
            <h2 className="font-semibold mb-2">Generated Question</h2>
            <p className="mb-3">{mcq.question}</p>
            <ol className="list-decimal ml-5 space-y-1">
              {mcq.options?.map((opt: string, i: number) => (
                <li key={i}>{opt}</li>
              ))}
            </ol>
            <p className="mt-3">
              <span className="font-semibold">Answer:</span> {mcq.answer}
            </p>
            <p className="mt-1 text-sm text-slate-300">
              <span className="font-semibold">Explanation:</span> {mcq.explanation}
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
