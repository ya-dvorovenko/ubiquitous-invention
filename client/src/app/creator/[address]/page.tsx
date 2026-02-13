"use client";

import { useParams } from "next/navigation";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { BackLink, NotFound } from "@/components/common";
import { CreatorHeader } from "@/components/creator";
import { PostList } from "@/components/post";
import { PotatoLoader } from "@/components/ui";
import {
  useCreatorByAddress,
  useCreatorPosts,
  useIsSubscribed,
  useSubscribe,
} from "@/hooks";

export default function CreatorProfilePage() {
  const params = useParams();
  const address = params.address as string;
  const currentAccount = useCurrentAccount();

  const { data: creator, isLoading: isLoadingCreator } = useCreatorByAddress(address);
  const { data: posts, isLoading: isLoadingPosts } = useCreatorPosts(
    creator?.profileId || "",
    address
  );
  const { isSubscribed } = useIsSubscribed(creator?.profileId || "");
  const { subscribe, isPending: isSubscribing } = useSubscribe();

  const handleSubscribe = async () => {
    if (!creator?.profileId || !currentAccount) return;

    try {
      await subscribe({
        profileId: creator.profileId,
        price: creator.subscriptionPrice,
      });
    } catch (error) {
      console.error("Subscribe failed:", error);
      alert(error instanceof Error ? error.message : "Subscribe failed");
    }
  };

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
        isSubscribing={isSubscribing}
        onSubscribe={handleSubscribe}
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
