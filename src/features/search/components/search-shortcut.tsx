"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

const SEARCH_PATH = "/dashboard/busca";

export function SearchShortcut() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (
        !(event.ctrlKey || event.metaKey) ||
        event.key.toLowerCase() !== "k"
      ) {
        return;
      }

      event.preventDefault();
      if (pathname === SEARCH_PATH) {
        document.querySelector<HTMLInputElement>("#global-search")?.focus();
        return;
      }

      router.push(SEARCH_PATH);
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [pathname, router]);

  return null;
}
