"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useRegisterCreator, useCreators } from "@/hooks";
import { Button, Card, useToast } from "@/components/ui";

export function RegisterForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { register, isPending } = useRegisterCreator();
  const { data: creators } = useCreators();
  const { showToast } = useToast();

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [price, setPrice] = useState("");
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

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

    try {
      const priceInMist = Math.floor(priceNum * 1_000_000_000);

      await register({
        name: name.trim(),
        bio: bio.trim(),
        price: priceInMist,
      });

      showToast("You're now a creator!", "success");
      setIsSuccess(true);
    } catch (err) {
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

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? "Registering..." : "Register as Creator"}
        </Button>
      </form>
    </Card>
  );
}
