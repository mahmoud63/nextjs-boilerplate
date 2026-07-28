"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { chartMetric, type ExerciseType, type SetLog } from "@/lib/exerciseTypes";

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
    return <div className="text-muted-foreground text-sm italic">No complete logs found.</div>;
  }

  return (
    <div className="bg-card border border-muted rounded-2xl p-4 shadow-lg h-[250px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--muted)" vertical={false} />
          <XAxis
            dataKey="date"
            stroke="var(--muted-foreground)"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            dy={10}
          />
          <YAxis
            stroke="var(--muted-foreground)"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}${metric.unit === "reps" ? "" : metric.unit}`}
          />
          <Tooltip
            contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--muted)', borderRadius: '12px' }}
            itemStyle={{ color: 'var(--foreground)', fontWeight: 'bold' }}
            labelStyle={{ color: 'var(--muted-foreground)', marginBottom: '4px' }}
            formatter={(value: any) => [`${value} ${metric.unit}`, metric.label]}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="var(--primary)"
            strokeWidth={3}
            dot={{ fill: 'var(--primary)', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, fill: 'var(--foreground)' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
