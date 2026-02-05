/**
 * Resolver Engine
 * Calculates birth charts from birth data
 * 
 * NOTE: This is a simplified implementation. A production version would:
 * - Use astronomical calculations for precise planetary positions
 * - Calculate the 64 gates based on I-Ching/Hexagram positions
 * - Determine channels from gate pairs
 * - Calculate variables (arrows) from advanced data
 */

export interface BirthData {
  date: Date;
  time: string; // HH:MM format
  latitude: number;
  longitude: number;
  timezone: string;
}

export interface Blueprint {
  type: "Generator" | "Projector" | "Manifestor" | "Reflector" | "MG";
  profile: string; // e.g., "1/3", "2/4"
  authority: string;
  definition: string;
  centers: {
    head: boolean;
    ajna: boolean;
    throat: boolean;
    g: boolean;
    sacral: boolean;
    heart: boolean;
    spleen: boolean;
    solar: boolean;
    root: boolean;
  };
  gates: number[];
  channels: number[];
  variables: any;
}

/**
 * Calculate birth chart from birth data
 * 
 * SIMPLIFIED: Returns deterministic mock data based on birth date
 * Production would use actual astronomical calculations
 */
export function calculateBlueprint(birthData: BirthData): Blueprint {
  const { date } = birthData;
  
  // Use birth date to deterministically generate a chart
  const seed = date.getTime();
  const random = seededRandom(seed);
  
  // Determine type based on date pattern
  const types: Blueprint["type"][] = ["Generator", "Projector", "Manifestor", "Reflector", "MG"];
  const type = types[Math.floor(random() * types.length)];
  
  // Generate profile (1-6 lines)
  const line1 = Math.floor(random() * 6) + 1;
  const line2 = Math.floor(random() * 6) + 1;
  const profile = `${line1}/${line2}`;
  
  // Determine authority based on type
  const authority = getAuthority(type, random);
  
  // Generate center definitions
  const centers = generateCenters(type, random);
  
  // Generate gates (sampling from 64 gates)
  const gates = generateGates(centers, random);
  
  // Generate channels (pairs of gates)
  const channels = generateChannels(gates, random);
  
  // Determine definition type
  const definition = getDefinition(channels);
  
  return {
    type,
    profile,
    authority,
    definition,
    centers,
    gates,
    channels,
    variables: {}
  };
}

/**
 * Seeded random number generator for deterministic results
 */
function seededRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 9301 + 49297) % 233280;
    return state / 233280;
  };
}

/**
 * Determine authority based on type and defined centers
 */
function getAuthority(type: Blueprint["type"], random: () => number): string {
  const authorities = {
    Generator: ["Sacral", "Emotional", "Splenic"],
    MG: ["Sacral", "Emotional", "Splenic"],
    Projector: ["Emotional", "Splenic", "Self-Projected", "Mental", "None (Lunar)"],
    Manifestor: ["Emotional", "Splenic", "Ego"],
    Reflector: ["Lunar"]
  };
  
  const options = authorities[type];
  return options[Math.floor(random() * options.length)];
}

/**
 * Generate center definitions
 */
function generateCenters(type: Blueprint["type"], random: () => number) {
  // Generators and MGs always have sacral defined
  const sacral = type === "Generator" || type === "MG";
  
  // Reflectors have all centers undefined
  if (type === "Reflector") {
    return {
      head: false,
      ajna: false,
      throat: false,
      g: false,
      sacral: false,
      heart: false,
      spleen: false,
      solar: false,
      root: false
    };
  }
  
  // Other types have variable definitions
  return {
    head: random() > 0.5,
    ajna: random() > 0.5,
    throat: random() > 0.5,
    g: random() > 0.4, // G center more often defined
    sacral,
    heart: random() > 0.7, // Heart less often defined
    spleen: random() > 0.5,
    solar: random() > 0.5,
    root: random() > 0.5
  };
}

/**
 * Generate activated gates
 */
function generateGates(centers: any, random: () => number): number[] {
  const gates: number[] = [];
  const definedCenters = Object.entries(centers)
    .filter(([_, isDefined]) => isDefined)
    .map(([center]) => center);
  
  // Each defined center gets 2-4 gates
  for (const center of definedCenters) {
    const gateCount = Math.floor(random() * 3) + 2;
    for (let i = 0; i < gateCount; i++) {
      const gate = Math.floor(random() * 64) + 1;
      if (!gates.includes(gate)) {
        gates.push(gate);
      }
    }
  }
  
  return gates.sort((a, b) => a - b);
}

/**
 * Generate channels from gates
 */
function generateChannels(gates: number[], random: () => number): number[] {
  const channels: number[] = [];
  
  // Simplified: Create channels from sequential gate pairs
  for (let i = 0; i < gates.length - 1; i++) {
    if (random() > 0.6) {
      channels.push(gates[i]);
    }
  }
  
  return channels;
}

/**
 * Determine definition type
 */
function getDefinition(channels: number[]): string {
  if (channels.length === 0) return "None";
  if (channels.length <= 2) return "Single";
  if (channels.length <= 4) return "Split";
  return "Triple Split";
}

/**
 * Validate birth data
 */
export function validateBirthData(data: any): { valid: boolean; error?: string } {
  if (!data.date || !(data.date instanceof Date)) {
    return { valid: false, error: "Invalid date" };
  }
  
  if (!data.time || !/^\d{2}:\d{2}$/.test(data.time)) {
    return { valid: false, error: "Invalid time format (use HH:MM)" };
  }
  
  if (typeof data.latitude !== "number" || data.latitude < -90 || data.latitude > 90) {
    return { valid: false, error: "Invalid latitude" };
  }
  
  if (typeof data.longitude !== "number" || data.longitude < -180 || data.longitude > 180) {
    return { valid: false, error: "Invalid longitude" };
  }
  
  if (!data.timezone || typeof data.timezone !== "string") {
    return { valid: false, error: "Invalid timezone" };
  }
  
  return { valid: true };
}
