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

    console.log("[Subscribe] Starting subscription:", { profileId, tierIndex, price });

    const tx = new Transaction();

    // Split exact price amount - use BigInt for large MIST values
    const priceInMist = BigInt(price);
    console.log("[Subscribe] Price in MIST (BigInt):", priceInMist.toString());

    // Split coin for payment - Move function expects &mut Coin with value >= price
    const [paymentCoin] = tx.splitCoins(tx.gas, [priceInMist]);

    // Call subscribe - it will split exact price from paymentCoin and transfer to creator
    tx.moveCall({
      target: TARGETS.subscribe,
      arguments: [
        tx.object(profileId),
        tx.pure.u64(tierIndex),
        paymentCoin,
        tx.object(CLOCK_ID),
      ],
    });

    // Transfer the remaining (now empty) coin back to sender to clean up
    tx.transferObjects([paymentCoin], currentAccount.address);

    console.log("[Subscribe] Executing transaction...");
    const result = await signAndExecute({ transaction: tx });
    console.log("[Subscribe] Transaction result:", result);

    const txDetails = await suiClient.waitForTransaction({
      digest: result.digest,
      options: { showEffects: true, showBalanceChanges: true },
    });
    console.log("[Subscribe] Transaction details:", txDetails);

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
