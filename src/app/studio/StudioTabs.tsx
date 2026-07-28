"use client";

import { useState } from "react";
import DaysManager from "@/app/days/DaysManager";
import ExercisesManager from "@/app/exercises/ExercisesManager";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function StudioTabs({ 
  initialDays, 
  initialExercises, 
  profiles, 
  currentProfileId,
  publishedProfiles
}: {
  initialDays: any[];
  initialExercises: any[];
  profiles: any[];
  currentProfileId: string;
  publishedProfiles: any[];
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"days" | "exercises">("days");

  const currentProfile = profiles.find(p => p.id === currentProfileId) || profiles[0];

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex items-center gap-4 mb-4">
        <button 
          onClick={() => router.push('/routines?tab=published')}
          className="p-2 bg-muted/50 text-muted-foreground rounded-full hover:bg-muted hover:text-foreground transition-colors"
          title="Back to Routines"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-3xl font-black tracking-tight text-accent uppercase">Studio Editor</h1>
          <p className="text-muted-foreground mt-1 text-sm font-semibold">Editing: {currentProfile?.name}</p>
        </div>
      </header>

      <div className="flex bg-muted/30 p-1.5 rounded-2xl mb-6 shadow-inner border border-muted/50">
        <button
          onClick={() => setActiveTab("days")}
          className={`flex-1 py-2 text-sm font-black uppercase tracking-wider rounded-xl transition-all ${
            activeTab === "days" ? "bg-background text-primary shadow-sm border border-muted" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Days Config
        </button>
        <button
          onClick={() => setActiveTab("exercises")}
          className={`flex-1 py-2 text-sm font-black uppercase tracking-wider rounded-xl transition-all ${
            activeTab === "exercises" ? "bg-background text-primary shadow-sm border border-muted" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Exercises Config
        </button>
      </div>

      <div className="flex-1">
        {activeTab === "days" && (
          <div className="animate-in fade-in slide-in-from-left-4 duration-300">
            <DaysManager 
              initialDays={initialDays} 
              initialExercises={initialExercises} 
              profiles={profiles} 
              currentProfileId={currentProfileId} 
              publishedProfiles={publishedProfiles}
            />
          </div>
        )}
        {activeTab === "exercises" && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <ExercisesManager initialExercises={initialExercises} />
          </div>
        )}
      </div>
    </div>
  );
}
