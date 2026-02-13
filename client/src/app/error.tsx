"use client";

import { useEffect } from "react";
import { SadPotato } from "@/components/ui";
import { Button } from "@/components/ui";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("Error:", error);
  }, [error]);

  return (
    <div className="page-container py-16">
      <div className="flex flex-col items-center justify-center text-center">
        <SadPotato size="lg" />

        <h1
          className="text-4xl font-bold mt-8 mb-4"
          style={{ color: "var(--text-primary)" }}
        >
          Oops!
        </h1>

        <p
          className="text-lg mb-2"
          style={{ color: "var(--text-secondary)" }}
        >
          Something went wrong
        </p>

        <p
          className="text-sm mb-8 max-w-md"
          style={{ color: "var(--text-secondary)" }}
        >
          {error.message || "An unexpected error occurred. Please try again."}
        </p>

        <div className="flex gap-4">
          <Button onClick={reset}>
            Try Again
          </Button>
          <Button
            variant="secondary"
            onClick={() => window.location.href = "/"}
          >
            Go Home
          </Button>
        </div>
      </div>
    </div>
  );
}
