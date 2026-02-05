/**
 * DEFRAG Physics Engine - Vector State Calculator
 * Calculates stress vectors and their impact on the Human Design chart
 */

import type { ChartData, EventInput, VectorState } from "./types";

/**
 * Calculate vector state from an event and chart data
 * @param event - The stress event to analyze
 * @param chart - User's Human Design chart
 * @returns Vector state showing magnitude, direction, and affected gates
 * 
 * TODO: Implement full physics calculation
 * - Map event severity to vector magnitude
 * - Analyze event description to determine affected gates
 * - Calculate stress direction based on chart configuration
 * - Consider defined vs undefined centers
 * - Factor in conditioning and openness
 */
export function calculateVectorState(
  event: EventInput,
  chart: ChartData
): VectorState {
  // STUB: Simplified physics calculation
  // In production, this would use complex algorithms to:
  // 1. Analyze event semantics to identify relevant gates
  // 2. Calculate stress propagation through the chart
  // 3. Determine vector magnitude based on severity and chart configuration
  // 4. Identify the direction of stress (resistance, flow, amplification, etc.)
  
  const magnitude = event.severity * 10; // Simple 0-100 scale
  
  // Analyze which gates are affected based on event category
  const affectedGates = determineAffectedGates(event, chart);
  
  // Determine stress direction
  const direction = determineStressDirection(event, chart, affectedGates);
  
  return {
    magnitude,
    direction,
    affectedGates,
    timestamp: event.timestamp,
  };
}

/**
 * Determine which gates are affected by an event
 * Uses semantic analysis and chart configuration
 */
function determineAffectedGates(event: EventInput, chart: ChartData): number[] {
  // STUB: Simplified gate determination
  // Map event categories to relevant gate domains
  const categoryGateMap: Record<string, number[]> = {
    work: [1, 7, 13, 31, 33], // Expression, direction, leadership
    relationships: [15, 39, 40, 52, 59], // Love, provocation, intimacy
    health: [18, 28, 50, 57, 64], // Correction, struggle, values, intuition
    family: [25, 26, 46, 48, 59], // Innocence, taming, serendipity, depth
    money: [21, 27, 45, 51, 54], // Control, caring, gathering, shock, ambition
    creativity: [1, 8, 11, 43, 56], // Creative force, contribution, ideas, breakthrough
  };
  
  const relevantGates = categoryGateMap[event.category.toLowerCase()] || [];
  
  // Filter to only gates that are actually in the user's chart
  const userGateNumbers = chart.gates.map((g) => g.number);
  return relevantGates.filter((g) => userGateNumbers.includes(g));
}

/**
 * Determine the direction of stress based on event and chart
 */
function determineStressDirection(
  event: EventInput,
  chart: ChartData,
  affectedGates: number[]
): string {
  // STUB: Simplified direction calculation
  // In production, would analyze:
  // - Whether affected gates are defined or undefined
  // - Chart type and strategy alignment
  // - Authority vs event decision-making
  
  if (event.severity >= 8) {
    return "resistance";
  } else if (event.severity >= 5) {
    return "friction";
  } else {
    return "flow";
  }
}

/**
 * Calculate cumulative stress over time
 * @param vectors - Array of vector states over time
 * @returns Overall stress profile
 */
export function calculateCumulativeStress(vectors: VectorState[]): {
  averageMagnitude: number;
  dominantDirection: string;
  mostAffectedGates: number[];
} {
  if (vectors.length === 0) {
    return {
      averageMagnitude: 0,
      dominantDirection: "neutral",
      mostAffectedGates: [],
    };
  }
  
  const averageMagnitude = vectors.reduce((sum, v) => sum + v.magnitude, 0) / vectors.length;
  
  // Count direction occurrences
  const directionCounts: Record<string, number> = {};
  vectors.forEach((v) => {
    directionCounts[v.direction] = (directionCounts[v.direction] || 0) + 1;
  });
  
  const dominantDirection = Object.entries(directionCounts)
    .sort((a, b) => b[1] - a[1])[0][0];
  
  // Count gate occurrences
  const gateCounts: Record<number, number> = {};
  vectors.forEach((v) => {
    v.affectedGates.forEach((gate) => {
      gateCounts[gate] = (gateCounts[gate] || 0) + 1;
    });
  });
  
  const mostAffectedGates = Object.entries(gateCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([gate]) => parseInt(gate));
  
  return {
    averageMagnitude,
    dominantDirection,
    mostAffectedGates,
  };
}
