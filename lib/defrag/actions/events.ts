/**
 * DEFRAG Server Actions - Event Management
 */

"use server";

import { auth } from "@/app/(auth)/auth";
import { db } from "@/lib/db";
import { defragEvent, defragBlueprint, defragSubscription, defragUsage } from "@/lib/db/schema";
import { calculateVectorState } from "../physics";
import { invertEvent, validateEvent } from "../inversion";
import type { EventInput, ChartData } from "../types";
import { eq, and, desc } from "drizzle-orm";
import { TIER_LIMITS } from "../types";

/**
 * Log a new event and generate wisdom script
 * Enforces tier-based rate limits
 */
export async function logEvent(input: {
  blueprintId: string;
  title: string;
  description: string;
  severity: number;
  category: string;
  timestamp?: string; // ISO date string, defaults to now
}) {
  const session = await auth();
  
  if (!session?.user?.id) {
    return { error: "Authentication required" };
  }
  
  try {
    // Validate event
    const eventInput: EventInput = {
      title: input.title,
      description: input.description,
      severity: input.severity,
      category: input.category,
      timestamp: input.timestamp ? new Date(input.timestamp) : new Date(),
    };
    
    validateEvent(eventInput);
    
    // Check subscription tier and limits
    const subscription = await db
      .select()
      .from(defragSubscription)
      .where(eq(defragSubscription.userId, session.user.id))
      .limit(1);
    
    const tier = subscription[0]?.tier || "free";
    const limits = TIER_LIMITS[tier];
    
    // Check monthly event limit
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    const usage = await db
      .select()
      .from(defragUsage)
      .where(
        and(
          eq(defragUsage.userId, session.user.id),
          eq(defragUsage.month, currentMonth)
        )
      )
      .limit(1);
    
    const eventsThisMonth = usage[0]?.eventsLogged || 0;
    
    if (eventsThisMonth >= limits.eventsPerMonth) {
      return {
        error: `Monthly event limit reached (${limits.eventsPerMonth}). Upgrade to log more events.`,
      };
    }
    
    // Get blueprint to verify ownership and get chart data
    const [blueprint] = await db
      .select()
      .from(defragBlueprint)
      .where(
        and(
          eq(defragBlueprint.id, input.blueprintId),
          eq(defragBlueprint.userId, session.user.id)
        )
      )
      .limit(1);
    
    if (!blueprint) {
      return { error: "Blueprint not found" };
    }
    
    const chartData = blueprint.chartData as ChartData;
    
    // Calculate vector state
    const vectorState = calculateVectorState(eventInput, chartData);
    
    // Generate wisdom script
    const processedEvent = await invertEvent(eventInput, chartData, vectorState);
    
    // Save event
    const [event] = await db
      .insert(defragEvent)
      .values({
        userId: session.user.id,
        blueprintId: input.blueprintId,
        title: eventInput.title,
        description: eventInput.description,
        severity: eventInput.severity,
        category: eventInput.category,
        timestamp: eventInput.timestamp,
        vectorState: vectorState as any,
        generatedScript: processedEvent.generatedScript,
      })
      .returning();
    
    // Update usage stats
    await db
      .insert(defragUsage)
      .values({
        userId: session.user.id,
        month: currentMonth,
        eventsLogged: 1,
      })
      .onConflictDoUpdate({
        target: [defragUsage.userId, defragUsage.month],
        set: {
          eventsLogged: defragUsage.eventsLogged + 1,
          updatedAt: new Date(),
        },
      });
    
    return { success: true, event };
  } catch (error) {
    console.error("Error logging event:", error);
    return { error: error instanceof Error ? error.message : "Failed to log event" };
  }
}

/**
 * Get all events for a blueprint
 */
export async function getEvents(blueprintId: string) {
  const session = await auth();
  
  if (!session?.user?.id) {
    return { error: "Authentication required" };
  }
  
  try {
    const events = await db
      .select()
      .from(defragEvent)
      .where(
        and(
          eq(defragEvent.blueprintId, blueprintId),
          eq(defragEvent.userId, session.user.id)
        )
      )
      .orderBy(desc(defragEvent.timestamp));
    
    return { success: true, events };
  } catch (error) {
    console.error("Error fetching events:", error);
    return { error: "Failed to fetch events" };
  }
}

/**
 * Get a single event by ID
 */
export async function getEvent(eventId: string) {
  const session = await auth();
  
  if (!session?.user?.id) {
    return { error: "Authentication required" };
  }
  
  try {
    const [event] = await db
      .select()
      .from(defragEvent)
      .where(
        and(
          eq(defragEvent.id, eventId),
          eq(defragEvent.userId, session.user.id)
        )
      )
      .limit(1);
    
    if (!event) {
      return { error: "Event not found" };
    }
    
    return { success: true, event };
  } catch (error) {
    console.error("Error fetching event:", error);
    return { error: "Failed to fetch event" };
  }
}

/**
 * Delete an event
 */
export async function deleteEvent(eventId: string) {
  const session = await auth();
  
  if (!session?.user?.id) {
    return { error: "Authentication required" };
  }
  
  try {
    await db
      .delete(defragEvent)
      .where(
        and(
          eq(defragEvent.id, eventId),
          eq(defragEvent.userId, session.user.id)
        )
      );
    
    return { success: true };
  } catch (error) {
    console.error("Error deleting event:", error);
    return { error: "Failed to delete event" };
  }
}

/**
 * Get usage stats for current user
 */
export async function getUsageStats() {
  const session = await auth();
  
  if (!session?.user?.id) {
    return { error: "Authentication required" };
  }
  
  try {
    const currentMonth = new Date().toISOString().slice(0, 7);
    
    const [usage] = await db
      .select()
      .from(defragUsage)
      .where(
        and(
          eq(defragUsage.userId, session.user.id),
          eq(defragUsage.month, currentMonth)
        )
      )
      .limit(1);
    
    const subscription = await db
      .select()
      .from(defragSubscription)
      .where(eq(defragSubscription.userId, session.user.id))
      .limit(1);
    
    const tier = subscription[0]?.tier || "free";
    const limits = TIER_LIMITS[tier];
    
    return {
      success: true,
      usage: usage || {
        eventsLogged: 0,
        blueprintsCreated: 0,
        experimentsStarted: 0,
        relationshipsCreated: 0,
      },
      limits,
      tier,
    };
  } catch (error) {
    console.error("Error fetching usage stats:", error);
    return { error: "Failed to fetch usage stats" };
  }
}
