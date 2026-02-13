"use client";

import { Post, Creator } from "@/types";
import { Card, MediaGallery } from "../ui";
import { Paywall } from "./Paywall";

interface PostContentProps {
  post: Post;
  creator: Creator;
  isSubscribed: boolean;
  onSubscribe?: () => void;
}

export function PostContent({
  post,
  creator,
  isSubscribed,
  onSubscribe,
}: PostContentProps) {
  if (isSubscribed) {
    return (
      <div className="flex flex-col gap-6">
        {post.media && post.media.length > 0 && (
          <MediaGallery media={post.media} />
        )}
        <Card>
          <div style={{ color: "var(--text-primary)" }}>{post.content}</div>
        </Card>
      </div>
    );
  }

  return (
    <div>
      {post.previewMedia && post.previewMedia.length > 0 && (
        <div className="mb-6">
          <MediaGallery media={post.previewMedia} />
        </div>
      )}

      <Card className="mb-6">
        <p style={{ color: "var(--text-secondary)" }}>{post.preview}</p>
      </Card>

      {post.media && post.media.length > 0 && (
        <div className="mb-6">
          <p
            className="text-sm mb-2"
            style={{ color: "var(--text-secondary)" }}
          >
            {post.media.length} exclusive{" "}
            {post.media.length === 1 ? "media" : "media files"} for subscribers
          </p>
          <MediaGallery media={post.media.slice(0, 3)} blur />
        </div>
      )}

      <Paywall creator={creator} onSubscribe={onSubscribe} />
    </div>
  );
}
