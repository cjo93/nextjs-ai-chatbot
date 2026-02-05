/**
 * Stress Mapper Engine
 * Maps life events to physical forces
 * Converts subjective stress events into objective force vectors
 */

import type { ForceInput } from "./physics";
import { loadType, loadGate } from "./god-engine/loader";

export interface StressEvent {
  title: string;
  description: string;
  severity: number; // 1-10 scale
  category: "work" | "relationship" | "health" | "finance" | "personal" | "family" | "other";
}

export interface StressMappingResult {
  force: ForceInput;
  analysis: {
    baseImpact: number;
    typeMultiplier: number;
    categoryModifier: number;
    finalMagnitude: number;
    direction: "momentum" | "resistance";
  };
  protocol: any;
}

/**
 * Map a stress event to a force vector
 */
export function mapEventToForce(
  event: StressEvent,
  blueprintType: string,
  activatedGates: number[]
): StressMappingResult {
  // Load type protocol for stress mapping
  const typeProtocol = loadType(blueprintType);
  const typeMultiplier = typeProtocol.stress_mapping?.exhaustion_multiplier || 1.0;
  
  // Category impact modifiers
  const categoryModifiers: Record<string, number> = {
    work: 1.2,
    relationship: 1.3,
    health: 1.5,
    finance: 1.1,
    personal: 1.0,
    family: 1.2,
    other: 1.0
  };
  
  const categoryModifier = categoryModifiers[event.category] || 1.0;
  
  // Base impact from severity
  const baseImpact = event.severity;
  
  // Calculate final magnitude
  const finalMagnitude = Math.min(10, baseImpact * typeMultiplier * categoryModifier);
  
  // Determine direction based on severity and category
  const direction = determineForceDirection(event, finalMagnitude);
  
  // Estimate duration based on severity
  const duration = Math.ceil(event.severity / 2); // 1-5 days typically
  
  // Get relevant gate protocols
  const relevantProtocols = activatedGates
    .slice(0, 3) // Take first 3 gates for relevance
    .map(gate => loadGate(gate));
  
  return {
    force: {
      magnitude: finalMagnitude,
      direction,
      duration
    },
    analysis: {
      baseImpact,
      typeMultiplier,
      categoryModifier,
      finalMagnitude,
      direction
    },
    protocol: {
      type: typeProtocol,
      gates: relevantProtocols,
      recommendations: generateRecommendations(event, finalMagnitude, typeProtocol)
    }
  };
}

/**
 * Determine if event creates momentum or resistance
 */
function determineForceDirection(
  event: StressEvent,
  magnitude: number
): "momentum" | "resistance" {
  // High severity events typically create resistance
  if (magnitude > 7) return "resistance";
  
  // Medium severity in certain categories might create momentum
  // (challenges that push growth)
  if (magnitude >= 4 && magnitude <= 7) {
    if (event.category === "work" || event.category === "personal") {
      return "momentum";
    }
  }
  
  // Default to resistance for stress events
  return "resistance";
}

/**
 * Generate context-aware recommendations
 */
function generateRecommendations(
  event: StressEvent,
  magnitude: number,
  typeProtocol: any
): string[] {
  const recommendations: string[] = [];
  
  // Type-specific strategy
  recommendations.push(`Follow your ${typeProtocol.strategy || 'Strategy'}`);
  
  // Severity-based guidance
  if (magnitude > 8) {
    recommendations.push("High severity detected - prioritize immediate stabilization");
    recommendations.push("Consider activating SEDA protocol");
  } else if (magnitude > 5) {
    recommendations.push("Moderate stress - increase self-care practices");
  } else {
    recommendations.push("Manageable event - trust your process");
  }
  
  // Category-specific advice
  const categoryAdvice: Record<string, string> = {
    work: "Reassess workload and boundaries",
    relationship: "Communicate needs clearly and honor your Authority",
    health: "Prioritize rest and seek appropriate support",
    finance: "Review resources and make aligned decisions",
    personal: "Return to self-care fundamentals",
    family: "Set healthy boundaries while staying connected",
    other: "Process through your Authority"
  };
  
  if (categoryAdvice[event.category]) {
    recommendations.push(categoryAdvice[event.category]);
  }
  
  return recommendations;
}

/**
 * Assess if event triggers SEDA (crisis) protocol
 */
export function assessSEDAThreshold(
  event: StressEvent,
  mappingResult: StressMappingResult
): { triggered: boolean; level: number } {
  const magnitude = mappingResult.force.magnitude;
  
  // SEDA levels:
  // 0: No crisis
  // 1: Elevated (7-7.5)
  // 2: High (7.5-8.5)
  // 3: Severe (8.5-9.5)
  // 4: Critical (9.5+)
  
  if (magnitude < 7) {
    return { triggered: false, level: 0 };
  }
  
  let level: number;
  if (magnitude >= 9.5) level = 4;
  else if (magnitude >= 8.5) level = 3;
  else if (magnitude >= 7.5) level = 2;
  else level = 1;
  
  // Health category automatically elevates
  if (event.category === "health" && level < 3) {
    level = Math.min(4, level + 1);
  }
  
  return { triggered: true, level };
}

/**
 * Calculate cumulative stress from multiple events
 */
export function calculateCumulativeStress(
  events: Array<{ magnitude: number; timestamp: Date }>
): number {
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  
  // Events decay in impact over time
  let cumulativeStress = 0;
  
  for (const event of events) {
    const daysAgo = (now - event.timestamp.getTime()) / dayMs;
    const decayFactor = Math.exp(-daysAgo / 7); // 7-day half-life
    cumulativeStress += event.magnitude * decayFactor;
  }
  
  return Math.min(10, cumulativeStress);
}
