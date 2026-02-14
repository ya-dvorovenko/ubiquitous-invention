"use client";

import { Transaction } from "@mysten/sui/transactions";
import { useQueryClient } from "@tanstack/react-query";
import { useSignAndExecuteTransaction, useSuiClient, useCurrentAccount } from "@mysten/dapp-kit";
import { TARGETS, CLOCK_ID } from "@/config/constants";

interface SubscribeParams {
  profileId: string;
  tierIndex: number;
  price: number;
}

export function useSubscribe() {
  const queryClient = useQueryClient();
  const suiClient = useSuiClient();
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signAndExecute, isPending } = useSignAndExecuteTransaction();

  const subscribe = async ({ profileId, tierIndex, price }: SubscribeParams) => {
    if (!currentAccount) throw new Error("No wallet connected");

    const tx = new Transaction();

    const [paymentCoin] = tx.splitCoins(tx.gas, [price]);

    tx.moveCall({
      target: TARGETS.subscribe,
      arguments: [
        tx.object(profileId),
        tx.pure.u64(tierIndex),
        paymentCoin,
        tx.object(CLOCK_ID),
      ],
    });

    const result = await signAndExecute({ transaction: tx });

    await suiClient.waitForTransaction({
      digest: result.digest,
      options: { showEffects: true },
    });

    queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
    queryClient.invalidateQueries({ queryKey: ["creators"] });
    queryClient.invalidateQueries({ queryKey: ["creator"] });

    return result;
  };

  return {
    subscribe,
    isPending,
  };
}
