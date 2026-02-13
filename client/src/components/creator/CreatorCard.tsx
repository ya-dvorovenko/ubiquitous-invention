"use client";

import Link from "next/link";
import { Creator } from "@/types";
import { Avatar, Badge } from "../ui";
import { formatAddress } from "@/utils/format";

interface CreatorCardProps {
  creator: Creator;
}

export function CreatorCard({ creator }: CreatorCardProps) {
  return (
    <Link href={`/creator/${creator.address}`}>
      <div
        className="h-full p-6 rounded-xl transition-all hover:scale-[1.02] hover:brightness-110 cursor-pointer flex flex-col"
        style={{
          backgroundColor: "var(--bg-secondary)",
          border: "1px solid var(--border-color)",
        }}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar name={creator.name} size="md" />
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
          <Badge variant="price">{creator.subscriptionPrice} SUI</Badge>
        </div>
      </div>
    </Link>
  );
}
