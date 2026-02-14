"use client";

import { useRouter } from "next/navigation";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useIsCreator, useCreatorPosts, usePublishPost } from "@/hooks";
import { CreatePostForm } from "@/components/dashboard";
import { PostList } from "@/components/post";
import { PotatoLoader, useToast } from "@/components/ui";

export default function DashboardPage() {
  const router = useRouter();
  const currentAccount = useCurrentAccount();
  const { isCreator, creatorProfile, isLoading: isCreatorLoading } = useIsCreator();
  const { data: posts, isLoading: isPostsLoading } = useCreatorPosts(
    creatorProfile?.profileId || "",
    creatorProfile?.address || ""
  );
  const { publishPost } = usePublishPost();
  const { showToast } = useToast();

  const handlePublish = async (data: {
    title: string;
    preview: string;
    content: string;
  }) => {
    if (!creatorProfile?.profileId) {
      showToast("Profile not found", "error");
      return;
    }

    try {
      await publishPost({
        profileId: creatorProfile.profileId,
        title: data.title,
        preview: data.preview,
        blobId: data.content, // TODO: Replace with actual Walrus blob ID
        encrypted: true,
      });

      showToast("Post published successfully!", "success");
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Failed to publish post",
        "error"
      );
    }
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
          <PotatoLoader fullScreen size="lg" text="Loading..." />
        </div>
      </div>
    );
  }

  if (!isCreator) {
    return (
      <div className="page-container py-8">
        <div className="text-center">
          <h1
            className="text-2xl font-bold mb-4"
            style={{ color: "var(--text-primary)" }}
          >
            Creator Dashboard
          </h1>
          <p style={{ color: "var(--text-secondary)" }} className="mb-4">
            You need to be a creator to access this page.
          </p>
          <button
            onClick={() => router.push("/register")}
            className="px-4 py-2 rounded-lg"
            style={{
              backgroundColor: "var(--accent-primary)",
              color: "var(--text-on-accent)",
            }}
          >
            Become a Creator
          </button>
        </div>
      </div>
    );
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
              <PotatoLoader fullScreen text="Loading posts..." />
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
