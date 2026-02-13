"use client";

import { Creator } from "@/types";
import { Avatar, Badge, Button } from "../ui";
import { formatAddress } from "@/utils/format";

interface CreatorHeaderProps {
  creator: Creator;
  postsCount: number;
  isSubscribed: boolean;
  onSubscribe?: () => void;
}

export function CreatorHeader({
  creator,
  postsCount,
  isSubscribed,
  onSubscribe,
}: CreatorHeaderProps) {
  return (
    <div
      className="p-8 rounded-xl mb-8"
      style={{
        backgroundColor: "var(--bg-secondary)",
        border: "1px solid var(--border-color)",
      }}
    >
      <div className="flex items-start gap-6">
        <Avatar name={creator.name} size="lg" />

        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h1
                className="text-3xl font-bold mb-1"
                style={{ color: "var(--text-primary)" }}
              >
                {creator.name}
              </h1>
              <p
                className="text-sm mb-4"
                style={{ color: "var(--text-secondary)" }}
              >
                {formatAddress(creator.address)}
              </p>
            </div>

            {isSubscribed ? (
              <Badge variant="success">Subscribed</Badge>
            ) : (
              <Button onClick={onSubscribe}>
                Subscribe ({creator.subscriptionPrice} SUI)
              </Button>
            )}
          </div>

          <p
            className="text-lg mb-4"
            style={{ color: "var(--text-secondary)" }}
          >
            {creator.bio}
          </p>

          <div className="flex items-center gap-6">
            <span style={{ color: "var(--text-secondary)" }}>
              <strong style={{ color: "var(--text-primary)" }}>
                {creator.subscriberCount}
              </strong>{" "}
              subscribers
            </span>
            <span style={{ color: "var(--text-secondary)" }}>
              <strong style={{ color: "var(--text-primary)" }}>
                {postsCount}
              </strong>{" "}
              posts
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
