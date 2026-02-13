"use client";

import { useCurrentAccount } from "@mysten/dapp-kit";
import { useIsCreator } from "@/hooks";
import { BackLink } from "@/components/common";
import { PotatoLoader } from "@/components/ui";
import {
  RegisterForm,
  AlreadyCreator,
  ConnectWalletPrompt,
} from "@/components/register";

export default function RegisterCreatorPage() {
  const currentAccount = useCurrentAccount();
  const { isCreator, creatorProfile, isLoading } = useIsCreator();

  return (
    <div className="page-container py-8">
      <BackLink href="/">Back to creators</BackLink>

      <div className="max-w-md mx-auto mt-8">
        <h1
          className="text-3xl font-bold mb-2 text-center"
          style={{ color: "var(--text-primary)" }}
        >
          Become a Creator
        </h1>
        <p
          className="text-center mb-8"
          style={{ color: "var(--text-secondary)" }}
        >
          Start sharing exclusive content with your subscribers
        </p>

        {!currentAccount ? (
          <ConnectWalletPrompt />
        ) : isLoading ? (
          <div className="flex justify-center py-8">
            <PotatoLoader />
          </div>
        ) : isCreator && creatorProfile ? (
          <AlreadyCreator creator={creatorProfile} />
        ) : (
          <RegisterForm />
        )}
      </div>
    </div>
  );
}
