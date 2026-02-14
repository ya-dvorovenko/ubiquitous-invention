"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useSuiClient, useCurrentAccount } from "@mysten/dapp-kit";
import { TARGETS, TYPES } from "@/config/constants";
import { useSponsoredTransaction } from "./useSponsoredTransaction";
import { Transaction } from "@mysten/sui/transactions";

interface AddTierParams {
  profileId: string;
  durationMs: number;
  price: number;
}

export function useAddTier() {
  const queryClient = useQueryClient();
  const suiClient = useSuiClient();
  const currentAccount = useCurrentAccount();
  const { sponsorAndExecute, isPending } = useSponsoredTransaction();

  const addTier = async ({ profileId, durationMs, price }: AddTierParams) => {
    if (!currentAccount) {
      throw new Error("Wallet not connected");
    }

    const caps = await suiClient.getOwnedObjects({
      owner: currentAccount.address,
      filter: { StructType: TYPES.creatorCap },
      options: { showContent: true },
    });

    if (caps.data.length === 0) {
      throw new Error("Creator cap not found");
    }

    const capObject = caps.data[0];
    const capId = capObject.data?.objectId;

    if (!capId) {
      throw new Error("Creator cap ID not found");
    }

    const tx = new Transaction();

    tx.moveCall({
      target: TARGETS.addTier,
      arguments: [
        tx.object(capId),
        tx.object(profileId),
        tx.pure.u64(durationMs),
        tx.pure.u64(price),
      ],
    });

    const result = await sponsorAndExecute(tx);

    queryClient.removeQueries({ queryKey: ["creators"] });
    await queryClient.refetchQueries({ queryKey: ["creators"] });
    queryClient.removeQueries({ queryKey: ["creator", profileId] });
    await queryClient.refetchQueries({ queryKey: ["creator", profileId] });

    return result;
  };

  return { addTier, isPending };
}
