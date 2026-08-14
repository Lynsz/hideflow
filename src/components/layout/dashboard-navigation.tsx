"use client";

import {
  BarChart3,
  Building2,
  CalendarClock,
  Columns3,
  LayoutDashboard,
  Settings,
  SquareKanban,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Logo } from "@/components/brand/logo";
import { LogoutButton } from "@/features/auth/components/logout-button";
import type { AuthenticatedUser } from "@/features/auth/types/auth";
import { cn } from "@/lib/utils";
import type { NavigationItem } from "@/types/navigation";

const navigationItems: NavigationItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  {
    label: "Candidaturas",
    href: "/dashboard/candidaturas",
    icon: Columns3,
  },
  {
    label: "Kanban",
    href: "/dashboard/kanban",
    icon: SquareKanban,
    disabled: true,
  },
  {
    label: "Empresas",
    href: "/dashboard/empresas",
    icon: Building2,
  },
  {
    label: "Entrevistas",
    href: "/dashboard/entrevistas",
    icon: CalendarClock,
    disabled: true,
  },
  {
    label: "Analytics",
    href: "/dashboard/analytics",
    icon: BarChart3,
    disabled: true,
  },
  {
    label: "Configurações",
    href: "/dashboard/configuracoes",
    icon: Settings,
    disabled: true,
  },
];

function NavigationItemView({
  item,
  compact = false,
}: {
  item: NavigationItem;
  compact?: boolean;
}) {
  const Icon = item.icon;
  const pathname = usePathname();
  const isActive =
    item.href === "/dashboard"
      ? pathname === item.href
      : pathname.startsWith(item.href);
  const classes = cn(
    "group flex items-center gap-3 rounded-lg px-3 text-sm transition-colors",
    compact
      ? "h-12 shrink-0 flex-col justify-center gap-1 px-4 text-[10px]"
      : "h-10",
    item.disabled
      ? "cursor-not-allowed text-muted-foreground/45"
      : isActive
        ? "bg-muted text-foreground"
        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
  );

  if (item.disabled) {
    return (
      <span
        className={classes}
        aria-disabled="true"
        title="Disponível nas próximas etapas"
      >
        <Icon className="size-4" aria-hidden="true" />
        <span>{item.label}</span>
      </span>
    );
  }

  return (
    <Link
      href={item.href}
      className={classes}
      aria-current={isActive ? "page" : undefined}
    >
      <Icon
        className={cn("size-4", isActive && "text-accent")}
        aria-hidden="true"
      />
      <span>{item.label}</span>
    </Link>
  );
}

function getInitials(fullName: string) {
  return fullName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

export function DashboardSidebar({ user }: { user: AuthenticatedUser }) {
  return (
    <aside className="border-border bg-surface fixed inset-y-0 left-0 z-20 hidden w-64 flex-col border-r md:flex">
      <div className="border-border flex h-18 items-center border-b px-5">
        <Logo href="/dashboard" />
      </div>
      <nav className="flex-1 space-y-1 p-3" aria-label="Navegação do dashboard">
        {navigationItems.map((item) => (
          <NavigationItemView key={item.label} item={item} />
        ))}
      </nav>
      <div className="border-border border-t p-4">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          <span className="bg-accent/10 text-accent grid size-8 place-items-center rounded-full text-xs font-semibold">
            {getInitials(user.fullName)}
          </span>
          <div className="min-w-0">
            <p className="truncate text-xs font-medium">{user.fullName}</p>
            <p className="text-muted-foreground truncate text-[11px]">
              {user.email}
            </p>
          </div>
        </div>
        <LogoutButton />
      </div>
    </aside>
  );
}

export function DashboardMobileNavigation() {
  return (
    <>
      <header className="border-border bg-surface/95 fixed inset-x-0 top-0 z-20 flex h-16 items-center border-b px-4 backdrop-blur md:hidden">
        <Logo href="/dashboard" />
        <div className="ml-auto">
          <LogoutButton compact />
        </div>
      </header>
      <nav
        className="border-border bg-surface/95 fixed inset-x-0 bottom-0 z-20 flex overflow-x-auto border-t px-1 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
        aria-label="Navegação móvel do dashboard"
      >
        {navigationItems.map((item) => (
          <NavigationItemView key={item.label} item={item} compact />
        ))}
      </nav>
    </>
  );
}
