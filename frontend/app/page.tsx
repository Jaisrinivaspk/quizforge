"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [backendStatus, setBackendStatus] = useState<string>("Checking...");

  useEffect(() => {
    async function checkBackend() {
      try {
        const res = await fetch("http://127.0.0.1:8000/ping");
        if (!res.ok) {
          throw new Error("Not ok");
        }
        const data = await res.json();
        setBackendStatus(`✅ ${data.message}`);
      } catch (err) {
        console.error(err);
        setBackendStatus("❌ Cannot reach backend");
      }
    }

    checkBackend();
  }, []);

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
        <h1 style={{ fontSize: "2.5rem", marginBottom: 16 }}>
          QuizForge
        </h1>
        <p style={{ fontSize: "1.1rem", marginBottom: 24 }}>
          Turn your PDFs and lecture notes into ready-made quizzes in minutes.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            alert("Later this will collect emails.");
          }}
        >
          <input
            type="email"
            placeholder="Enter your email to join the waitlist"
            required
            style={{
              padding: "10px 12px",
              borderRadius: 8,
              border: "none",
              width: "100%",
              maxWidth: 320,
              marginBottom: 12,
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

        <div style={{ marginTop: 32, fontSize: "0.9rem", opacity: 0.9 }}>
          <p>Backend status: {backendStatus}</p>
        </div>
      </div>
    </main>
  );
}
