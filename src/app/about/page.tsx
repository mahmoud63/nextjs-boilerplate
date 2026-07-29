import Link from "next/link";
import { ChevronLeft, Mail, Dumbbell, Calendar, Globe, Layers } from "lucide-react";
import { ButtonLink, Card, PageTitle } from "@/components/ui";

/* Icon tint was blue/green/orange per card. The system has one accent, so the cards
   are differentiated by their number and icon instead of by hue. */
const FEATURES = [
  {
    icon: Dumbbell,
    title: "Exercise studio",
    body: "Build a personal library of exercises. Configure sets, reps, target muscles, rest times, and attach demonstration media.",
  },
  {
    icon: Layers,
    title: "Routine profiles",
    body: "Group days into profiles — bulking, cutting, off-season — and switch the active one whenever the plan changes.",
  },
  {
    icon: Calendar,
    title: "Day-by-day config",
    body: "Design exact training days, assign exercises, or mark rest days. A structured cycle that fits the week you actually have.",
  },
  {
    icon: Globe,
    title: "Marketplace",
    body: "Take routines built by other athletes into your library, and stay synced when the author publishes an update.",
  },
] as const;

export default function AboutPage() {
  return (
    <div className="space-y-5 animate-rise">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 -ml-1 text-eyebrow uppercase text-fg-dim hover:text-fg transition-colors w-fit"
      >
        <ChevronLeft size={14} /> Back
      </Link>

      <PageTitle title="Beast Tracker" eyebrow="System guide" />

      <p className="text-body text-fg-muted leading-relaxed">
        A self-tracking workout companion. Craft customisable schedules, log every
        session precisely, and share what works with the community.
      </p>

      <div className="pt-1">
        <p className="text-eyebrow uppercase text-fg-dim">Core features</p>

        <div className="mt-3 space-y-2">
          {FEATURES.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title}>
                <div className="flex items-start gap-3">
                  <span className="font-mono tnum text-data-sm text-fg-dim pt-0.5 shrink-0">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 text-eyebrow uppercase text-fg">
                      <Icon size={14} className="text-fg-dim shrink-0" />
                      {feature.title}
                    </p>
                    <p className="mt-2 text-body-sm text-fg-muted leading-relaxed">
                      {feature.body}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      <Card className="text-center" chamfer>
        <Mail size={22} className="text-fg-dim mx-auto" />
        <p className="mt-3 font-display text-title-md uppercase text-fg">
          Contact the developer
        </p>
        <p className="mt-2 text-body-sm text-fg-muted max-w-sm mx-auto">
          Feedback, feature requests, bug reports — send them straight over.
        </p>
        <ButtonLink href="mailto:mahmoudk63@gmail.com" className="mt-5">
          mahmoudk63@gmail.com
        </ButtonLink>
      </Card>

      <div className="border border-line p-4">
        <p className="text-eyebrow uppercase text-fg-dim">Legal disclaimer</p>
        <p className="mt-2 text-body-sm text-fg-dim leading-relaxed">
          The system administrator and the developer of Beast Tracker assume no
          responsibility or liability for any copyright infringement, unauthorized
          distribution, or misuse of licensed images, graphics, or media uploaded by
          users. All content, including but not limited to exercise demonstration media
          and user profile pictures, is uploaded at the sole discretion and
          responsibility of the individual user. By utilizing this platform, users
          expressly agree that they possess the necessary rights, licenses, and
          permissions for any content they upload, and they agree to indemnify and hold
          harmless the system administrator from any claims or damages arising from such
          user-generated content.
        </p>
      </div>
    </div>
  );
}
