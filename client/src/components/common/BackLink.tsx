import Link from "next/link";

interface BackLinkProps {
  href: string;
  children: React.ReactNode;
}

export function BackLink({ href, children }: BackLinkProps) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 mb-6 hover:underline"
      style={{ color: "var(--text-secondary)" }}
    >
      {children}
    </Link>
  );
}
