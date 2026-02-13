"use client";

import { useRouter } from "next/navigation";
import {
  useCurrentAccount,
  useSuiClient,
  useSignAndExecuteTransaction,
} from "@mysten/dapp-kit";
import { useIsCreator, useCreatorPosts } from "@/hooks";
import { WalrusClient, WalrusFile } from "@mysten/walrus";
import { SealClient, SessionKey } from "@mysten/seal";
import { CreatePostForm } from "@/components/dashboard";
import { PostList } from "@/components/post";
import { PotatoLoader } from "@/components/ui";
import { ClientWithCoreApi } from "@mysten/sui/client";
import { CLOCK_ID, sealObjectIds, TARGETS } from "@/config/constants";
import { Transaction } from "@mysten/sui/transactions";

interface MediaFile {
  file: File;
  preview: string;
  type: "image" | "video";
}

export default function DashboardPage() {
  const router = useRouter();
  const suiClient = useSuiClient() as ClientWithCoreApi;
  const currentAccount = useCurrentAccount();
  const {
    isCreator,
    creatorProfile,
    isLoading: isCreatorLoading,
  } = useIsCreator();
  const { mutateAsync: signAndExecuteTransaction } =
    useSignAndExecuteTransaction();

  const { data: posts, isLoading: isPostsLoading } = useCreatorPosts(
    creatorProfile?.profileId || "",
    creatorProfile?.address || "",
  );

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
    try {
      // TODO: Implement actual publish logic
      // 1. Upload media files to Walrus
      if (!currentAccount) {
        throw new Error("No account connected");
      }

      if (mediaFiles.length > 5) {
        throw new Error("Too much files you uploaded");
      }

      if (mediaFiles.length == 0) {
        throw new Error("No media files inside your post");
      }

      if (!title || !preview || !content) {
        throw new Error("Title, preview and content are required");
      }

      const walrusClient = new WalrusClient({
        suiClient: suiClient,
        network: "testnet",
      });

      const filesBlobsForWalrus = [];

      for (const mediaFile of mediaFiles) {
        const file = new Uint8Array(await mediaFile.file.arrayBuffer());
        filesBlobsForWalrus.push({
          contents: file,
          identifier: mediaFile.file.name,
        });
      }

      const flow = await walrusClient.writeFilesFlow({
        files: filesBlobsForWalrus.map((file) => {
          return WalrusFile.from({
            contents: file.contents,
            identifier: file.identifier,
          });
        }),
      });

      await flow.encode();

      const registerBlobTransaction = await flow.register({
        epochs: 3,
        owner: currentAccount.address,
        deletable: true,
      });

      const { digest } = await signAndExecuteTransaction({
        transaction: registerBlobTransaction,
      });

      await flow.upload({ digest });

      const certifyTx = await flow.certify();

      const { digest: certifyDigest } = await signAndExecuteTransaction({
        transaction: certifyTx,
      });

      let files = await flow.listFiles();
      const listOfMediaBlobIds = files.map((file) => file.blobId);

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
        packageId: TARGETS.assertAccess,
        id: "1",
      });

      // 3. Upload encrypted blob to Walrus

      const encryptedBlobFile = WalrusFile.from({
        contents: encryptedContent.encryptedObject,
        identifier: "encrypted_content",
      });

      const encryptedFlow = await walrusClient.writeFilesFlow({
        files: [encryptedBlobFile],
      });

      await encryptedFlow.encode();

      const registerEncryptedBlobTransaction = await encryptedFlow.register({
        epochs: 3,
        owner: currentAccount.address,
        deletable: true,
      });

      const { digest: encryptedDigest } = await signAndExecuteTransaction({
        transaction: registerEncryptedBlobTransaction,
      });

      await encryptedFlow.upload({ digest: encryptedDigest });

      const certifyEncryptedBlobTransaction = await encryptedFlow.certify();

      const { digest: certifyEncryptedBlobDigest } =
        await signAndExecuteTransaction({
          transaction: certifyEncryptedBlobTransaction,
        });

      const encryptedBlobId = (await encryptedFlow.listFiles())[0].blobId;

      // 4. Call publish_post() on smart contract

      const transaction = new Transaction();

      transaction.moveCall({
        target: TARGETS.publishPost,
        arguments: [
          // todo: find profile id, which is owned by currentAccount
          // transaction.object(profileId)
          transaction.pure.string(title),
          transaction.pure.string(preview),
          transaction.pure.string(encryptedBlobId),
          transaction.pure.bool(true),
          transaction.object(CLOCK_ID),
        ],
      });

      await new Promise((resolve) => setTimeout(resolve, 1000));
      // alert("Post published! (mock)");
    } catch (error) {
      console.log(error);
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
