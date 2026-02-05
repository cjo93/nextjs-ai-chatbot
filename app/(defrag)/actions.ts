"use server";

import { auth } from "@/app/(auth)/auth";
import { db } from "@/lib/db/utils";
import {
  blueprint as blueprintTable,
  event as eventTable,
  experiment as experimentTable,
  inversionOutcome as inversionOutcomeTable,
  relationship as relationshipTable,
  subscription as subscriptionTable,
  vectorState as vectorStateTable,
} from "@/lib/db/schema";
import { checkTierLimits } from "@/lib/stripe/client";
import { resolveChart } from "@/lib/defrag/resolver";
import {
  calculateInitialVectorState,
  applyForce,
  type VectorState,
} from "@/lib/defrag/physics";
import {
  mapEventToForce,
  shouldTriggerSEDA,
  type SeverityLevel,
} from "@/lib/defrag/stress-mapper";
import { generateInversionScript } from "@/lib/defrag/inversion";
import { eq, and, desc } from "drizzle-orm";

/**
 * Creates a new blueprint from birth data
 */
export async function createBlueprint(data: {
  name: string;
  birthDate: string;
  birthLatitude: number;
  birthLongitude: number;
  birthTimezone: string;
  birthLocation: Record<string, unknown>;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  try {
    // Check subscription limits
    const [userSubscription] = await db
      .select()
      .from(subscriptionTable)
      .where(eq(subscriptionTable.userId, session.user.id))
      .limit(1);

    const tier = userSubscription?.tier || "free";
    const blueprintsCreated = userSubscription?.blueprintsCreated || 0;

    const limits = checkTierLimits(tier, 0, blueprintsCreated);

    if (!limits.canCreateBlueprint) {
      throw new Error(
        "Blueprint limit reached. Please upgrade your subscription."
      );
    }

    // Resolve chart data
    const chartData = await resolveChart({
      date: new Date(data.birthDate),
      latitude: data.birthLatitude,
      longitude: data.birthLongitude,
      timezone: data.birthTimezone,
    });

    // Create blueprint
    const [blueprint] = await db
      .insert(blueprintTable)
      .values({
        userId: session.user.id,
        name: data.name,
        birthDate: new Date(data.birthDate),
        birthLatitude: data.birthLatitude,
        birthLongitude: data.birthLongitude,
        birthTimezone: data.birthTimezone,
        birthLocation: data.birthLocation,
        humanDesign: chartData.humanDesign,
        geneKeys: chartData.geneKeys,
        ephemeris: chartData.ephemeris,
        fidelityScore: chartData.fidelityScore,
        missingData: chartData.missingData,
      })
      .returning();

    // Calculate initial vector state
    const initialVectorState = calculateInitialVectorState(
      chartData.humanDesign
    );

    // Create initial vector state snapshot
    await db.insert(vectorStateTable).values({
      blueprintId: blueprint.id,
      ...initialVectorState,
      snapshotReason: "initial",
    });

    // Update subscription blueprint count
    if (userSubscription) {
      await db
        .update(subscriptionTable)
        .set({
          blueprintsCreated: blueprintsCreated + 1,
          updatedAt: new Date(),
        })
        .where(eq(subscriptionTable.id, userSubscription.id));
    } else {
      // Create initial subscription record
      await db.insert(subscriptionTable).values({
        userId: session.user.id,
        tier: "free",
        blueprintsCreated: 1,
      });
    }

    return { success: true, blueprintId: blueprint.id };
  } catch (error) {
    console.error("Error creating blueprint:", error);
    throw error;
  }
}

/**
 * Logs a new event and generates inversion script
 */
export async function logEvent(data: {
  blueprintId: string;
  severity: SeverityLevel;
  severityNumeric: number;
  context: string;
  keywords?: string[];
  domains?: string[];
}) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  try {
    // Check subscription limits
    const [userSubscription] = await db
      .select()
      .from(subscriptionTable)
      .where(eq(subscriptionTable.userId, session.user.id))
      .limit(1);

    const tier = userSubscription?.tier || "free";
    const eventsThisPeriod = userSubscription?.eventsThisPeriod || 0;

    const limits = checkTierLimits(tier, eventsThisPeriod, 0);

    if (!limits.canLogEvent) {
      throw new Error("Event limit reached. Please upgrade your subscription.");
    }

    // Get blueprint
    const [blueprint] = await db
      .select()
      .from(blueprintTable)
      .where(
        and(
          eq(blueprintTable.id, data.blueprintId),
          eq(blueprintTable.userId, session.user.id)
        )
      )
      .limit(1);

    if (!blueprint) {
      throw new Error("Blueprint not found");
    }

    // Get current vector state
    const [currentVectorState] = await db
      .select()
      .from(vectorStateTable)
      .where(eq(vectorStateTable.blueprintId, data.blueprintId))
      .orderBy(desc(vectorStateTable.timestamp))
      .limit(1);

    if (!currentVectorState) {
      throw new Error("Vector state not found");
    }

    // Map event to force vector
    const diagnosedEvent = mapEventToForce({
      description: data.context,
      severity: data.severity,
      severityNumeric: data.severityNumeric,
      keywords: data.keywords,
      domains: data.domains as
        | ("work" | "relationships" | "health" | "finance" | "identity")[]
        | undefined,
    });

    // Apply force to create new vector state
    const newVectorState = applyForce(
      currentVectorState,
      diagnosedEvent.forceVector
    );

    // Save new vector state
    const [vectorState] = await db
      .insert(vectorStateTable)
      .values({
        blueprintId: data.blueprintId,
        ...newVectorState,
        snapshotReason: "event",
      })
      .returning();

    // Check if SEDA should be triggered
    const sedaCheck = shouldTriggerSEDA(
      data.severity,
      data.severityNumeric,
      data.keywords || []
    );

    // Generate inversion script
    const humanDesignData = blueprint.humanDesign as { gates?: Array<{ gate: number; line: number; planet: string }> };
    const activatedGates = humanDesignData.gates || [];
    const gateNumbers = activatedGates.slice(0, 3).map(g => g.gate); // Use top 3 gates
    const inversionScript = await generateInversionScript(
      gateNumbers,
      data.severity,
      data.context
    );

    // Create event
    const [event] = await db
      .insert(eventTable)
      .values({
        blueprintId: data.blueprintId,
        userId: session.user.id,
        severity: data.severity,
        severityNumeric: data.severityNumeric,
        context: data.context,
        diagnosis: diagnosedEvent.diagnosis,
        script: inversionScript.script,
        scriptSource: inversionScript.source,
        experiments: inversionScript.experiments,
        sedaLocked: sedaCheck.shouldTrigger,
        sedaKeywords: sedaCheck.matchedKeywords || null,
        vectorStateId: vectorState.id,
      })
      .returning();

    // Update subscription event count
    if (userSubscription) {
      await db
        .update(subscriptionTable)
        .set({
          eventsThisPeriod: eventsThisPeriod + 1,
          updatedAt: new Date(),
        })
        .where(eq(subscriptionTable.id, userSubscription.id));
    }

    return {
      success: true,
      eventId: event.id,
      script: inversionScript.script,
      experiments: inversionScript.experiments,
      sedaTriggered: sedaCheck.shouldTrigger,
    };
  } catch (error) {
    console.error("Error logging event:", error);
    throw error;
  }
}

/**
 * Starts a new experiment
 */
export async function startExperiment(data: {
  blueprintId: string;
  sourceEventId?: string;
  hypothesis: string;
  action: string;
  successCriteria: Record<string, unknown>;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  try {
    // Verify blueprint ownership
    const [blueprint] = await db
      .select()
      .from(blueprintTable)
      .where(
        and(
          eq(blueprintTable.id, data.blueprintId),
          eq(blueprintTable.userId, session.user.id)
        )
      )
      .limit(1);

    if (!blueprint) {
      throw new Error("Blueprint not found");
    }

    // Create experiment
    const [experiment] = await db
      .insert(experimentTable)
      .values({
        blueprintId: data.blueprintId,
        sourceEventId: data.sourceEventId || null,
        hypothesis: data.hypothesis,
        action: data.action,
        successCriteria: data.successCriteria,
        status: "active",
      })
      .returning();

    return { success: true, experimentId: experiment.id };
  } catch (error) {
    console.error("Error starting experiment:", error);
    throw error;
  }
}

/**
 * Completes an experiment
 */
export async function completeExperiment(data: {
  experimentId: string;
  outcome: string;
  success: boolean;
  insights?: string;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  try {
    // Verify experiment exists and get blueprint
    const [experiment] = await db
      .select()
      .from(experimentTable)
      .where(eq(experimentTable.id, data.experimentId))
      .limit(1);

    if (!experiment) {
      throw new Error("Experiment not found");
    }

    // Verify blueprint ownership
    const [blueprint] = await db
      .select()
      .from(blueprintTable)
      .where(
        and(
          eq(blueprintTable.id, experiment.blueprintId),
          eq(blueprintTable.userId, session.user.id)
        )
      )
      .limit(1);

    if (!blueprint) {
      throw new Error("Unauthorized");
    }

    // Update experiment
    await db
      .update(experimentTable)
      .set({
        outcome: data.outcome,
        success: data.success,
        insights: data.insights || null,
        status: "completed",
        endedAt: new Date(),
      })
      .where(eq(experimentTable.id, data.experimentId));

    return { success: true };
  } catch (error) {
    console.error("Error completing experiment:", error);
    throw error;
  }
}

/**
 * Creates a relationship between two blueprints
 */
export async function createRelationship(data: {
  blueprintAId: string;
  blueprintBId: string;
  name?: string;
  relationshipType?: string;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  try {
    // Verify both blueprints belong to user
    const blueprints = await db
      .select()
      .from(blueprintTable)
      .where(eq(blueprintTable.userId, session.user.id));

    const blueprintIds = blueprints.map((b) => b.id);

    if (
      !blueprintIds.includes(data.blueprintAId) ||
      !blueprintIds.includes(data.blueprintBId)
    ) {
      throw new Error("One or both blueprints not found");
    }

    // Create relationship
    const [relationship] = await db
      .insert(relationshipTable)
      .values({
        userId: session.user.id,
        blueprintAId: data.blueprintAId,
        blueprintBId: data.blueprintBId,
        name: data.name || null,
        relationshipType: data.relationshipType || null,
        synastryData: {}, // Can be calculated later
      })
      .returning();

    return { success: true, relationshipId: relationship.id };
  } catch (error) {
    console.error("Error creating relationship:", error);
    throw error;
  }
}

/**
 * Records inversion outcome feedback
 */
export async function recordInversionOutcome(data: {
  eventId: string;
  wasHelpful: boolean;
  clarityRating?: number;
  feedbackText?: string;
  actionTaken?: boolean;
  actionDescription?: string;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  try {
    // Verify event ownership
    const [event] = await db
      .select()
      .from(eventTable)
      .where(
        and(
          eq(eventTable.id, data.eventId),
          eq(eventTable.userId, session.user.id)
        )
      )
      .limit(1);

    if (!event) {
      throw new Error("Event not found");
    }

    // Create outcome record
    await db.insert(inversionOutcomeTable).values({
      eventId: data.eventId,
      wasHelpful: data.wasHelpful,
      clarityRating: data.clarityRating || null,
      feedbackText: data.feedbackText || null,
      actionTaken: data.actionTaken || false,
      actionDescription: data.actionDescription || null,
    });

    return { success: true };
  } catch (error) {
    console.error("Error recording inversion outcome:", error);
    throw error;
  }
}
