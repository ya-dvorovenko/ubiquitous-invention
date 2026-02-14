"use client";

import Link from "next/link";
import Image from "next/image";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { Creator } from "@/types";
import { Avatar, Badge } from "../ui";
import { formatAddress, formatSui } from "@/utils/format";
import { getWalrusUrl } from "@/sdk/walrus-http";
import { useIsSubscribed } from "@/hooks/useSubscription";

interface CreatorCardProps {
  creator: Creator;
}

export function CreatorCard({ creator }: CreatorCardProps) {
  const currentAccount = useCurrentAccount();
  const { isSubscribed } = useIsSubscribed(creator.profileId || "");

  const isOwnProfile = currentAccount?.address === creator.address;

  return (
    <Link href={`/creator/${creator.address}`}>
      <div
        className="h-full p-6 rounded-xl transition-all hover:scale-[1.02] cursor-pointer flex flex-col"
        style={{
          backgroundColor: "var(--bg-secondary)",
          border: isOwnProfile
            ? "2px solid var(--accent)"
            : "1px solid var(--border-color)",
          boxShadow: isOwnProfile
            ? "0 0 12px rgba(255, 196, 69, 0.25)"
            : "none",
        }}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar
                name={creator.name}
                size="md"
                avatarUrl={creator.avatarBlobId ? getWalrusUrl(creator.avatarBlobId) : undefined}
              />
            <div>
              <h3
                className="font-semibold text-lg"
                style={{ color: "var(--text-primary)" }}
              >
                {creator.name}
              </h3>
              <p
                className="text-sm"
                style={{ color: "var(--text-secondary)" }}
              >
                {formatAddress(creator.address)}
              </p>
            </div>
          </div>
          {isOwnProfile && (
            <Badge variant="default">You</Badge>
          )}
          {!isOwnProfile && isSubscribed && (
            <Image
              src="/sub.jpg"
              alt="Subscribed"
              width={28}
              height={28}
              className="rounded-full"
              title="Subscribed"
            />
          )}
        </div>

        <p
          className="text-sm mb-4 line-clamp-2 flex-1"
          style={{ color: "var(--text-secondary)" }}
        >
          {creator.bio}
        </p>

        <div className="flex items-center justify-between mt-auto">
          <span
            className="text-sm"
            style={{ color: "var(--text-secondary)" }}
          >
            {creator.subscriberCount} subscribers
          </span>
          {creator.tiers.length > 0 ? (
            <Badge variant="price">
              from {formatSui(Math.min(...creator.tiers.map(t => t.price)))} SUI
            </Badge>
          ) : (
            <Badge variant="default">No tiers</Badge>
          )}
        </div>
      </div>
    </Link>
  );
}
