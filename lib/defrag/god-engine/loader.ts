import fs from "node:fs/promises";
import path from "node:path";

/**
 * Structure of a gate's inversion protocol for different severity levels
 */
interface InversionProtocol {
  trigger: string;
  script: string;
  experiments: string[];
}

/**
 * Complete gate data structure from JSON files
 */
export interface GateData {
  gateNumber: number;
  name: string;
  hexagram: string;
  description: string;
  keywords: string[];
  center: string;
  quarter: number;
  theme: string;
  channel: {
    number: string;
    name: string;
    description: string;
  };
  geneKeys: {
    shadowFrequency: string;
    giftFrequency: string;
    siddhiFrequency: string;
  };
  inversionProtocols: {
    signal?: InversionProtocol;
    friction?: InversionProtocol;
    breakpoint?: InversionProtocol;
  };
}

/**
 * In-memory cache of loaded gate data
 */
let gateCache: Map<number, GateData> | null = null;

/**
 * Loads all gate JSON files and caches them in memory
 */
async function loadAllGates(): Promise<Map<number, GateData>> {
  const gatesDir = path.join(process.cwd(), "lib/defrag/god-engine/gates");
  const gateMap = new Map<number, GateData>();

  try {
    const files = await fs.readdir(gatesDir);
    const gateFiles = files.filter((f) => f.startsWith("gate-") && f.endsWith(".json"));

    for (const file of gateFiles) {
      const filePath = path.join(gatesDir, file);
      const content = await fs.readFile(filePath, "utf-8");
      const gateData: GateData = JSON.parse(content);
      gateMap.set(gateData.gateNumber, gateData);
    }

    console.log(`Loaded ${gateMap.size} gates into cache`);
    return gateMap;
  } catch (error) {
    console.error("Error loading gate files:", error);
    throw new Error("Failed to load gate data");
  }
}

/**
 * Gets gate data by number, loading cache if needed
 */
export async function getGate(gateNumber: number): Promise<GateData | null> {
  if (!gateCache) {
    gateCache = await loadAllGates();
  }

  return gateCache.get(gateNumber) || null;
}

/**
 * Gets multiple gates by numbers
 */
export async function getGates(gateNumbers: number[]): Promise<GateData[]> {
  if (!gateCache) {
    gateCache = await loadAllGates();
  }

  return gateNumbers
    .map((num) => gateCache?.get(num))
    .filter((gate): gate is GateData => gate !== null);
}

/**
 * Gets all loaded gates
 */
export async function getAllGates(): Promise<GateData[]> {
  if (!gateCache) {
    gateCache = await loadAllGates();
  }

  return Array.from(gateCache.values());
}

/**
 * Gets inversion protocol for a specific gate and severity level
 */
export async function getInversionProtocol(
  gateNumber: number,
  severity: "signal" | "friction" | "breakpoint" | "distortion" | "anomaly"
): Promise<InversionProtocol | null> {
  const gate = await getGate(gateNumber);

  if (!gate) return null;

  // Map higher severities to available protocols
  const severityMap: Record<typeof severity, keyof typeof gate.inversionProtocols> = {
    signal: "signal",
    friction: "friction",
    breakpoint: "breakpoint",
    distortion: "breakpoint", // Use breakpoint protocol for distortion
    anomaly: "breakpoint", // Use breakpoint protocol for anomaly
  };

  const protocolKey = severityMap[severity];
  return gate.inversionProtocols[protocolKey] || null;
}

/**
 * Searches gates by keyword
 */
export async function searchGatesByKeyword(keyword: string): Promise<GateData[]> {
  const allGates = await getAllGates();
  const searchTerm = keyword.toLowerCase();

  return allGates.filter(
    (gate) =>
      gate.keywords.some((kw) => kw.toLowerCase().includes(searchTerm)) ||
      gate.name.toLowerCase().includes(searchTerm) ||
      gate.description.toLowerCase().includes(searchTerm)
  );
}

/**
 * Clears the gate cache (useful for testing or hot reloading)
 */
export function clearGateCache(): void {
  gateCache = null;
}
