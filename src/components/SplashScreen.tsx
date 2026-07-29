"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

import { BEAST_LOGO_B64 } from "@/lib/logo";

export default function SplashScreen() {
  const [show, setShow] = useState(true);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    // The previous version leaned on `animate-out fade-out`, which needs a Tailwind
    // animation plugin the project does not have — so it never faded, it vanished.
    const fade = setTimeout(() => setLeaving(true), 1500);
    const hide = setTimeout(() => setShow(false), 2000);
    return () => {
      clearTimeout(fade);
      clearTimeout(hide);
    };
  }, []);

  if (!show) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center transition-opacity duration-500 ease-kinetic ${
        leaving ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="flex flex-col items-center animate-rise">
        <Image
          src={BEAST_LOGO_B64}
          alt="Beast Tracker Icon"
          width={88}
          height={88}
          className="bg-black"
          unoptimized={true}
        />
        <h1 className="mt-6 font-display text-title-lg uppercase text-fg leading-none">
          Beast Tracker
        </h1>
        {/* Single lime rule: the whole splash's accent budget. */}
        <span className="mt-4 h-0.5 w-16 bg-accent-fill" />
      </div>
    </div>
  );
}
