import Link from "next/link";

interface NotFoundProps {
  title: string;
  backHref?: string;
  backLabel?: string;
}

export function NotFound({
  title,
  backHref = "/",
  backLabel = "Back to creators",
}: NotFoundProps) {
  return (
    <div className="page-container py-8">
      <div className="text-center">
        <h1
          className="text-2xl font-bold mb-4"
          style={{ color: "var(--text-primary)" }}
        >
          {title}
        </h1>
        <Link
          href={backHref}
          className="hover:underline"
          style={{ color: "var(--accent)" }}
        >
          {backLabel}
        </Link>
      </div>
    </div>
  );
}
