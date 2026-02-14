"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useCurrentAccount, useSuiClient } from "@mysten/dapp-kit";
import { TARGETS, CLOCK_ID, TYPES } from "@/config/constants";
import { useSponsoredTransaction } from "./useSponsoredTransaction";
import { Transaction } from "@mysten/sui/transactions";

interface RegisterParams {
  name: string;
  bio: string;
  xProfile: string;
  avatarBlobId: string;
}

export function useRegisterCreator() {
  const queryClient = useQueryClient();
  const suiClient = useSuiClient();
  const currentAccount = useCurrentAccount();
  const { sponsorAndExecute, isPending } = useSponsoredTransaction();

  const register = async ({ name, bio, xProfile, avatarBlobId }: RegisterParams) => {
    if (!currentAccount) {
      throw new Error("Wallet not connected");
    }

    const existingCaps = await suiClient.getOwnedObjects({
      owner: currentAccount.address,
      filter: { StructType: TYPES.creatorCap },
      limit: 1,
    });

    if (existingCaps.data.length > 0) {
      throw new Error("You are already registered as a creator");
    }

    const tx = new Transaction();

    tx.moveCall({
      target: TARGETS.register,
      arguments: [
        tx.pure.string(name),
        tx.pure.string(bio),
        tx.pure.string(xProfile),
        tx.pure.string(avatarBlobId),
        tx.object(CLOCK_ID),
      ],
    });

    const result = await sponsorAndExecute(tx);

    // Get the newly created CreatorCap to extract profileId
    const caps = await suiClient.getOwnedObjects({
      owner: currentAccount.address,
      filter: { StructType: TYPES.creatorCap },
      options: { showContent: true },
    });

    let profileId: string | undefined;
    if (caps.data.length > 0 && caps.data[0].data?.content?.dataType === "moveObject") {
      const fields = caps.data[0].data.content.fields as { profile_id: string };
      profileId = fields.profile_id;
    }

    queryClient.removeQueries({ queryKey: ["creators"] });
    await queryClient.refetchQueries({ queryKey: ["creators"] });

    return { ...result, profileId };
  };

  return { register, isPending };
}
