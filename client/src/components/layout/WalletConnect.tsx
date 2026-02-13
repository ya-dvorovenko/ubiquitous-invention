"use client";

import {
  ConnectModal,
  useCurrentAccount,
  useDisconnectWallet,
  useSuiClientQuery,
} from "@mysten/dapp-kit";
import { useState } from "react";
import Image from "next/image";

function formatAddress(address: string): string {
  return `${address.slice(0, 13)}..${address.slice(-3)}`;
}

function formatBalance(balance: string): string {
  const sui = Number(balance) / 1_000_000_000;
  return sui.toFixed(2);
}

export function WalletConnect() {
  const currentAccount = useCurrentAccount();
  const { mutate: disconnect } = useDisconnectWallet();
  const [open, setOpen] = useState(false);

  const { data: balanceData } = useSuiClientQuery(
    "getBalance",
    { owner: currentAccount?.address ?? "" },
    { enabled: !!currentAccount }
  );

  const balance = balanceData ? formatBalance(balanceData.totalBalance) : "0.00";

  if (currentAccount) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2" style={{ color: "#FFFFFF" }}>
          <span style={{ fontSize: 16, fontWeight: 400 }}>{balance} SUI</span>
          <Image src="/wallet.svg" alt="" width={20} height={20} />
        </div>

        <div
          style={{
            width: 1,
            height: 24,
            backgroundColor: "var(--border-color)",
          }}
        />

        <div className="flex items-center gap-2" style={{ color: "#FFFFFF" }}>
          <span style={{ fontSize: 16, fontWeight: 400 }}>
            {formatAddress(currentAccount.address)}
          </span>
          <button
            onClick={() => {
              disconnect();
              setOpen(false);
            }}
            className="transition-all hover:brightness-125 active:scale-95"
            style={{
              backgroundColor: "var(--border-color)",
              borderRadius: 50,
              padding: "12px 16px",
            }}
          >
            <Image src="/logout.svg" alt="Disconnect" width={16} height={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <ConnectModal
      trigger={
        <button
          className="transition-all hover:brightness-110 hover:scale-[1.02] active:scale-[0.98]"
          style={{
            backgroundColor: "var(--accent)",
            color: "#1a1a1a",
            borderRadius: 50,
            padding: "12px 24px",
            fontWeight: 500,
            fontSize: 16,
          }}
        >
          Connect wallet
        </button>
      }
      open={open}
      onOpenChange={setOpen}
    />
  );
}
