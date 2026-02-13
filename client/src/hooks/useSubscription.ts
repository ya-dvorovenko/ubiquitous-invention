"use client";

import { useQuery } from "@tanstack/react-query";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { graphqlQuery } from "@/lib/graphql/client";
import { USER_SUBSCRIPTIONS_QUERY, CREATOR_PROFILE_QUERY } from "@/lib/graphql/queries";
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

interface CreatorProfileResponse {
  object: {
    asMoveObject: {
      contents: {
        json: {
          name: string;
          owner: string;
        };
      };
    };
  } | null;
}

async function fetchCreatorInfo(
  profileId: string
): Promise<{ name: string; address: string } | null> {
  try {
    const data = await graphqlQuery<CreatorProfileResponse>(CREATOR_PROFILE_QUERY, {
      id: profileId,
    });
    if (data.object?.asMoveObject?.contents?.json) {
      return {
        name: data.object.asMoveObject.contents.json.name,
        address: data.object.asMoveObject.contents.json.owner,
      };
    }
    return null;
  } catch {
    return null;
  }
}

async function fetchUserSubscriptions(
  ownerAddress: string
): Promise<Subscription[]> {
  const rawSubscriptions: Array<{
    id: string;
    profileId: string;
    subscriberAddress: string;
    expiresAt: string;
    createdAt: string;
  }> = [];
  let cursor: string | null = null;
  let hasNextPage = true;

  try {
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
        rawSubscriptions.push({
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

    // Enrich subscriptions with creator info
    const subscriptions = await Promise.all(
      rawSubscriptions.map(async (sub) => {
        const creatorInfo = await fetchCreatorInfo(sub.profileId);
        return {
          ...sub,
          creatorName: creatorInfo?.name,
          creatorAddress: creatorInfo?.address,
        };
      })
    );

    return subscriptions;
  } catch (error) {
    throw error;
  }
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
