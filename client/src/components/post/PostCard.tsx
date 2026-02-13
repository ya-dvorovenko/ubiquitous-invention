"use client";

import Link from "next/link";
import { Post } from "@/types";
import { Card } from "../ui";

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  return (
    <Link href={`/post/${post.id}`}>
      <Card hoverable>
        <div className="flex items-start justify-between mb-2">
          <h3
            className="text-lg font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            {post.title}
          </h3>
          <span
            className="text-sm flex-shrink-0 ml-4"
            style={{ color: "var(--text-secondary)" }}
          >
            {post.createdAt}
          </span>
        </div>
        <p
          className="text-sm"
          style={{ color: "var(--text-secondary)" }}
        >
          {post.preview}
        </p>
      </Card>
    </Link>
  );
}
