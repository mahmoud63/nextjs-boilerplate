# Action-Based Cycles Walkthrough

We have successfully overhauled the core logic of the application to be purely **action-based** rather than **time-based**. 

### What Changed?
Previously, the app checked the system clock and reset your progress every night at midnight. 
Now, the application respects a "Cycle Marker". A cycle persists indefinitely until you decide to start a new one.

### How It Works
1. **Infinite Cycle**: Any session you log or status you update will remain active on your dashboard forever.
2. **Start Next Week**: When you are ready to start a new cycle, you simply click the **"Start Next Week"** button (the refresh icon at the top of the dashboard).
3. **Data Preservation**: Clicking the button drops a new virtual marker in the database at the exact second you clicked it. The app now only looks for progress made *after* that marker. This means your dashboard instantly resets to "Idle", but **all of your past data is perfectly preserved** and remains attached to its original date in your exercise history!

### Verification
You can verify this by:
1. Marking a day as completed or logging a set.
2. Confirming that no amount of waiting (even overnight) clears the dashboard.
3. Clicking **Start Next Week** and watching the dashboard instantly clear, while your exercise history still displays the data you just logged under "Past Performance".
