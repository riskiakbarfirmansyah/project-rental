"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function PageViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // Don't track admin pages
    if (pathname.startsWith("/admin") || pathname.startsWith("/api")) {
      return;
    }

    // Small delay to avoid tracking navigations that immediately redirect
    const timeout = setTimeout(() => {
      fetch("/api/pageviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ page: pathname }),
      }).catch(() => {
        // Silently fail - tracking should never break the app
      });
    }, 300);

    return () => clearTimeout(timeout);
  }, [pathname]);

  return null;
}
