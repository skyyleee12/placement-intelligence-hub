import { useState } from "react";
import { cn } from "@/lib/utils";

const domainOf = (url?: string) => {
  try { return url ? new URL(url).hostname.replace(/^www\./, "") : ""; } catch { return ""; }
};

export function CompanyLogo({ name, logoUrl, websiteUrl, className }: { name: string; logoUrl?: string; websiteUrl?: string; className?: string }) {
  const key = import.meta.env.VITE_LOGO_DEV_PUBLISHABLE_KEY as string | undefined;
  const domain = domainOf(websiteUrl);
  const sources = [key && domain ? `https://img.logo.dev/${domain}?token=${key}` : "", logoUrl ?? ""].filter(Boolean);
  const [idx, setIdx] = useState(0);
  const src = sources[idx];
  return (
    <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-card", className)}>
      {src ? (
        <img src={src} alt={`${name} logo`} className="h-full w-full object-contain p-1" onError={() => setIdx((i) => i + 1)} />
      ) : (
        <span className="font-heading text-sm font-semibold text-primary">{name.charAt(0).toUpperCase()}</span>
      )}
    </div>
  );
}
