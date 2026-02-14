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

export function formatDuration(ms: number): string {
  const days = ms / (1000 * 60 * 60 * 24);
  if (days >= 365) {
    const years = Math.round(days / 365);
    return years === 1 ? "1 year" : `${years} years`;
  }
  if (days >= 30) {
    const months = Math.round(days / 30);
    return months === 1 ? "1 month" : `${months} months`;
  }
  return days === 1 ? "1 day" : `${Math.round(days)} days`;
}
