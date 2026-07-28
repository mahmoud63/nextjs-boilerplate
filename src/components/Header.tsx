import Image from 'next/image';
import Link from 'next/link';
import { getCurrentUser } from '@/app/actions';
import { UserCircle, Info } from 'lucide-react';
import { BEAST_LOGO_B64 } from '@/lib/logo';
import { ThemeToggle } from '@/components/ThemeToggle';

export default async function Header() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md">
      <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src={BEAST_LOGO_B64}
            alt="App Icon"
            width={40}
            height={40}
            className="rounded-full bg-black shadow-sm"
            unoptimized={true}
          />
          <span className="font-bold tracking-tight text-xl text-accent uppercase">
            BT
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/about" className="text-muted-foreground hover:text-primary transition-colors">
            <Info size={24} />
          </Link>
          <ThemeToggle />
          {user ? (
            <Link
              href="/settings"
              className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              <span className="max-w-24 truncate hidden sm:inline-block">{user.email}</span>
              {user.profilePicUrl ? (
                <img
                  src={`/api/blob?url=${encodeURIComponent(user.profilePicUrl)}`}
                  alt="Profile"
                  className="w-8 h-8 rounded-full object-cover border border-muted"
                />
              ) : (
                <UserCircle size={24} />
              )}
            </Link>
          ) : (
            <Link href="/login" className="text-sm font-bold text-primary">
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
