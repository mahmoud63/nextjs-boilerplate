"use client";

import { useState } from "react";
import DaysManager from "@/app/days/DaysManager";
import ExercisesManager from "@/app/exercises/ExercisesManager";
import MyPublishedManager from "./MyPublishedManager";
import { PageTitle, Tabs, type TabItem } from "@/components/ui";

type Tab = "profiles" | "exercises" | "published";

const TABS: ReadonlyArray<TabItem<Tab>> = [
  { value: "profiles", label: "Profiles" },
  { value: "exercises", label: "Exercises" },
  { value: "published", label: "Published" },
];

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
  const [activeTab, setActiveTab] = useState<Tab>(
    (initialTab === "published" || initialTab === "exercises" || initialTab === "profiles") ? initialTab : "profiles"
  );

  return (
    <div className="flex flex-col h-full animate-rise">
      <PageTitle title="Routines" eyebrow="Library" className="mb-1" />

      <Tabs items={TABS} value={activeTab} onChange={setActiveTab} className="mb-5" />

      <div className="flex-1">
        {activeTab === "profiles" && (
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
        {activeTab === "published" && (
          <MyPublishedManager publishedProfiles={publishedProfiles} setActiveTab={setActiveTab} profiles={profiles} />
        )}
      </div>
    </div>
  );
}
