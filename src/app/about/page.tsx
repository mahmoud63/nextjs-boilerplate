import Link from "next/link";
import { ArrowLeft, Mail, Info, Dumbbell, Calendar, Globe, Layers } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex items-center gap-4 pb-4 border-b border-muted">
        <Link href="/" className="p-2 -ml-2 hover:bg-muted rounded-full transition-colors">
          <ArrowLeft size={24} className="text-foreground" />
        </Link>
        <div>
          <h1 className="text-3xl font-black tracking-tight text-primary uppercase">About Beast Tracker</h1>
        </div>
      </header>

      <section className="bg-card p-6 rounded-3xl border border-muted shadow-sm space-y-4">
        <div className="flex items-center gap-3 text-primary mb-4">
          <Info size={28} />
          <h2 className="text-2xl font-bold uppercase tracking-tight">System Guide</h2>
        </div>
        <p className="text-muted-foreground leading-relaxed">
          Welcome to Beast Tracker, your ultimate self-tracking workout and fitness companion. This system is designed to give you complete control over your fitness routines, letting you craft highly customizable workout schedules, log every session meticulously, and share your creations with a vibrant community.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold uppercase tracking-tight text-foreground ml-2">Core Features</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-muted/30 p-5 rounded-2xl border border-muted/50 flex flex-col gap-3">
            <div className="bg-primary/20 w-10 h-10 rounded-full flex items-center justify-center text-primary">
              <Dumbbell size={20} />
            </div>
            <h3 className="font-bold text-foreground">Advanced Exercise Studio</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Create and manage a personal library of exercises. Configure sets, reps, target muscles, rest times, and attach demonstration images.
            </p>
          </div>

          <div className="bg-muted/30 p-5 rounded-2xl border border-muted/50 flex flex-col gap-3">
            <div className="bg-blue-500/20 w-10 h-10 rounded-full flex items-center justify-center text-blue-500">
              <Layers size={20} />
            </div>
            <h3 className="font-bold text-foreground">Routine Profiles</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Group your days into specific Routine Profiles (e.g., "Bulking Phase", "Cutting Phase"). Easily switch your active profile at any time.
            </p>
          </div>

          <div className="bg-muted/30 p-5 rounded-2xl border border-muted/50 flex flex-col gap-3">
            <div className="bg-green-500/20 w-10 h-10 rounded-full flex items-center justify-center text-green-500">
              <Calendar size={20} />
            </div>
            <h3 className="font-bold text-foreground">Day-by-Day Configuration</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Design exact workout days, assign specific exercises, or designate rest days. Build a structured regimen that fits your life.
            </p>
          </div>

          <div className="bg-muted/30 p-5 rounded-2xl border border-muted/50 flex flex-col gap-3">
            <div className="bg-orange-500/20 w-10 h-10 rounded-full flex items-center justify-center text-orange-500">
              <Globe size={20} />
            </div>
            <h3 className="font-bold text-foreground">Community Marketplace</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Discover workout routines created by other athletes. Add them to your local library and keep them synced when the author publishes updates.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-card p-6 rounded-3xl border border-muted shadow-sm space-y-4 text-center mt-8">
        <div className="w-16 h-16 bg-primary/20 text-primary rounded-full flex items-center justify-center mx-auto mb-2">
          <Mail size={32} />
        </div>
        <h2 className="text-xl font-black uppercase tracking-tight text-foreground">Contact the Developer</h2>
        <p className="text-muted-foreground text-sm max-w-sm mx-auto">
          Have feedback, feature requests, or just want to say hi? Reach out to the creator directly!
        </p>
        <a 
          href="mailto:mahmoudk63@gmail.com"
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold hover:bg-primary/90 transition-colors mt-2"
        >
          mahmoudk63@gmail.com
        </a>
      </section>
    </div>
  );
}
