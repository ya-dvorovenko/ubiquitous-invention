"use client";

import { Transaction } from "@mysten/sui/transactions";
import { useQueryClient } from "@tanstack/react-query";
import { useCurrentAccount, useSuiClient } from "@mysten/dapp-kit";
import { useSponsoredTransaction } from "./useSponsoredTransaction";
import { TARGETS, CLOCK_ID, TYPES } from "@/config/constants";

interface PublishPostParams {
  profileId: string;
  title: string;
  preview: string;
  blobId: string;
  encrypted: boolean;
}


export function usePublishPost() {
  const queryClient = useQueryClient();
  const suiClient = useSuiClient();
  const currentAccount = useCurrentAccount();
  const { sponsorAndExecute, isPending } = useSponsoredTransaction();

  const publishPost = async ({
    profileId,
    title,
    preview,
    blobId,
    encrypted,
  }: PublishPostParams) => {
    if (!currentAccount) throw new Error("No wallet connected");

    const ownedObjects = await suiClient.getOwnedObjects({
      owner: currentAccount.address,
      filter: { StructType: TYPES.creatorCap },
      options: { showType: true },
    });

    const creatorCap = ownedObjects.data.find((obj) =>
      obj.data?.type?.includes("CreatorCap")
    );

    if (!creatorCap?.data?.objectId) {
      throw new Error("CreatorCap not found. Are you a registered creator?");
    }

    const tx = new Transaction();

    tx.moveCall({
      target: TARGETS.publishPost,
      arguments: [
        tx.object(creatorCap.data.objectId),
        tx.object(profileId),
        tx.pure.string(title),
        tx.pure.string(preview),
        tx.pure.string(blobId),
        tx.pure.bool(encrypted),
        tx.object(CLOCK_ID),
      ],
    });

    const result = await sponsorAndExecute(tx);

    await queryClient.refetchQueries({ queryKey: ["creatorPosts", profileId] });
    queryClient.invalidateQueries({ queryKey: ["creators"] });

    return result;
  };

  return { publishPost, isPending };
}
