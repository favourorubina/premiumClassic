"use client";

import { usePathname } from "next/navigation";
import { SiteShell } from "@/components/SiteShell";

export default function ClientLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/sweet-81985");

  if (isAdmin) return <>{children}</>;

  return <SiteShell>{children}</SiteShell>;
}
