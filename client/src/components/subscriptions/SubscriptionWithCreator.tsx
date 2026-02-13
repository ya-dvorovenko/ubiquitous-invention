"use client";

import { Subscription } from "@/types";
import { useCreatorByProfileId } from "@/hooks";
import { SubscriptionCard } from "./SubscriptionCard";

interface SubscriptionWithCreatorProps {
  subscription: Subscription;
}

export function SubscriptionWithCreator({ subscription }: SubscriptionWithCreatorProps) {
  const { data: creator, isLoading } = useCreatorByProfileId(subscription.profileId);

  return (
    <SubscriptionCard
      subscription={subscription}
      creator={creator}
      isLoading={isLoading}
    />
  );
}
