"use client";

import { useState, useMemo, useEffect } from "react";
import { SearchBar } from "@/components/common";
import { CreatorList } from "@/components/creator";
import { MOCK_CREATORS } from "@/data/mock";
import { useSuiNS } from "@/hooks";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [resolvedAddress, setResolvedAddress] = useState<string | null>(null);
  const [isResolvingSuiNS, setIsResolvingSuiNS] = useState(false);
  const { resolveNameToAddress } = useSuiNS();

  // Local search - always runs first
  const localResults = useMemo(() => {
    if (!searchQuery.trim()) return MOCK_CREATORS;

    const query = searchQuery.toLowerCase();

    return MOCK_CREATORS.filter(
      (creator) =>
        creator.name.toLowerCase().includes(query) ||
        creator.address.toLowerCase().includes(query) ||
        creator.suinsName?.toLowerCase().includes(query) ||
        creator.bio.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  // Only resolve SuiNS if no local results found
  useEffect(() => {
    const query = searchQuery.trim().toLowerCase();

    // Skip SuiNS lookup if: empty, is address, or found locally
    if (!query || query.startsWith("0x") || localResults.length > 0) {
      setResolvedAddress(null);
      setIsResolvingSuiNS(false);
      return;
    }

    // Try SuiNS resolution
    setIsResolvingSuiNS(true);
    const timeoutId = setTimeout(async () => {
      const address = await resolveNameToAddress(query);
      setResolvedAddress(address);
      setIsResolvingSuiNS(false);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, localResults.length, resolveNameToAddress]);

  // Final results: prefer SuiNS resolved, fallback to local
  const filteredCreators = useMemo(() => {
    if (resolvedAddress) {
      return MOCK_CREATORS.filter(
        (creator) => creator.address.toLowerCase() === resolvedAddress.toLowerCase()
      );
    }
    return localResults;
  }, [resolvedAddress, localResults]);

  return (
    <div className="page-container py-8">
      <div className="flex flex-col items-center mb-12">
        <h1
          className="text-4xl font-bold mb-2"
          style={{ color: "var(--text-primary)" }}
        >
          Discover Creators
        </h1>
        <p
          className="text-lg mb-8"
          style={{ color: "var(--text-secondary)" }}
        >
          Subscribe to your favorite creators and access exclusive content
        </p>
        <SearchBar onSearch={setSearchQuery} isLoading={isResolvingSuiNS} />

        {resolvedAddress && (
          <p
            className="text-sm mt-2"
            style={{ color: "var(--text-secondary)" }}
          >
            Resolved to: {resolvedAddress.slice(0, 10)}...{resolvedAddress.slice(-6)}
          </p>
        )}
      </div>

      <CreatorList creators={filteredCreators} />
    </div>
  );
}
