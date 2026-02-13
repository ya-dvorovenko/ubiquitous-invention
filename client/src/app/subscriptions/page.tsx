"use client";

import { useCurrentAccount } from "@mysten/dapp-kit";
import { useUserSubscriptions } from "@/hooks";
import { PotatoLoader, Card } from "@/components/ui";
import {
  SubscriptionsList,
  ConnectWalletPrompt,
} from "@/components/subscriptions";

export default function SubscriptionsPage() {
  const currentAccount = useCurrentAccount();
  const { data: subscriptions, isLoading, error } = useUserSubscriptions();

  if (!currentAccount) {
    return (
      <div className="page-container py-8">
        <ConnectWalletPrompt />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="page-container py-8">
        <h1
          className="text-3xl font-bold mb-8"
          style={{ color: "var(--text-primary)" }}
        >
          My Subscriptions
        </h1>
        <div className="flex justify-center py-12">
          <PotatoLoader fullScreen size="lg" text="Loading subscriptions..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container py-8">
        <h1
          className="text-3xl font-bold mb-8"
          style={{ color: "var(--text-primary)" }}
        >
          My Subscriptions
        </h1>
        <Card>
          <p className="text-red-500 text-center">
            Failed to load subscriptions. Please try again.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="page-container py-8">
      <h1
        className="text-3xl font-bold mb-2"
        style={{ color: "var(--text-primary)" }}
      >
        My Subscriptions
      </h1>
      <p
        className="mb-8"
        style={{ color: "var(--text-secondary)" }}
      >
        Creators you are following
      </p>

      <SubscriptionsList subscriptions={subscriptions || []} />
    </div>
  );
}
