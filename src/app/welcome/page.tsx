import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  Activity,
  BookOpen,
  CalendarDays,
  Check,
  LineChart,
  PlayCircle,
  Store,
} from "lucide-react";
import LandingNav from "./LandingNav";
import InstallGuide from "./InstallGuide";
import { DayScreen, LoggerScreen, TypeChips } from "./AppMockups";

export const metadata: Metadata = {
  title: "Beast Tracker — Log the work. Watch it compound.",
  description:
    "A workout tracker built around real programming: exercise types that log what they should, RPE and target weights, block periodisation, in-app demos, and routines you can share.",
};

const features = [
  {
    Icon: Activity,
    title: "Four Exercise Types",
    body: "A treadmill run should not ask you for weight. Weights, bodyweight, timed holds and cardio each log exactly what they should — nothing more to fight with.",
  },
  {
    Icon: LineChart,
    title: "Progress That Matches",
    body: "Charts trend the metric that counts for each movement: kilos on the bar, reps on the bar hang, seconds on the plank, minutes on the bike.",
  },
  {
    Icon: BookOpen,
    title: "Rich Session Briefs",
    body: "Warm-up, block targets, progression rules and cool-down live on the day itself as formatted text — not a note buried on your phone.",
  },
  {
    Icon: PlayCircle,
    title: "Demos In The App",
    body: "Attach a clip or a link to any exercise and it plays inline. Add as many reference links as you want alongside it.",
  },
  {
    Icon: CalendarDays,
    title: "Built For Blocks",
    body: "Target RPE, target weight and rest sit on every exercise, so a 12-week periodised plan survives contact with a real gym.",
  },
  {
    Icon: Store,
    title: "Share Your Routines",
    body: "Publish a full programme to the marketplace, or pull someone else's into your own account and make it yours.",
  },
];

const faqs = [
  {
    q: "Is it free?",
    a: "Yes. Create an account, build your routine, and start logging. There is no paywall on tracking.",
  },
  {
    q: "Do I need to install anything?",
    a: "No. It runs in any browser. Installing it as an app is optional — it just makes it full screen and one tap from your home screen.",
  },
  {
    q: "Does it work offline?",
    a: "The app shell is cached, so it opens without a connection. Logging sets needs a connection to save to your account.",
  },
  {
    q: "Can I bring my own programme?",
    a: "Yes. Build days and exercises yourself, or copy a published routine from the marketplace and edit every field — sets, reps, RPE, rest, notes and order.",
  },
];

export default function WelcomePage() {
  return (
    <div id="top" className="bg-surface text-on-surface min-h-screen">
      <LandingNav />

      {/* HERO */}
      <section className="relative min-h-[90svh] flex items-center pt-28 pb-20 overflow-hidden">
        <div
          className="absolute inset-0 z-0 opacity-[0.06]"
          aria-hidden
          style={{
            backgroundImage:
              "linear-gradient(#ccff00 1px, transparent 1px), linear-gradient(90deg, #ccff00 1px, transparent 1px)",
            backgroundSize: "72px 72px",
          }}
        />
        <div className="absolute inset-0 z-0 bg-gradient-to-t from-surface via-surface/70 to-transparent" aria-hidden />

        <div className="relative z-10 w-full max-w-[1280px] mx-auto px-5 md:px-16 flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left">
            <Image
              src="/logo.png"
              alt="Beast Tracker logo"
              width={96}
              height={96}
              priority
              className="h-20 w-20 md:h-24 md:w-24 object-contain mix-blend-screen mb-6"
            />
            <span className="font-sans text-label-lg font-bold uppercase tracking-widest text-neon-lime border border-neon-lime/30 px-3 py-1.5">
              Free · Installs as an app
            </span>

            <h1 className="mt-6 font-display text-5xl md:text-7xl xl:text-display-lg uppercase italic leading-[0.95] max-w-4xl">
              Log the work.
              <br />
              Watch it <span className="text-neon-lime">compound</span>.
            </h1>

            <p className="mt-8 font-sans text-body-lg text-on-surface-variant max-w-2xl border-l-4 border-neon-lime pl-4 text-left">
              A tracker built around how training actually works — periodised blocks,
              target RPE, four kinds of exercise, and a session brief that tells you
              what to do before you touch a bar.
            </p>

            <div className="mt-10 flex gap-4 flex-wrap justify-center lg:justify-start w-full sm:w-auto">
              <Link
                href="/login"
                className="w-full sm:w-auto text-center whitespace-nowrap bg-neon-lime text-surface font-display text-lg md:text-2xl uppercase px-8 py-4 transition-all hover:-translate-y-1"
              >
                Start Tracking
              </Link>
              <a
                href="#install"
                className="w-full sm:w-auto text-center whitespace-nowrap bg-transparent text-neon-lime font-display text-lg md:text-2xl uppercase px-8 py-4 border border-neon-lime hover:bg-neon-lime/10 transition-all hover:-translate-y-1"
              >
                Install The App
              </a>
            </div>
          </div>

          <div className="flex-1 flex justify-center lg:justify-end">
            <DayScreen />
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-20 md:py-32 px-5 md:px-16 relative">
        <div className="max-w-[1280px] mx-auto">
          <h2 className="font-display text-4xl md:text-headline-lg uppercase text-neon-lime">
            Everything The Session Needs
          </h2>
          <p className="font-sans text-body-lg text-on-surface-variant max-w-3xl mt-4">
            Most trackers give you a weight box and a reps box and wish you luck. This
            one carries the programme with you.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-14">
            {features.map(({ Icon, title, body }) => (
              <div
                key={title}
                className="border border-white/10 bg-white/[0.03] backdrop-blur-sm p-8 flex flex-col gap-4 transition-colors hover:border-neon-lime/40"
              >
                <Icon size={36} className="text-neon-lime" strokeWidth={1.5} />
                <h3 className="font-display text-2xl uppercase text-on-surface">{title}</h3>
                <p className="font-sans text-body-md text-on-surface-variant">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TRACKING / TYPES */}
      <section id="tracking" className="py-20 md:py-32 px-5 md:px-16 bg-deep-charcoal">
        <div className="max-w-[1280px] mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1 order-2 lg:order-1 w-full">
              <h2 className="font-display text-4xl md:text-headline-lg uppercase italic">
                It Asks The <span className="text-neon-lime">Right Question</span>
              </h2>
              <p className="font-sans text-body-lg text-on-surface-variant mt-4 max-w-2xl">
                Every exercise carries a type, and the logger reshapes itself around it.
                Your history and your charts follow the same rule.
              </p>

              <div className="mt-10">
                <TypeChips />
              </div>

              <ul className="mt-10 space-y-3 font-sans text-body-md text-on-surface">
                {[
                  "Target weight and RPE on every movement",
                  "Rest timers and notes where you can actually see them",
                  "Reorder days and exercises to match how you train",
                  "History keyed to the exercise, so a rename never loses it",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <Check size={18} className="text-neon-lime shrink-0 mt-1" strokeWidth={3} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex-1 order-1 lg:order-2 flex justify-center">
              <LoggerScreen />
            </div>
          </div>
        </div>
      </section>

      {/* INSTALL */}
      <section id="install" className="py-20 md:py-32 px-5 md:px-16">
        <div className="max-w-[1000px] mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-display text-4xl md:text-headline-lg uppercase text-neon-lime">
              Put It On Your Home Screen
            </h2>
            <p className="font-sans text-body-lg text-on-surface-variant mt-4 max-w-2xl mx-auto">
              Beast Tracker is a progressive web app. There is no app store, no download,
              and no update to chase — installing takes about ten seconds.
            </p>
          </div>

          <InstallGuide />
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 md:py-32 px-5 md:px-16 bg-deep-charcoal">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-display text-4xl md:text-headline-lg uppercase text-neon-lime mb-4">
              FAQ
            </h2>
            <p className="font-sans text-label-lg font-bold uppercase tracking-widest text-on-surface-variant">
              Common Questions
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq) => (
              <details
                key={faq.q}
                className="group bg-surface-container border border-surface-container-high [&_summary::-webkit-details-marker]:hidden"
              >
                <summary className="flex items-center justify-between gap-4 p-5 md:p-6 cursor-pointer font-display text-lg md:text-xl uppercase text-on-surface">
                  <span>{faq.q}</span>
                  <span className="text-neon-lime text-2xl leading-none transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <div className="px-5 md:px-6 pb-6 font-sans text-body-md text-on-surface-variant">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA + FOOTER */}
      <section className="py-24 md:py-32 px-5 md:px-16 border-t border-white/10">
        <div className="max-w-[1280px] mx-auto text-center">
          <h2 className="font-display text-4xl md:text-display-lg uppercase italic leading-[0.95]">
            No Excuses. <span className="text-neon-lime">Just Reps.</span>
          </h2>
          <Link
            href="/login"
            className="inline-block mt-10 bg-neon-lime text-surface font-display text-xl md:text-2xl uppercase px-12 py-5 transition-all hover:-translate-y-1"
          >
            Start Tracking
          </Link>
        </div>
      </section>

      <footer className="border-t border-white/10 px-5 md:px-16 py-10">
        <div className="max-w-[1280px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="Beast Tracker logo"
              width={36}
              height={36}
              className="h-9 w-9 object-contain mix-blend-screen"
            />
            <span className="font-display text-xl uppercase text-neon-lime italic tracking-wider">
              Beast Tracker
            </span>
          </div>
          <p className="font-sans text-sm text-on-surface-variant/60">
            Track your daily exercise routine and unleash your inner beast.
          </p>
          <Link
            href="/login"
            className="font-sans text-label-lg font-bold uppercase tracking-widest text-on-surface hover:text-neon-lime transition-colors"
          >
            Sign In
          </Link>
        </div>
      </footer>
    </div>
  );
}
