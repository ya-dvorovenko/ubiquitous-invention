"use client";

import { useState } from "react";
import { useAddTier } from "@/hooks/useAddTier";
import { Button, Card, useToast } from "@/components/ui";
import { SubscriptionTier } from "@/types";
import { formatSui } from "@/utils/format";

interface TierInput {
  durationDays: string;
  price: string;
}

const DURATION_PRESETS = [
  { label: "1 month", days: 30 },
  { label: "3 months", days: 90 },
  { label: "6 months", days: 180 },
  { label: "1 year", days: 365 },
];

const formatDuration = (ms: number): string => {
  const days = Math.round(ms / (24 * 60 * 60 * 1000));
  if (days >= 365) return `${Math.round(days / 365)} year${days >= 730 ? "s" : ""}`;
  if (days >= 30) return `${Math.round(days / 30)} month${days >= 60 ? "s" : ""}`;
  return `${days} day${days !== 1 ? "s" : ""}`;
};

interface TierManagerProps {
  profileId: string;
  existingTiers: SubscriptionTier[];
  onTierAdded?: () => void;
}

export function TierManager({ profileId, existingTiers, onTierAdded }: TierManagerProps) {
  const { addTier, isPending } = useAddTier();
  const { showToast } = useToast();
  const [newTier, setNewTier] = useState<TierInput>({ durationDays: "30", price: "" });
  const [isAdding, setIsAdding] = useState(false);

  const handleAddTier = async () => {
    if (!newTier.price.trim()) {
      showToast("Please enter a price", "error");
      return;
    }

    const price = parseFloat(newTier.price);
    if (isNaN(price) || price <= 0) {
      showToast("Price must be a positive number", "error");
      return;
    }

    if (existingTiers.length >= 3) {
      showToast("Maximum 3 tiers allowed", "error");
      return;
    }

    try {
      const durationMs = parseInt(newTier.durationDays) * 24 * 60 * 60 * 1000;
      const priceInMist = Math.round(price * 1_000_000_000);

      await addTier({
        profileId,
        durationMs,
        price: priceInMist,
      });

      showToast("Tier added successfully!", "success");
      setNewTier({ durationDays: "30", price: "" });
      setIsAdding(false);
      onTierAdded?.();
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Failed to add tier", "error");
    }
  };

  return (
    <Card>
      <h3
        className="text-lg font-bold mb-4"
        style={{ color: "var(--text-primary)" }}
      >
        Subscription Tiers ({existingTiers.length}/3)
      </h3>

      {existingTiers.length > 0 ? (
        <div className="space-y-2 mb-4">
          {existingTiers.map((tier, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 rounded-lg"
              style={{ backgroundColor: "var(--bg-primary)" }}
            >
              <span style={{ color: "var(--text-primary)" }}>
                {formatDuration(tier.durationMs)}
              </span>
              <span style={{ color: "var(--accent)" }}>
                {formatSui(tier.price)} SUI
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="mb-4 text-sm" style={{ color: "var(--text-secondary)" }}>
          No tiers yet. Add at least one tier so users can subscribe.
        </p>
      )}

      {existingTiers.length < 3 && (
        <>
          {isAdding ? (
            <div className="space-y-3">
              <div className="flex gap-2">
                <select
                  value={newTier.durationDays}
                  onChange={(e) => setNewTier({ ...newTier, durationDays: e.target.value })}
                  className="flex-1 px-4 py-3 rounded-lg outline-none cursor-pointer"
                  style={{
                    backgroundColor: "var(--bg-primary)",
                    border: "1px solid var(--border-color)",
                    color: "var(--text-primary)",
                  }}
                  disabled={isPending}
                >
                  {DURATION_PRESETS.map((preset) => (
                    <option key={preset.days} value={preset.days}>
                      {preset.label}
                    </option>
                  ))}
                </select>
                <div className="relative flex-1">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={newTier.price}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "" || /^\d*\.?\d*$/.test(val)) {
                        setNewTier({ ...newTier, price: val });
                      }
                    }}
                    placeholder="0.00"
                    className="w-full px-4 py-3 pr-14 rounded-lg outline-none"
                    style={{
                      backgroundColor: "var(--bg-primary)",
                      border: "1px solid var(--border-color)",
                      color: "var(--text-primary)",
                    }}
                    disabled={isPending}
                  />
                  <span
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-sm"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    SUI
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddTier} disabled={isPending} className="flex-1">
                  {isPending ? "Adding..." : "Add Tier"}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setIsAdding(false)}
                  disabled={isPending}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="secondary"
              onClick={() => setIsAdding(true)}
              className="w-full"
            >
              + Add Tier
            </Button>
          )}
        </>
      )}
    </Card>
  );
}
