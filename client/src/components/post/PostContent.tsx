"use client";

import { useEffect, useState, useRef } from "react";
import { SealClient, SessionKey } from "@mysten/seal";
import {
  useSuiClient,
  useSignPersonalMessage,
  useCurrentAccount,
} from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { Post, Creator, PostMedia, Subscription } from "@/types";
import { Card, MediaGallery, PotatoLoader, useToast } from "../ui";
import { Paywall } from "./Paywall";
import {
  CLOCK_ID,
  PACKAGE_ID,
  sealObjectIds,
  TARGETS,
} from "@/config/constants";
import { readBlobHttp } from "@/sdk/walrus-http";
import { fromHex } from "@mysten/sui/utils";
import { bcs } from "@mysten/sui/bcs";

interface PostContentProps {
  post: Post;
  creator: Creator;
  isSubscribed: boolean;
  subscription?: Subscription | null;
  onSubscribe?: () => void;
  isOwnPost?: boolean;
}

interface DecryptedPostData {
  content: string;
  media?: PostMedia[];
}

export function PostContent({
  post,
  creator,
  isSubscribed,
  subscription,
  onSubscribe,
  isOwnPost = false,
}: PostContentProps) {
  const suiClient = useSuiClient();
  const { mutateAsync: signPersonalMessage } = useSignPersonalMessage();
  const currentAccount = useCurrentAccount();
  const { showToast } = useToast();

  const [decrypted, setDecrypted] = useState<DecryptedPostData | null>(null);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [decryptError, setDecryptError] = useState<string | null>(null);
  const mediaUrlsRef = useRef<string[]>([]);

  const canDecrypt = (isSubscribed && subscription) || isOwnPost;

  useEffect(() => {
    if (
      !isSubscribed ||
      !post.blobId ||
      !creator?.address ||
      !creator?.profileId ||
      !subscription
    ) {
      setDecrypted(null);
      setDecryptError(null);
      return;
    }

    let cancelled = false;

    const decryptAndLoad = async () => {
      if (!currentAccount?.address) return;

      setIsDecrypting(true);
      setDecryptError(null);

      try {
        const sessionKey = await SessionKey.create({
          address: currentAccount.address,
          packageId: PACKAGE_ID,
          ttlMin: 10,
          suiClient,
        });

        const message = await sessionKey.getPersonalMessage();
        const { signature } = await signPersonalMessage({ message });

        sessionKey.setPersonalMessageSignature(signature);

        const encryptedBlobId = post.blobId;
        const encryptedBlob = await readBlobHttp(encryptedBlobId);

        console.log("Encrypted Blob", encryptedBlob);

        // Build the seal_approve transaction (not execute - just build for Seal verification)
        const tx = new Transaction();

        const profileIdBytes = fromHex(creator.profileId!);
        const nonce = new Uint8Array(8).fill(0); // Same nonce as used during encryption
        const idBytes = new Uint8Array([...profileIdBytes, ...nonce]);

        tx.moveCall({
          target: TARGETS.sealApprove,
          arguments: [
            tx.pure.vector("u8", idBytes),
            tx.object(subscription.id),
            tx.object(creator.profileId!),
            tx.object(CLOCK_ID),
          ],
        });

        // Build transaction bytes for Seal (onlyTransactionKind: true)
        const txBytes = await tx.build({ client: suiClient, onlyTransactionKind: true });

        console.log("Built TX bytes for Seal decryption");

        const sealClient = new SealClient({
          suiClient,
          serverConfigs: sealObjectIds.map((id) => ({
            objectId: id,
            weight: 1,
          })),
          verifyKeyServers: false,
        });

        const decryptedBytes = await sealClient.decrypt({
          data: encryptedBlob,
          sessionKey,
          txBytes,
        });

        console.log("Decrypted Bytes", decryptedBytes);

        const jsonString = new TextDecoder("utf-8").decode(decryptedBytes);
        const postData: {
          title: string;
          preview: string;
          content: string;
          mediaFiles: { blobId: string; type: "image" | "video" }[];
        } = JSON.parse(jsonString);

        console.log("Post Data", postData);

        // const mediaBlobs = await Promise.all(
        //   postData.mediaFiles.map(async (mediaBlob) => {
        //     const bytes = await readBlobHttp(mediaBlob.blobId);
        //     return new Blob([new Uint8Array(bytes)]);
        //   }),
        // );

        // const urls = mediaBlobs.map((blob) => URL.createObjectURL(blob));
        // mediaUrlsRef.current = urls;

        // const media: PostMedia[] = postData.mediaFiles.map((m, index) => ({
        //   url: urls[index],
        //   type: m.type,
        // }));

        if (!cancelled) {
          setDecrypted({ content: postData.content });
          showToast("Content decrypted", "success");
        }
      } catch (error) {
        if (!cancelled) {
          const errorMessage = (error as Error).message;
          setDecryptError(errorMessage);
          showToast(errorMessage, "error");
        }
      } finally {
        if (!cancelled) {
          setIsDecrypting(false);
        }
      }
    };

    decryptAndLoad();

    return () => {
      cancelled = true;
      mediaUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      mediaUrlsRef.current = [];
    };
  }, [
    canDecrypt,
    isOwnPost,
    post.blobId,
    post.encrypted,
    post.id,
    creator?.address,
    creator?.profileId,
    currentAccount,
    subscription?.id,
    signPersonalMessage,
    suiClient,
    showToast,
  ]);

  // Not subscribed and not own post - show paywall
  if (!isSubscribed && !isOwnPost) {
    return (
      <div>
        <Card className="mb-6">
          <p style={{ color: "var(--text-secondary)" }}>{post.preview}</p>
        </Card>

        <Paywall creator={creator} onSubscribe={onSubscribe} />
      </div>
    );
  }

  // Subscribed: show decrypted content when we have blobId, otherwise fallback
  const needsDecrypt = !!post.blobId && !!subscription;

  if (needsDecrypt && isDecrypting) {
    return (
      <div className="flex justify-center py-12">
        <PotatoLoader size="lg" text="Decrypting content..." />
      </div>
    );
  }

  if (needsDecrypt && decryptError) {
    return (
      <Card>
        <p style={{ color: "var(--text-secondary)" }}>
          Could not load content: {decryptError}
        </p>
      </Card>
    );
  }

  if (needsDecrypt && !decrypted) {
    return (
      <Card>
        <p style={{ color: "var(--text-secondary)" }}>{post.preview}</p>
      </Card>
    );
  }

  const content = needsDecrypt ? decrypted?.content : post.preview;
  const media = needsDecrypt ? decrypted?.media : undefined;

  return (
    <div className="flex flex-col gap-6">
      {media && media.length > 0 && <MediaGallery media={media} />}
      <Card>
        <div style={{ color: "var(--text-primary)", whiteSpace: "pre-wrap" }}>
          {content}
        </div>
      </Card>
    </div>
  );
}
