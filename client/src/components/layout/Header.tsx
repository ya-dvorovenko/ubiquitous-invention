"use client";

import Image from "next/image";
import Link from "next/link";
import { useIsCreator } from "@/hooks";
import { WalletConnect } from "./WalletConnect";

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="hover:text-[var(--accent)] transition-colors"
      style={{
        color: "var(--text-primary)",
        fontWeight: 400,
        fontSize: 16,
        lineHeight: "140%",
      }}
    >
      {children}
    </Link>
  );
}

export function Header() {
  const { isCreator } = useIsCreator();

  return (
    <header
      className="page-container fixed top-0 left-0 right-0 z-50 flex items-center justify-between border-b"
      style={{
        backgroundColor: "var(--bg-primary)",
        borderColor: "var(--border-color)",
        paddingTop: 12,
        paddingBottom: 12,
      }}
    >
      <div className="flex items-center gap-12">
        <Link
          href="/"
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <Image src="/potato.webp" alt="potato" width={40} height={40} />
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <NavLink href="/">Creators</NavLink>
          <NavLink href="/subscriptions">My Subscriptions</NavLink>
          {isCreator ? (
            <NavLink href="/dashboard">Dashboard</NavLink>
          ) : (
            <NavLink href="/register">Become Creator</NavLink>
          )}
        </nav>
      </div>

      <WalletConnect />
    </header>
  );
}
