"use client";

import { useParams } from "next/navigation";
import { getPostById, getCreatorByAddress } from "@/data/mock";
import { BackLink, NotFound } from "@/components/common";
import { PostAuthor, PostContent } from "@/components/post";

export default function PostViewPage() {
  const params = useParams();
  const postId = params.id as string;

  const post = getPostById(postId);
  const creator = post ? getCreatorByAddress(post.creatorAddress) : undefined;

  // Mock subscription status - will be replaced with real check
  const isSubscribed = false;

  if (!post || !creator) {
    return <NotFound title="Post not found" />;
  }

  return (
    <div className="page-container py-8 max-w-3xl mx-auto">
      <BackLink href={`/creator/${creator.address}`}>
        Back to {creator.name}
      </BackLink>

      <article>
        <h1
          className="text-3xl font-bold mb-4"
          style={{ color: "var(--text-primary)" }}
        >
          {post.title}
        </h1>

        <PostAuthor creator={creator} date={post.createdAt} />

        <PostContent
          post={post}
          creator={creator}
          isSubscribed={isSubscribed}
        />
      </article>
    </div>
  );
}
