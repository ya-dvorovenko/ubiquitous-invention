"use client";

import Link from "next/link";
import { Creator } from "@/types";
import { Avatar } from "../ui";
import { formatAddress, formatDate } from "@/utils/format";

interface PostAuthorProps {
  creator: Creator;
  date: string;
}

export function PostAuthor({ creator, date }: PostAuthorProps) {
  return (
    <div className="flex items-center gap-4 mb-8">
      <Link
        href={`/creator/${creator.address}`}
        className="flex items-center gap-3 hover:opacity-80 transition-opacity"
      >
        <Avatar name={creator.name} size="sm" />
        <div>
          <p className="font-medium" style={{ color: "var(--text-primary)" }}>
            {creator.name}
          </p>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            {formatAddress(creator.address)}
          </p>
        </div>
      </Link>
      <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
        {formatDate(date)}
      </span>
    </div>
  );
}
