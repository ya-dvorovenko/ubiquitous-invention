"use client";

import { PotatoLoader } from "@/components/ui";

export default function DashboardLoading() {
  return (
    <div className="page-container py-16">
      <div className="flex items-center justify-center min-h-[50vh]">
        <PotatoLoader size="lg" text="Loading dashboard..." />
      </div>
    </div>
  );
}
