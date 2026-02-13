"use client";

import Link from "next/link";
import { Creator } from "@/types";
import { Card, Avatar, Button } from "@/components/ui";
import { formatSui } from "@/utils/format";

interface AlreadyCreatorProps {
  creator: Creator;
}

export function AlreadyCreator({ creator }: AlreadyCreatorProps) {
  return (
    <Card>
      <div className="p-6 text-center space-y-4">
        <Avatar name={creator.name} size="lg" className="mx-auto" />
        <div>
          <h2
            className="text-xl font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            You&apos;re already a creator!
          </h2>
          <p
            className="mt-1"
            style={{ color: "var(--text-secondary)" }}
          >
            {creator.name} - {formatSui(creator.subscriptionPrice)} SUI/year
          </p>
        </div>
        <div className="flex gap-3 justify-center">
          <Link href="/dashboard">
            <Button>Go to Dashboard</Button>
          </Link>
          <Link href={`/creator/${creator.address}`}>
            <Button variant="secondary">View Profile</Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}
