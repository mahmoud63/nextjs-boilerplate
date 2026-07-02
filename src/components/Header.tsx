import Image from "next/image";
import Link from "next/link";
import { getCurrentUser } from "@/app/actions";
import { UserCircle } from "lucide-react";

export default async function Header() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md">
      <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/beast-logo.jpg" alt="App Icon" width={40} height={40} className="rounded-lg bg-black shadow-sm" unoptimized={true} />
          <span className="font-bold tracking-tight text-xl text-foreground uppercase">Beast Tracker</span>
        </Link>
        {user ? (
          <Link href="/settings" className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">
            <span className="max-w-24 truncate">{user.username}</span>
            <UserCircle size={24} />
          </Link>
        ) : (
          <Link href="/login" className="text-sm font-bold text-primary">
            Login
          </Link>
        )}
      </div>
    </header>
  );
}
