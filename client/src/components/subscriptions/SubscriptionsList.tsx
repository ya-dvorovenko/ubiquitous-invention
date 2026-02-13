"use client";

import Link from "next/link";
import { Subscription } from "@/types";
import { Card } from "@/components/ui";
import { SubscriptionWithCreator } from "./SubscriptionWithCreator";

interface SubscriptionsListProps {
  subscriptions: Subscription[];
}

export function SubscriptionsList({ subscriptions }: SubscriptionsListProps) {
  const activeSubscriptions = subscriptions.filter(
    (s) => new Date(s.expiresAt) > new Date()
  );
  const expiredSubscriptions = subscriptions.filter(
    (s) => new Date(s.expiresAt) <= new Date()
  );

  if (subscriptions.length === 0) {
    return (
      <Card>
        <div className="text-center py-8">
          <p
            className="text-lg mb-4"
            style={{ color: "var(--text-secondary)" }}
          >
            You haven&apos;t subscribed to any creators yet
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-2 rounded-lg font-medium transition-colors"
            style={{
              backgroundColor: "var(--accent)",
              color: "var(--text-primary)",
            }}
          >
            Discover Creators
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {activeSubscriptions.length > 0 && (
        <div>
          <h2
            className="text-xl font-semibold mb-4"
            style={{ color: "var(--text-primary)" }}
          >
            Active ({activeSubscriptions.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeSubscriptions.map((subscription) => (
              <SubscriptionWithCreator
                key={subscription.id}
                subscription={subscription}
              />
            ))}
          </div>
        </div>
      )}

      {expiredSubscriptions.length > 0 && (
        <div>
          <h2
            className="text-xl font-semibold mb-4"
            style={{ color: "var(--text-secondary)" }}
          >
            Expired ({expiredSubscriptions.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 opacity-60">
            {expiredSubscriptions.map((subscription) => (
              <SubscriptionWithCreator
                key={subscription.id}
                subscription={subscription}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
