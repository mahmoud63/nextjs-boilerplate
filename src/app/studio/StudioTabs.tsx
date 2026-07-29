"use client";

import { useState } from "react";
import DaysManager from "@/app/days/DaysManager";
import ExercisesManager from "@/app/exercises/ExercisesManager";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { PageTitle, Tabs, type TabItem } from "@/components/ui";

type Tab = "days" | "exercises";

const TABS: ReadonlyArray<TabItem<Tab>> = [
  { value: "days", label: "Days config" },
  { value: "exercises", label: "Exercises config" },
];

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
  const [activeTab, setActiveTab] = useState<Tab>("days");

  const currentProfile = profiles.find(p => p.id === currentProfileId) || profiles[0];

  return (
    <div className="flex flex-col h-full animate-rise">
      <button
        onClick={() => router.push('/routines?tab=published')}
        className="inline-flex items-center gap-1.5 -ml-1 mb-3 text-eyebrow uppercase text-fg-dim hover:text-fg transition-colors w-fit"
      >
        <ChevronLeft size={14} /> Routines
      </button>

      <PageTitle
        title="Studio"
        eyebrow={currentProfile?.name ? `Editing · ${currentProfile.name}` : "Editing"}
        className="mb-1"
      />

      <Tabs items={TABS} value={activeTab} onChange={setActiveTab} className="mb-5" />

      <div className="flex-1">
        {activeTab === "days" && (
          <DaysManager
            initialDays={initialDays}
            initialExercises={initialExercises}
            profiles={profiles}
            currentProfileId={currentProfileId}
            publishedProfiles={publishedProfiles}
          />
        )}
        {activeTab === "exercises" && (
          <ExercisesManager initialExercises={initialExercises} />
        )}
      </div>
    </div>
  );
}
