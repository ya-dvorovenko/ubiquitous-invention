"use client";

import { Transaction } from "@mysten/sui/transactions";
import { useQueryClient } from "@tanstack/react-query";
import { TARGETS, CLOCK_ID } from "@/config/constants";
import { useSponsoredTransaction } from "./useSponsoredTransaction";

interface RegisterCreatorParams {
  name: string;
  bio: string;
  price: number; // subscription price in MIST
}

export function useRegisterCreator() {
  const queryClient = useQueryClient();
  const { sponsorAndExecute, isPending } = useSponsoredTransaction();

  const register = async ({ name, bio, price }: RegisterCreatorParams) => {
    const tx = new Transaction();

    tx.moveCall({
      target: TARGETS.register,
      arguments: [
        tx.pure.string(name),
        tx.pure.string(bio),
        tx.pure.u64(price),
        tx.object(CLOCK_ID),
      ],
    });

    const result = await sponsorAndExecute(tx);

    // Invalidate creators cache
    queryClient.invalidateQueries({ queryKey: ["creators"] });

    return result;
  };

  return {
    register,
    isPending,
  };
}
