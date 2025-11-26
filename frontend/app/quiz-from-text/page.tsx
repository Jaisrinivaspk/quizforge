"use client";

import { useState, FormEvent } from "react";

type MCQ = {
  question: string;
  options: string[];
  answer: string;
  explanation?: string;
  difficulty?: string;
};

export default function QuizFromTextPage() {
  const [text, setText] = useState("");
  const [numQuestions, setNumQuestions] = useState(5);
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<MCQ[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setQuestions([]);

    try {
      const res = await fetch("http://127.0.0.1:8000/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, num_questions: numQuestions }),
      });

      if (!res.ok) {
        throw new Error("Backend error");
      }

      const data = await res.json();
      setQuestions(data.questions || []);
    } catch (err) {
      console.error(err);
      setError("Failed to generate quiz. Check backend and logs.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
      <div className="max-w-3xl w-full p-6">
        <h1 className="text-3xl font-bold mb-4">Generate Quiz from Text</h1>
        <p className="mb-4 text-sm text-slate-300">
          Paste your content and choose how many questions you want.
        </p>

        <form onSubmit={handleGenerate} className="space-y-4 mb-6">
          <textarea
            className="w-full h-48 rounded-md p-3 text-black"
            placeholder="Paste your chapter / notes here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            required
          />

          <div className="flex items-center gap-3">
            <label className="text-sm">
              Number of questions:
            </label>
            <input
              type="number"
              min={1}
              max={20}
              value={numQuestions}
              onChange={(e) => setNumQuestions(Number(e.target.value))}
              className="w-20 p-1 rounded text-black"
            />
          </div>

          <button
            type="submit"
            className="px-4 py-2 rounded-md bg-blue-500 hover:bg-blue-600 disabled:opacity-60"
            disabled={loading || !text}
          >
            {loading ? "Generating..." : "Generate Quiz"}
          </button>
        </form>

        {error && <p className="text-red-400 mb-4 text-sm">{error}</p>}

        {questions.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold mb-2">Generated Questions</h2>
            {questions.map((q, idx) => (
              <div
                key={idx}
                className="border border-slate-700 rounded-md p-4 bg-slate-800"
              >
                <p className="font-medium mb-2">
                  {idx + 1}. {q.question}
                </p>
                <ol className="list-decimal ml-6 space-y-1">
                  {q.options?.map((opt, i) => (
                    <li key={i}>{opt}</li>
                  ))}
                </ol>
                <p className="mt-2 text-sm">
                  <span className="font-semibold">Answer:</span> {q.answer}
                </p>
                {q.explanation && (
                  <p className="mt-1 text-xs text-slate-300">
                    <span className="font-semibold">Explanation:</span> {q.explanation}
                  </p>
                )}
                {q.difficulty && (
                  <p className="mt-1 text-xs text-slate-400">
                    Difficulty: {q.difficulty}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
