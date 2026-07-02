"use client";

import { useState } from "react";
import DaysManager from "@/app/days/DaysManager";
import ExercisesManager from "@/app/exercises/ExercisesManager";
import MyPublishedManager from "./MyPublishedManager";

export default function RoutinesTabs({ 
  initialDays, 
  initialExercises, 
  profiles, 
  currentProfileId,
  publishedProfiles,
  initialTab = "profiles"
}: { 
  initialDays: any[], 
  initialExercises: any[], 
  profiles: any[], 
  currentProfileId: string,
  publishedProfiles: any[],
  initialTab?: string
}) {
  const [activeTab, setActiveTab] = useState<"profiles" | "exercises" | "published">(
    (initialTab === "published" || initialTab === "exercises" || initialTab === "profiles") ? initialTab : "profiles"
  );

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Custom Tab Bar */}
      <div className="flex bg-muted p-1 rounded-2xl mb-6">
        <button
          onClick={() => setActiveTab("profiles")}
          className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${
            activeTab === "profiles" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          My Profiles
        </button>
        <button
          onClick={() => setActiveTab("exercises")}
          className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${
            activeTab === "exercises" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Exercises
        </button>
        <button
          onClick={() => setActiveTab("published")}
          className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${
            activeTab === "published" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          My Published
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1">
        {activeTab === "profiles" && (
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
        {activeTab === "published" && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <MyPublishedManager publishedProfiles={publishedProfiles} setActiveTab={setActiveTab} profiles={profiles} />
          </div>
        )}
      </div>
    </div>
  );
}
