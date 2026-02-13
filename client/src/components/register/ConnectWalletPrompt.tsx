"use client";

import { ConnectButton } from "@mysten/dapp-kit";
import { Card } from "@/components/ui";

export function ConnectWalletPrompt() {
  return (
    <Card>
      <div className="p-6 text-center space-y-4">
        <p style={{ color: "var(--text-secondary)" }}>
          Connect your wallet to become a creator
        </p>
        <ConnectButton />
      </div>
    </Card>
  );
}
