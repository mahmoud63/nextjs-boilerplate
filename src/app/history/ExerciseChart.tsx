"use client";

import { useEffect, useState } from "react";
import { getExerciseHistory } from "@/app/actions";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { LoaderCircle } from "lucide-react";
import { EmptyState, StatBlock, StatRow } from "@/components/ui";
import {
  chartMargin,
  gridProps,
  lineProps,
  tooltipProps,
  xAxisProps,
  yAxisProps,
} from "@/lib/chartTheme";

export default function ExerciseChart({ exerciseName }: { exerciseName: string }) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const fetchHistory = async () => {
      setLoading(true);
      const res = await getExerciseHistory(exerciseName);
      if (active && res.success && res.data) {
        // Map logs to chart data
        const mapped = res.data.map(log => {
          let maxWeight = 0;
          if (log.sets && Array.isArray(log.sets)) {
            log.sets.forEach((s: any) => {
              if (s.weight > maxWeight) maxWeight = s.weight;
            });
          }
          return {
            date: new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            maxWeight
          };
        });
        setData(mapped);
      }
      if (active) setLoading(false);
    };

    if (exerciseName) {
      fetchHistory();
    } else {
      setData([]);
      setLoading(false);
    }

    return () => { active = false; };
  }, [exerciseName]);

  if (loading) {
    return (
      <div className="h-56 flex items-center justify-center">
        <LoaderCircle className="animate-spin text-fg-dim" />
      </div>
    );
  }

  if (data.length === 0) {
    return <EmptyState title="No data" message="Nothing logged for this exercise yet." />;
  }

  const best = Math.max(...data.map((d) => d.maxWeight));
  const latest = data[data.length - 1].maxWeight;
  const previous = data.length > 1 ? data[data.length - 2].maxWeight : undefined;

  return (
    <div className="border border-line">
      <StatRow>
        <StatBlock
          label="Latest"
          value={latest}
          unit="kg"
          delta={previous !== undefined ? Number((latest - previous).toFixed(1)) : undefined}
        />
        <StatBlock label="Best" value={best} unit="kg" />
        <StatBlock label="Sessions" value={data.length} />
      </StatRow>

      <div className="h-56 w-full bg-panel border-t border-line p-3 pl-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={chartMargin}>
            <CartesianGrid {...gridProps} />
            <XAxis dataKey="date" {...xAxisProps} />
            <YAxis {...yAxisProps} />
            <Tooltip
              {...tooltipProps}
              formatter={(value: any) => [`${value} kg`, "Max weight"]}
            />
            <Line dataKey="maxWeight" {...lineProps} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
