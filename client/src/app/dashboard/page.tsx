"use client";

import { useRouter } from "next/navigation";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useIsCreator, useCreatorPosts } from "@/hooks";
import { CreatePostForm } from "@/components/dashboard";
import { PostList } from "@/components/post";
import { PotatoLoader } from "@/components/ui";

export default function DashboardPage() {
  const router = useRouter();
  const currentAccount = useCurrentAccount();
  const { isCreator, creatorProfile, isLoading: isCreatorLoading } = useIsCreator();
  const { data: posts, isLoading: isPostsLoading } = useCreatorPosts(
    creatorProfile?.profileId || "",
    creatorProfile?.address || ""
  );

  const handlePublish = async () => {
    // TODO: Implement actual publish logic
    // 1. Upload media files to Walrus
    // 2. Encrypt content + media references with Seal
    // 3. Upload encrypted blob to Walrus
    // 4. Call publish_post() on smart contract

    await new Promise((resolve) => setTimeout(resolve, 1000));
    alert("Post published! (mock)");
  };

  if (!currentAccount) {
    return (
      <div className="page-container py-8">
        <div className="text-center">
          <h1
            className="text-2xl font-bold mb-4"
            style={{ color: "var(--text-primary)" }}
          >
            Creator Dashboard
          </h1>
          <p style={{ color: "var(--text-secondary)" }}>
            Please connect your wallet to access the dashboard
          </p>
        </div>
      </div>
    );
  }

  if (isCreatorLoading) {
    return (
      <div className="page-container py-8">
        <div className="flex justify-center py-12">
          <PotatoLoader size="lg" text="Loading..." />
        </div>
      </div>
    );
  }

  if (!isCreator) {
    router.push("/register");
    return null;
  }

  return (
    <div className="page-container py-8">
      <h1
        className="text-3xl font-bold mb-8"
        style={{ color: "var(--text-primary)" }}
      >
        Creator Dashboard
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2
            className="text-xl font-bold mb-4"
            style={{ color: "var(--text-primary)" }}
          >
            Create New Post
          </h2>
          <CreatePostForm onPublish={handlePublish} />
        </div>

        <div>
          <h2
            className="text-xl font-bold mb-4"
            style={{ color: "var(--text-primary)" }}
          >
            Your Posts ({posts?.length || 0})
          </h2>
          {isPostsLoading ? (
            <div className="flex justify-center py-8">
              <PotatoLoader text="Loading posts..." />
            </div>
          ) : (
            <PostList
              posts={posts || []}
              emptyMessage="You haven't published any posts yet"
            />
          )}
        </div>
      </div>
    </div>
  );
}
