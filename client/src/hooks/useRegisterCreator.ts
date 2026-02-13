"use client";

import { useQueryClient } from "@tanstack/react-query";
import { TARGETS, CLOCK_ID } from "@/config/constants";
import { useSponsoredTransaction } from "./useSponsoredTransaction";
import { Transaction } from "@mysten/sui/transactions";

interface RegisterParams {
  name: string;
  bio: string;
  price: number;
}

export function useRegisterCreator() {
  const queryClient = useQueryClient();
  const { sponsorAndExecute, isPending } = useSponsoredTransaction();

  const register = async ({ name, bio, price }: RegisterParams) => {
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

    queryClient.invalidateQueries({ queryKey: ["creators"] });
    queryClient.invalidateQueries({ queryKey: ["isCreator"] });

    return result;
  };

  return { register, isPending };
}
