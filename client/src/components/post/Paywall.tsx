"use client";

import { Creator } from "@/types";
import { Badge, Button, Card } from "../ui";
import { formatSui } from "@/utils/format";

interface PaywallProps {
  creator: Creator;
  isSubscribing?: boolean;
  onSubscribe?: () => void;
}

export function Paywall({ creator, isSubscribing, onSubscribe }: PaywallProps) {
  return (
    <Card className="text-center">
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
        style={{ backgroundColor: "var(--border-color)" }}
      >
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--accent)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      </div>
      <h3
        className="text-xl font-bold mb-2"
        style={{ color: "var(--text-primary)" }}
      >
        Subscribe to unlock
      </h3>
      <p className="mb-6" style={{ color: "var(--text-secondary)" }}>
        Get access to this post and all exclusive content from {creator.name}
      </p>
      <div className="flex items-center justify-center gap-4">
        {creator.tiers.length > 0 ? (
          <Button onClick={onSubscribe} disabled={isSubscribing}>
            {isSubscribing
              ? "Subscribing..."
              : `Subscribe (from ${formatSui(Math.min(...creator.tiers.map(t => t.price)))} SUI)`}
          </Button>
        ) : (
          <Badge variant="default">No subscription tiers available</Badge>
        )}
        <Badge variant="price">{creator.subscriberCount} subscribers</Badge>
      </div>
    </Card>
  );
}
