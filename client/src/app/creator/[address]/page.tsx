"use client";

import { useParams } from "next/navigation";
import { BackLink, NotFound } from "@/components/common";
import { CreatorHeader } from "@/components/creator";
import { PostList } from "@/components/post";
import { PotatoLoader } from "@/components/ui";
import { useCreatorByAddress, useCreatorPosts, useIsSubscribed } from "@/hooks";

export default function CreatorProfilePage() {
  const params = useParams();
  const address = params.address as string;

  const { data: creator, isLoading: isLoadingCreator } = useCreatorByAddress(address);
  const { data: posts, isLoading: isLoadingPosts } = useCreatorPosts(
    creator?.profileId || "",
    address
  );
  const { isSubscribed } = useIsSubscribed(creator?.profileId || "");

  if (isLoadingCreator) {
    return (
      <div className="page-container py-8 flex justify-center">
        <PotatoLoader />
      </div>
    );
  }

  if (!creator) {
    return <NotFound title="Creator not found" />;
  }

  return (
    <div className="page-container py-8">
      <BackLink href="/">Back to creators</BackLink>

      <CreatorHeader
        creator={creator}
        postsCount={posts?.length || 0}
        isSubscribed={isSubscribed}
      />

      <h2
        className="text-xl font-bold mb-4"
        style={{ color: "var(--text-primary)" }}
      >
        Posts
      </h2>

      {isLoadingPosts ? (
        <div className="flex justify-center py-8">
          <PotatoLoader />
        </div>
      ) : (
        <PostList posts={posts || []} emptyMessage="No posts yet" />
      )}
    </div>
  );
}
