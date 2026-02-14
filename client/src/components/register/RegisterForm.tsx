"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useQueryClient } from "@tanstack/react-query";
import {
  useCurrentAccount,
  useSuiClient,
  useSignAndExecuteTransaction,
} from "@mysten/dapp-kit";
import { useRegisterCreator, useCreators } from "@/hooks";
import { Button, Card, useToast } from "@/components/ui";
import { uploadFiles } from "@/sdk/walrus";

export function RegisterForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const suiClient = useSuiClient();
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signAndExecuteTransaction } =
    useSignAndExecuteTransaction();
  const { register, isPending } = useRegisterCreator();
  const { data: creators } = useCreators();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [price, setPrice] = useState("");
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [twitterHandle, setTwitterHandle] = useState("");

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

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      setError("Price must be a positive number");
      return;
    }

    if (!twitterHandle.trim()) {
      setError("X handle is required");
      return;
    }

    try {
      const priceInMist = Math.floor(priceNum * 1_000_000_000);

      let avatarBlobId = "";

      if (avatar && currentAccount) {
        setIsUploading(true);
        const uploadedFiles = await uploadFiles(
          [avatar],
          suiClient,
          currentAccount,
          signAndExecuteTransaction
        );
        avatarBlobId = uploadedFiles[0]?.blobId || "";
        setIsUploading(false);
      }

      await register({
        name: name.trim(),
        bio: bio.trim(),
        xProfile: twitterHandle.trim(),
        avatarBlobId,
        price: priceInMist,
      });

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
            htmlFor="price"
            className="block text-sm font-medium mb-2"
            style={{ color: "var(--text-primary)" }}
          >
            Subscription Price (SUI per year)
          </label>
          <div className="relative">
            <input
              id="price"
              type="text"
              inputMode="decimal"
              value={price}
              onChange={(e) => {
                const val = e.target.value;
                if (val === "" || /^\d*\.?\d*$/.test(val)) {
                  setPrice(val);
                }
              }}
              placeholder="0.1"
              className="w-full px-4 py-3 rounded-lg outline-none transition-colors"
              style={{
                backgroundColor: "var(--bg-primary)",
                border: "1px solid var(--border-color)",
                color: "var(--text-primary)",
              }}
              disabled={isPending}
            />
            <span
              className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium"
              style={{ color: "var(--text-secondary)" }}
            >
              SUI
            </span>
          </div>
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

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <Button type="submit" disabled={isPending || isUploading} className="w-full">
          {isUploading ? "Uploading avatar..." : isPending ? "Registering..." : "Register as Creator"}
        </Button>
      </form>
    </Card>
  );
}
