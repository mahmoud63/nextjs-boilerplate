"use client";

import { useState, useTransition, useEffect } from "react";
import { logWeight, getWorkoutHistory } from "@/app/actions";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { Plus, Scale, Calendar, ChevronDown, ChevronUp, CheckCircle2, XCircle, Search, Filter, X } from "lucide-react";

import ExerciseChart from "./ExerciseChart";
import { describeSetLoose, type SetLog } from "@/lib/exerciseTypes";
import { Button, Card, Field, PageTitle, PendingBars, StatBlock, StatRow } from "@/components/ui";
import {
  chartMargin,
  gridProps,
  lineProps,
  tooltipProps,
  xAxisProps,
  yAxisProps,
} from "@/lib/chartTheme";

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
    sets: SetLog[];
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
    <div className="space-y-5">
      <PageTitle title="History" eyebrow="Weight & progress" />

      {/* Body metrics as one instrument cluster rather than four separate cards. */}
      <div className="border border-line">
        <StatRow>
          <StatBlock
            label="Weight"
            value={latestWeight > 0 ? latestWeight.toFixed(1) : "0"}
            unit="kg"
            delta={diff !== 0 ? Number(diff.toFixed(1)) : undefined}
            higherIsBetter={false}
          />
          <StatBlock label="BMI" value={bmi} />
          <StatBlock label="Height" value={userHeight || "0"} unit="cm" />
        </StatRow>
        <div className="border-t border-line">
          <StatRow>
            <StatBlock label="Days done" value={cycleStats.completed} />
            <StatBlock label="Days skipped" value={cycleStats.skipped} />
            <StatBlock label="Logs" value={initialLogs.length} />
          </StatRow>
        </div>
      </div>

      {/* Weight Input Card */}
      <Card>
        <p className="flex items-center gap-2 text-eyebrow uppercase text-fg">
          <Scale size={14} className="text-fg-dim" /> Log new weight
        </p>
        <form onSubmit={handleLogWeight} className="mt-4 flex items-end gap-2">
          <Field
            label="Weight"
            suffix="kg"
            numeric
            inputMode="decimal"
            type="number"
            step="0.1"
            value={weight}
            onChange={e => setWeight(e.target.value)}
            placeholder="85.5"
            wrapperClassName="flex-1 min-w-0"
          />
          <Button type="submit" disabled={!weight} loading={isPending} icon={<Plus size={16} />}>
            Add
          </Button>
        </form>
        {error && <p className="mt-2 text-body-sm text-danger">{error}</p>}
      </Card>

      {/* Chart */}
      {chartData.length > 0 && (
        <div className="border border-line bg-panel">
          <p className="p-4 pb-0 text-eyebrow uppercase text-fg-dim">Weight trend</p>
          <div className="h-60 w-full p-3 pl-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={chartMargin}>
                <CartesianGrid {...gridProps} />
                <XAxis dataKey="displayDate" {...xAxisProps} />
                <YAxis domain={['dataMin - 2', 'dataMax + 2']} {...yAxisProps} />
                <Tooltip {...tooltipProps} />
                <Line dataKey="weight" {...lineProps} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Exercise Selection & Chart */}
      {exercises.length > 0 && (
        <div className="bg-panel border border-line p-5">
          <div className="flex flex-col mb-4">
            <h3 className="font-bold text-fg mb-2">Exercise Progress</h3>
            <select 
              value={selectedExercise} 
              onChange={(e) => setSelectedExercise(e.target.value)}
              className="bg-background border border-line p-2 font-semibold text-sm focus:border-accent transition-colors"
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
      <div className="bg-panel border border-line overflow-hidden flex flex-col">
        <div className="p-4 border-b border-line flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-accent" />
              <h3 className="font-bold text-fg">Workout History</h3>
            </div>
            {isSearching && <PendingBars className="text-fg-muted" />}
          </div>
          
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-fg-muted" />
              <input 
                type="text" 
                placeholder="Search by day or exercise..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-background border border-line py-2 pl-10 pr-4 text-sm font-semibold focus:border-accent transition-colors"
              />
            </div>
            
            {profiles.length > 0 && (
              <button
                onClick={() => setIsFilterOpen(true)}
                className={`p-2 border flex items-center justify-center transition-colors ${
                  selectedProfileId || selectedDayName 
                    ? "bg-accent-fill text-on-accent border-accent" 
                    : "bg-background border-line text-fg-muted hover:bg-field"
                }`}
              >
                <Filter size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Filter Popup Modal */}
        {isFilterOpen && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/50 animate-rise">
            <div className="bg-panel w-full sm:w-[400px] sm: p-5 animate-rise sm: sm: duration-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-fg flex items-center gap-2">
                  <Filter size={18} className="text-accent" />
                  Filter History
                </h3>
                <button 
                  onClick={() => setIsFilterOpen(false)}
                  className="p-2 text-fg-muted hover:bg-field rounded-full transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-eyebrow uppercase text-fg-dim mb-2 block">Routine Profile</label>
                  <select 
                    value={selectedProfileId}
                    onChange={e => {
                      setSelectedProfileId(e.target.value);
                      setSelectedDayName("");
                    }}
                    className="w-full bg-background border border-line p-3 text-sm font-semibold focus:border-accent transition-colors"
                  >
                    <option value="">All Profiles</option>
                    {profiles.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                
                {selectedProfileId && (
                  <div>
                    <label className="text-eyebrow uppercase text-fg-dim mb-2 block">Specific Day</label>
                    <select
                      value={selectedDayName}
                      onChange={e => setSelectedDayName(e.target.value)}
                      className="w-full bg-background border border-line p-3 text-sm font-semibold focus:border-accent transition-colors"
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
                  className="flex-1 py-3 border border-line bg-background font-bold text-fg text-sm hover:bg-field transition-colors"
                >
                  Clear Filters
                </button>
                <button 
                  onClick={() => setIsFilterOpen(false)}
                  className="flex-1 py-3 bg-accent-fill text-on-accent font-bold text-sm hover:bg-accent-dim transition-colors"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="divide-y divide-muted">
          {historyList.length === 0 ? (
            <div className="p-6 text-center text-fg-muted text-sm">No workout days found.</div>
          ) : (
            historyList.map((session) => (
              <div key={session.id} className="flex flex-col">
                <button 
                  onClick={() => toggleSession(session.id)}
                  className="w-full p-4 flex items-center justify-between hover:bg-field/30 transition-colors text-left"
                >
                  <div>
                    <h4 className="font-bold text-fg flex items-center gap-2">
                      {session.dayName}
                      {session.status === 'COMPLETED' ? (
                        <CheckCircle2 size={16} className="text-accent" />
                      ) : session.status === 'SKIPPED' ? (
                        <XCircle size={16} className="text-danger" />
                      ) : null}
                    </h4>
                    <p className="text-xs text-fg-muted mt-1">
                      {new Date(session.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                  <div className="text-fg-muted">
                    {expandedSessions[session.id] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                </button>
                
                {/* Expanded Details */}
                {expandedSessions[session.id] && (
                  <div className="px-4 pb-4 pt-1 bg-field/10">
                    {session.exercises.length === 0 ? (
                      <p className="text-xs text-fg-muted italic py-2">No exercises logged.</p>
                    ) : (
                      <div className="space-y-4 mt-2">
                        {session.exercises.map(ex => (
                          <div key={ex.id} className="border-l-2 border-accent pl-3">
                            <h5 className="font-bold text-sm text-fg mb-2">{ex.exerciseName}</h5>
                            <div className="flex flex-wrap gap-2">
                              {ex.sets.map((s, i) => (
                                <div key={i} className="bg-background border border-line px-2 py-1 rounded text-xs font-semibold text-fg-muted">
                                  Set {s.setNumber}: {describeSetLoose(s)}
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
          <div className="p-4 border-t border-line bg-field/10">
            <button 
              onClick={handleLoadMore} 
              disabled={isLoadingMore}
              className="w-full py-3 bg-background border border-line hover:bg-field font-bold text-sm text-fg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoadingMore && <PendingBars />}
              {isLoadingMore ? "Loading..." : "Load More"}
            </button>
          </div>
        )}
      </div>

      {/* History Table */}
      <div className="bg-panel border border-line overflow-hidden">
        <div className="p-4 border-b border-line">
          <h3 className="font-bold text-fg">Log History</h3>
        </div>
        <div className="divide-y divide-muted">
          {[...chartData].reverse().map((log, idx) => {
            const previous = [...chartData].reverse()[idx + 1];
            const change = previous ? log.weight - previous.weight : 0;
            return (
              <div key={log.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold">{log.weight.toFixed(1)} kg</p>
                  <p className="text-xs text-fg-muted">{new Date(log.date).toLocaleDateString()} at {new Date(log.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                {change !== 0 && (
                  <div className={`text-xs font-bold flex items-center gap-1 ${change > 0 ? "text-danger" : "text-accent"}`}>
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
