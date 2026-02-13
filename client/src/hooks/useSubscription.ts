"use client";

import { useQuery } from "@tanstack/react-query";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { graphqlQuery } from "@/lib/graphql/client";
import { USER_SUBSCRIPTIONS_QUERY } from "@/lib/graphql/queries";
import { Subscription } from "@/types";

interface SubscriptionData {
  id: { id: string };
  profile_id: string;
  expires_at: string;
  created_at: string;
}

interface SubscriptionNode {
  address: string;
  asMoveObject: {
    contents: {
      json: SubscriptionData;
    };
  };
}

interface SubscriptionsResponse {
  objects: {
    pageInfo: {
      hasNextPage: boolean;
      endCursor: string | null;
    };
    nodes: SubscriptionNode[];
  };
}

async function fetchUserSubscriptions(
  ownerAddress: string
): Promise<Subscription[]> {
  const subscriptions: Subscription[] = [];
  let cursor: string | null = null;
  let hasNextPage = true;

  while (hasNextPage) {
    const data: SubscriptionsResponse = await graphqlQuery<SubscriptionsResponse>(
      USER_SUBSCRIPTIONS_QUERY,
      {
        owner: ownerAddress,
        after: cursor,
      }
    );

    for (const node of data.objects.nodes as SubscriptionNode[]) {
      const sub = node.asMoveObject.contents.json;
      subscriptions.push({
        id: node.address,
        profileId: sub.profile_id,
        subscriberAddress: ownerAddress,
        expiresAt: new Date(parseInt(sub.expires_at, 10)).toISOString(),
        createdAt: new Date(parseInt(sub.created_at, 10)).toISOString(),
      });
    }

    hasNextPage = data.objects.pageInfo.hasNextPage;
    cursor = data.objects.pageInfo.endCursor;
  }

  return subscriptions;
}

export function useUserSubscriptions() {
  const currentAccount = useCurrentAccount();

  return useQuery<Subscription[]>({
    queryKey: ["subscriptions", currentAccount?.address],
    queryFn: () => fetchUserSubscriptions(currentAccount!.address),
    enabled: !!currentAccount?.address,
    staleTime: 30000,
  });
}

export function useIsSubscribed(profileId: string) {
  const { data: subscriptions, ...rest } = useUserSubscriptions();

  const subscription = subscriptions?.find((s) => {
    const isMatch = s.profileId === profileId;
    const isActive = new Date(s.expiresAt) > new Date();
    return isMatch && isActive;
  });

  return {
    isSubscribed: !!subscription,
    subscription,
    ...rest,
  };
}
