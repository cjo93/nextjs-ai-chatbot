/**
 * DEFRAG Blueprint Resolver
 * Calculates Human Design chart from birth data
 */

export interface BirthData {
  date: Date;
  latitude: number;
  longitude: number;
  timezone: string;
}

export interface HumanDesignChart {
  type: "Generator" | "Projector" | "Manifestor" | "Reflector" | "Manifesting Generator";
  strategy: string;
  authority: string;
  profile: string;
  definition: "single" | "split" | "triple" | "quadruple" | "none";
  incarnationCross: string;
  centers: {
    head: { defined: boolean; gates: number[] };
    ajna: { defined: boolean; gates: number[] };
    throat: { defined: boolean; gates: number[] };
    g: { defined: boolean; gates: number[] };
    heart: { defined: boolean; gates: number[] };
    solarPlexus: { defined: boolean; gates: number[] };
    sacral: { defined: boolean; gates: number[] };
    spleen: { defined: boolean; gates: number[] };
    root: { defined: boolean; gates: number[] };
  };
  channels: Array<{ gate1: number; gate2: number; name: string }>;
  gates: Array<{
    number: number;
    line: number;
    activation: "personality" | "design";
    planet: string;
  }>;
}

/**
 * Simplified planetary position calculator
 * In production, use swiss-ephemeris or astronomy-engine
 */
function calculatePlanetaryPositions(date: Date): Record<string, number> {
  // This is a simplified approximation
  // Real implementation would use proper ephemeris calculations
  const daysSinceEpoch = date.getTime() / (1000 * 60 * 60 * 24);
  const J2000 = 10957.5; // Jan 1, 2000 in days since epoch
  const T = (daysSinceEpoch - J2000) / 36525; // centuries since J2000

  // Simplified mean longitudes (these are approximations)
  const sun = (280.46 + 36000.77 * T) % 360;
  const moon = (218.32 + 481267.88 * T) % 360;
  const mercury = (252.25 + 149472.67 * T) % 360;
  const venus = (181.98 + 58517.81 * T) % 360;
  const mars = (355.43 + 19140.30 * T) % 360;
  const jupiter = (34.35 + 3034.91 * T) % 360;
  const saturn = (50.08 + 1222.11 * T) % 360;
  const uranus = (314.05 + 428.47 * T) % 360;
  const neptune = (304.35 + 218.46 * T) % 360;
  const pluto = (238.93 + 145.18 * T) % 360;
  const northNode = (125.04 - 1934.14 * T) % 360;
  const southNode = (northNode + 180) % 360;

  return {
    sun,
    moon,
    mercury,
    venus,
    mars,
    jupiter,
    saturn,
    uranus,
    neptune,
    pluto,
    northNode,
    southNode,
    earth: (sun + 180) % 360,
  };
}

/**
 * Convert zodiac degree to I-Ching gate
 */
function degreeToGate(degree: number): { gate: number; line: number } {
  // 64 gates distributed across 360 degrees
  const gateSize = 360 / 64; // ~5.625 degrees per gate
  const lineSize = gateSize / 6; // ~0.9375 degrees per line

  const gateMap = [
    41, 19, 13, 49, 30, 55, 37, 63, 22, 36, 25, 17, 21, 51, 42, 3,
    27, 24, 2, 23, 8, 20, 16, 35, 45, 12, 15, 52, 39, 53, 62, 56,
    31, 33, 7, 4, 29, 59, 40, 64, 47, 6, 46, 18, 48, 57, 32, 50,
    28, 44, 1, 43, 14, 34, 9, 5, 26, 11, 10, 58, 38, 54, 61, 60,
  ];

  const index = Math.floor(degree / gateSize) % 64;
  const gate = gateMap[index];
  const linePosition = (degree % gateSize) / lineSize;
  const line = Math.floor(linePosition) + 1;

  return { gate, line: Math.min(line, 6) };
}

/**
 * Calculate blueprint from birth data
 */
export async function calculateBlueprint(
  birthData: BirthData
): Promise<HumanDesignChart> {
  try {
    // Calculate personality (conscious) - at birth time
    const personalityPositions = calculatePlanetaryPositions(birthData.date);

    // Calculate design (unconscious) - 88 degrees of sun movement before birth (~3 months)
    const designDate = new Date(birthData.date);
    designDate.setDate(designDate.getDate() - 88); // Approximate
    const designPositions = calculatePlanetaryPositions(designDate);

    // Get gates from planetary positions
    const personalityGates = Object.entries(personalityPositions).map(
      ([planet, degree]) => ({
        ...degreeToGate(degree),
        planet,
        activation: "personality" as const,
      })
    );

    const designGates = Object.entries(designPositions).map(
      ([planet, degree]) => ({
        ...degreeToGate(degree),
        planet,
        activation: "design" as const,
      })
    );

    const allGates = [...personalityGates, ...designGates];

    // Determine defined centers based on gates
    const definedGates = new Set(allGates.map((g) => g.gate));
    const centers = determineCenters(definedGates);

    // Determine type based on defined centers
    const type = determineType(centers);

    // Determine authority
    const authority = determineAuthority(centers, type);

    // Determine profile from sun/earth gates
    const sunPersonality = personalityGates.find((g) => g.planet === "sun");
    const earthDesign = designGates.find((g) => g.planet === "earth");
    const profile = `${sunPersonality?.line || 1}/${earthDesign?.line || 3}`;

    // Determine channels (simplified - checks for gate pairs)
    const channels = determineChannels(definedGates);

    return {
      type,
      strategy: getStrategy(type),
      authority,
      profile,
      definition: determineDefinition(channels),
      incarnationCross: "Right Angle Cross", // Simplified
      centers,
      channels,
      gates: allGates.map((g) => ({
        number: g.gate,
        line: g.line,
        activation: g.activation,
        planet: g.planet,
      })),
    };
  } catch (error) {
    console.error("Error calculating blueprint:", error);
    throw new Error("Failed to calculate blueprint");
  }
}

function determineCenters(
  gates: Set<number>
): HumanDesignChart["centers"] {
  // Gate-to-center mapping
  const centerGates = {
    head: [64, 61, 63],
    ajna: [47, 24, 4, 17, 43, 11],
    throat: [62, 23, 56, 35, 12, 45, 33, 8, 31, 20, 16],
    g: [7, 1, 13, 10, 25, 15, 2, 46],
    heart: [21, 40, 26, 51],
    solarPlexus: [36, 22, 37, 6, 49, 55, 30],
    sacral: [5, 14, 29, 59, 9, 3, 42, 27, 34],
    spleen: [48, 57, 44, 50, 32, 28, 18],
    root: [53, 60, 52, 19, 39, 41, 58, 38, 54],
  };

  const centers: HumanDesignChart["centers"] = {
    head: { defined: false, gates: [] },
    ajna: { defined: false, gates: [] },
    throat: { defined: false, gates: [] },
    g: { defined: false, gates: [] },
    heart: { defined: false, gates: [] },
    solarPlexus: { defined: false, gates: [] },
    sacral: { defined: false, gates: [] },
    spleen: { defined: false, gates: [] },
    root: { defined: false, gates: [] },
  };

  for (const [center, centerGateList] of Object.entries(centerGates)) {
    const activatedGates = centerGateList.filter((g) => gates.has(g));
    if (activatedGates.length > 0) {
      centers[center as keyof typeof centers] = {
        defined: activatedGates.length >= 1, // Simplified: at least 1 gate
        gates: activatedGates,
      };
    }
  }

  return centers;
}

function determineType(
  centers: HumanDesignChart["centers"]
): HumanDesignChart["type"] {
  const sacralDefined = centers.sacral.defined;
  const throatDefined = centers.throat.defined;
  const heartDefined = centers.heart.defined;

  if (sacralDefined && throatDefined && heartDefined) {
    return "Manifesting Generator";
  }
  if (sacralDefined) {
    return "Generator";
  }
  if (!sacralDefined && heartDefined && throatDefined) {
    return "Manifestor";
  }
  if (
    !sacralDefined &&
    !centers.head.defined &&
    !centers.ajna.defined &&
    !centers.throat.defined &&
    !centers.g.defined &&
    !centers.heart.defined &&
    !centers.solarPlexus.defined &&
    !centers.spleen.defined &&
    !centers.root.defined
  ) {
    return "Reflector";
  }
  return "Projector";
}

function determineAuthority(
  centers: HumanDesignChart["centers"],
  type: HumanDesignChart["type"]
): string {
  if (centers.solarPlexus.defined) return "Emotional Authority";
  if (centers.sacral.defined && type !== "Projector")
    return "Sacral Authority";
  if (centers.spleen.defined) return "Splenic Authority";
  if (centers.heart.defined) return "Ego Authority";
  if (centers.g.defined) return "Self-Projected Authority";
  if (type === "Reflector") return "Lunar Authority";
  return "Mental Authority";
}

function getStrategy(type: HumanDesignChart["type"]): string {
  const strategies = {
    Generator: "To Respond",
    "Manifesting Generator": "To Respond",
    Manifestor: "To Inform",
    Projector: "To Wait for Invitation",
    Reflector: "To Wait a Lunar Cycle",
  };
  return strategies[type];
}

function determineChannels(
  gates: Set<number>
): Array<{ gate1: number; gate2: number; name: string }> {
  // Channel definitions (gate pairs)
  const channelDefs = [
    { gate1: 1, gate2: 8, name: "Inspiration" },
    { gate1: 2, gate2: 14, name: "The Beat" },
    { gate1: 3, gate2: 60, name: "Mutation" },
    { gate1: 4, gate2: 63, name: "Logic" },
    { gate1: 5, gate2: 15, name: "Rhythm" },
    { gate1: 6, gate2: 59, name: "Mating" },
    { gate1: 7, gate2: 31, name: "The Alpha" },
    { gate1: 9, gate2: 52, name: "Concentration" },
    { gate1: 10, gate2: 20, name: "Awakening" },
    { gate1: 10, gate2: 34, name: "Exploration" },
    // Add more channels as needed
  ];

  return channelDefs.filter(
    (ch) => gates.has(ch.gate1) && gates.has(ch.gate2)
  );
}

function determineDefinition(
  channels: Array<{ gate1: number; gate2: number; name: string }>
): "single" | "split" | "triple" | "quadruple" | "none" {
  if (channels.length === 0) return "none";
  if (channels.length <= 2) return "single";
  if (channels.length <= 4) return "split";
  if (channels.length <= 6) return "triple";
  return "quadruple";
}
