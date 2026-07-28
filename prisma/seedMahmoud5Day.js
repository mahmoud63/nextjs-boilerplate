/**
 * Rebuilds a RoutineProfile from the "Mahmoud — 5 Day Programme"
 * (Muscle Fourma E3 + block periodisation).
 *
 * Destructive: deletes every RoutineDay in the target profile and every
 * ExerciseConfig those days own, then recreates them from PROGRAMME below.
 * Exercises shared with days outside the target profile are left alone.
 *
 * Day descriptions are stored as rich text (HTML) — see src/lib/sanitize.ts.
 *
 * Usage: node prisma/seedMahmoud5Day.js <routineProfileId>
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/** MuscleWiki pages can't be embedded, so they live in refLinks, not videoUrl. */
const mw = (slug) => [{ label: 'MuscleWiki', url: `https://musclewiki.com/exercise/${slug}` }];

const li = (items) => items.map((i) => `<li>${i}</li>`).join('');

const WARMUP_HTML =
  '<h3>Warm-up — 8-10 min</h3>' +
  '<p>Dynamic only. Never stretch cold: raise temperature first, then move.</p>' +
  '<ul>' +
  li([
    'Treadmill or bike, easy pace — 5 min',
    'Arm circles — 20 forward, 20 backward',
    'Band pull-aparts — 2 x 15',
    'Bodyweight squats — 15',
    'Torso twists + hip circles — 30 sec each',
    '2 ramping sets on the first exercise',
  ]) +
  '</ul>';

const BLOCKS_HTML =
  '<h3>Block targets</h3>' +
  '<ul>' +
  li([
    '<strong>Block 1 — Volume</strong> (weeks 1-4): 8-12 reps @ RPE 7-8',
    '<strong>Block 2 — Intensity</strong> (weeks 5-8): 6-8 reps @ RPE 8',
    '<strong>Block 3 — Heavy</strong> (weeks 9-11): 4-6 reps @ RPE 8-9',
    '<strong>Block 4 — Deload</strong> (week 12): 8-10 reps @ RPE 5-6',
  ]) +
  '</ul>' +
  '<p><strong>Progression:</strong> hit the top of the rep range at target RPE two sessions running, then add 2.5 kg (upper compound) or 5 kg (lower compound). Accessories: add reps before weight.</p>';

const cooldown = (items) =>
  '<h3>Cool-down</h3>' +
  '<p>Static holds after the session. Breathe normally, never bounce, both sides, mild tension not pain.</p>' +
  `<ul>${li(items)}</ul>`;

const focus = (text) => `<h3>Focus</h3><p>${text}</p>`;

const cardio = (name, reps, targetMuscle, rpe, notes) => ({
  name, type: 'CARDIO', sets: 1, reps, targetMuscle, rest: 'N/A', rpe,
  targetWeight: null, videoUrl: null, refLinks: [], notes,
});

const PROGRAMME = [
  {
    dayNumber: 1,
    dayName: 'Chest & Triceps',
    isRestDay: false,
    description:
      focus('Chest thickness across all angles, plus triceps. Cardio goes after the lifting, never before — doing it first steals the strength work.') +
      WARMUP_HTML +
      BLOCKS_HTML +
      cooldown([
        'Standing wall chest stretch — 30 sec each arm',
        'Floor chest opener — 45 sec',
        'Overhead triceps stretch — 30 sec each',
        'Towel triceps stretch — 30 sec each',
        'Cross-body shoulder stretch — 30 sec each',
      ]),
    exercises: [
      { name: 'Flat Barbell Bench Press', type: 'WEIGHTS', sets: 4, reps: '8-10', targetMuscle: 'Chest (Mid)', rest: '2 mins', rpe: '7', targetWeight: '30 kg (confirm)', videoUrl: null, refLinks: mw('barbell-bench-press'), notes: 'Week 1 is calibration — log the real number. Bar + 5 kg per side assumed.' },
      { name: 'Incline Dumbbell Press', type: 'WEIGHTS', sets: 4, reps: '8-12', targetMuscle: 'Chest (Upper)', rest: '90 sec', rpe: '7-8', targetWeight: '7.5 kg DBs', videoUrl: null, refLinks: mw('dumbbell-incline-bench-press'), notes: null },
      { name: 'Pec Dec / Butterfly Machine', type: 'WEIGHTS', sets: 4, reps: '10-12', targetMuscle: 'Chest (Inner)', rest: '90 sec', rpe: '7-8', targetWeight: 'Calibrate', videoUrl: null, refLinks: mw('machine-chest-fly'), notes: 'Needs a real number by end of week 1.' },
      { name: 'Low Cable Fly (Crossover)', type: 'WEIGHTS', sets: 3, reps: '10-12', targetMuscle: 'Chest (Lower/Inner)', rest: '60 sec', rpe: '7-8', targetWeight: 'Calibrate', videoUrl: null, refLinks: mw('cable-crossover'), notes: 'Needs a real number by end of week 1.' },
      { name: 'EZ-Bar Skull Crushers', type: 'WEIGHTS', sets: 3, reps: '10-12', targetMuscle: 'Triceps (Long Head)', rest: '90 sec', rpe: '7', targetWeight: 'Empty EZ bar to start', videoUrl: null, refLinks: mw('cable-rope-skullcrusher'), notes: 'New movement — bare bar first, elbows tucked.' },
      { name: 'Rope Pushdown', type: 'WEIGHTS', sets: 3, reps: '10-12', targetMuscle: 'Triceps (Lateral Head)', rest: '60 sec', rpe: '8', targetWeight: '20 kg', videoUrl: null, refLinks: mw('cable-tricep-pushdown'), notes: null },
      { name: 'Overhead Cable Tricep Extension', type: 'WEIGHTS', sets: 3, reps: '12', targetMuscle: 'Triceps (Long Head)', rest: '60 sec', rpe: '7-8', targetWeight: 'Calibrate', videoUrl: null, refLinks: mw('cable-overhead-tricep-extension'), notes: 'Needs a real number by end of week 1.' },
      cardio('Cardio — LISS', '30 min', 'Conditioning', '4-5', 'Treadmill incline walk or bike at conversational pace — you can talk in sentences.'),
    ],
  },
  {
    dayNumber: 2,
    dayName: 'Back & Biceps',
    isRestDay: false,
    description:
      focus('Width and thickness (V-taper) plus biceps. The barbell row is the book\'s #1 back builder and it is new to you — earn the load.') +
      WARMUP_HTML +
      BLOCKS_HTML +
      cooldown([
        "Child's pose — 60 sec",
        'Cat-cow — 10 slow cycles',
        'Wall bicep stretch — 30 sec each',
        'Behind-the-back bicep stretch — 30 sec',
        'Lateral neck stretch — 20 sec each side',
      ]),
    exercises: [
      { name: 'Barbell Bent-Over Row', type: 'WEIGHTS', sets: 4, reps: '8-10', targetMuscle: 'Back (Upper/Mid)', rest: '2 mins', rpe: '6-7', targetWeight: 'Empty/light bar', videoUrl: null, refLinks: mw('barbell-bent-over-row'), notes: 'FIRST EXPOSURE. Week 1: light bar, hinge to ~45 degrees, flat back, pull to belly button. Nail the pattern before adding plates.' },
      { name: 'Lat Pulldown (Wide Grip)', type: 'WEIGHTS', sets: 4, reps: '8-12', targetMuscle: 'Lats (Width)', rest: '90 sec', rpe: '7-8', targetWeight: '40 kg', videoUrl: null, refLinks: mw('cable-lat-pulldown'), notes: null },
      { name: 'Close-Grip / Neutral Pulldown', type: 'WEIGHTS', sets: 3, reps: '10-12', targetMuscle: 'Lats (Thickness)', rest: '90 sec', rpe: '7-8', targetWeight: 'Calibrate', videoUrl: null, refLinks: mw('cable-close-grip-lat-pulldown'), notes: 'Needs a real number by end of week 1.' },
      { name: 'Single-Arm Cable Pulldown', type: 'WEIGHTS', sets: 3, reps: '10-12 each side', targetMuscle: 'Lats (Unilateral)', rest: '60 sec', rpe: '7-8', targetWeight: 'Calibrate', videoUrl: null, refLinks: mw('cable-single-arm-lat-pulldown'), notes: 'Needs a real number by end of week 1.' },
      { name: 'Seated Cable Row', type: 'WEIGHTS', sets: 3, reps: '10-12', targetMuscle: 'Mid Back', rest: '90 sec', rpe: '7-8', targetWeight: 'Calibrate', videoUrl: null, refLinks: mw('cable-seated-row'), notes: 'Squeeze shoulder blades, no torso swing.' },
      { name: 'Incline Dumbbell Curl', type: 'WEIGHTS', sets: 3, reps: '10-12', targetMuscle: 'Biceps (Long Head)', rest: '60 sec', rpe: '7-8', targetWeight: 'Calibrate', videoUrl: null, refLinks: mw('dumbbell-incline-curl'), notes: 'Needs a real number by end of week 1.' },
      { name: 'Hammer Curl', type: 'WEIGHTS', sets: 3, reps: '10-12', targetMuscle: 'Brachialis / Forearms', rest: '60 sec', rpe: '8', targetWeight: 'Calibrate', videoUrl: null, refLinks: mw('dumbbell-hammer-curl'), notes: 'Controlled movement.' },
      cardio('Cardio — LISS', '30 min', 'Conditioning', '4-5', 'Easy pace, after lifting.'),
    ],
  },
  {
    dayNumber: 3,
    dayName: 'Shoulders & Abs',
    isRestDay: false,
    description:
      focus('All three delt heads and traps, then an abs circuit. <strong>No behind-the-neck pressing</strong> — per your limitations, all pressing stays in front.') +
      WARMUP_HTML +
      BLOCKS_HTML +
      '<h3>Abs circuit</h3><p>The last four exercises run as a circuit: 3 rounds, 45 sec rest between rounds.</p>' +
      cooldown([
        'Cross-body shoulder stretch — 30 sec each',
        'Overhead triceps & shoulder stretch — 30 sec each',
        'Cobra stretch — 30 sec',
        'Standing side stretch — 30 sec each',
        'Forward + lateral neck stretch — 20 sec each',
      ]),
    exercises: [
      { name: 'Dumbbell Shoulder Press', type: 'WEIGHTS', sets: 4, reps: '8-12', targetMuscle: 'Front Delt', rest: '90 sec', rpe: '7', targetWeight: 'Calibrate — start 7.5 kg', videoUrl: null, refLinks: mw('dumbbell-shoulder-press'), notes: 'Front only — no behind-the-neck.' },
      { name: 'Dumbbell Lateral Raise', type: 'WEIGHTS', sets: 4, reps: '10-12', targetMuscle: 'Side Delt', rest: '60 sec', rpe: '8', targetWeight: '7.5 kg', videoUrl: null, refLinks: mw('dumbbell-lateral-raise'), notes: null },
      { name: 'Cable Lateral Raise', type: 'WEIGHTS', sets: 3, reps: '12-15', targetMuscle: 'Side Delt', rest: '60 sec', rpe: '8', targetWeight: 'Calibrate', videoUrl: null, refLinks: mw('cable-lateral-raise'), notes: 'Needs a real number by end of week 1.' },
      { name: 'Rear Delt Machine / Reverse Pec Dec', type: 'WEIGHTS', sets: 3, reps: '12-15', targetMuscle: 'Rear Delt', rest: '60 sec', rpe: '7-8', targetWeight: 'Calibrate', videoUrl: null, refLinks: mw('machine-rear-delt-fly'), notes: 'Needs a real number by end of week 1.' },
      { name: 'Cable Rope Face Pull', type: 'WEIGHTS', sets: 3, reps: '12-15', targetMuscle: 'Rear Delt / Rotator Cuff', rest: '60 sec', rpe: '7', targetWeight: 'Calibrate', videoUrl: null, refLinks: mw('cable-bar-face-pull'), notes: 'Needs a real number by end of week 1.' },
      { name: 'Dumbbell Shrugs', type: 'WEIGHTS', sets: 3, reps: '12-15', targetMuscle: 'Upper Traps', rest: '60 sec', rpe: '8', targetWeight: 'Calibrate', videoUrl: null, refLinks: mw('dumbbell-shrug'), notes: 'Squeeze at the top.' },
      { name: 'Hanging Knee Raise', type: 'BODYWEIGHT', sets: 3, reps: '10-12', targetMuscle: 'Lower Abs', rest: '45 sec', rpe: '8', targetWeight: null, videoUrl: null, refLinks: mw('bodyweight-hanging-knee-raise'), notes: 'Abs circuit. Avoid swinging.' },
      { name: 'Cable Crunch', type: 'WEIGHTS', sets: 3, reps: '12-15', targetMuscle: 'Upper Abs', rest: '45 sec', rpe: '8', targetWeight: 'Calibrate', videoUrl: null, refLinks: mw('cable-crunch'), notes: 'Abs circuit.' },
      { name: 'Plank', type: 'TIMED', sets: 3, reps: '45 sec', targetMuscle: 'Core (Anti-Extension)', rest: '45 sec', rpe: '8', targetWeight: null, videoUrl: null, refLinks: mw('bodyweight-plank'), notes: 'Abs circuit.' },
      { name: 'Russian Twist', type: 'BODYWEIGHT', sets: 3, reps: '20 total', targetMuscle: 'Obliques', rest: '45 sec', rpe: '8', targetWeight: null, videoUrl: null, refLinks: mw('bodyweight-russian-twist'), notes: 'Abs circuit — 45 sec rest, then next round.' },
      cardio('Cardio — LISS', '30 min', 'Conditioning', '4-5', 'Easy pace, after lifting.'),
    ],
  },
  {
    dayNumber: 4,
    dayName: 'Legs',
    isRestDay: false,
    description:
      focus('Expanded leg day — the book\'s version is thin. Your squat is logged at 0 kg, so the goblet squat builds the pattern first: depth, knees tracking over toes, chest up. Move to the bar once 4 x 10 is comfortable (target: Block 2).') +
      WARMUP_HTML +
      BLOCKS_HTML +
      cooldown([
        'Standing quad stretch — 30 sec each',
        'Lying side quad stretch — 30 sec each',
        'Seated hamstring stretch — 45 sec each',
        'Standing hamstring stretch — 30 sec each',
        'Seated figure four (glutes) — 45 sec each',
        'Wall calf stretch — 30 sec each',
        'Downward dog — 60 sec',
      ]),
    exercises: [
      { name: 'Goblet Squat → Barbell Squat', type: 'WEIGHTS', sets: 4, reps: '8-10', targetMuscle: 'Quads & Glutes', rest: '2-3 mins', rpe: '7', targetWeight: 'Calibrate — DB/KB first', videoUrl: null, refLinks: mw('dumbbell-goblet-squat'), notes: 'Build the pattern before loading the bar.' },
      { name: 'Leg Press', type: 'WEIGHTS', sets: 4, reps: '10-12', targetMuscle: 'Quads & Glutes', rest: '2 mins', rpe: '7-8', targetWeight: 'Calibrate', videoUrl: null, refLinks: mw('machine-leg-press'), notes: 'Needs a real number by end of week 1.' },
      { name: 'Romanian Deadlift', type: 'WEIGHTS', sets: 3, reps: '10', targetMuscle: 'Hamstrings & Glutes', rest: '2 mins', rpe: '6', targetWeight: 'Empty bar', videoUrl: null, refLinks: mw('barbell-romanian-deadlift'), notes: 'TECHNIQUE ONLY in Block 1. New movement — hinge, focus on the stretch, load it from Block 2.' },
      { name: 'Seated Leg Curl', type: 'WEIGHTS', sets: 3, reps: '10-12', targetMuscle: 'Hamstrings', rest: '90 sec', rpe: '8', targetWeight: '40 kg', videoUrl: null, refLinks: mw('machine-seated-leg-curl'), notes: null },
      { name: 'Leg Extension', type: 'WEIGHTS', sets: 3, reps: '12-15', targetMuscle: 'Quads', rest: '60 sec', rpe: '8', targetWeight: 'Calibrate', videoUrl: null, refLinks: mw('machine-leg-extension'), notes: 'Needs a real number by end of week 1.' },
      { name: 'Standing Calf Raise', type: 'WEIGHTS', sets: 4, reps: '12-15', targetMuscle: 'Calves (Gastrocnemius)', rest: '60 sec', rpe: '8', targetWeight: 'Calibrate', videoUrl: null, refLinks: mw('machine-standing-calf-raise'), notes: 'Full range of motion.' },
      { name: 'Seated Calf Raise', type: 'WEIGHTS', sets: 3, reps: '15-20', targetMuscle: 'Calves (Soleus)', rest: '60 sec', rpe: '8', targetWeight: 'Calibrate', videoUrl: null, refLinks: mw('machine-seated-calf-raise'), notes: 'Hold at the top.' },
      cardio('Cardio — LISS Incline Walk', '30 min', 'Conditioning', '4', 'Incline walk only, keep it easy. You will be cooked.'),
    ],
  },
  {
    dayNumber: 5,
    dayName: 'Cardio, Core & Mobility',
    isRestDay: false,
    description:
      focus('The bigger cardio hit — the other four days carry the easy volume. LISS stays capped at ~3x/week to protect muscle.') +
      '<h3>Warm-up — 5 min</h3><p>Easy walk plus dynamic drills: leg swings, hip circles, arm circles.</p>' +
      '<h3>Session shape</h3><ul>' +
      li([
        '<strong>HIIT — 20 min:</strong> 3 min ramp to a jog, then 10 rounds of 30 sec hard / 60-90 sec walk, 2 min easy walk to cool',
        '<strong>LISS — 20 min:</strong> incline walk or bike, steady and conversational',
        '<strong>Core finisher:</strong> 2 rounds through the last five exercises',
      ]) +
      '</ul>' +
      '<blockquote>If you are beaten up from the week, drop the HIIT and do 40 min LISS instead. That is a valid Day 5, not a cop-out.</blockquote>' +
      '<h3>Full-body stretch — 10 min, 30 sec each</h3><ul>' +
      li([
        "Child's pose → cat-cow → cobra",
        'Standing quad → seated hamstring → figure four',
        'Wall calf → downward dog',
        'Chest wall stretch → cross-body shoulder',
        'Neck — lateral and forward',
      ]) +
      '</ul>',
    exercises: [
      { name: 'HIIT Intervals', type: 'CARDIO', sets: 10, reps: '30 sec hard / 60-90 sec walk', targetMuscle: 'Conditioning', rest: '60-90 sec walk', rpe: '9', targetWeight: null, videoUrl: null, refLinks: [], notes: 'Sprint or high resistance. Full breath recovery between rounds. 3 min ramp before, 2 min cool after.' },
      cardio('LISS — Incline Walk / Bike', '20 min', 'Conditioning', '4-5', 'Steady, conversational. This is where the fat-loss volume comes from.'),
      { name: 'Plank', type: 'TIMED', sets: 2, reps: '60 sec', targetMuscle: 'Core (Anti-Extension)', rest: '30 sec', rpe: '8', targetWeight: null, videoUrl: null, refLinks: mw('bodyweight-plank'), notes: 'Core finisher — 2 rounds.' },
      { name: 'Side Plank', type: 'TIMED', sets: 2, reps: '30 sec each side', targetMuscle: 'Obliques', rest: '30 sec', rpe: '8', targetWeight: null, videoUrl: null, refLinks: mw('bodyweight-side-plank'), notes: 'Core finisher.' },
      { name: 'Lying Leg Raise', type: 'BODYWEIGHT', sets: 2, reps: '15', targetMuscle: 'Lower Abs', rest: '30 sec', rpe: '8', targetWeight: null, videoUrl: null, refLinks: mw('bodyweight-lying-leg-raise'), notes: 'Core finisher.' },
      { name: 'Bicycle Crunch', type: 'BODYWEIGHT', sets: 2, reps: '20 total', targetMuscle: 'Obliques', rest: '30 sec', rpe: '8', targetWeight: null, videoUrl: null, refLinks: mw('bodyweight-bicycle-crunch'), notes: 'Core finisher.' },
      { name: 'Mountain Climbers', type: 'TIMED', sets: 2, reps: '30 sec', targetMuscle: 'Core / Conditioning', rest: '30 sec', rpe: '8', targetWeight: null, videoUrl: null, refLinks: [], notes: 'Core finisher — last exercise of the round.' },
    ],
  },
  {
    dayNumber: 6,
    dayName: 'Rest',
    isRestDay: true,
    description:
      focus('Rest day. Walk if you feel like it — static stretching and food are the work today.'),
    exercises: [],
  },
  {
    dayNumber: 7,
    dayName: 'Rest',
    isRestDay: true,
    description:
      focus('Full rest. Let joints and the nervous system recover. Walk if you feel like it.'),
    exercises: [],
  },
];

async function main() {
  const profileId = process.argv[2];
  if (!profileId) {
    console.error('Usage: node prisma/seedMahmoud5Day.js <routineProfileId>');
    process.exit(1);
  }

  const profile = await prisma.routineProfile.findUnique({ where: { id: profileId } });
  if (!profile) {
    console.error(`RoutineProfile ${profileId} not found.`);
    process.exit(1);
  }
  console.log(`Target profile: "${profile.name}" (user ${profile.userId})`);

  const oldDays = await prisma.routineDay.findMany({ where: { routineProfileId: profileId } });
  const oldDayIds = new Set(oldDays.map((d) => d.id));
  const oldExIds = [...new Set(oldDays.flatMap((d) => d.exerciseIds))];

  if (oldExIds.length > 0) {
    const oldExs = await prisma.exerciseConfig.findMany({ where: { id: { in: oldExIds } } });
    // Only delete exercises that no day outside this profile still points at.
    const deletable = oldExs.filter((e) => e.routineDayIds.every((id) => oldDayIds.has(id)));
    const shared = oldExs.length - deletable.length;
    if (shared > 0) console.log(`Keeping ${shared} exercise(s) shared with other profiles.`);
    if (deletable.length > 0) {
      await prisma.exerciseConfig.deleteMany({ where: { id: { in: deletable.map((e) => e.id) } } });
      console.log(`Deleted ${deletable.length} old exercises.`);
    }
  }
  await prisma.routineDay.deleteMany({ where: { routineProfileId: profileId } });
  console.log(`Deleted ${oldDays.length} old days.`);

  for (const day of PROGRAMME) {
    const exerciseIds = [];
    for (const ex of day.exercises) {
      const created = await prisma.exerciseConfig.create({
        data: { ...ex, userId: profile.userId },
      });
      exerciseIds.push(created.id);
    }
    await prisma.routineDay.create({
      data: {
        userId: profile.userId,
        routineProfileId: profileId,
        dayNumber: day.dayNumber,
        dayName: day.dayName,
        description: day.description,
        isRestDay: day.isRestDay,
        exerciseIds,
      },
    });
    console.log(`Day ${day.dayNumber} "${day.dayName}" — ${exerciseIds.length} exercises`);
  }

  console.log('Done.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
