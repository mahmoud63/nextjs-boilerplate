"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import crypto from "crypto";
import { cookies } from "next/headers";

// --- AUTHENTICATION ACTIONS ---

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return salt + ":" + derivedKey.toString('hex');
}

function verifyPassword(password: string, hash: string): boolean {
  const [salt, key] = hash.split(":");
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return key === derivedKey.toString('hex');
}

export async function getCurrentUser() {
  const token = (await cookies()).get('session_token')?.value;
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true }
  });

  if (!session || session.expiresAt < new Date()) {
    return null;
  }
  return session.user;
}

export async function login(username: string, password: string) {
  try {
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user || !verifyPassword(password, user.passwordHash)) {
      return { success: false, error: "Invalid username or password" };
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

    await prisma.session.create({
      data: {
        userId: user.id,
        token,
        expiresAt
      }
    });

    (await cookies()).set('session_token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', expires: expiresAt, path: '/' });
    
    return { success: true };
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, error: "An error occurred during login" };
  }
}

export async function signup(username: string, password: string, height: number, initialWeight: number) {
  try {
    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) return { success: false, error: "Username already exists" };

    const user = await prisma.user.create({
      data: {
        username,
        passwordHash: hashPassword(password),
        height,
      }
    });

    await prisma.weightLog.create({
      data: {
        userId: user.id,
        weight: initialWeight,
      }
    });

    // Create Default Profile with 7 days
    const defaultProfile = await prisma.routineProfile.create({
      data: {
        name: "Default Profile",
        isActive: true,
        userId: user.id,
        activatedAt: new Date()
      }
    });

    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    for (let i = 0; i < 7; i++) {
      await prisma.routineDay.create({
        data: {
          userId: user.id,
          routineProfileId: defaultProfile.id,
          dayNumber: i + 1,
          dayName: days[i],
          description: i >= 5 ? "Rest Day" : "Workout Day",
          isRestDay: i >= 5,
          exerciseIds: []
        }
      });
    }

    // Auto login
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await prisma.session.create({
      data: { userId: user.id, token, expiresAt }
    });

    (await cookies()).set('session_token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', expires: expiresAt, path: '/' });
    
    return { success: true };
  } catch (error) {
    console.error("Signup error:", error);
    return { success: false, error: "An error occurred during signup" };
  }
}

export async function logout() {
  const token = (await cookies()).get('session_token')?.value;
  if (token) {
    await prisma.session.deleteMany({ where: { token } });
  }
  (await cookies()).delete('session_token');
  return { success: true };
}


export async function logWeight(weight: number) {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Unauthorized" };

    await prisma.weightLog.create({
      data: {
        userId: user.id,
        weight,
        date: new Date()
      }
    });
    
    revalidatePath("/history");
    return { success: true };
  } catch (error) {
    console.error("Failed to log weight:", error);
    return { success: false, error: "Failed to log weight" };
  }
}

export async function getWeightHistory() {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const logs = await prisma.weightLog.findMany({
      where: { userId: user.id },
      orderBy: { date: 'asc' }
    });
    return { success: true, data: logs };
  } catch (error) {
    console.error("Failed to get weight history:", error);
    return { success: false, error: "Failed to fetch weight history" };
  }
}

export async function getCycleStartDate() {
  const user = await getCurrentUser();
  if (!user) return new Date(0);

  const marker = await prisma.workoutSession.findFirst({
    where: { dayName: "SYSTEM_CYCLE_MARKER", userId: user.id },
    orderBy: { date: 'desc' }
  });
  return marker ? marker.date : new Date(0);
}

export async function logSet(data: {
  exerciseId: string;
  exerciseName: string;
  dayName: string;
  setNumber: number;
  weight: number;
  reps: number;
}) {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const startOfCycle = await getCycleStartDate();

    let session = await prisma.workoutSession.findFirst({
      where: {
        date: { gt: startOfCycle },
        dayName: data.dayName,
        userId: user.id,
      },
    });

    if (!session) {
      session = await prisma.workoutSession.create({
        data: {
          dayName: data.dayName,
          date: new Date(),
          userId: user.id,
        },
      });
    }

    let exerciseLog = await prisma.exerciseLog.findFirst({
      where: {
        workoutSessionId: session.id,
        exerciseName: data.exerciseName,
      },
    });

    if (!exerciseLog) {
      exerciseLog = await prisma.exerciseLog.create({
        data: {
          workoutSessionId: session.id,
          exerciseName: data.exerciseName,
        },
      });
    }

    await prisma.exerciseLog.update({
      where: { id: exerciseLog.id },
      data: {
        sets: {
          push: {
            setNumber: data.setNumber,
            weight: data.weight,
            reps: data.reps,
          },
        },
      },
    });

    revalidatePath(`/exercise/${data.exerciseId}`);
    revalidatePath(`/`); // Revalidate dashboard to update completion statuses
    return { success: true };
  } catch (error) {
    console.error("Failed to log set:", error);
    return { success: false, error: "Failed to log set" };
  }
}

export async function getExerciseHistory(exerciseName: string) {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Unauthorized" };

    // Find all sessions for this user
    const userSessions = await prisma.workoutSession.findMany({
      where: { userId: user.id },
      select: { id: true }
    });
    const sessionIds = userSessions.map(s => s.id);

    const logs = await prisma.exerciseLog.findMany({
      where: { 
        exerciseName,
        workoutSessionId: { in: sessionIds }
      },
      orderBy: { date: 'asc' },
    });
    return { success: true, data: logs };
  } catch (error) {
    console.error("Failed to get history:", error);
    return { success: false, error: "Failed to fetch history" };
  }
}

export async function getTodaySession(dayName: string) {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const startOfCycle = await getCycleStartDate();

    const session = await prisma.workoutSession.findFirst({
      where: {
        date: { gt: startOfCycle },
        dayName,
        userId: user.id,
      },
      include: {
        exercises: true,
      },
    });

    return { success: true, data: session };
  } catch (error) {
    console.error("Failed to get today session:", error);
    return { success: false, error: "Failed to get session" };
  }
}

export async function getAllCycleSessions() {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, data: [] };

    const startOfCycle = await getCycleStartDate();

    const sessions = await prisma.workoutSession.findMany({
      where: {
        date: { gt: startOfCycle },
        userId: user.id,
      },
      include: {
        exercises: true,
      },
    });

    return { success: true, data: sessions };
  } catch (error) {
    console.error("Failed to get all cycle sessions:", error);
    return { success: false, error: "Failed to get sessions" };
  }
}

export async function updateSessionStatus(dayName: string, status: "COMPLETED" | "SKIPPED") {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const startOfCycle = await getCycleStartDate();

    let session = await prisma.workoutSession.findFirst({
      where: {
        date: { gt: startOfCycle },
        dayName,
        userId: user.id,
      },
    });

    if (!session) {
      session = await prisma.workoutSession.create({
        data: {
          dayName,
          date: new Date(),
          userId: user.id,
        },
      });
    }

    // Workaround for locked Prisma Client in dev mode:
    // We use a virtual ExerciseLog to store the status since the schema change
    // wasn't generated into the running Node.js process.
    await prisma.exerciseLog.deleteMany({
      where: {
        workoutSessionId: session.id,
        exerciseName: { startsWith: "SYSTEM_STATUS_" },
      }
    });

    await prisma.exerciseLog.create({
      data: {
        workoutSessionId: session.id,
        exerciseName: "SYSTEM_STATUS_" + status,
      }
    });
    
    revalidatePath(`/`);
    return { success: true };
  } catch (error) {
    console.error("Failed to update session status:", error);
    return { success: false, error: "Failed to update session status" };
  }
}

export async function resetCycle() {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Unauthorized" };

    // Creating a new SYSTEM_CYCLE_MARKER sets a new start date for the cycle.
    // All existing sessions will now be in the "past" (before this marker)
    // and the dashboard will be entirely idle.
    await prisma.workoutSession.create({
      data: {
        dayName: "SYSTEM_CYCLE_MARKER",
        date: new Date(),
        userId: user.id,
      }
    });
    
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Failed to reset cycle:", error);
    return { success: false };
  }
}

// --- PROFILE ACTIONS ---

export async function getRoutineProfiles() {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Unauthorized" };

    let profiles = await prisma.routineProfile.findMany({
      where: { userId: user.id },
      orderBy: { id: 'asc' }
    });

    if (profiles.length === 0) {
      // Auto-migrate existing loose days to "Default Profile"
      const defaultProfile = await prisma.routineProfile.create({
        data: {
          name: "Default Profile",
          isActive: true,
          userId: user.id,
          activatedAt: new Date()
        }
      });

      await prisma.routineDay.updateMany({
        where: { userId: user.id, routineProfileId: { isSet: false } },
        data: { routineProfileId: defaultProfile.id }
      });

      // Create "Test Profile"
      const testProfile = await prisma.routineProfile.create({
        data: {
          name: "Test Profile",
          isActive: false,
          userId: user.id
        }
      });
      
      const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
      for (let i = 0; i < 7; i++) {
        await prisma.routineDay.create({
          data: {
            userId: user.id,
            routineProfileId: testProfile.id,
            dayNumber: i + 1,
            dayName: days[i],
            description: i >= 5 ? "Rest Day" : "Test Workout Day",
            isRestDay: i >= 5,
            exerciseIds: []
          }
        });
      }

      profiles = await prisma.routineProfile.findMany({
        where: { userId: user.id },
        orderBy: { id: 'asc' }
      });
    }

    return { success: true, data: profiles };
  } catch (error) {
    console.error("Failed to get routine profiles:", error);
    return { success: false, error: "Failed to get routine profiles" };
  }
}

export async function createRoutineProfile(name: string) {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const profile = await prisma.routineProfile.create({
      data: {
        name,
        isActive: false,
        userId: user.id
      }
    });

    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    for (let i = 0; i < 7; i++) {
      await prisma.routineDay.create({
        data: {
          userId: user.id,
          routineProfileId: profile.id,
          dayNumber: i + 1,
          dayName: days[i],
          description: i >= 5 ? "Rest Day" : "Workout Day",
          isRestDay: i >= 5,
          exerciseIds: []
        }
      });
    }

    revalidatePath("/days");
    return { success: true, data: profile };
  } catch (error) {
    console.error("Failed to create profile:", error);
    return { success: false, error: "Failed to create profile" };
  }
}

export async function activateRoutineProfile(id: string) {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Unauthorized" };

    await prisma.routineProfile.updateMany({
      where: { userId: user.id },
      data: { isActive: false }
    });

    await prisma.routineProfile.update({
      where: { id, userId: user.id },
      data: { isActive: true, activatedAt: new Date() }
    });

    // Reset cycle tracking
    await resetCycle();

    revalidatePath("/");
    revalidatePath("/days");
    return { success: true };
  } catch (error) {
    console.error("Failed to activate profile:", error);
    return { success: false, error: "Failed to activate profile" };
  }
}

export async function updateRoutineProfile(id: string, name: string) {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const profile = await prisma.routineProfile.findUnique({ where: { id, userId: user.id } });
    if (!profile) return { success: false, error: "Not found" };
    if (profile.name === "Default Profile") return { success: false, error: "Cannot edit default profile" };

    await prisma.routineProfile.update({
      where: { id, userId: user.id },
      data: { name }
    });

    revalidatePath("/days");
    return { success: true };
  } catch (error) {
    console.error("Failed to update profile:", error);
    return { success: false, error: "Failed to update profile" };
  }
}

export async function deleteRoutineProfile(id: string) {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const profile = await prisma.routineProfile.findUnique({ where: { id, userId: user.id } });
    if (!profile) return { success: false, error: "Not found" };
    if (profile.name === "Default Profile") return { success: false, error: "Cannot delete default profile" };

    // If active, activate default profile
    if (profile.isActive) {
      const defaultProfile = await prisma.routineProfile.findFirst({ where: { name: "Default Profile", userId: user.id } });
      if (defaultProfile) {
        await activateRoutineProfile(defaultProfile.id);
      }
    }

    await prisma.routineProfile.delete({ where: { id, userId: user.id } });

    revalidatePath("/days");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete profile:", error);
    return { success: false, error: "Failed to delete profile" };
  }
}

// --- CONFIGURATION CRUD ACTIONS ---

export async function getAllRoutineDays(profileId?: string) {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Unauthorized" };

    let targetProfileId = profileId;
    if (!targetProfileId) {
      const activeProfile = await prisma.routineProfile.findFirst({
        where: { userId: user.id, isActive: true }
      });
      if (activeProfile) {
        targetProfileId = activeProfile.id;
      } else {
        await getRoutineProfiles(); // Trigger init
        const newlyActive = await prisma.routineProfile.findFirst({
          where: { userId: user.id, isActive: true }
        });
        if (newlyActive) targetProfileId = newlyActive.id;
      }
    }

    if (!targetProfileId) return { success: true, data: [] };

    const days = await prisma.routineDay.findMany({
      where: { userId: user.id, routineProfileId: targetProfileId },
      orderBy: { dayNumber: 'asc' },
      include: { exercises: true }
    });
    return { success: true, data: days };
  } catch (error) {
    console.error("Failed to get routine days:", error);
    return { success: false, error: "Failed to get routine days" };
  }
}

export async function getRoutineDay(dayNumber: number) {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const day = await prisma.routineDay.findFirst({
      where: { dayNumber, userId: user.id },
      include: { exercises: true }
    });
    return { success: true, data: day };
  } catch (error) {
    console.error("Failed to get routine day:", error);
    return { success: false, error: "Failed to get routine day" };
  }
}

export async function updateRoutineDay(id: string, data: { dayName: string, description: string, isRestDay: boolean, exerciseIds: string[] }) {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Unauthorized" };

    await prisma.routineDay.update({
      where: { id, userId: user.id },
      data: {
        dayName: data.dayName,
        description: data.description,
        isRestDay: data.isRestDay,
        exerciseIds: data.exerciseIds,
      }
    });
    revalidatePath("/");
    revalidatePath("/settings");
    return { success: true };
  } catch (error) {
    console.error("Failed to update routine day:", error);
    return { success: false, error: "Failed to update routine day" };
  }
}

export async function getAllExercises() {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const exercises = await prisma.exerciseConfig.findMany({
      where: { userId: user.id },
      orderBy: { name: 'asc' }
    });
    return { success: true, data: exercises };
  } catch (error) {
    console.error("Failed to get exercises:", error);
    return { success: false, error: "Failed to get exercises" };
  }
}

export async function createExercise(data: { name: string, sets: number, reps: string, targetMuscle: string, rest: string, notes?: string, imageUrl?: string }) {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Unauthorized" };

    await prisma.exerciseConfig.create({ data: { ...data, userId: user.id } });
    revalidatePath("/settings");
    return { success: true };
  } catch (error) {
    console.error("Failed to create exercise:", error);
    return { success: false, error: "Failed to create exercise" };
  }
}

export async function updateExercise(id: string, data: { name: string, sets: number, reps: string, targetMuscle: string, rest: string, notes?: string, imageUrl?: string }) {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Unauthorized" };

    await prisma.exerciseConfig.update({ where: { id, userId: user.id }, data });
    revalidatePath("/");
    revalidatePath("/settings");
    return { success: true };
  } catch (error) {
    console.error("Failed to update exercise:", error);
    return { success: false, error: "Failed to update exercise" };
  }
}

export async function deleteExercise(id: string) {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Unauthorized" };

    // Note: Due to MongoDB's lack of true cascading on array relations without extra work,
    // we should ideally clean up references in routineDay, but Prisma handles array relations 
    // by storing ObjectIds. Let's manually pull the ID from routineDays.
    const exercise = await prisma.exerciseConfig.findUnique({ where: { id, userId: user.id } });
    if (exercise && exercise.routineDayIds.length > 0) {
      // Find days that have this exercise and remove it
      const days = await prisma.routineDay.findMany({ where: { id: { in: exercise.routineDayIds }, userId: user.id } });
      for (const day of days) {
        await prisma.routineDay.update({
          where: { id: day.id },
          data: {
            exerciseIds: day.exerciseIds.filter(eId => eId !== id)
          }
        });
      }
    }
    
    await prisma.exerciseConfig.delete({ where: { id, userId: user.id } });
    revalidatePath("/");
    revalidatePath("/settings");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete exercise:", error);
    return { success: false, error: "Failed to delete exercise" };
  }
}

export async function getExerciseConfig(id: string) {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const exercise = await prisma.exerciseConfig.findUnique({
      where: { id, userId: user.id },
    });
    return { success: true, data: exercise };
  } catch (error) {
    console.error("Failed to get exercise:", error);
    return { success: false, error: "Failed to get exercise" };
  }
}

export async function getCycleStats() {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const startOfCycle = await getCycleStartDate();

    const userSessions = await prisma.workoutSession.findMany({
      where: { userId: user.id, date: { gt: startOfCycle } },
      select: { id: true }
    });
    const sessionIds = userSessions.map(s => s.id);

    const logs = await prisma.exerciseLog.findMany({
      where: { 
        workoutSessionId: { in: sessionIds },
        exerciseName: { startsWith: "SYSTEM_STATUS_" }
      }
    });

    const completed = logs.filter(l => l.exerciseName === "SYSTEM_STATUS_COMPLETED").length;
    const skipped = logs.filter(l => l.exerciseName === "SYSTEM_STATUS_SKIPPED").length;

    return { success: true, data: { completed, skipped } };
  } catch (error) {
    console.error("Failed to get cycle stats:", error);
    return { success: false, error: "Failed to get stats" };
  }
}

export async function changePassword(oldPass: string, newPass: string) {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Unauthorized" };

    if (!verifyPassword(oldPass, user.passwordHash)) {
      return { success: false, error: "Incorrect old password" };
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: hashPassword(newPass) }
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to change password:", error);
    return { success: false, error: "Failed to change password" };
  }
}
