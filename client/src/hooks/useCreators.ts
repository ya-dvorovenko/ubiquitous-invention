"use client";

import { useQuery } from "@tanstack/react-query";
import { graphqlQuery } from "@/lib/graphql/client";
import {
  CREATOR_REGISTERED_EVENTS_QUERY,
  CREATOR_PROFILE_QUERY,
} from "@/lib/graphql/queries";
import { Creator } from "@/types";

interface CreatorRegisteredEvent {
  profile_id: string;
  owner: string;
  name: string;
}

interface EventNode {
  timestamp: string;
  contents: {
    json: CreatorRegisteredEvent;
  };
}

interface EventsResponse {
  events: {
    pageInfo: {
      hasNextPage: boolean;
      endCursor: string | null;
    };
    nodes: EventNode[];
  };
}

interface TierJson {
  duration_ms: string;
  price: string;
}

interface ProfileResponse {
  object: {
    address: string;
    version: number;
    asMoveObject: {
      contents: {
        json: {
          id: { id: string };
          owner: string;
          name: string;
          bio: string;
          x_profile: string;
          avatar_blob_id: string;
          tiers: TierJson[];
          total_posts: string;
          total_subs: string;
          created_at: string;
        };
      };
    };
  } | null;
}

async function fetchCreatorProfile(profileId: string): Promise<Creator | null> {
  try {
    const data = await graphqlQuery<ProfileResponse>(CREATOR_PROFILE_QUERY, {
      id: profileId,
    });

    if (!data.object?.asMoveObject) {
      return null;
    }

    const profile = data.object.asMoveObject.contents.json;
    const tiers = (profile.tiers || []).map((t: TierJson) => ({
      durationMs: parseInt(t.duration_ms, 10),
      price: parseInt(t.price, 10),
    }));
    return {
      address: profile.owner,
      name: profile.name,
      bio: profile.bio,
      subscriberCount: parseInt(profile.total_subs, 10),
      tiers,
      profileId: data.object.address,
      twitter: profile.x_profile || undefined,
      avatarBlobId: profile.avatar_blob_id || undefined,
    };
  } catch {
    return null;
  }
}

async function fetchAllCreators(): Promise<Creator[]> {
  const creators: Creator[] = [];
  let cursor: string | null = null;
  let hasNextPage = true;

  try {
    while (hasNextPage) {
      const data: EventsResponse = await graphqlQuery<EventsResponse>(
        CREATOR_REGISTERED_EVENTS_QUERY,
        { after: cursor }
      );

      const profileIds = data.events.nodes.map((node: EventNode) => node.contents.json.profile_id);

      const profiles = await Promise.all(
        profileIds.map((id: string) => fetchCreatorProfile(id))
      );

      creators.push(...profiles.filter((p): p is Creator => p !== null));

      hasNextPage = data.events.pageInfo.hasNextPage;
      cursor = data.events.pageInfo.endCursor;
    }

    return creators;
  } catch (error) {
    throw error;
  }
}

export function useCreators() {
  return useQuery<Creator[]>({
    queryKey: ["creators"],
    queryFn: fetchAllCreators,
    staleTime: 30000,
  });
}

export function useCreatorByAddress(address: string) {
  const { data: creators, ...rest } = useCreators();

  const creator = creators?.find((c) => c.address === address);

  return {
    data: creator,
    ...rest,
  };
}

export function useCreatorByProfileId(profileId: string) {
  return useQuery<Creator | null>({
    queryKey: ["creator", profileId],
    queryFn: () => fetchCreatorProfile(profileId),
    enabled: !!profileId,
    staleTime: 30000,
  });
}
