"use client";

import Link, { useLinkStatus } from "next/link";
import { usePathname } from "next/navigation";
import { Home, CalendarDays, Dumbbell, History, Settings } from "lucide-react";

/**
 * Marks the tapped tab the moment it is pressed, before the route responds.
 *
 * useLinkStatus must live inside the <Link> it reports on. It fires only while a
 * navigation is genuinely pending — a prefetched route skips the state entirely, so
 * this never flickers on a fast hop.
 */
function PendingMarker() {
  const { pending } = useLinkStatus();

  return (
    <span
      aria-hidden
      className={`absolute top-0 inset-x-0 h-0.5 bg-accent-fill origin-left transition-transform duration-200 ease-kinetic ${
        pending ? "scale-x-100" : "scale-x-0"
      }`}
    />
  );
}

export default function BottomNav() {
  const pathname = usePathname();

  if (pathname === "/login") return null;

  // "Market" rather than "Marketplace": five labels at 10px have to survive a 360px
  // viewport without truncating mid-word.
  const navItems = [
    { label: "Home", href: "/", icon: Home },
    { label: "Routines", href: "/routines", icon: CalendarDays },
    { label: "Market", href: "/marketplace", icon: Dumbbell },
    { label: "History", href: "/history", icon: History },
    { label: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-panel border-t border-line pb-safe">
      <ul className="flex items-stretch h-16 max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className="relative flex flex-col items-center justify-center h-full w-full gap-1"
              >
                {/* Lime marker on the top edge — the tab bar's share of the accent
                    budget, and readable without relying on icon colour alone. */}
                {isActive ? (
                  <span className="absolute top-0 inset-x-0 h-0.5 bg-accent-fill" />
                ) : (
                  <PendingMarker />
                )}
                <Icon
                  size={22}
                  strokeWidth={isActive ? 2.25 : 1.75}
                  className={
                    isActive
                      ? "text-accent"
                      : "text-fg-dim transition-colors duration-[120ms]"
                  }
                />
                <span
                  className={`text-[10px] font-bold uppercase tracking-[0.1em] ${
                    isActive ? "text-fg" : "text-fg-dim"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
