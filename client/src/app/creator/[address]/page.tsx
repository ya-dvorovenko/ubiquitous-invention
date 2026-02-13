"use client";

import { useParams } from "next/navigation";
import { getCreatorByAddress, getPostsByCreator } from "@/data/mock";
import { BackLink, NotFound } from "@/components/common";
import { CreatorHeader } from "@/components/creator";
import { PostList } from "@/components/post";

export default function CreatorProfilePage() {
  const params = useParams();
  const address = params.address as string;

  const creator = getCreatorByAddress(address);
  const posts = getPostsByCreator(address);

  // Mock subscription status - will be replaced with real check
  const isSubscribed = false;

  if (!creator) {
    return <NotFound title="Creator not found" />;
  }

  return (
    <div className="page-container py-8">
      <BackLink href="/">Back to creators</BackLink>

      <CreatorHeader
        creator={creator}
        postsCount={posts.length}
        isSubscribed={isSubscribed}
      />

      <h2
        className="text-xl font-bold mb-4"
        style={{ color: "var(--text-primary)" }}
      >
        Posts
      </h2>

      <PostList posts={posts} emptyMessage="No posts yet" />
    </div>
  );
}
