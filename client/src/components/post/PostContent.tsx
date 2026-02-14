"use client";

import { useEffect, useState, useRef } from "react";
import { SealClient, SessionKey } from "@mysten/seal";
import { useSuiClient, useSignPersonalMessage } from "@mysten/dapp-kit";
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

interface PostContentProps {
  post: Post;
  creator: Creator;
  isSubscribed: boolean;
  subscription?: Subscription | null;
  onSubscribe?: () => void;
}

interface DecryptedPostData {
  content: string;
  media: PostMedia[];
}

export function PostContent({
  post,
  creator,
  isSubscribed,
  subscription,
  onSubscribe,
}: PostContentProps) {
  const suiClient = useSuiClient();
  const { mutateAsync: signPersonalMessage } = useSignPersonalMessage();
  const { showToast } = useToast();

  const [decrypted, setDecrypted] = useState<DecryptedPostData | null>(null);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [decryptError, setDecryptError] = useState<string | null>(null);
  const mediaUrlsRef = useRef<string[]>([]);

  useEffect(() => {
    if (!isSubscribed || !post.blobId || !creator?.address || !creator?.profileId || !subscription) {
      setDecrypted(null);
      setDecryptError(null);
      return;
    }

    let cancelled = false;

    const decryptAndLoad = async () => {
      setIsDecrypting(true);
      setDecryptError(null);

      try {
        const sessionKey = await SessionKey.create({
          address: creator.address,
          packageId: PACKAGE_ID,
          ttlMin: 10,
          suiClient,
        });

        if (!sessionKey.isExpired()) {
          setIsDecrypting(false);
          return;
        }

        const message = await sessionKey.getPersonalMessage();
        const { signature } = await signPersonalMessage({ message });
        sessionKey.setPersonalMessageSignature(signature);

        const encryptedBlobId = post.blobId!;
        const encryptedBlob = await readBlobHttp(encryptedBlobId);

        const tx = new Transaction();
        tx.moveCall({
          target: TARGETS.sealApprove,
          arguments: [
            tx.object("123"),
            tx.object(subscription.id),
            tx.object(creator.profileId!),
            tx.object(CLOCK_ID),
          ],
        });

        const txBytes = await tx.build({
          client: suiClient,
          onlyTransactionKind: true,
        });

        const sealClient = new SealClient({
          suiClient,
          serverConfigs: sealObjectIds.map((id) => ({ objectId: id, weight: 1 })),
          verifyKeyServers: false,
        });

        const decryptedBytes = await sealClient.decrypt({
          data: encryptedBlob,
          sessionKey,
          txBytes,
        });

        const jsonString = new TextDecoder("utf-8").decode(decryptedBytes);
        const postData: {
          title: string;
          preview: string;
          content: string;
          mediaFiles: { blobId: string; type: "image" | "video" }[];
        } = JSON.parse(jsonString);

        const mediaBlobs = await Promise.all(
          postData.mediaFiles.map(async (mediaBlob) => {
            const bytes = await readBlobHttp(mediaBlob.blobId);
            return new Blob([new Uint8Array(bytes)]);
          }),
        );

        const urls = mediaBlobs.map((blob) => URL.createObjectURL(blob));
        mediaUrlsRef.current = urls;

        const media: PostMedia[] = postData.mediaFiles.map((m, index) => ({
          url: urls[index],
          type: m.type,
        }));

        if (!cancelled) {
          setDecrypted({ content: postData.content, media });
          showToast("Content decrypted", "success");
        }
      } catch (error) {
        if (!cancelled) {
          const message = (error as Error).message;
          setDecryptError(message);
          showToast(message, "error");
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
    isSubscribed,
    post.blobId,
    creator?.address,
    creator?.profileId,
    subscription?.id,
    signPersonalMessage,
    suiClient,
    showToast,
  ]);

  if (!isSubscribed) {
    return (
      <div>
        <Card className="mb-6">
          <p style={{ color: "var(--text-secondary)" }}>{post.preview}</p>
        </Card>

        <Paywall creator={creator} onSubscribe={onSubscribe} />
      </div>
    );
  }

  const needsDecrypt = post.encrypted && !!subscription;
  const content = needsDecrypt ? decrypted?.content : post.blobId;
  const media = needsDecrypt ? decrypted?.media : undefined;

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
