"use client";

import { useParams } from "next/navigation";
import { useCurrentAccount } from "@mysten/dapp-kit";
import {
  useCreatorPosts,
  useCreatorByProfileId,
  useIsSubscribed,
  useSubscribe,
} from "@/hooks";
import { BackLink, NotFound } from "@/components/common";
import { PostAuthor, PostContent } from "@/components/post";
import { PotatoLoader, useToast } from "@/components/ui";

export default function PostViewPage() {
  const params = useParams();
  const postId = params.id as string;
  const currentAccount = useCurrentAccount();

  const [profileId, postIndex] = postId.includes("_")
    ? postId.split("_")
    : [postId, "0"];

  const { data: creator, isLoading: isCreatorLoading } =
    useCreatorByProfileId(profileId);
  const { data: posts, isLoading: isPostsLoading } = useCreatorPosts(
    profileId,
    creator?.address || "",
  );

  const { subscription, isSubscribed } = useIsSubscribed(profileId);
  const { subscribe, isPending: isSubscribing } = useSubscribe();
  const isOwnPost = currentAccount?.address === creator?.address;

  const isLoading = isCreatorLoading || isPostsLoading;

  const { showToast } = useToast();
  const isOwnProfile = currentAccount?.address === creator?.address;

  const handleSubscribe = async () => {
    if (!creator?.profileId || !currentAccount || isOwnProfile) return;

    try {
      await subscribe({
        profileId: creator.profileId,
        price: creator.tiers[0].price,
        tierIndex: 0,
      });
      showToast(`Subscribed to ${creator.name}!`, "success");
    } catch (error) {
      console.error("Subscribe failed:", error);
      showToast(
        error instanceof Error ? error.message : "Subscribe failed",
        "error",
      );
    }
  };

  if (isLoading || isSubscribing) {
    return (
      <div className="page-container py-8">
        <div className="flex justify-center py-12">
          <PotatoLoader fullScreen size="lg" text="Loading post..." />
        </div>
      </div>
    );
  }

  const post = posts?.find((p) => p.id === postIndex || p.id === postId);

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
          isSubscribed={isSubscribed || isOwnPost}
          subscription={subscription}
          isOwnPost={isOwnPost}
          onSubscribe={isOwnPost ? undefined : handleSubscribe}
        />
      </article>
    </div>
  );
}
