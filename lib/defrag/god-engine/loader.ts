/**
 * God Engine Loader - Loads gate, type, and center protocols
 * Implements caching for performance
 */

import type { GateProtocol, TypeProtocol, CenterProtocol, HumanDesignType, CenterName } from "../types";

// Import available gate protocols
import gate001 from "./gates/gate-001.json";
import gate007 from "./gates/gate-007.json";
import gate013 from "./gates/gate-013.json";

// Gate protocol map
const gateProtocols: Record<number, GateProtocol> = {
  1: gate001,
  7: gate007,
  13: gate013,
};

// Simple in-memory cache
const gateCache = new Map<number, GateProtocol>();
const typeCache = new Map<HumanDesignType, TypeProtocol>();
const centerCache = new Map<CenterName, CenterProtocol>();

/**
 * Load a gate protocol by number
 * @param gateNumber - Gate number (1-64)
 * @returns Gate protocol with wisdom and inversion protocols
 */
export async function getGateProtocol(gateNumber: number): Promise<GateProtocol> {
  if (gateNumber < 1 || gateNumber > 64) {
    throw new Error(`Invalid gate number: ${gateNumber}`);
  }
  
  // Check cache
  if (gateCache.has(gateNumber)) {
    return gateCache.get(gateNumber)!;
  }
  
  // Check if we have this gate protocol
  if (gateProtocols[gateNumber]) {
    gateCache.set(gateNumber, gateProtocols[gateNumber]);
    return gateProtocols[gateNumber];
  }
  
  // Return default protocol if not found
  console.warn(`Gate ${gateNumber} protocol not found, using default`);
  const defaultProtocol: GateProtocol = {
    gateNumber,
    name: `Gate ${gateNumber}`,
    hexagram: "☰",
    keywords: ["transformation", "awareness", "growth"],
    inversionProtocols: {
      low: ["Observe this pattern with curiosity and gentleness."],
      medium: ["This challenge invites deeper self-awareness and alignment."],
      high: ["This is a powerful catalyst for transformation. Trust the process."],
    },
    wisdomText: "Every experience is an opportunity for growth and self-discovery.",
  };
  gateCache.set(gateNumber, defaultProtocol);
  return defaultProtocol;
}

/**
 * Load a type protocol
 * @param type - Human Design type
 * @returns Type protocol with strategy and wisdom
 */
export async function getTypeProtocol(type: HumanDesignType): Promise<TypeProtocol> {
  // Check cache
  if (typeCache.has(type)) {
    return typeCache.get(type)!;
  }
  
  // Return default protocol (type-specific files not yet implemented)
  console.warn(`Type ${type} protocol not found, using default`);
  const defaultProtocol: TypeProtocol = {
    type,
    strategy: "Follow your strategy",
    signature: "Success",
    notSelfTheme: "Frustration",
    wisdomText: "Honor your unique design and trust your process.",
  };
  typeCache.set(type, defaultProtocol);
  return defaultProtocol;
}

/**
 * Load a center protocol
 * @param centerName - Name of the center
 * @returns Center protocol with defined/undefined wisdom
 */
export async function getCenterProtocol(centerName: CenterName): Promise<CenterProtocol> {
  // Check cache
  if (centerCache.has(centerName)) {
    return centerCache.get(centerName)!;
  }
  
  // Return default protocol (center-specific files not yet implemented)
  console.warn(`Center ${centerName} protocol not found, using default`);
  const defaultProtocol: CenterProtocol = {
    name: centerName,
    defined: {
      wisdom: "This center is consistent and reliable in you.",
      strengths: ["Consistency", "Reliability"],
      shadows: ["Rigidity", "Stubbornness"],
    },
    undefined: {
      wisdom: "This center is open and receptive in you.",
      openness: ["Flexibility", "Wisdom through experience"],
      conditioning: ["Taking in others' energy", "Amplification"],
    },
  };
  centerCache.set(centerName, defaultProtocol);
  return defaultProtocol;
}

/**
 * Clear all caches (useful for testing or hot reload)
 */
export function clearCache(): void {
  gateCache.clear();
  typeCache.clear();
  centerCache.clear();
}

/**
 * Preload commonly used protocols
 * Call this at application startup to improve performance
 */
export async function preloadProtocols(): Promise<void> {
  // Preload first 10 gates as they're most commonly referenced
  const commonGates = [1, 2, 3, 7, 8, 13, 14, 25, 27, 29];
  await Promise.all(commonGates.map((g) => getGateProtocol(g).catch(() => {})));
  
  console.log("God Engine protocols preloaded");
}
