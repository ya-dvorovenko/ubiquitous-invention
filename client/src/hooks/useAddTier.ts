"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSuiClient, useCurrentAccount, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { TARGETS, TYPES } from "@/config/constants";
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
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const [isPending, setIsPending] = useState(false);

  const addTier = async ({ profileId, durationMs, price }: AddTierParams) => {
    if (!currentAccount) {
      throw new Error("Wallet not connected");
    }

    setIsPending(true);

    try {
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

      const result = await signAndExecute({ transaction: tx });

      await suiClient.waitForTransaction({ digest: result.digest });

      queryClient.removeQueries({ queryKey: ["creators"] });
      await queryClient.refetchQueries({ queryKey: ["creators"] });
      queryClient.removeQueries({ queryKey: ["creator", profileId] });
      await queryClient.refetchQueries({ queryKey: ["creator", profileId] });

      return result;
    } finally {
      setIsPending(false);
    }
  };

  return { addTier, isPending };
}
