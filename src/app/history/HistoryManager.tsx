"use client";

import { useState, useTransition, useEffect } from "react";
import { logWeight, getWorkoutHistory } from "@/app/actions";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { Loader2, Plus, TrendingDown, TrendingUp, Scale, Calendar, ChevronDown, ChevronUp, CheckCircle2, XCircle, Search, Filter, X } from "lucide-react";

import ExerciseChart from "./ExerciseChart";

type WeightLog = {
  id: string;
  weight: number;
  date: Date;
};

type WorkoutHistory = {
  id: string;
  date: Date;
  dayName: string;
  status: string;
  exercises: {
    id: string;
    exerciseName: string;
    sets: { setNumber: number; weight: number; reps: number }[];
  }[];
};

export default function HistoryManager({ 
  initialLogs, 
  userHeight, 
  cycleStats, 
  exercises,
  workoutHistory = [],
  profiles = []
}: { 
  initialLogs: WeightLog[], 
  userHeight: number,
  cycleStats: { completed: number, skipped: number },
  exercises: any[],
  workoutHistory?: WorkoutHistory[],
  profiles?: any[]
}) {
  const [isPending, startTransition] = useTransition();
  const [expandedSessions, setExpandedSessions] = useState<Record<string, boolean>>({});

  const [historyList, setHistoryList] = useState<WorkoutHistory[]>(workoutHistory);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProfileId, setSelectedProfileId] = useState("");
  const [selectedDayName, setSelectedDayName] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(workoutHistory.length === 15);
  const [isSearching, setIsSearching] = useState(false);

  const activeProfile = profiles.find(p => p.id === selectedProfileId);
  const activeProfileDays = activeProfile?.routineDays || [];

  const dayNamesFilter = selectedDayName 
    ? [selectedDayName] 
    : (selectedProfileId ? activeProfileDays.map((d: any) => d.dayName) : []);
  
  const dayNamesFilterStr = JSON.stringify(dayNamesFilter);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSearching(true);
      startTransition(async () => {
        const res = await getWorkoutHistory(searchQuery, 0, 15, JSON.parse(dayNamesFilterStr));
        if (res.success && res.data) {
          // Dates come from Server Action as strings when passed over network, so map them back to Dates if needed, 
          // but since they are rendered with toLocaleDateString, we can handle string/Date.
          setHistoryList(res.data as any);
          setHasMore(res.data.length === 15);
        }
        setIsSearching(false);
      });
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery, dayNamesFilterStr]);

  const handleLoadMore = async () => {
    if (isLoadingMore) return;
    setIsLoadingMore(true);
    const res = await getWorkoutHistory(searchQuery, historyList.length, 15, JSON.parse(dayNamesFilterStr));
    if (res.success && res.data) {
      setHistoryList(prev => [...prev, ...(res.data as any)]);
      setHasMore(res.data.length === 15);
    }
    setIsLoadingMore(false);
  };

  const toggleSession = (id: string) => {
    setExpandedSessions(prev => ({ ...prev, [id]: !prev[id] }));
  };
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
        <form onSubmit={handleLogWeight} className="flex gap-2">
          <input 
            type="number" 
            step="0.1"
            value={weight}
            onChange={e => setWeight(e.target.value)}
            placeholder="e.g. 85.5"
            className="flex-1 min-w-0 bg-background border border-muted rounded-xl p-3 font-semibold focus:border-primary transition-colors"
          />
          <button 
            type="submit" 
            disabled={isPending || !weight}
            className="bg-foreground text-background px-4 shrink-0 rounded-xl font-bold disabled:opacity-50 flex items-center justify-center gap-1"
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

      {/* Workout Days History */}
      <div className="bg-card border border-muted rounded-2xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-muted flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-primary" />
              <h3 className="font-bold text-foreground">Workout History</h3>
            </div>
            {isSearching && <Loader2 size={16} className="text-muted-foreground animate-spin" />}
          </div>
          
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search by day or exercise..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-background border border-muted rounded-xl py-2 pl-10 pr-4 text-sm font-semibold focus:border-primary transition-colors"
              />
            </div>
            
            {profiles.length > 0 && (
              <button
                onClick={() => setIsFilterOpen(true)}
                className={`p-2 rounded-xl border flex items-center justify-center transition-colors ${
                  selectedProfileId || selectedDayName 
                    ? "bg-primary text-primary-foreground border-primary" 
                    : "bg-background border-muted text-muted-foreground hover:bg-muted"
                }`}
              >
                <Filter size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Filter Popup Modal */}
        {isFilterOpen && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/50 animate-in fade-in duration-200">
            <div className="bg-card w-full sm:w-[400px] rounded-t-3xl sm:rounded-3xl shadow-xl p-5 animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-foreground flex items-center gap-2">
                  <Filter size={18} className="text-primary" />
                  Filter History
                </h3>
                <button 
                  onClick={() => setIsFilterOpen(false)}
                  className="p-2 text-muted-foreground hover:bg-muted rounded-full transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Routine Profile</label>
                  <select 
                    value={selectedProfileId}
                    onChange={e => {
                      setSelectedProfileId(e.target.value);
                      setSelectedDayName("");
                    }}
                    className="w-full bg-background border border-muted rounded-xl p-3 text-sm font-semibold focus:border-primary transition-colors"
                  >
                    <option value="">All Profiles</option>
                    {profiles.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                
                {selectedProfileId && (
                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Specific Day</label>
                    <select
                      value={selectedDayName}
                      onChange={e => setSelectedDayName(e.target.value)}
                      className="w-full bg-background border border-muted rounded-xl p-3 text-sm font-semibold focus:border-primary transition-colors"
                    >
                      <option value="">All Days in Profile</option>
                      {activeProfileDays.map((d: any) => (
                        <option key={d.id} value={d.dayName}>{d.dayName}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="mt-6 flex gap-3">
                <button 
                  onClick={() => {
                    setSelectedProfileId("");
                    setSelectedDayName("");
                  }}
                  className="flex-1 py-3 border border-muted bg-background rounded-xl font-bold text-foreground text-sm hover:bg-muted transition-colors"
                >
                  Clear Filters
                </button>
                <button 
                  onClick={() => setIsFilterOpen(false)}
                  className="flex-1 py-3 bg-primary text-primary-foreground rounded-xl font-bold text-sm shadow-md hover:bg-primary/90 transition-colors"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="divide-y divide-muted">
          {historyList.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground text-sm">No workout days found.</div>
          ) : (
            historyList.map((session) => (
              <div key={session.id} className="flex flex-col">
                <button 
                  onClick={() => toggleSession(session.id)}
                  className="w-full p-4 flex items-center justify-between hover:bg-muted/30 transition-colors text-left"
                >
                  <div>
                    <h4 className="font-bold text-foreground flex items-center gap-2">
                      {session.dayName}
                      {session.status === 'COMPLETED' ? (
                        <CheckCircle2 size={16} className="text-green-500" />
                      ) : session.status === 'SKIPPED' ? (
                        <XCircle size={16} className="text-red-500" />
                      ) : null}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(session.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                  <div className="text-muted-foreground">
                    {expandedSessions[session.id] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                </button>
                
                {/* Expanded Details */}
                {expandedSessions[session.id] && (
                  <div className="px-4 pb-4 pt-1 bg-muted/10">
                    {session.exercises.length === 0 ? (
                      <p className="text-xs text-muted-foreground italic py-2">No exercises logged.</p>
                    ) : (
                      <div className="space-y-4 mt-2">
                        {session.exercises.map(ex => (
                          <div key={ex.id} className="border-l-2 border-primary/50 pl-3">
                            <h5 className="font-bold text-sm text-foreground mb-2">{ex.exerciseName}</h5>
                            <div className="flex flex-wrap gap-2">
                              {ex.sets.map((s, i) => (
                                <div key={i} className="bg-background border border-muted px-2 py-1 rounded text-xs font-semibold text-muted-foreground">
                                  Set {s.setNumber}: {s.weight}kg × {s.reps}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
        {hasMore && (
          <div className="p-4 border-t border-muted bg-muted/10">
            <button 
              onClick={handleLoadMore} 
              disabled={isLoadingMore}
              className="w-full py-3 bg-background border border-muted hover:bg-muted rounded-xl font-bold text-sm text-foreground transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoadingMore && <Loader2 size={16} className="animate-spin" />}
              {isLoadingMore ? "Loading..." : "Load More"}
            </button>
          </div>
        )}
      </div>

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
