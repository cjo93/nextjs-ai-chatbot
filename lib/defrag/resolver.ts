/**
 * Birth Chart Resolver
 * Calculates Human Design chart data from birth information
 */

/**
 * Birth data required for chart calculation
 */
export interface BirthData {
  date: Date;
  latitude: number;
  longitude: number;
  timezone: string;
}

/**
 * Planetary position in degrees
 */
interface PlanetaryPosition {
  longitude: number; // 0-360 degrees
  sign: string;
  gate: number; // 1-64
  line: number; // 1-6
}

/**
 * Complete ephemeris data for a moment in time
 */
export interface Ephemeris {
  sun: PlanetaryPosition;
  earth: PlanetaryPosition;
  moon: PlanetaryPosition;
  northNode: PlanetaryPosition;
  southNode: PlanetaryPosition;
  mercury: PlanetaryPosition;
  venus: PlanetaryPosition;
  mars: PlanetaryPosition;
  jupiter: PlanetaryPosition;
  saturn: PlanetaryPosition;
  uranus: PlanetaryPosition;
  neptune: PlanetaryPosition;
  pluto: PlanetaryPosition;
}

/**
 * Center definition states
 */
export type CenterDefinition = "defined" | "undefined" | "open";

/**
 * Human Design chart structure
 */
export interface HumanDesignChart {
  type: "Manifestor" | "Generator" | "Manifesting Generator" | "Projector" | "Reflector";
  profile: string; // e.g., "3/5", "6/2"
  authority: string;
  strategy: string;
  centers: {
    head: CenterDefinition;
    ajna: CenterDefinition;
    throat: CenterDefinition;
    g: CenterDefinition;
    heart: CenterDefinition;
    sacral: CenterDefinition;
    solarPlexus: CenterDefinition;
    spleen: CenterDefinition;
    root: CenterDefinition;
  };
  gates: number[]; // Activated gates
  channels: string[]; // Activated channels
  incarnationCross: string;
}

/**
 * Gene Keys data structure
 */
export interface GeneKeysData {
  lifesWork: { gate: number; line: number };
  evolution: { gate: number; line: number };
  radiance: { gate: number; line: number };
  purpose: { gate: number; line: number };
}

/**
 * Mapping of degrees to Human Design gates (simplified)
 * In production, this would use precise astronomical calculations
 */
const DEGREE_TO_GATE: number[] = [
  41, 19, 13, 49, 30, 55, 37, 63, 22, 36, 25, 17, 21, 51, 42, 3, 27, 24, 2, 23,
  8, 20, 16, 35, 45, 12, 15, 52, 39, 53, 62, 56, 31, 33, 7, 4, 29, 59, 40, 64,
  47, 6, 46, 18, 48, 57, 32, 50, 28, 44, 1, 43, 14, 34, 9, 5, 26, 11, 10, 58,
  38, 54, 61, 60,
];

/**
 * Converts astronomical longitude to Human Design gate and line
 */
function longitudeToGateLine(longitude: number): { gate: number; line: number } {
  // Each gate covers approximately 5.625 degrees (360 / 64)
  const gateIndex = Math.floor(longitude / 5.625);
  const gate = DEGREE_TO_GATE[gateIndex % 64];

  // Each line covers approximately 0.9375 degrees (5.625 / 6)
  const linePosition = (longitude % 5.625) / 0.9375;
  const line = Math.floor(linePosition) + 1;

  return { gate, line: Math.min(line, 6) };
}

/**
 * Simplified ephemeris calculation
 * In production, this would use Swiss Ephemeris or similar astronomical library
 */
function calculateEphemeris(birthData: BirthData): Ephemeris {
  // This is a simplified placeholder calculation
  // Real implementation would use precise astronomical calculations
  const baseDate = birthData.date.getTime();
  const daysSinceEpoch = baseDate / (1000 * 60 * 60 * 24);

  // Simplified planetary positions (placeholder)
  const sunLongitude = ((daysSinceEpoch * 0.9856) % 360) + birthData.longitude * 0.01;
  const moonLongitude = ((daysSinceEpoch * 13.176) % 360) + birthData.longitude * 0.02;

  return {
    sun: {
      longitude: sunLongitude % 360,
      sign: getZodiacSign(sunLongitude % 360),
      ...longitudeToGateLine(sunLongitude % 360),
    },
    earth: {
      longitude: (sunLongitude + 180) % 360,
      sign: getZodiacSign((sunLongitude + 180) % 360),
      ...longitudeToGateLine((sunLongitude + 180) % 360),
    },
    moon: {
      longitude: moonLongitude % 360,
      sign: getZodiacSign(moonLongitude % 360),
      ...longitudeToGateLine(moonLongitude % 360),
    },
    northNode: {
      longitude: ((daysSinceEpoch * -0.0529) % 360 + 360) % 360,
      sign: getZodiacSign(((daysSinceEpoch * -0.0529) % 360 + 360) % 360),
      ...longitudeToGateLine(((daysSinceEpoch * -0.0529) % 360 + 360) % 360),
    },
    southNode: {
      longitude: ((daysSinceEpoch * -0.0529 + 180) % 360 + 360) % 360,
      sign: getZodiacSign(((daysSinceEpoch * -0.0529 + 180) % 360 + 360) % 360),
      ...longitudeToGateLine(((daysSinceEpoch * -0.0529 + 180) % 360 + 360) % 360),
    },
    mercury: {
      longitude: ((sunLongitude + 15) % 360),
      sign: getZodiacSign((sunLongitude + 15) % 360),
      ...longitudeToGateLine((sunLongitude + 15) % 360),
    },
    venus: {
      longitude: ((sunLongitude + 30) % 360),
      sign: getZodiacSign((sunLongitude + 30) % 360),
      ...longitudeToGateLine((sunLongitude + 30) % 360),
    },
    mars: {
      longitude: ((sunLongitude + 45) % 360),
      sign: getZodiacSign((sunLongitude + 45) % 360),
      ...longitudeToGateLine((sunLongitude + 45) % 360),
    },
    jupiter: {
      longitude: ((sunLongitude + 60) % 360),
      sign: getZodiacSign((sunLongitude + 60) % 360),
      ...longitudeToGateLine((sunLongitude + 60) % 360),
    },
    saturn: {
      longitude: ((sunLongitude + 75) % 360),
      sign: getZodiacSign((sunLongitude + 75) % 360),
      ...longitudeToGateLine((sunLongitude + 75) % 360),
    },
    uranus: {
      longitude: ((sunLongitude + 90) % 360),
      sign: getZodiacSign((sunLongitude + 90) % 360),
      ...longitudeToGateLine((sunLongitude + 90) % 360),
    },
    neptune: {
      longitude: ((sunLongitude + 105) % 360),
      sign: getZodiacSign((sunLongitude + 105) % 360),
      ...longitudeToGateLine((sunLongitude + 105) % 360),
    },
    pluto: {
      longitude: ((sunLongitude + 120) % 360),
      sign: getZodiacSign((sunLongitude + 120) % 360),
      ...longitudeToGateLine((sunLongitude + 120) % 360),
    },
  };
}

/**
 * Gets zodiac sign from longitude
 */
function getZodiacSign(longitude: number): string {
  const signs = [
    "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
    "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
  ];
  return signs[Math.floor(longitude / 30)];
}

/**
 * Determines Human Design type from sacral and throat definitions
 */
function determineType(gates: number[]): HumanDesignChart["type"] {
  const sacralGates = [5, 14, 29, 59, 9, 3, 42, 27, 34];
  const throatGates = [62, 23, 56, 35, 12, 45, 33, 8, 31, 20, 16];

  const hasSacral = gates.some((g) => sacralGates.includes(g));
  const hasThroat = gates.some((g) => throatGates.includes(g));

  if (!hasSacral && hasThroat) return "Manifestor";
  if (hasSacral && hasThroat) return "Manifesting Generator";
  if (hasSacral) return "Generator";
  if (gates.length < 5) return "Reflector";
  return "Projector";
}

/**
 * Main function to resolve a complete birth chart
 */
export async function resolveChart(birthData: BirthData): Promise<{
  humanDesign: HumanDesignChart;
  geneKeys: GeneKeysData;
  ephemeris: Ephemeris;
  fidelityScore: "HIGH" | "MEDIUM" | "LOW";
  missingData: string[];
}> {
  const ephemeris = calculateEphemeris(birthData);

  // Extract activated gates
  const gates = [
    ephemeris.sun.gate,
    ephemeris.earth.gate,
    ephemeris.moon.gate,
    ephemeris.northNode.gate,
    ephemeris.mercury.gate,
    ephemeris.venus.gate,
    ephemeris.mars.gate,
  ];

  const type = determineType(gates);

  const humanDesign: HumanDesignChart = {
    type,
    profile: `${ephemeris.sun.line}/${ephemeris.earth.line}`,
    authority: type === "Generator" || type === "Manifesting Generator" ? "Sacral" : "Emotional",
    strategy: type === "Generator" || type === "Manifesting Generator" ? "Wait to Respond" : "Wait for Invitation",
    centers: {
      head: gates.some(g => [61, 63, 64].includes(g)) ? "defined" : "undefined",
      ajna: gates.some(g => [47, 24, 4, 17, 43, 11].includes(g)) ? "defined" : "undefined",
      throat: gates.some(g => [62, 23, 56, 35, 12, 45, 33, 8, 31, 20, 16].includes(g)) ? "defined" : "undefined",
      g: gates.some(g => [7, 1, 13, 10, 25, 46, 2, 15].includes(g)) ? "defined" : "undefined",
      heart: gates.some(g => [21, 40, 26, 51].includes(g)) ? "defined" : "undefined",
      sacral: gates.some(g => [5, 14, 29, 59, 9, 3, 42, 27, 34].includes(g)) ? "defined" : "undefined",
      solarPlexus: gates.some(g => [6, 37, 22, 36, 30, 55, 49].includes(g)) ? "defined" : "undefined",
      spleen: gates.some(g => [48, 57, 44, 50, 32, 28, 18].includes(g)) ? "defined" : "undefined",
      root: gates.some(g => [53, 60, 52, 19, 39, 41, 58, 38, 54].includes(g)) ? "defined" : "undefined",
    },
    gates: [...new Set(gates)],
    channels: [],
    incarnationCross: `Right Angle Cross of ${ephemeris.sun.gate}/${ephemeris.earth.gate}`,
  };

  const geneKeys: GeneKeysData = {
    lifesWork: { gate: ephemeris.sun.gate, line: ephemeris.sun.line },
    evolution: { gate: ephemeris.earth.gate, line: ephemeris.earth.line },
    radiance: { gate: ephemeris.venus.gate, line: ephemeris.venus.line },
    purpose: { gate: ephemeris.northNode.gate, line: ephemeris.northNode.line },
  };

  return {
    humanDesign,
    geneKeys,
    ephemeris,
    fidelityScore: "MEDIUM",
    missingData: ["Precise birth time would improve accuracy"],
  };
}
