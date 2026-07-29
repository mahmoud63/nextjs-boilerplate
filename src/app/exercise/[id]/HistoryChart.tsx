"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { chartMetric, type ExerciseType, type SetLog } from "@/lib/exerciseTypes";
import {
  chartMargin,
  gridProps,
  lineProps,
  tooltipProps,
  xAxisProps,
  yAxisProps,
} from "@/lib/chartTheme";
import { EmptyState, StatBlock, StatRow } from "@/components/ui";

type ExerciseLog = { id: string; date: Date; sets: SetLog[] };

export default function HistoryChart({ history, type = "WEIGHTS" }: { history: ExerciseLog[]; type?: ExerciseType }) {
  const metric = chartMetric(type);

  // Cardio is charted in minutes; timed holds stay in seconds.
  const scale = type === "CARDIO" && metric.key === "duration" ? 1 / 60 : 1;

  const data = history.map((log) => {
    const values = log.sets
      .map((s) => s[metric.key] ?? 0)
      .filter((v): v is number => typeof v === "number");
    const best = values.length > 0 ? Math.max(...values) : 0;

    return {
      date: new Date(log.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      value: Math.round(best * scale * 100) / 100,
      sets: log.sets.length,
    };
  }).filter(d => d.value > 0);

  if (data.length === 0) {
    return <EmptyState title="No data yet" message="Log a set and the trend shows up here." />;
  }

  const best = Math.max(...data.map((d) => d.value));
  const latest = data[data.length - 1].value;
  const previous = data.length > 1 ? data[data.length - 2].value : undefined;

  return (
    <div className="border border-line">
      {/* Stats above the chart: the three numbers worth knowing before reading a line. */}
      <StatRow>
        <StatBlock
          label="Latest"
          value={latest}
          unit={metric.unit}
          delta={previous !== undefined ? Math.round((latest - previous) * 100) / 100 : undefined}
        />
        <StatBlock label="Best" value={best} unit={metric.unit} />
        <StatBlock label="Sessions" value={data.length} />
      </StatRow>

      <div className="h-[220px] w-full bg-panel border-t border-line p-3 pl-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={chartMargin}>
            <CartesianGrid {...gridProps} />
            <XAxis dataKey="date" {...xAxisProps} />
            <YAxis
              {...yAxisProps}
              tickFormatter={(value) => `${value}${metric.unit === "reps" ? "" : metric.unit}`}
            />
            <Tooltip
              {...tooltipProps}
              formatter={(value: any) => [`${value} ${metric.unit}`, metric.label]}
            />
            <Line dataKey="value" {...lineProps} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
