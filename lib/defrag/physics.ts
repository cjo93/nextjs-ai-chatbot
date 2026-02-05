/**
 * DEFRAG Physics Engine
 * Models blueprint as physical system with mass, permeability, elasticity
 */

import type { HumanDesignChart } from "./resolver";

export interface PhysicsConstants {
  mass: number;
  permeability: number;
  elasticity: number;
}

export interface VectorState {
  xResilience: number;
  yAutonomy: number;
  zConnectivity: number;
}

export interface StressVector {
  dx: number;
  dy: number;
  dz: number;
  magnitude: number;
}

/**
 * Blueprint Physics Calculator
 */
export class BlueprintPhysics {
  /**
   * Derive physics constants from human design chart
   */
  static derive(chart: HumanDesignChart): PhysicsConstants {
    // Calculate mass (density of definition)
    const definedCenters = Object.values(chart.centers).filter(
      (c) => c.defined
    ).length;
    const totalGates = chart.gates.length;

    // Mass: 1.0 to 10.0 based on definition
    const mass = 1.0 + (definedCenters / 9) * 9.0;

    // Permeability: How easily energy flows through (inverse of definition)
    // Reflectors (no definition) = high permeability
    // Manifestors (high definition) = low permeability
    const permeability = 10.0 - (definedCenters / 9) * 7.0;

    // Elasticity: Ability to return to baseline (based on type and authority)
    let elasticity = 5.0;

    if (chart.type === "Reflector") {
      elasticity = 9.0; // Highly elastic
    } else if (chart.type === "Manifestor") {
      elasticity = 3.0; // Less elastic, more fixed
    } else if (chart.type === "Generator" || chart.type === "Manifesting Generator") {
      elasticity = 6.0; // Moderate elasticity
    } else if (chart.type === "Projector") {
      elasticity = 7.0; // Good elasticity
    }

    // Adjust based on authority
    if (chart.authority === "Emotional Authority") {
      elasticity -= 1.0; // Emotional authority adds inertia
    } else if (chart.authority === "Splenic Authority") {
      elasticity += 1.0; // Splenic is quick to reset
    }

    return {
      mass: Math.max(1.0, Math.min(10.0, mass)),
      permeability: Math.max(1.0, Math.min(10.0, permeability)),
      elasticity: Math.max(1.0, Math.min(10.0, elasticity)),
    };
  }
}

/**
 * Physics Solver
 */
export class PhysicsSolver {
  /**
   * Calculate impact of stress on vector state
   */
  static calculateImpact(
    currentState: VectorState,
    stress: StressVector,
    physics: PhysicsConstants
  ): VectorState {
    // F = ma, but modified by permeability and elasticity
    const acceleration = {
      x: (stress.dx / physics.mass) * (physics.permeability / 10),
      y: (stress.dy / physics.mass) * (physics.permeability / 10),
      z: (stress.dz / physics.mass) * (physics.permeability / 10),
    };

    // Apply acceleration to current state
    let newX = currentState.xResilience + acceleration.x;
    let newY = currentState.yAutonomy + acceleration.y;
    let newZ = currentState.zConnectivity + acceleration.z;

    // Apply elasticity (pull back toward baseline of 5.0)
    const baseline = 5.0;
    const elasticityFactor = physics.elasticity / 10;

    newX = newX + (baseline - newX) * elasticityFactor * 0.1;
    newY = newY + (baseline - newY) * elasticityFactor * 0.1;
    newZ = newZ + (baseline - newZ) * elasticityFactor * 0.1;

    // Clamp values to 0-10 range
    return {
      xResilience: Math.max(0, Math.min(10, newX)),
      yAutonomy: Math.max(0, Math.min(10, newY)),
      zConnectivity: Math.max(0, Math.min(10, newZ)),
    };
  }

  /**
   * Calculate overall system health (0-10)
   */
  static calculateHealth(state: VectorState): number {
    // Health is the average of all three dimensions
    return (state.xResilience + state.yAutonomy + state.zConnectivity) / 3;
  }

  /**
   * Detect if system is in critical state
   */
  static isCritical(state: VectorState): boolean {
    const health = this.calculateHealth(state);
    return (
      health < 3.0 ||
      state.xResilience < 2.0 ||
      state.yAutonomy < 2.0 ||
      state.zConnectivity < 2.0
    );
  }

  /**
   * Calculate distance from baseline
   */
  static distortionMagnitude(state: VectorState): number {
    const baseline = 5.0;
    const dx = state.xResilience - baseline;
    const dy = state.yAutonomy - baseline;
    const dz = state.zConnectivity - baseline;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }
}

/**
 * Initialize baseline vector state
 */
export function initializeVectorState(): VectorState {
  return {
    xResilience: 5.0,
    yAutonomy: 5.0,
    zConnectivity: 5.0,
  };
}

/**
 * Serialize vector state for storage
 */
export function serializeVectorState(state: VectorState): string {
  return JSON.stringify(state);
}

/**
 * Deserialize vector state from storage
 */
export function deserializeVectorState(data: string): VectorState {
  try {
    const parsed = JSON.parse(data);
    return {
      xResilience: parsed.xResilience || 5.0,
      yAutonomy: parsed.yAutonomy || 5.0,
      zConnectivity: parsed.zConnectivity || 5.0,
    };
  } catch {
    return initializeVectorState();
  }
}
