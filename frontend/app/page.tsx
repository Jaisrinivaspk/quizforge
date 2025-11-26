"use client";

import { useEffect, useState, FormEvent } from "react";
import Link from "next/link";

export default function Home() {
  const [backendStatus, setBackendStatus] = useState<string>("Checking...");
  const [email, setEmail] = useState("");
  const [waitlistMessage, setWaitlistMessage] = useState<string | null>(null);

  useEffect(() => {
    async function checkBackend() {
      try {
        const res = await fetch("http://127.0.0.1:8000/ping");
        if (!res.ok) throw new Error("Not ok");
        const data = await res.json();
        setBackendStatus(`✅ ${data.message}`);
      } catch (err) {
        console.error(err);
        setBackendStatus("❌ Cannot reach backend");
      }
    }
    checkBackend();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setWaitlistMessage(null);

    try {
      const res = await fetch("http://127.0.0.1:8000/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) throw new Error("Request failed");

      const data = await res.json();
      setWaitlistMessage("✅ Thanks! You’re on the waitlist.");
      setEmail("");
    } catch (err) {
      console.error(err);
      setWaitlistMessage("❌ Something went wrong. Please try again.");
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0f172a",
        color: "white",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ maxWidth: 600, textAlign: "center", padding: 24 }}>
        <h1 style={{ fontSize: "2.5rem", marginBottom: 16 }}>QuizForge</h1>
        <p style={{ fontSize: "1.1rem", marginBottom: 24 }}>
          Turn your PDFs and lecture notes into ready-made quizzes in minutes.
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Enter your email to join the waitlist"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              padding: "10px 12px",
              borderRadius: 8,
              border: "none",
              width: "100%",
              maxWidth: 320,
              marginBottom: 12,
              color: "black",
            }}
          />
          <br />
          <button
            type="submit"
            style={{
              padding: "10px 20px",
              borderRadius: 8,
              border: "none",
              background: "#3b82f6",
              color: "white",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Join Waitlist
          </button>
        </form>

        <p style={{ marginTop: 24 }}>
          <Link href="/generate">
            <span style={{ textDecoration: "underline", cursor: "pointer" }}>
              Try the MCQ generator →
            </span>
          </Link>
        </p>
        
        <p style={{ marginTop: 12 }}>
          <Link href="/quiz-from-text">
            <span style={{ textDecoration: "underline", cursor: "pointer" }}>
              Generate full quiz from text →
            </span>
          </Link>
        </p>     

        {waitlistMessage && (
          <p style={{ marginTop: 12, fontSize: "0.9rem" }}>
            {waitlistMessage}
          </p>
        )}

        <div style={{ marginTop: 32, fontSize: "0.9rem", opacity: 0.9 }}>
          <p>Backend status: {backendStatus}</p>
        </div>
      </div>
    </main>
  );
}
