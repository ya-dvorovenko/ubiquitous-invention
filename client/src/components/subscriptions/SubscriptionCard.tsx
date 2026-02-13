"use client";

import Link from "next/link";
import { Subscription, Creator } from "@/types";
import { Avatar, Badge, Card } from "@/components/ui";
import { formatAddress, formatSui } from "@/utils/format";

interface SubscriptionCardProps {
  subscription: Subscription;
  creator: Creator | null | undefined;
  isLoading: boolean;
}

export function SubscriptionCard({
  subscription,
  creator,
  isLoading,
}: SubscriptionCardProps) {
  const expiresAt = new Date(subscription.expiresAt);
  const isActive = expiresAt > new Date();
  const daysLeft = Math.ceil(
    (expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  if (isLoading) {
    return (
      <Card>
        <div className="animate-pulse flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gray-600" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-600 rounded w-1/3" />
            <div className="h-3 bg-gray-600 rounded w-1/4" />
          </div>
        </div>
      </Card>
    );
  }

  if (!creator) {
    return null;
  }

  return (
    <Link href={`/creator/${creator.address}`}>
      <Card hoverable>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Avatar name={creator.name} size="lg" />
            <div>
              <h3
                className="font-semibold text-lg"
                style={{ color: "var(--text-primary)" }}
              >
                {creator.name}
              </h3>
              <p
                className="text-sm"
                style={{ color: "var(--text-secondary)" }}
              >
                {formatAddress(creator.address)}
              </p>
            </div>
          </div>

          <div className="text-right">
            <Badge variant={isActive ? "success" : "default"}>
              {isActive ? "Active" : "Expired"}
            </Badge>
            {isActive && (
              <p
                className="text-sm mt-1"
                style={{ color: "var(--text-secondary)" }}
              >
                {daysLeft} days left
              </p>
            )}
          </div>
        </div>

        <div className="mt-4 pt-4 border-t" style={{ borderColor: "var(--border-color)" }}>
          <div className="flex items-center justify-between text-sm">
            <span style={{ color: "var(--text-secondary)" }}>
              {creator.subscriberCount} subscribers
            </span>
            <span style={{ color: "var(--text-secondary)" }}>
              {formatSui(creator.subscriptionPrice)} SUI/year
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
