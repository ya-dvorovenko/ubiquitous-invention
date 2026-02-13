"use client";

import { SadPotato } from "@/components/ui";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ reset }: GlobalErrorProps) {
  return (
    <html>
      <body
        style={{
          backgroundColor: "#0a0a0a",
          color: "#fff",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem",
            textAlign: "center",
          }}
        >
          <SadPotato size="lg" />

          <h1
            style={{
              fontSize: "2.5rem",
              fontWeight: "bold",
              marginTop: "2rem",
              marginBottom: "1rem",
            }}
          >
            Oops!
          </h1>

          <p
            style={{
              fontSize: "1.125rem",
              color: "#888",
              marginBottom: "2rem",
            }}
          >
            Something went terribly wrong
          </p>

          <button
            onClick={reset}
            style={{
              backgroundColor: "#ffc445",
              color: "#000",
              padding: "0.75rem 1.5rem",
              borderRadius: "0.5rem",
              border: "none",
              fontWeight: 600,
              cursor: "pointer",
              fontSize: "1rem",
            }}
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}
