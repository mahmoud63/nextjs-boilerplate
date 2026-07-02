"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

type SetLog = { setNumber: number; weight: number; reps: number };
type ExerciseLog = { id: string; date: Date; sets: SetLog[] };

export default function HistoryChart({ history }: { history: ExerciseLog[] }) {
  // Format data for chart: Get the max weight lifted on that date
  const data = history.map((log) => {
    const maxWeight = log.sets.length > 0 
      ? Math.max(...log.sets.map(s => s.weight)) 
      : 0;
    
    return {
      date: new Date(log.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      weight: maxWeight,
      sets: log.sets.length,
    };
  }).filter(d => d.weight > 0);

  if (data.length === 0) {
    return <div className="text-muted-foreground text-sm italic">No complete logs found.</div>;
  }

  return (
    <div className="bg-card border border-muted rounded-2xl p-4 shadow-lg h-[250px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
          <XAxis 
            dataKey="date" 
            stroke="#a1a1aa" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false} 
            dy={10}
          />
          <YAxis 
            stroke="#a1a1aa" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false} 
            tickFormatter={(value) => `${value}kg`}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px' }}
            itemStyle={{ color: '#ffffff', fontWeight: 'bold' }}
            labelStyle={{ color: '#fafafa', marginBottom: '4px' }}
            formatter={(value: any) => [`${value} kg`, "Max Weight"]}
          />
          <Line 
            type="monotone" 
            dataKey="weight" 
            stroke="#ffffff" 
            strokeWidth={3}
            dot={{ fill: '#ffffff', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, fill: '#000000' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
