import Image from 'next/image';
import Link from 'next/link';
import { getCurrentUser } from '@/app/actions';
import { UserCircle, Info } from 'lucide-react';
import { BEAST_LOGO_B64 } from '@/lib/logo';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ButtonLink } from '@/components/ui';

/* Header carries no lime on purpose — it is on every screen, and spending the
   one-per-viewport accent here would leave nothing for the active set below. */
const ICON_BUTTON =
  "p-2 text-fg-dim hover:text-fg hover:bg-field transition-colors duration-[120ms] ease-kinetic";

export default async function Header() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-50 w-full bg-background/85 backdrop-blur-md border-b border-line">
      <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 min-w-0">
          <Image
            src={BEAST_LOGO_B64}
            alt="App Icon"
            width={32}
            height={32}
            className="bg-black shrink-0"
            unoptimized={true}
          />
          <span className="font-display text-title-md uppercase text-fg leading-none">
            BT
          </span>
        </Link>

        <div className="flex items-center gap-0.5">
          <Link href="/about" aria-label="About" className={ICON_BUTTON}>
            <Info size={20} />
          </Link>

          <ThemeToggle />

          {user ? (
            <Link
              href="/settings"
              className="flex items-center gap-2 pl-1.5 group"
            >
              <span className="hidden sm:inline max-w-24 truncate font-mono text-data-sm text-fg-dim group-hover:text-fg-muted transition-colors">
                {user.email}
              </span>
              {user.profilePicUrl ? (
                /* The avatar is the one intentionally round thing in the app. */
                <img
                  src={`/api/blob?url=${encodeURIComponent(user.profilePicUrl)}`}
                  alt="Profile"
                  className="w-8 h-8 rounded-full object-cover border border-line-strong"
                />
              ) : (
                <UserCircle size={22} className="text-fg-dim group-hover:text-fg transition-colors" />
              )}
            </Link>
          ) : (
            <ButtonLink href="/login" variant="secondary" size="sm" className="ml-1">
              Login
            </ButtonLink>
          )}
        </div>
      </div>
    </header>
  );
}
