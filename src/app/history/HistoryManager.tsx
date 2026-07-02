"use client";

import { useState, useTransition } from "react";
import { logWeight } from "@/app/actions";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { Loader2, Plus, TrendingDown, TrendingUp, Scale } from "lucide-react";

import ExerciseChart from "./ExerciseChart";

type WeightLog = {
  id: string;
  weight: number;
  date: Date;
};

export default function HistoryManager({ 
  initialLogs, 
  userHeight, 
  cycleStats, 
  exercises 
}: { 
  initialLogs: WeightLog[], 
  userHeight: number,
  cycleStats: { completed: number, skipped: number },
  exercises: any[]
}) {
  const [isPending, startTransition] = useTransition();
  const [weight, setWeight] = useState("");
  const [error, setError] = useState("");
  const [selectedExercise, setSelectedExercise] = useState(exercises[0]?.name || "");

  const handleLogWeight = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const w = parseFloat(weight);
    if (isNaN(w) || w <= 0) {
      setError("Please enter a valid weight");
      return;
    }

    startTransition(async () => {
      const res = await logWeight(w);
      if (res.success) {
        setWeight("");
      } else {
        setError(res.error || "Failed to log weight");
      }
    });
  };

  // Prepare chart data
  const chartData = initialLogs.map(log => ({
    ...log,
    displayDate: new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    timestamp: new Date(log.date).getTime()
  }));

  const latestWeight = chartData.length > 0 ? chartData[chartData.length - 1].weight : 0;
  const previousWeight = chartData.length > 1 ? chartData[chartData.length - 2].weight : latestWeight;
  const diff = latestWeight - previousWeight;

  // Calculate BMI
  const heightM = userHeight / 100;
  const bmi = latestWeight > 0 && heightM > 0 ? (latestWeight / (heightM * heightM)).toFixed(1) : "0";

  return (
    <div className="space-y-6 pb-20">
      <header className="flex items-center justify-between pb-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">History</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Track your weight and progress
          </p>
        </div>
      </header>

      {/* Cycle Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-card border border-muted p-4 rounded-2xl shadow-sm text-center">
          <p className="text-xs font-bold text-muted-foreground mb-1 uppercase tracking-wider">Days Completed</p>
          <p className="text-3xl font-black text-foreground">{cycleStats.completed}</p>
        </div>
        <div className="bg-card border border-muted p-4 rounded-2xl shadow-sm text-center">
          <p className="text-xs font-bold text-muted-foreground mb-1 uppercase tracking-wider">Days Skipped</p>
          <p className="text-3xl font-black text-muted-foreground">{cycleStats.skipped}</p>
        </div>
      </div>

      {/* Weight Input Card */}
      <div className="bg-card border border-muted p-5 rounded-2xl shadow-sm">
        <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
          <Scale size={18} className="text-primary" /> Log New Weight
        </h3>
        <form onSubmit={handleLogWeight} className="flex gap-3">
          <input 
            type="number" 
            step="0.1"
            value={weight}
            onChange={e => setWeight(e.target.value)}
            placeholder="e.g. 85.5"
            className="flex-1 bg-background border border-muted rounded-xl p-3 font-semibold focus:border-primary transition-colors"
          />
          <button 
            type="submit" 
            disabled={isPending || !weight}
            className="bg-foreground text-background px-6 rounded-xl font-bold disabled:opacity-50 flex items-center gap-2"
          >
            {isPending ? <Loader2 size={18} className="animate-spin" /> : <><Plus size={18} /> Add</>}
          </button>
        </form>
        {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-card border border-muted p-4 rounded-2xl shadow-sm">
          <p className="text-xs font-bold text-muted-foreground mb-1 uppercase tracking-wider">Current Weight</p>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-black text-foreground">{latestWeight.toFixed(1)} <span className="text-lg text-muted-foreground font-semibold">kg</span></span>
          </div>
          {diff !== 0 && (
            <p className={`text-xs mt-2 flex items-center gap-1 font-bold ${diff > 0 ? "text-red-500" : "text-green-500"}`}>
              {diff > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />} 
              {Math.abs(diff).toFixed(1)} kg since last log
            </p>
          )}
        </div>
        <div className="bg-card border border-muted p-4 rounded-2xl shadow-sm">
          <p className="text-xs font-bold text-muted-foreground mb-1 uppercase tracking-wider">Current BMI</p>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-black text-foreground">{bmi}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-2 font-medium">Height: {userHeight} cm</p>
        </div>
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <div className="bg-card border border-muted p-4 rounded-2xl shadow-sm">
          <h3 className="font-bold text-foreground mb-6">Weight Trend</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="opacity-10" vertical={false} />
                <XAxis 
                  dataKey="displayDate" 
                  stroke="currentColor" 
                  className="text-xs opacity-50" 
                  tickMargin={10} 
                  axisLine={false} 
                  tickLine={false} 
                />
                <YAxis 
                  domain={['dataMin - 2', 'dataMax + 2']} 
                  stroke="currentColor" 
                  className="text-xs opacity-50" 
                  axisLine={false} 
                  tickLine={false} 
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px' }}
                  itemStyle={{ color: 'hsl(var(--foreground))', fontWeight: 'bold' }}
                  labelStyle={{ color: 'hsl(var(--muted-foreground))', marginBottom: '4px' }}
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
        </div>
      )}

      {/* Exercise Selection & Chart */}
      {exercises.length > 0 && (
        <div className="bg-card border border-muted p-5 rounded-2xl shadow-sm">
          <div className="flex flex-col mb-4">
            <h3 className="font-bold text-foreground mb-2">Exercise Progress</h3>
            <select 
              value={selectedExercise} 
              onChange={(e) => setSelectedExercise(e.target.value)}
              className="bg-background border border-muted rounded-xl p-2 font-semibold text-sm focus:border-primary transition-colors"
            >
              {exercises.map(ex => (
                <option key={ex.id} value={ex.name}>{ex.name}</option>
              ))}
            </select>
          </div>
          {selectedExercise && <ExerciseChart exerciseName={selectedExercise} />}
        </div>
      )}

      {/* History Table */}
      <div className="bg-card border border-muted rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-muted">
          <h3 className="font-bold text-foreground">Log History</h3>
        </div>
        <div className="divide-y divide-muted">
          {[...chartData].reverse().map((log, idx) => {
            const previous = [...chartData].reverse()[idx + 1];
            const change = previous ? log.weight - previous.weight : 0;
            return (
              <div key={log.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold">{log.weight.toFixed(1)} kg</p>
                  <p className="text-xs text-muted-foreground">{new Date(log.date).toLocaleDateString()} at {new Date(log.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                {change !== 0 && (
                  <div className={`text-xs font-bold flex items-center gap-1 ${change > 0 ? "text-red-500" : "text-green-500"}`}>
                    {change > 0 ? "+" : ""}{change.toFixed(1)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
