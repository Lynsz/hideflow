"use client";

import { LoaderCircle, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { logout } from "@/features/auth/actions";
import { cn } from "@/lib/utils";

export function LogoutButton({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const handleLogout = () => {
    setError("");
    startTransition(async () => {
      const result = await logout();

      if (!result.success) {
        setError(result.message);
        return;
      }

      router.replace(result.redirectTo ?? "/login");
      router.refresh();
    });
  };

  return (
    <div>
      <button
        type="button"
        onClick={handleLogout}
        disabled={isPending}
        aria-label={compact ? "Sair" : undefined}
        title={compact ? "Sair" : undefined}
        className={cn(
          "text-muted-foreground hover:bg-muted hover:text-foreground flex items-center justify-center gap-2 rounded-lg transition-colors disabled:pointer-events-none disabled:opacity-50",
          compact ? "size-9" : "h-9 w-full px-3 text-xs",
        )}
      >
        {isPending ? (
          <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
        ) : (
          <LogOut className="size-4" aria-hidden="true" />
        )}
        {compact ? null : isPending ? "Saindo…" : "Sair"}
      </button>
      {error ? (
        <p role="alert" className="mt-1 text-center text-[10px] text-red-400">
          {error}
        </p>
      ) : null}
    </div>
  );
}
