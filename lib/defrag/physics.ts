/**
 * Physics Engine
 * Vector mechanics for the DEFRAG system - calculating vector states from blueprint data
 */

import type { HumanDesignChart } from "./resolver";

/**
 * 3D Vector State representing a person's current position in
 * Resilience (X), Autonomy (Y), and Connectivity (Z) space
 */
export interface VectorState {
  xResilience: number; // 0-10 scale
  yAutonomy: number; // 0-10 scale
  zConnectivity: number; // 0-10 scale
  mass: number; // Resistance to change
  permeability: number; // Openness to influence
  elasticity: number; // Ability to return to baseline
}

/**
 * Force vector applied to a vector state
 */
export interface ForceVector {
  xComponent: number;
  yComponent: number;
  zComponent: number;
  magnitude: number;
}

/**
 * Calculate initial vector state from Human Design chart
 * This establishes the baseline "physics" of a person
 */
export function calculateInitialVectorState(
  chart: HumanDesignChart
): VectorState {
  // X-Axis: Resilience (ability to withstand stress)
  // Influenced by Root center (motor) and Spleen (survival)
  const rootDefined = chart.centers.root === "defined" ? 2 : 0;
  const spleenDefined = chart.centers.spleen === "defined" ? 2 : 0;
  const xResilience = 5 + rootDefined + spleenDefined;

  // Y-Axis: Autonomy (self-direction and independence)
  // Influenced by G center (identity) and Sacral (life force)
  const gDefined = chart.centers.g === "defined" ? 2 : 0;
  const sacralDefined = chart.centers.sacral === "defined" ? 2 : 0;
  const yAutonomy = 5 + gDefined + sacralDefined;

  // Z-Axis: Connectivity (relational capacity)
  // Influenced by Throat (expression) and Solar Plexus (emotions)
  const throatDefined = chart.centers.throat === "defined" ? 2 : 0;
  const solarPlexusDefined = chart.centers.solarPlexus === "defined" ? 2 : 0;
  const zConnectivity = 5 + throatDefined + solarPlexusDefined;

  // Mass: Resistance to change (more defined centers = more mass)
  const definedCenters = Object.values(chart.centers).filter(
    (c) => c === "defined"
  ).length;
  const mass = 5 + definedCenters * 0.5;

  // Permeability: Openness to influence (more undefined = more permeable)
  const undefinedCenters = 9 - definedCenters;
  const permeability = 5 + undefinedCenters * 0.5;

  // Elasticity: Ability to return to baseline
  // Generators and MGs have higher elasticity (Sacral energy)
  const elasticity =
    chart.type === "Generator" || chart.type === "Manifesting Generator"
      ? 7
      : chart.type === "Projector"
        ? 5
        : chart.type === "Manifestor"
          ? 6
          : 4; // Reflector

  return {
    xResilience: Math.max(0, Math.min(10, xResilience)),
    yAutonomy: Math.max(0, Math.min(10, yAutonomy)),
    zConnectivity: Math.max(0, Math.min(10, zConnectivity)),
    mass: Math.max(1, Math.min(10, mass)),
    permeability: Math.max(1, Math.min(10, permeability)),
    elasticity: Math.max(1, Math.min(10, elasticity)),
  };
}

/**
 * Apply a force vector to a vector state
 * Returns the new vector state after force application
 */
export function applyForce(
  currentState: VectorState,
  force: ForceVector,
  duration: number = 1.0
): VectorState {
  // Force application is modified by mass, permeability, and elasticity
  const effectiveForce = {
    x: (force.xComponent * currentState.permeability) / currentState.mass,
    y: (force.yComponent * currentState.permeability) / currentState.mass,
    z: (force.zComponent * currentState.permeability) / currentState.mass,
  };

  // Apply force with duration scaling
  const newX = currentState.xResilience + effectiveForce.x * duration;
  const newY = currentState.yAutonomy + effectiveForce.y * duration;
  const newZ = currentState.zConnectivity + effectiveForce.z * duration;

  // Apply elasticity - tendency to return to baseline (5.0)
  const baselineX = 5.0;
  const baselineY = 5.0;
  const baselineZ = 5.0;

  const elasticityFactor = currentState.elasticity * 0.1;

  const elasticX = newX + (baselineX - newX) * elasticityFactor;
  const elasticY = newY + (baselineY - newY) * elasticityFactor;
  const elasticZ = newZ + (baselineZ - newZ) * elasticityFactor;

  return {
    ...currentState,
    xResilience: Math.max(0, Math.min(10, elasticX)),
    yAutonomy: Math.max(0, Math.min(10, elasticY)),
    zConnectivity: Math.max(0, Math.min(10, elasticZ)),
  };
}

/**
 * Calculate distance between two vector states
 */
export function calculateVectorDistance(
  state1: VectorState,
  state2: VectorState
): number {
  const dx = state2.xResilience - state1.xResilience;
  const dy = state2.yAutonomy - state1.yAutonomy;
  const dz = state2.zConnectivity - state1.zConnectivity;

  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/**
 * Calculate the magnitude of displacement from baseline (5, 5, 5)
 */
export function calculateDisplacementMagnitude(state: VectorState): number {
  const dx = state.xResilience - 5;
  const dy = state.yAutonomy - 5;
  const dz = state.zConnectivity - 5;

  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/**
 * Determine if a vector state indicates critical stress
 * (too far from baseline or at extreme values)
 */
export function isCriticalState(state: VectorState): boolean {
  // Check for extreme values (near 0 or 10)
  const hasExtremeValue =
    state.xResilience < 2 ||
    state.xResilience > 8 ||
    state.yAutonomy < 2 ||
    state.yAutonomy > 8 ||
    state.zConnectivity < 2 ||
    state.zConnectivity > 8;

  // Check for high displacement from baseline
  const displacement = calculateDisplacementMagnitude(state);
  const highDisplacement = displacement > 5;

  return hasExtremeValue || highDisplacement;
}

/**
 * Calculate the primary stress axis (which dimension is most affected)
 */
export function getPrimaryStressAxis(state: VectorState): {
  axis: "resilience" | "autonomy" | "connectivity";
  severity: number;
} {
  const resilienceDeviation = Math.abs(state.xResilience - 5);
  const autonomyDeviation = Math.abs(state.yAutonomy - 5);
  const connectivityDeviation = Math.abs(state.zConnectivity - 5);

  if (resilienceDeviation >= autonomyDeviation && resilienceDeviation >= connectivityDeviation) {
    return { axis: "resilience", severity: resilienceDeviation };
  }
  if (autonomyDeviation >= connectivityDeviation) {
    return { axis: "autonomy", severity: autonomyDeviation };
  }
  return { axis: "connectivity", severity: connectivityDeviation };
}

/**
 * Simulate natural recovery over time (no force applied)
 */
export function simulateRecovery(
  currentState: VectorState,
  timeUnits: number = 1.0
): VectorState {
  // Natural tendency to return to baseline
  const elasticityFactor = currentState.elasticity * 0.05 * timeUnits;

  const recoveredX =
    currentState.xResilience + (5 - currentState.xResilience) * elasticityFactor;
  const recoveredY =
    currentState.yAutonomy + (5 - currentState.yAutonomy) * elasticityFactor;
  const recoveredZ =
    currentState.zConnectivity + (5 - currentState.zConnectivity) * elasticityFactor;

  return {
    ...currentState,
    xResilience: Math.max(0, Math.min(10, recoveredX)),
    yAutonomy: Math.max(0, Math.min(10, recoveredY)),
    zConnectivity: Math.max(0, Math.min(10, recoveredZ)),
  };
}

/**
 * Calculate compatibility between two vector states (for relationships)
 */
export function calculateCompatibility(
  state1: VectorState,
  state2: VectorState
): {
  overall: number; // 0-100
  dimensions: {
    resilience: number;
    autonomy: number;
    connectivity: number;
  };
} {
  // Compatibility is based on complementary differences
  const resilienceDiff = Math.abs(state1.xResilience - state2.xResilience);
  const autonomyDiff = Math.abs(state1.yAutonomy - state2.yAutonomy);
  const connectivityDiff = Math.abs(state1.zConnectivity - state2.zConnectivity);

  // Convert differences to compatibility scores (0-100)
  // Moderate differences (2-4) are ideal, extremes (0 or 8+) are challenging
  const scoreFromDiff = (diff: number) => {
    if (diff < 2) return 70; // Too similar
    if (diff < 4) return 100; // Ideal complementarity
    if (diff < 6) return 80;
    return 50; // Too different
  };

  const resilienceScore = scoreFromDiff(resilienceDiff);
  const autonomyScore = scoreFromDiff(autonomyDiff);
  const connectivityScore = scoreFromDiff(connectivityDiff);

  return {
    overall: Math.round((resilienceScore + autonomyScore + connectivityScore) / 3),
    dimensions: {
      resilience: resilienceScore,
      autonomy: autonomyScore,
      connectivity: connectivityScore,
    },
  };
}
