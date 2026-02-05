"use server";

import { auth } from "@/app/(auth)/auth";
import { db } from "@/lib/db";
import {
  blueprint,
  event,
  experiment,
  relationship,
  vectorState,
  subscription,
  sedaEvent,
} from "@/lib/db/schema";
import { calculateBlueprint, type BirthData } from "@/lib/defrag/resolver";
import {
  BlueprintPhysics,
  PhysicsSolver,
  initializeVectorState,
} from "@/lib/defrag/physics";
import {
  mapEventToStress,
  numericToSeverity,
  detectSedaTriggers,
} from "@/lib/defrag/stress-mapper";
import { processEvent } from "@/lib/defrag/inversion";
import { checkSEDATrigger, formatSEDADisplay } from "@/lib/defrag/seda";
import { eq, desc } from "drizzle-orm";
import {
  checkEventLimit,
  incrementEventCount,
  getUserSubscription,
} from "@/lib/stripe/subscription";

/**
 * Create a new blueprint from birth data
 */
export async function createBlueprint(formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    // Get user subscription and check blueprint limit
    const userSub = await getUserSubscription(session.user.id);
    const blueprintLimit = userSub?.tier === "free" ? 1 : userSub?.tier === "pro" ? 5 : 999;

    // Check existing blueprint count
    const existingBlueprints = await db
      .select()
      .from(blueprint)
      .where(eq(blueprint.userId, session.user.id));

    if (existingBlueprints.length >= blueprintLimit) {
      return {
        error: `Blueprint limit reached. Upgrade to create more blueprints.`,
      };
    }

    // Extract form data
    const name = formData.get("name") as string;
    const birthDateStr = formData.get("birthDate") as string;
    const birthTime = formData.get("birthTime") as string;
    const latitude = parseFloat(formData.get("latitude") as string);
    const longitude = parseFloat(formData.get("longitude") as string);
    const timezone = formData.get("timezone") as string;
    const locationName = formData.get("locationName") as string;

    if (!name || !birthDateStr || !birthTime || isNaN(latitude) || isNaN(longitude)) {
      return { error: "Invalid form data" };
    }

    // Combine date and time
    const birthDate = new Date(`${birthDateStr}T${birthTime}`);

    // Calculate blueprint
    const birthData: BirthData = {
      date: birthDate,
      latitude,
      longitude,
      timezone: timezone || "UTC",
    };

    const chart = await calculateBlueprint(birthData);

    // Calculate physics constants
    const physics = BlueprintPhysics.derive(chart);

    // Create blueprint in database
    const [newBlueprint] = await db
      .insert(blueprint)
      .values({
        userId: session.user.id,
        name,
        birthDate,
        birthLatitude: latitude,
        birthLongitude: longitude,
        birthTimezone: timezone || "UTC",
        birthLocation: { name: locationName, latitude, longitude },
        humanDesign: chart as any,
        ephemeris: {}, // Store planetary positions if needed
        fidelityScore: "HIGH",
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    // Create initial vector state
    const initialState = initializeVectorState();
    await db.insert(vectorState).values({
      blueprintId: newBlueprint.id,
      xResilience: initialState.xResilience,
      yAutonomy: initialState.yAutonomy,
      zConnectivity: initialState.zConnectivity,
      mass: physics.mass,
      permeability: physics.permeability,
      elasticity: physics.elasticity,
      snapshotReason: "baseline",
      timestamp: new Date(),
    });

    // Update subscription blueprint count
    if (userSub) {
      await db
        .update(subscription)
        .set({
          blueprintsCreated: (userSub.blueprintsCreated || 0) + 1,
          updatedAt: new Date(),
        })
        .where(eq(subscription.userId, session.user.id));
    }

    return { success: true, blueprintId: newBlueprint.id };
  } catch (error) {
    console.error("Error creating blueprint:", error);
    return { error: "Failed to create blueprint" };
  }
}

/**
 * Log a new event
 */
export async function logEvent(
  blueprintId: string,
  severityNumeric: number,
  context: string
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    // Check event limit
    const limitCheck = await checkEventLimit(session.user.id);
    if (!limitCheck.canLog) {
      return {
        error: `Event limit reached (${limitCheck.used}/${limitCheck.limit}). Upgrade to log more events.`,
      };
    }

    // Get blueprint
    const [blueprintData] = await db
      .select()
      .from(blueprint)
      .where(eq(blueprint.id, blueprintId))
      .limit(1);

    if (!blueprintData || blueprintData.userId !== session.user.id) {
      return { error: "Blueprint not found" };
    }

    // Get current vector state
    const [currentState] = await db
      .select()
      .from(vectorState)
      .where(eq(vectorState.blueprintId, blueprintId))
      .orderBy(desc(vectorState.timestamp))
      .limit(1);

    if (!currentState) {
      return { error: "Vector state not found" };
    }

    // Map event to stress
    const stress = mapEventToStress(context, severityNumeric);

    // Calculate new vector state
    const newState = PhysicsSolver.calculateImpact(
      {
        xResilience: currentState.xResilience,
        yAutonomy: currentState.yAutonomy,
        zConnectivity: currentState.zConnectivity,
      },
      stress,
      {
        mass: currentState.mass,
        permeability: currentState.permeability,
        elasticity: currentState.elasticity,
      }
    );

    // Create new vector state snapshot
    const [newVectorState] = await db
      .insert(vectorState)
      .values({
        blueprintId,
        xResilience: newState.xResilience,
        yAutonomy: newState.yAutonomy,
        zConnectivity: newState.zConnectivity,
        mass: currentState.mass,
        permeability: currentState.permeability,
        elasticity: currentState.elasticity,
        snapshotReason: "event",
        timestamp: new Date(),
      })
      .returning();

    // Check for SEDA trigger
    const sedaTrigger = checkSEDATrigger(context, severityNumeric);
    const sedaKeywords = sedaTrigger ? detectSedaTriggers(context) : [];

    let diagnosis = null;
    let script = null;
    let experiments = null;

    if (sedaTrigger) {
      // SEDA protocol
      script = formatSEDADisplay();

      // Log SEDA event
      await db.insert(sedaEvent).values({
        userId: session.user.id,
        blueprintId,
        triggerSource: "event_context",
        severityAtTrigger: severityNumeric,
        keywordsMatched: sedaKeywords,
        userContext: context,
        protocolVersion: "v2",
        createdAt: new Date(),
      });
    } else {
      // Normal inversion processing
      const chart = blueprintData.humanDesign as any;
      const inversionResult = await processEvent(
        chart,
        context,
        severityNumeric,
        newState
      );

      diagnosis = inversionResult.diagnosis;
      script = inversionResult.script;
      experiments = inversionResult.experiments;
    }

    // Create event
    const [newEvent] = await db
      .insert(event)
      .values({
        blueprintId,
        userId: session.user.id,
        severity: numericToSeverity(severityNumeric),
        severityNumeric,
        context,
        diagnosis,
        script,
        scriptSource: "deterministic",
        experiments,
        sedaLocked: sedaTrigger,
        sedaKeywords: sedaKeywords.length > 0 ? sedaKeywords : null,
        vectorStateId: newVectorState.id,
        createdAt: new Date(),
      })
      .returning();

    // Increment event count
    await incrementEventCount(session.user.id);

    return {
      success: true,
      eventId: newEvent.id,
      sedaTrigger,
    };
  } catch (error) {
    console.error("Error logging event:", error);
    return { error: "Failed to log event" };
  }
}

/**
 * Start an experiment
 */
export async function startExperiment(
  blueprintId: string,
  eventId: string,
  hypothesis: string,
  action: string,
  successCriteria: string[]
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    const [newExperiment] = await db
      .insert(experiment)
      .values({
        blueprintId,
        sourceEventId: eventId,
        hypothesis,
        action,
        successCriteria,
        status: "active",
        startedAt: new Date(),
        createdAt: new Date(),
      })
      .returning();

    return { success: true, experimentId: newExperiment.id };
  } catch (error) {
    console.error("Error starting experiment:", error);
    return { error: "Failed to start experiment" };
  }
}

/**
 * Complete an experiment
 */
export async function completeExperiment(
  experimentId: string,
  outcome: string,
  success: boolean,
  insights?: string
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    await db
      .update(experiment)
      .set({
        status: "completed",
        outcome,
        success,
        insights,
        endedAt: new Date(),
      })
      .where(eq(experiment.id, experimentId));

    return { success: true };
  } catch (error) {
    console.error("Error completing experiment:", error);
    return { error: "Failed to complete experiment" };
  }
}

/**
 * Create a relationship (synastry)
 */
export async function createRelationship(
  blueprintAId: string,
  blueprintBId: string,
  name?: string,
  relationshipType?: string
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    // Verify both blueprints belong to user
    const blueprints = await db
      .select()
      .from(blueprint)
      .where(eq(blueprint.userId, session.user.id));

    const hasA = blueprints.some((b) => b.id === blueprintAId);
    const hasB = blueprints.some((b) => b.id === blueprintBId);

    if (!hasA || !hasB) {
      return { error: "Invalid blueprints" };
    }

    // Create relationship (synastry calculation would go here)
    const [newRelationship] = await db
      .insert(relationship)
      .values({
        userId: session.user.id,
        blueprintAId,
        blueprintBId,
        name,
        relationshipType,
        synastryData: {}, // Placeholder for synastry calculations
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return { success: true, relationshipId: newRelationship.id };
  } catch (error) {
    console.error("Error creating relationship:", error);
    return { error: "Failed to create relationship" };
  }
}
