"use client";

import { CreatorCard } from "./CreatorCard";
import { PotatoLoader } from "@/components/ui";
import { Creator } from "@/types";

interface CreatorListProps {
  creators: Creator[];
  isLoading?: boolean;
}

export function CreatorList({ creators, isLoading }: CreatorListProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <PotatoLoader fullScreen size="lg" text="Loading creators..." />
      </div>
    );
  }

  if (creators.length === 0) {
    return (
      <div
        className="text-center py-12"
        style={{ color: "var(--text-secondary)" }}
      >
        <p className="text-lg">No creators found</p>
        <p className="text-sm mt-2">Try a different search term</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full auto-rows-fr">
      {creators.map((creator) => (
        <CreatorCard key={creator.address} creator={creator} />
      ))}
    </div>
  );
}
