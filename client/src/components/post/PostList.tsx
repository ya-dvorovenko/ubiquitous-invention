"use client";

import { Post } from "@/types";
import { PostCard } from "./PostCard";
import { Card, PotatoLoader } from "../ui";

interface PostListProps {
  posts: Post[];
  emptyMessage?: string;
  isLoading?: boolean;
}

export function PostList({
  posts,
  emptyMessage = "No posts yet",
  isLoading = false,
}: PostListProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <PotatoLoader size="md" text="Loading posts..." />
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <Card>
        <p className="text-center" style={{ color: "var(--text-secondary)" }}>
          {emptyMessage}
        </p>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
