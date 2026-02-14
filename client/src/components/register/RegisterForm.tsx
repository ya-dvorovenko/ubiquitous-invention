"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useQueryClient } from "@tanstack/react-query";
import { useRegisterCreator, useCreators } from "@/hooks";
import { useAddTier } from "@/hooks/useAddTier";
import { Button, Card, useToast } from "@/components/ui";

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

export function RegisterForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { register, isPending } = useRegisterCreator();
  const { addTier, isPending: isAddingTier } = useAddTier();
  const { data: creators } = useCreators();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [twitterHandle, setTwitterHandle] = useState("");
  const [tiers, setTiers] = useState<TierInput[]>([{ durationDays: "365", price: "" }]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError("Avatar must be less than 2MB");
        return;
      }
      setAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const removeAvatar = () => {
    if (avatarPreview) {
      URL.revokeObjectURL(avatarPreview);
    }
    setAvatar(null);
    setAvatarPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const addTierField = () => {
    if (tiers.length < 3) {
      setTiers([...tiers, { durationDays: "30", price: "" }]);
    }
  };

  const removeTierField = (index: number) => {
    if (tiers.length > 1) {
      setTiers(tiers.filter((_, i) => i !== index));
    }
  };

  const updateTier = (index: number, field: keyof TierInput, value: string) => {
    const newTiers = [...tiers];
    newTiers[index] = { ...newTiers[index], [field]: value };
    setTiers(newTiers);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Name is required");
      return;
    }

    const nameExists = creators?.some(
      (c) => c.name.toLowerCase() === name.trim().toLowerCase()
    );
    if (nameExists) {
      setError("This name is already taken");
      return;
    }

    if (!bio.trim()) {
      setError("Bio is required");
      return;
    }

    if (!twitterHandle.trim()) {
      setError("X handle is required");
      return;
    }

    const validTiers = tiers.filter(t => t.price.trim() !== "");
    if (validTiers.length === 0) {
      setError("At least one subscription tier is required");
      return;
    }

    for (const tier of validTiers) {
      const price = parseFloat(tier.price);
      if (isNaN(price) || price <= 0) {
        setError("All tier prices must be positive numbers");
        return;
      }
    }

    try {
      let avatarBlobId = "";

      if (avatar) {
        setIsUploading(true);
        const { uploadFileHttp } = await import("@/sdk/walrus-http");
        avatarBlobId = await uploadFileHttp(avatar);
        setIsUploading(false);
      }

      const result = await register({
        name: name.trim(),
        bio: bio.trim(),
        xProfile: twitterHandle.trim(),
        avatarBlobId,
      });

      // Add tiers after registration
      if (result.profileId) {
        for (const tier of validTiers) {
          const durationMs = parseInt(tier.durationDays) * 24 * 60 * 60 * 1000;
          const priceInMist = Math.round(parseFloat(tier.price) * 1_000_000_000);

          await addTier({
            profileId: result.profileId,
            durationMs,
            price: priceInMist,
          });
        }
      }

      showToast("You're now a creator!", "success");
      setIsSuccess(true);
    } catch (err) {
      setIsUploading(false);
      showToast(err instanceof Error ? err.message : "Registration failed", "error");
      setError(err instanceof Error ? err.message : "Registration failed");
    }
  };

  if (isSuccess) {
    return (
      <Card>
        <div className="p-6 text-center space-y-4">
          <div className="text-4xl">🎉</div>
          <h2
            className="text-xl font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            You&apos;re now a creator!
          </h2>
          <p style={{ color: "var(--text-secondary)" }}>
            Your profile has been created. You can now start sharing content with your subscribers.
          </p>
          <Button
            onClick={async () => {
              await queryClient.refetchQueries({ queryKey: ["creators"] });
              router.push("/");
            }}
            className="w-full"
          >
            Browse Creators
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="flex flex-col items-center gap-3">
          <div
            className="relative w-24 h-24 rounded-full overflow-hidden cursor-pointer"
            style={{
              backgroundColor: "var(--bg-primary)",
              border: "2px dashed var(--border-color)",
            }}
            onClick={() => fileInputRef.current?.click()}
          >
            {avatarPreview ? (
              <Image
                src={avatarPreview}
                alt="Avatar preview"
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <svg
                  className="w-8 h-8"
                  style={{ color: "var(--text-secondary)" }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="hidden"
          />
          <div className="flex items-center gap-2">
            <span
              className="text-sm"
              style={{ color: "var(--text-secondary)" }}
            >
              {avatarPreview ? "Change avatar" : "Add avatar (optional)"}
            </span>
            {avatarPreview && (
              <button
                type="button"
                onClick={removeAvatar}
                className="text-sm text-red-400 hover:text-red-300"
              >
                Remove
              </button>
            )}
          </div>
        </div>

        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium mb-2"
            style={{ color: "var(--text-primary)" }}
          >
            Creator Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your creator name"
            className="w-full px-4 py-3 rounded-lg outline-none transition-colors"
            style={{
              backgroundColor: "var(--bg-primary)",
              border: "1px solid var(--border-color)",
              color: "var(--text-primary)",
            }}
            disabled={isPending}
          />
        </div>

        <div>
          <label
            htmlFor="bio"
            className="block text-sm font-medium mb-2"
            style={{ color: "var(--text-primary)" }}
          >
            Bio
          </label>
          <textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell your subscribers about yourself..."
            rows={4}
            className="w-full px-4 py-3 rounded-lg outline-none transition-colors resize-none"
            style={{
              backgroundColor: "var(--bg-primary)",
              border: "1px solid var(--border-color)",
              color: "var(--text-primary)",
            }}
            disabled={isPending}
          />
        </div>

        <div>
          <label
            htmlFor="twitter"
            className="block text-sm font-medium mb-2"
            style={{ color: "var(--text-primary)" }}
          >
            X
          </label>
          <div className="relative">
            <span
              className="absolute left-4 top-1/2 -translate-y-1/2"
              style={{ color: "var(--text-secondary)" }}
            >
              @
            </span>
            <input
              id="twitter"
              type="text"
              value={twitterHandle}
              onChange={(e) => setTwitterHandle(e.target.value.replace("@", ""))}
              placeholder="username"
              className="w-full pl-8 pr-4 py-3 rounded-lg outline-none transition-colors"
              style={{
                backgroundColor: "var(--bg-primary)",
                border: "1px solid var(--border-color)",
                color: "var(--text-primary)",
              }}
              disabled={isPending}
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label
              className="block text-sm font-medium"
              style={{ color: "var(--text-primary)" }}
            >
              Subscription Tiers (min 1, max 3)
            </label>
            {tiers.length < 3 && (
              <button
                type="button"
                onClick={addTierField}
                className="text-sm hover:opacity-80"
                style={{ color: "var(--accent)" }}
              >
                + Add tier
              </button>
            )}
          </div>
          <div className="space-y-3">
            {tiers.map((tier, index) => (
              <div key={index} className="flex gap-2 items-center">
                <select
                  value={tier.durationDays}
                  onChange={(e) => updateTier(index, "durationDays", e.target.value)}
                  className="flex-1 pl-4 pr-10 py-3 rounded-lg outline-none cursor-pointer appearance-none bg-no-repeat bg-[length:16px] bg-[right_12px_center]"
                  style={{
                    backgroundColor: "var(--bg-primary)",
                    border: "1px solid var(--border-color)",
                    color: "var(--text-primary)",
                  }}
                  disabled={isPending || isAddingTier}
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
                    value={tier.price}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "" || /^\d*\.?\d*$/.test(val)) {
                        updateTier(index, "price", val);
                      }
                    }}
                    placeholder="0.00"
                    className="w-full px-4 py-3 pr-14 rounded-lg outline-none"
                    style={{
                      backgroundColor: "var(--bg-primary)",
                      border: "1px solid var(--border-color)",
                      color: "var(--text-primary)",
                    }}
                    disabled={isPending || isAddingTier}
                  />
                  <span
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-sm"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    SUI
                  </span>
                </div>
                {tiers.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeTierField(index)}
                    className="p-2 rounded hover:bg-red-500/20"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
          <p className="text-xs mt-2" style={{ color: "var(--text-secondary)" }}>
            Define subscription options for your supporters
          </p>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <Button type="submit" disabled={isPending || isUploading || isAddingTier} className="w-full">
          {isUploading ? "Uploading avatar..." : isPending || isAddingTier ? "Registering..." : "Register as Creator"}
        </Button>
      </form>
    </Card>
  );
}
