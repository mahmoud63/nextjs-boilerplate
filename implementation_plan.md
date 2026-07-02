# Shift to Action-Based Cycles

The user has requested that the application no longer reset based on the calendar day (midnight). Instead, the cycle should persist indefinitely until an explicit action is taken to reset it (e.g. clicking a button to start a new week).

## Proposed Changes

We will introduce a "Cycle Marker" using the existing database schema to avoid locking issues with the Prisma Client. 

### 1. Cycle Marker Implementation
- We will use a special `WorkoutSession` record where `dayName = "SYSTEM_CYCLE_MARKER"`.
- The timestamp of this most recent marker dictates the `startOfCycle`.
- All queries for "current session" will be updated to fetch sessions where `date > startOfCycle`, completely removing the `startOfDay` midnight logic.

### 2. Update Data Fetching & Mutations (`src/app/actions.ts`)
- Add a helper `getCycleStartDate()` to retrieve the `startOfCycle`.
- Update `getTodaySession(dayName)` to use `date: { gt: startOfCycle }`.
- Update `updateSessionStatus(...)` to use `date: { gt: startOfCycle }`.
- Update `logSet(...)` to use `date: { gt: startOfCycle }`.

### 3. Update Reset Logic
- `resetTodayCycle` will be renamed to `resetCycle`.
- Instead of modifying existing sessions or shifting their dates, `resetCycle` will simply insert a new `SYSTEM_CYCLE_MARKER` with the current timestamp.
- This acts as an instant "checkpoint". All past sessions immediately fall behind the checkpoint and become historical data, rendering the dashboard completely idle for the new cycle.

### 4. Update UI Components
- Update `ResetCycleButton.tsx` to call `resetCycle()`. We will also rename the button tooltip/text to "Start Next Week" to align with the action-based terminology.

## Verification Plan
1. Manually log a session and mark it as completed.
2. Verify that waiting or shifting the system clock does not reset the status.
3. Click "Start Next Week".
4. Verify the dashboard instantly resets to idle, while the exercise history still retains the logged data.
