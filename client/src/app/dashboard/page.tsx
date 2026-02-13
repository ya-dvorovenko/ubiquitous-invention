"use client";

import { useCurrentAccount } from "@mysten/dapp-kit";
import { CreatePostForm } from "@/components/dashboard";
import { PostList } from "@/components/post";
import { getPostsByCreator } from "@/data/mock";

export default function DashboardPage() {
  const currentAccount = useCurrentAccount();

  const creatorPosts = currentAccount
    ? getPostsByCreator(currentAccount.address)
    : [];

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
            Your Posts
          </h2>
          <PostList
            posts={creatorPosts}
            emptyMessage="You haven't published any posts yet"
          />
        </div>
      </div>
    </div>
  );
}
