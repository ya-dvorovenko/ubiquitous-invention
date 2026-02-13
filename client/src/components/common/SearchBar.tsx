"use client";

import { useState } from "react";

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  isLoading?: boolean;
}

export function SearchBar({
  onSearch,
  placeholder = "Search by name, address, or SuiNS (e.g. alice.sui)...",
  isLoading = false,
}: SearchBarProps) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    onSearch(value);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleChange}
          placeholder={placeholder}
          className="w-full px-4 py-3 pl-12 pr-12 rounded-xl outline-none transition-all focus:ring-2 focus:ring-[var(--accent)]"
          style={{
            backgroundColor: "var(--bg-secondary)",
            border: "1px solid var(--border-color)",
            color: "var(--text-primary)",
            fontSize: 16,
          }}
        />
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--text-secondary)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>

        {isLoading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div
              className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin"
              style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }}
            />
          </div>
        )}
      </div>
    </form>
  );
}
