/**
 * God Engine Loader
 * Loads and caches Human Design protocol data
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

const GOD_ENGINE_PATH = join(process.cwd(), "lib/defrag/god-engine");

// Cache for loaded data
const cache = new Map<string, any>();

/**
 * Load a gate protocol by number
 */
export function loadGate(gateNumber: number): any {
  const cacheKey = `gate-${gateNumber}`;
  
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  try {
    const filePath = join(GOD_ENGINE_PATH, "gates", `gate-${gateNumber}.json`);
    const data = JSON.parse(readFileSync(filePath, "utf-8"));
    cache.set(cacheKey, data);
    return data;
  } catch (error) {
    console.warn(`Gate ${gateNumber} not found, using default protocol`);
    return getDefaultGateProtocol(gateNumber);
  }
}

/**
 * Load a type protocol
 */
export function loadType(type: string): any {
  const cacheKey = `type-${type.toLowerCase()}`;
  
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  try {
    const filePath = join(GOD_ENGINE_PATH, "types", `${type.toLowerCase()}.json`);
    const data = JSON.parse(readFileSync(filePath, "utf-8"));
    cache.set(cacheKey, data);
    return data;
  } catch (error) {
    console.warn(`Type ${type} not found, using default protocol`);
    return getDefaultTypeProtocol(type);
  }
}

/**
 * Load a center protocol
 */
export function loadCenter(center: string): any {
  const cacheKey = `center-${center.toLowerCase()}`;
  
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  try {
    const filePath = join(GOD_ENGINE_PATH, "centers", `${center.toLowerCase()}.json`);
    const data = JSON.parse(readFileSync(filePath, "utf-8"));
    cache.set(cacheKey, data);
    return data;
  } catch (error) {
    console.warn(`Center ${center} not found, using default protocol`);
    return getDefaultCenterProtocol(center);
  }
}

/**
 * Get protocol for activated gates
 */
export function getGateProtocols(gates: number[]): any[] {
  return gates.map((gateNumber) => loadGate(gateNumber));
}

/**
 * Default gate protocol when specific gate data not available
 */
function getDefaultGateProtocol(gateNumber: number) {
  return {
    gateNumber,
    name: `Gate ${gateNumber}`,
    center: "Unknown",
    keynote: "Default Protocol",
    description: `Gate ${gateNumber} protocol (default)`,
    protocol: {
      when_activated: {
        strength: "Active energy in this area",
        guidance: "Trust your natural expression",
        warning: "Avoid forcing or over-emphasizing"
      },
      when_undefined: {
        challenge: "Variable energy in this area",
        guidance: "Stay open and flexible",
        opportunity: "Learn from experiencing variety"
      }
    },
    stress_response: {
      type: "general_stress",
      severity_multiplier: 1.0,
      recommended_action: "Return to your Strategy and Authority"
    }
  };
}

/**
 * Default type protocol
 */
function getDefaultTypeProtocol(type: string) {
  return {
    type,
    description: `${type} type protocol (default)`,
    strategy: "Follow your Strategy",
    signature: "Alignment",
    not_self_theme: "Resistance",
    protocol: {
      decision_making: "Use your Authority",
      energy_management: "Honor your design",
      stress_indicators: ["Misalignment with strategy"],
      optimal_approach: {
        work: "Follow correct strategy",
        relationships: "Honor your Authority",
        decisions: "Trust your design"
      }
    },
    stress_mapping: {
      frustration_threshold: 0.7,
      exhaustion_multiplier: 1.0,
      recovery_protocol: "Return to Strategy and Authority"
    }
  };
}

/**
 * Default center protocol
 */
function getDefaultCenterProtocol(center: string) {
  return {
    center,
    name: `${center} Center`,
    function: "Energy processing",
    description: `${center} center protocol (default)`,
    when_defined: {
      characteristic: "Fixed energy",
      strength: "Consistent expression",
      challenge: "Can be rigid",
      guidance: "Trust your definition"
    },
    when_undefined: {
      characteristic: "Variable energy",
      strength: "Flexibility and wisdom",
      challenge: "Can be influenced",
      not_self: "Trying to be defined",
      guidance: "Embrace openness"
    },
    stress_protocol: {
      defined: "Honor your consistency",
      undefined: "Release what's not yours"
    }
  };
}

/**
 * Clear the cache (useful for testing)
 */
export function clearCache() {
  cache.clear();
}
