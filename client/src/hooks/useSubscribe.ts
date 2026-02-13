"use client";

import { useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { useQueryClient } from "@tanstack/react-query";
import { TARGETS, CLOCK_ID } from "@/config/constants";

interface SubscribeParams {
  profileId: string;
  price: number; // in MIST
}

export function useSubscribe() {
  const suiClient = useSuiClient();
  const queryClient = useQueryClient();
  const { mutateAsync: signAndExecute, isPending } =
    useSignAndExecuteTransaction();

  const subscribe = async ({ profileId, price }: SubscribeParams) => {
    const tx = new Transaction();

    // Split coins for payment
    const [paymentCoin] = tx.splitCoins(tx.gas, [price]);

    // Call subscribe function
    tx.moveCall({
      target: TARGETS.subscribe,
      arguments: [
        tx.object(profileId),
        paymentCoin,
        tx.object(CLOCK_ID),
      ],
    });

    const result = await signAndExecute({
      transaction: tx,
    });

    // Wait for transaction to be confirmed
    await suiClient.waitForTransaction({
      digest: result.digest,
    });

    // Invalidate subscriptions cache
    queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
    queryClient.invalidateQueries({ queryKey: ["creator", profileId] });

    return result;
  };

  return {
    subscribe,
    isPending,
  };
}
