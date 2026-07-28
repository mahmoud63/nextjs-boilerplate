"use client";

import { useEffect, useState } from "react";
import { Apple, Monitor, Smartphone, Share, MoreVertical, Plus, Download } from "lucide-react";

type Platform = "ios" | "android" | "desktop";

const guides: Record<
  Platform,
  { label: string; Icon: typeof Apple; browser: string; steps: { text: string; Icon?: typeof Share }[] }
> = {
  ios: {
    label: "iPhone / iPad",
    Icon: Apple,
    browser: "Safari — Chrome on iOS cannot install web apps",
    steps: [
      { text: "Open beast tracker in Safari and sign in." },
      { text: "Tap the Share button in the toolbar.", Icon: Share },
      { text: "Scroll down and choose “Add to Home Screen”.", Icon: Plus },
      { text: "Confirm with “Add”. The icon lands on your home screen." },
    ],
  },
  android: {
    label: "Android",
    Icon: Smartphone,
    browser: "Chrome, Edge, or Samsung Internet",
    steps: [
      { text: "Open beast tracker in Chrome and sign in." },
      { text: "Tap the three-dot menu, top right.", Icon: MoreVertical },
      { text: "Choose “Install app” or “Add to Home screen”.", Icon: Download },
      { text: "Confirm. It installs like any other app." },
    ],
  },
  desktop: {
    label: "Desktop",
    Icon: Monitor,
    browser: "Chrome or Edge on Windows, macOS, Linux",
    steps: [
      { text: "Open beast tracker and sign in." },
      { text: "Click the install icon at the right of the address bar.", Icon: Download },
      { text: "No icon? Use the ⋮ menu → “Cast, save and share” → “Install page as app”.", Icon: MoreVertical },
      { text: "It opens in its own window, no browser tabs." },
    ],
  },
};

const order: Platform[] = ["ios", "android", "desktop"];

export default function InstallGuide() {
  const [active, setActive] = useState<Platform>("android");

  // Open on whichever platform the visitor is actually using.
  useEffect(() => {
    const ua = navigator.userAgent;
    if (/iPhone|iPad|iPod/i.test(ua)) setActive("ios");
    else if (/Android/i.test(ua)) setActive("android");
    else setActive("desktop");
  }, []);

  const guide = guides[active];

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-8">
        {order.map((key) => {
          const { label, Icon } = guides[key];
          const isActive = key === active;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setActive(key)}
              className={`flex items-center gap-2 px-5 py-3 font-sans text-label-lg font-bold uppercase tracking-widest border transition-colors ${
                isActive
                  ? "bg-neon-lime text-surface border-neon-lime"
                  : "bg-transparent text-on-surface-variant border-white/15 hover:border-neon-lime/50 hover:text-on-surface"
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          );
        })}
      </div>

      <div className="border border-white/10 bg-white/[0.03] backdrop-blur-sm p-6 md:p-10">
        <p className="font-sans text-label-lg font-bold uppercase tracking-widest text-neon-lime mb-8">
          {guide.browser}
        </p>
        <ol className="space-y-6">
          {guide.steps.map((step, i) => (
            <li key={step.text} className="flex gap-5 items-start">
              <span className="shrink-0 w-10 h-10 border border-neon-lime/40 text-neon-lime font-display text-lg flex items-center justify-center">
                {i + 1}
              </span>
              <span className="flex-1 pt-1.5 font-sans text-body-lg text-on-surface flex items-center gap-2 flex-wrap">
                {step.text}
                {step.Icon && (
                  <span className="inline-flex items-center justify-center border border-white/15 bg-surface p-1.5">
                    <step.Icon size={15} className="text-on-surface-variant" />
                  </span>
                )}
              </span>
            </li>
          ))}
        </ol>

        <p className="mt-10 pt-6 border-t border-white/10 font-sans text-sm text-on-surface-variant/70">
          Installed, it runs full screen with no address bar, keeps you signed in, and
          launches from your home screen like a native app.
        </p>
      </div>
    </div>
  );
}
