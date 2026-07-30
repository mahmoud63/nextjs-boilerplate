import Link from 'next/link';
import { getCurrentUser, getCycleStats } from '@/app/actions';
import { UserCircle } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

/**
 * A live status strip rather than branding.
 *
 * The logo and wordmark are gone from inner pages on purpose: this is an installed
 * PWA, so the mark is already on the home screen and repeating it on every route
 * spent 56px of a phone viewport on something the user cannot act on. What replaces
 * it is cycle state they actually read between sets.
 *
 * Header carries no lime — it is on every screen, and the accent budget belongs to
 * the active set below.
 */
export default async function Header() {
  const [user, statsResult] = await Promise.all([
    getCurrentUser(),
    getCycleStats(),
  ]);

  const stats = statsResult.success ? statsResult.data : null;
  const done = stats?.completed ?? 0;
  const skipped = stats?.skipped ?? 0;

  return (
    <header className="sticky top-0 z-50 w-full bg-background/85 backdrop-blur-md border-b border-line">
      <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between gap-3">
        <Link href="/" className="min-w-0 group" aria-label="Dashboard">
          <p className="text-eyebrow uppercase text-fg-dim">Cycle</p>
          {/* Mono and tabular so the row does not shift as counts tick over. */}
          <p className="mt-0.5 font-mono tnum text-data-sm text-fg group-hover:text-accent transition-colors">
            {done} done
            <span className="text-fg-dim"> · {skipped} skip</span>
          </p>
        </Link>

        <div className="flex items-center gap-0.5 shrink-0">
          <ThemeToggle />

          {user ? (
            <Link href="/settings" aria-label="Settings" className="pl-1.5 group">
              {user.profilePicUrl ? (
                /* The avatar is the one intentionally round thing in the app. */
                <img
                  src={`/api/blob?url=${encodeURIComponent(user.profilePicUrl)}`}
                  alt="Profile"
                  className="w-8 h-8 rounded-full object-cover border border-line-strong group-hover:border-accent transition-colors"
                />
              ) : (
                <UserCircle
                  size={22}
                  className="text-fg-dim group-hover:text-fg transition-colors"
                />
              )}
            </Link>
          ) : (
            <Link
              href="/login"
              className="ml-1 px-3 h-9 inline-flex items-center border border-line-strong text-[11px] font-bold uppercase tracking-[0.14em] text-fg hover:border-accent hover:text-accent transition-colors"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
