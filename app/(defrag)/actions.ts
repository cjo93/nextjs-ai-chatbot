/**
 * DEFRAG Server Actions
 * Server-side operations for blueprint and event management
 */
"use server";

import { auth } from "@/app/(auth)/auth";
import { db } from "@/lib/db";
import {
  blueprint as blueprintTable,
  event as eventTable,
  vectorState as vectorStateTable,
  experiment as experimentTable,
  subscription as subscriptionTable,
} from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { calculateBlueprint, validateBirthData } from "@/lib/defrag/resolver";
import { mapEventToForce, assessSEDAThreshold } from "@/lib/defrag/stress-mapper";
import { generateScript } from "@/lib/defrag/inversion";
import { activateSEDA } from "@/lib/defrag/seda";
import { applyForce, initializeVectorState } from "@/lib/defrag/physics";
import { canCreateBlueprint, canLogEvent } from "@/lib/stripe/features";

/**
 * Create a new blueprint from birth data
 */
export async function createBlueprint(formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    // Check subscription limits
    const [userSubscription] = await db
      .select()
      .from(subscriptionTable)
      .where(eq(subscriptionTable.userId, session.user.id))
      .limit(1);

    const tier = userSubscription?.tier || "free";
    const existingBlueprints = await db
      .select()
      .from(blueprintTable)
      .where(eq(blueprintTable.userId, session.user.id));

    const limit = canCreateBlueprint(tier, existingBlueprints.length);
    if (!limit.allowed) {
      return {
        success: false,
        error: `Blueprint limit reached (${limit.limit}). Upgrade to create more.`,
      };
    }

    // Parse form data
    const name = formData.get("name") as string;
    const birthDate = new Date(formData.get("birthDate") as string);
    const birthTime = formData.get("birthTime") as string;
    const birthPlace = formData.get("birthPlace") as string;
    const latitude = parseFloat(formData.get("latitude") as string);
    const longitude = parseFloat(formData.get("longitude") as string);
    const timezone = formData.get("timezone") as string;

    // Validate birth data
    const validation = validateBirthData({
      date: birthDate,
      time: birthTime,
      latitude,
      longitude,
      timezone,
    });

    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    // Calculate blueprint
    const chart = calculateBlueprint({
      date: birthDate,
      time: birthTime,
      latitude,
      longitude,
      timezone,
    });

    // Insert blueprint
    const [newBlueprint] = await db
      .insert(blueprintTable)
      .values({
        userId: session.user.id,
        name,
        birthDate,
        birthTime,
        birthPlace,
        latitude,
        longitude,
        timezone,
        type: chart.type,
        profile: chart.profile,
        authority: chart.authority,
        definition: chart.definition,
        centers: chart.centers,
        gates: chart.gates,
        channels: chart.channels,
        variables: chart.variables,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    // Initialize vector state
    await db.insert(vectorStateTable).values({
      blueprintId: newBlueprint.id,
      ...initializeVectorState(),
      timestamp: new Date(),
      createdAt: new Date(),
    });

    revalidatePath("/dashboard");
    revalidatePath("/blueprint");

    return {
      success: true,
      blueprintId: newBlueprint.id,
      data: newBlueprint,
    };
  } catch (error) {
    console.error("Create blueprint error:", error);
    return {
      success: false,
      error: "Failed to create blueprint. Please try again.",
    };
  }
}

/**
 * Log a new event
 */
export async function logEvent(
  blueprintId: string,
  formData: FormData
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    // Verify blueprint belongs to user
    const [blueprint] = await db
      .select()
      .from(blueprintTable)
      .where(eq(blueprintTable.id, blueprintId))
      .limit(1);

    if (!blueprint || blueprint.userId !== session.user.id) {
      return { success: false, error: "Blueprint not found" };
    }

    // Check event limits
    const [userSubscription] = await db
      .select()
      .from(subscriptionTable)
      .where(eq(subscriptionTable.userId, session.user.id))
      .limit(1);

    const tier = userSubscription?.tier || "free";
    
    // Count events this month
    const firstDayOfMonth = new Date();
    firstDayOfMonth.setDate(1);
    firstDayOfMonth.setHours(0, 0, 0, 0);
    
    const monthEvents = await db
      .select()
      .from(eventTable)
      .where(eq(eventTable.blueprintId, blueprintId));

    const thisMonthCount = monthEvents.filter(
      e => e.createdAt >= firstDayOfMonth
    ).length;

    const limit = canLogEvent(tier, thisMonthCount);
    if (!limit.allowed) {
      return {
        success: false,
        error: `Monthly event limit reached (${limit.limit}). Upgrade for more.`,
      };
    }

    // Parse event data
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const severity = parseInt(formData.get("severity") as string);
    const category = formData.get("category") as string;

    // Map event to force
    const mappingResult = mapEventToForce(
      { title, description, severity, category: category as any },
      blueprint.type,
      blueprint.gates as number[]
    );

    // Generate behavioral script
    const script = generateScript(
      { title, description, severity, category },
      blueprint.type,
      blueprint.gates as number[]
    );

    // Check SEDA threshold
    const sedaAssessment = assessSEDAThreshold(
      { title, description, severity, category: category as any },
      mappingResult
    );

    let sedaProtocol = null;
    if (sedaAssessment.triggered) {
      sedaProtocol = activateSEDA(
        { title, severity, category },
        sedaAssessment.level,
        blueprint.type
      );
    }

    // Get latest vector state
    const [latestState] = await db
      .select()
      .from(vectorStateTable)
      .where(eq(vectorStateTable.blueprintId, blueprintId))
      .orderBy(desc(vectorStateTable.timestamp))
      .limit(1);

    const currentState = latestState || initializeVectorState();

    // Apply force to vector state
    const newState = applyForce(currentState, mappingResult.force);

    // Insert event
    const [newEvent] = await db
      .insert(eventTable)
      .values({
        blueprintId,
        title,
        description,
        severity,
        category: category as any,
        forceMagnitude: mappingResult.force.magnitude,
        forceDirection: mappingResult.force.direction,
        impactVector: mappingResult.analysis,
        script: script.script,
        protocol: mappingResult.protocol,
        sedaLevel: sedaAssessment.triggered ? sedaAssessment.level : null,
        sedaProtocol,
        isProcessed: true,
        processedAt: new Date(),
        occurredAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    // Insert new vector state
    await db.insert(vectorStateTable).values({
      blueprintId,
      ...newState,
      timestamp: new Date(),
      context: { eventId: newEvent.id },
      createdAt: new Date(),
    });

    revalidatePath("/events");
    revalidatePath("/dashboard");

    return {
      success: true,
      eventId: newEvent.id,
      data: {
        event: newEvent,
        script,
        sedaTriggered: sedaAssessment.triggered,
        sedaLevel: sedaAssessment.level,
      },
    };
  } catch (error) {
    console.error("Log event error:", error);
    return {
      success: false,
      error: "Failed to log event. Please try again.",
    };
  }
}

/**
 * Start an experiment
 */
export async function startExperiment(formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const blueprintId = formData.get("blueprintId") as string;
    const title = formData.get("title") as string;
    const hypothesis = formData.get("hypothesis") as string;
    const method = formData.get("method") as string;
    const expectedOutcome = formData.get("expectedOutcome") as string;

    const [newExperiment] = await db
      .insert(experimentTable)
      .values({
        blueprintId,
        title,
        hypothesis,
        method,
        expectedOutcome,
        status: "active",
        startDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    revalidatePath("/experiments");
    revalidatePath("/dashboard");

    return {
      success: true,
      experimentId: newExperiment.id,
      data: newExperiment,
    };
  } catch (error) {
    console.error("Start experiment error:", error);
    return { success: false, error: "Failed to start experiment" };
  }
}

/**
 * Complete an experiment
 */
export async function completeExperiment(
  experimentId: string,
  formData: FormData
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const actualOutcome = formData.get("actualOutcome") as string;
    const successRating = parseInt(formData.get("successRating") as string);
    const insights = formData.get("insights") as string;
    const nextSteps = formData.get("nextSteps") as string;

    const [updatedExperiment] = await db
      .update(experimentTable)
      .set({
        actualOutcome,
        successRating,
        insights,
        nextSteps,
        status: "completed",
        endDate: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(experimentTable.id, experimentId))
      .returning();

    revalidatePath("/experiments");
    revalidatePath(`/experiments/${experimentId}`);

    return {
      success: true,
      data: updatedExperiment,
    };
  } catch (error) {
    console.error("Complete experiment error:", error);
    return { success: false, error: "Failed to complete experiment" };
  }
}
