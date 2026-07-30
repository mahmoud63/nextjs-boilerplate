import { RouteLoader } from "@/components/ui";

/**
 * Root fallback. Covers "/" and any segment that has no loading.tsx of its own.
 */
export default function Loading() {
  return <RouteLoader label="Workout" />;
}
