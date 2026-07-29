"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, CalendarDays, Dumbbell, History, Settings } from "lucide-react";

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
                {isActive && (
                  <span className="absolute top-0 inset-x-0 h-0.5 bg-accent-fill" />
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
