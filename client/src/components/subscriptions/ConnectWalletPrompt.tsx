"use client";

export function ConnectWalletPrompt() {
  return (
    <div className="text-center">
      <h1
        className="text-2xl font-bold mb-4"
        style={{ color: "var(--text-primary)" }}
      >
        My Subscriptions
      </h1>
      <p style={{ color: "var(--text-secondary)" }}>
        Please connect your wallet to view your subscriptions
      </p>
    </div>
  );
}
