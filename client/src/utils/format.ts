export function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatBalance(balance: string): string {
  const sui = Number(balance) / 1_000_000_000;
  return sui.toFixed(2);
}

export function formatSui(mist: number): string {
  const sui = mist / 1_000_000_000;
  if (sui >= 1) return sui.toFixed(2);
  if (sui >= 0.01) return sui.toFixed(2);
  return sui.toFixed(4);
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
