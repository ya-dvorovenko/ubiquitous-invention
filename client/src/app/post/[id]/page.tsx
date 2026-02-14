"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { SealClient, SessionKey } from "@mysten/seal";
import { useSuiClient, useSignPersonalMessage } from "@mysten/dapp-kit";
import {
  useCreatorPosts,
  useCreatorByProfileId,
  useIsSubscribed,
} from "@/hooks";
import { BackLink, NotFound } from "@/components/common";
import { PostAuthor, PostContent } from "@/components/post";
import { PotatoLoader } from "@/components/ui";
import { PACKAGE_ID, sealObjectIds, TARGETS } from "@/config/constants";
import { Transaction } from "@mysten/sui/transactions";
import { WalrusClient } from "@mysten/walrus";

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
  const { isSubscribed } = useIsSubscribed(profileId);

  const isOwnPost = currentAccount?.address === creator?.address;

  const isLoading = isCreatorLoading || isPostsLoading;

  const suiClient = useSuiClient();

  const { mutateAsync: signPersonalMessage } = useSignPersonalMessage();

  const handleSignMessage = async () => {
    if (!creator?.address) return;

    const sessionKey = await SessionKey.create({
      address: creator?.address,
      packageId: PACKAGE_ID,
      ttlMin: 10,
      suiClient,
    });

    if (!sessionKey.isExpired()) {
      return null;
    }

    const message = await sessionKey.getPersonalMessage();

    const { signature } = await signPersonalMessage({
      message,
    });

    sessionKey.setPersonalMessageSignature(signature);

    // Decrypt process

    const encryptedBlobId = post?.blobId;

    if (!encryptedBlobId) {
      throw new Error("No blob here");
    }

    const walrusClient = new WalrusClient({
      suiClient: suiClient,
      network: "testnet",
    });

    const encryptedBlob = await walrusClient.readBlob({
      blobId: encryptedBlobId,
    });

    const blob = new Blob([new Uint8Array(encryptedBlob)]);

    const textDecoder = new TextDecoder("utf-8");
    const mainBlobId = textDecoder.decode(await blob.arrayBuffer());

    const tx = new Transaction();
    tx.moveCall({
      target: TARGETS.sealApprove,
    });

    const txBytes = tx.build({ client: suiClient, onlyTransactionKind: true });

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

    // const decryptedBytes = await sealClient.decrypt({
    //   data: encryptedBytes,
    //   sessionKey,
    //   txBytes,
    // });
  };

  useEffect(() => {
    handleSignMessage();
  }, [creator?.address]);

  if (isLoading) {
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
        />
      </article>
    </div>
  );
}
