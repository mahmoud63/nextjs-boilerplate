import { getAllExercises } from "@/app/actions";
import ExercisesManager from "./ExercisesManager";

export default async function ExercisesPage() {
  const exercisesResult = await getAllExercises();
  const exercises = exercisesResult.success ? exercisesResult.data || [] : [];

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
      <ExercisesManager initialExercises={exercises} />
    </div>
  );
}
