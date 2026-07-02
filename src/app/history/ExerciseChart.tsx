"use client";

import { useEffect, useState } from "react";
import { getExerciseHistory } from "@/app/actions";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Loader2 } from "lucide-react";

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
    return <div className="h-48 flex items-center justify-center"><Loader2 className="animate-spin text-muted-foreground" /></div>;
  }

  if (data.length === 0) {
    return <div className="h-48 flex items-center justify-center text-muted-foreground text-sm font-medium">No data found for this exercise.</div>;
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="opacity-10" vertical={false} />
          <XAxis 
            dataKey="date" 
            stroke="currentColor" 
            className="text-xs opacity-50" 
            tickMargin={10} 
            axisLine={false} 
            tickLine={false} 
          />
          <YAxis 
            stroke="currentColor" 
            className="text-xs opacity-50" 
            axisLine={false} 
            tickLine={false} 
          />
          <Tooltip 
            contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px' }}
            itemStyle={{ color: 'hsl(var(--foreground))', fontWeight: 'bold' }}
            labelStyle={{ color: 'hsl(var(--muted-foreground))', marginBottom: '4px' }}
            formatter={(value: any) => [`${value} kg`, "Max Weight"]}
          />
          <Line 
            type="monotone" 
            dataKey="maxWeight" 
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
