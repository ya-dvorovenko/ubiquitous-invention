"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  useCurrentAccount,
  useSuiClient,
} from "@mysten/dapp-kit";
import { useIsCreator, useCreatorPosts, usePublishPost } from "@/hooks";
import { SealClient } from "@mysten/seal";
import { CreatePostForm } from "@/components/dashboard";
import { PostList } from "@/components/post";
import { PotatoLoader, useToast } from "@/components/ui";
import { ClientWithCoreApi } from "@mysten/sui/client";
import { PACKAGE_ID, sealObjectIds } from "@/config/constants";
import { uploadFilesHttp, uploadBlobHttp } from "@/sdk/walrus-http";

interface MediaFile {
  file: File;
  preview: string;
  type: "image" | "video";
}

export default function DashboardPage() {
  const router = useRouter();
  const [isPublishing, setIsPublishing] = useState(false);
  const suiClient = useSuiClient() as ClientWithCoreApi;
  const currentAccount = useCurrentAccount();
  const {
    isCreator,
    creatorProfile,
    isLoading: isCreatorLoading,
  } = useIsCreator();

  const { data: posts, isLoading: isPostsLoading } = useCreatorPosts(
    creatorProfile?.profileId || "",
    creatorProfile?.address || "",
  );

  const { publishPost } = usePublishPost();

  const { showToast } = useToast();

  const handlePublish = async ({
    title,
    preview,
    content,
    mediaFiles,
  }: {
    title: string;
    preview: string;
    content: string;
    mediaFiles: MediaFile[];
  }) => {
    setIsPublishing(true);
    try {
      // TODO: Implement actual publish logic
      // 1. Upload media files to Walrus
      if (!creatorProfile?.profileId) {
        throw new Error("No creator profile found");
      }

      if (!currentAccount) {
        throw new Error("No account connected");
      }

      if (mediaFiles.length > 5) {
        throw new Error("Too many files uploaded");
      }

      if (!title || !preview || !content) {
        throw new Error("Title, preview and content are required");
      }

      let listOfMediaBlobIds: { blobId: string; type: "image" | "video" }[] = [];

      if (mediaFiles.length > 0) {
        const formatedMediaFiles = mediaFiles.map((mediaFile) => mediaFile.file);

        const files = await uploadFilesHttp(formatedMediaFiles);

        listOfMediaBlobIds = files.map((file: { blobId: string }, index: number) => ({
          blobId: file.blobId,
          type: mediaFiles[index].type,
        }));
      }

      // 2. Encrypt content + media references with Seal

      const sealClient = new SealClient({
        suiClient: suiClient,
        serverConfigs: sealObjectIds.map((id) => {
          return {
            objectId: id,
            weight: 1,
          };
        }),
        verifyKeyServers: false,
      });

      const dataToEncrypt: Uint8Array<ArrayBuffer> = new Uint8Array(
        Buffer.from(
          JSON.stringify({
            title,
            preview,
            content,
            mediaFiles: listOfMediaBlobIds,
          }),
        ),
      );

      const encryptedContent = await sealClient.encrypt({
        data: dataToEncrypt,
        threshold: 2,
        packageId: PACKAGE_ID,
        id: "123", // todo: change it in the future, for now it's just a placeholder
      });

      // 3. Upload encrypted blob to Walrus

      const encryptedBlobId = await uploadBlobHttp(encryptedContent.encryptedObject);

      // 4. Call publish_post() on smart contract

      await publishPost({
        profileId: creatorProfile.profileId,
        title,
        preview,
        blobId: encryptedBlobId,
        encrypted: true,
      });

      showToast("Post published!", "success");
    } catch (error) {
      console.log(error);
      showToast((error as Error).message, "error");
    } finally {
      setIsPublishing(false);
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

  if (isPublishing) {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: "rgba(0, 0, 0, 0.8)" }}>
        <PotatoLoader size="lg" text="Publishing post..." />
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
