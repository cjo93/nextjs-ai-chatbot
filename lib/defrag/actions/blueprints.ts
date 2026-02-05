/**
 * DEFRAG Server Actions - Blueprint Management
 */

"use server";

import { auth } from "@/app/(auth)/auth";
import { db } from "@/lib/db";
import { defragBlueprint, defragSubscription, defragUsage } from "@/lib/db/schema";
import { calculateChart, validateBirthInfo } from "../resolver";
import type { BirthInfo } from "../types";
import { eq, and } from "drizzle-orm";

/**
 * Create a new blueprint (birth chart) for the user
 * Enforces tier-based limits
 */
export async function createBlueprint(input: {
  name: string;
  birthDate: string; // ISO date string
  birthTime: string; // HH:MM
  birthLocation: string;
  birthLatitude: number;
  birthLongitude: number;
}) {
  const session = await auth();
  
  if (!session?.user?.id) {
    return { error: "Authentication required" };
  }
  
  try {
    // Validate birth info
    const birthInfo: BirthInfo = {
      date: new Date(input.birthDate),
      time: input.birthTime,
      location: input.birthLocation,
      latitude: input.birthLatitude,
      longitude: input.birthLongitude,
    };
    
    validateBirthInfo(birthInfo);
    
    // Check subscription tier and limits
    const subscription = await db
      .select()
      .from(defragSubscription)
      .where(eq(defragSubscription.userId, session.user.id))
      .limit(1);
    
    const tier = subscription[0]?.tier || "free";
    
    // Check existing blueprints count
    const existingBlueprints = await db
      .select()
      .from(defragBlueprint)
      .where(eq(defragBlueprint.userId, session.user.id));
    
    // Enforce limits
    if (tier === "free" && existingBlueprints.length >= 1) {
      return { error: "Free tier limited to 1 blueprint. Upgrade to create more." };
    }
    if (tier === "basic" && existingBlueprints.length >= 3) {
      return { error: "Basic tier limited to 3 blueprints. Upgrade to Pro for unlimited." };
    }
    
    // Calculate chart
    const chartData = await calculateChart(birthInfo);
    
    // Create blueprint
    const [blueprint] = await db
      .insert(defragBlueprint)
      .values({
        userId: session.user.id,
        name: input.name,
        birthDate: birthInfo.date,
        birthTime: birthInfo.time,
        birthLocation: birthInfo.location,
        birthLatitude: String(birthInfo.latitude),
        birthLongitude: String(birthInfo.longitude),
        chartData: chartData as any,
      })
      .returning();
    
    // Update usage stats
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    await db
      .insert(defragUsage)
      .values({
        userId: session.user.id,
        month: currentMonth,
        blueprintsCreated: 1,
      })
      .onConflictDoUpdate({
        target: [defragUsage.userId, defragUsage.month],
        set: {
          blueprintsCreated: defragUsage.blueprintsCreated + 1,
          updatedAt: new Date(),
        },
      });
    
    return { success: true, blueprint };
  } catch (error) {
    console.error("Error creating blueprint:", error);
    return { error: error instanceof Error ? error.message : "Failed to create blueprint" };
  }
}

/**
 * Get all blueprints for the current user
 */
export async function getBlueprints() {
  const session = await auth();
  
  if (!session?.user?.id) {
    return { error: "Authentication required" };
  }
  
  try {
    const blueprints = await db
      .select()
      .from(defragBlueprint)
      .where(eq(defragBlueprint.userId, session.user.id))
      .orderBy(defragBlueprint.createdAt);
    
    return { success: true, blueprints };
  } catch (error) {
    console.error("Error fetching blueprints:", error);
    return { error: "Failed to fetch blueprints" };
  }
}

/**
 * Get a single blueprint by ID
 */
export async function getBlueprint(blueprintId: string) {
  const session = await auth();
  
  if (!session?.user?.id) {
    return { error: "Authentication required" };
  }
  
  try {
    const [blueprint] = await db
      .select()
      .from(defragBlueprint)
      .where(
        and(
          eq(defragBlueprint.id, blueprintId),
          eq(defragBlueprint.userId, session.user.id)
        )
      )
      .limit(1);
    
    if (!blueprint) {
      return { error: "Blueprint not found" };
    }
    
    return { success: true, blueprint };
  } catch (error) {
    console.error("Error fetching blueprint:", error);
    return { error: "Failed to fetch blueprint" };
  }
}

/**
 * Delete a blueprint
 */
export async function deleteBlueprint(blueprintId: string) {
  const session = await auth();
  
  if (!session?.user?.id) {
    return { error: "Authentication required" };
  }
  
  try {
    await db
      .delete(defragBlueprint)
      .where(
        and(
          eq(defragBlueprint.id, blueprintId),
          eq(defragBlueprint.userId, session.user.id)
        )
      );
    
    return { success: true };
  } catch (error) {
    console.error("Error deleting blueprint:", error);
    return { error: "Failed to delete blueprint" };
  }
}
