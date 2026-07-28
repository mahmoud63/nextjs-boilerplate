"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";

const links = [
  { label: "Features", href: "#features" },
  { label: "Tracking", href: "#tracking" },
  { label: "Install", href: "#install" },
  { label: "FAQ", href: "#faq" },
];

export default function LandingNav() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 w-full z-50 bg-surface/90 backdrop-blur-md border-b border-white/10">
      <div className="flex justify-between items-center w-full px-5 md:px-16 py-4 max-w-[1280px] mx-auto">
        <a href="#top" className="flex items-center gap-3">
          {/* The logo art is white-on-solid-black; screen blending drops the black
              block so it sits flush on the dark surface. */}
          <Image
            src="/logo.png"
            alt="Beast Tracker logo"
            width={44}
            height={44}
            priority
            className="h-10 w-10 md:h-11 md:w-11 object-contain mix-blend-screen"
          />
          <span className="font-display text-2xl md:text-headline-md uppercase text-neon-lime italic tracking-wider">
            Beast Tracker
          </span>
        </a>

        <nav className="hidden md:flex gap-8 items-center">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-on-surface font-sans text-label-lg font-bold uppercase transition-colors duration-200 hover:text-neon-lime"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <Link
          href="/login"
          className="hidden md:block bg-neon-lime text-surface font-display text-lg uppercase px-6 py-2 transition-all duration-300 scale-95 hover:scale-100 ease-in-out"
        >
          Sign In
        </Link>

        <button
          className="md:hidden text-neon-lime"
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {menuOpen && (
        <nav className="md:hidden flex flex-col gap-4 px-5 pb-6 bg-surface/95 border-t border-white/10 pt-4">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="text-on-surface font-sans text-label-lg font-bold uppercase hover:text-neon-lime"
            >
              {link.label}
            </a>
          ))}
          <Link
            href="/login"
            className="bg-neon-lime text-surface font-display text-lg uppercase px-6 py-2 w-full text-center"
          >
            Sign In
          </Link>
        </nav>
      )}
    </header>
  );
}
