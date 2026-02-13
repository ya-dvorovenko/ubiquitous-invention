"use client";

import { useQuery } from "@tanstack/react-query";
import { graphqlQuery } from "@/lib/graphql/client";
import { CREATOR_POSTS_QUERY } from "@/lib/graphql/queries";
import { Post } from "@/types";

interface PostData {
  post_id: string;
  title: string;
  preview: string;
  blob_id: string;
  encrypted: boolean;
  created_at: string;
}

interface DynamicFieldsResponse {
  object: {
    dynamicFields: {
      pageInfo: {
        hasNextPage: boolean;
        endCursor: string | null;
      };
      nodes: Array<{
        name: {
          json: { post_id: string };
        };
        value: {
          json: PostData;
        };
      }>;
    };
  } | null;
}

async function fetchCreatorPosts(
  profileId: string,
  creatorAddress: string
): Promise<Post[]> {
  const posts: Post[] = [];
  let cursor: string | null = null;
  let hasNextPage = true;

  while (hasNextPage) {
    const data = await graphqlQuery<DynamicFieldsResponse>(
      CREATOR_POSTS_QUERY,
      {
        profileId,
        after: cursor,
      }
    );

    if (!data.object?.dynamicFields) break;

    const nodes = data.object.dynamicFields.nodes;

    // Filter only PostKey dynamic fields (they have post_id in name)
    const postNodes = nodes.filter(
      (node) => node.name?.json?.post_id !== undefined
    );

    for (const node of postNodes) {
      const postData = node.value.json;
      posts.push({
        id: postData.post_id,
        creatorAddress,
        title: postData.title,
        preview: postData.preview,
        createdAt: new Date(parseInt(postData.created_at, 10)).toISOString(),
        blobId: postData.blob_id,
        encrypted: postData.encrypted,
      });
    }

    hasNextPage = data.object.dynamicFields.pageInfo.hasNextPage;
    cursor = data.object.dynamicFields.pageInfo.endCursor;
  }

  // Sort by post_id descending (newest first)
  return posts.sort((a, b) => parseInt(b.id, 10) - parseInt(a.id, 10));
}

export function useCreatorPosts(profileId: string, creatorAddress: string) {
  return useQuery({
    queryKey: ["creatorPosts", profileId],
    queryFn: () => fetchCreatorPosts(profileId, creatorAddress),
    enabled: !!profileId && !!creatorAddress,
    staleTime: 30000,
  });
}
