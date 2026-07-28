"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

import { BEAST_LOGO_B64 } from "@/lib/logo";

export default function SplashScreen() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center animate-out fade-out duration-500 fill-mode-forwards" 
      style={{ animationDelay: '1.5s' }}
    >
      <div className="flex flex-col items-center gap-6 animate-in zoom-in-50 fade-in duration-700">
        <Image 
          src={BEAST_LOGO_B64} 
          alt="Beast Tracker Icon" 
          width={100} 
          height={100} 
          className="rounded-3xl bg-black shadow-2xl drop-shadow-2xl" 
          unoptimized={true} 
        />
        <h1 className="text-4xl font-black tracking-tighter uppercase text-accent">
          Beast Tracker
        </h1>
      </div>
    </div>
  );
}
