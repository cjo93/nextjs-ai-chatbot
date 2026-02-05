/**
 * DEFRAG God Engine - Type Definitions
 * 
 * Complete type system for the Human Design DEFRAG implementation
 */

// Gate Types
export interface GateFrequency {
  name: string;
  description: string;
  behavioral_signature: string;
  somatic_signature: string;
  thought_pattern: string;
  emotional_state: string;
}

export interface InversionProtocol {
  severity_level: number;
  trigger_context: string[];
  diagnosis: {
    mechanism: string;
    distortion: string;
  };
  script: string;
  somatic_anchor: string;
  experiment: {
    id: string;
    duration_days: number;
    hypothesis: string;
    action: string;
    success_criteria: {
      metric: string;
      target: string;
      duration: string;
    };
  };
}

export interface Gate {
  id: number;
  label: string;
  i_ching_name: string;
  frequencies: {
    shadow: GateFrequency;
    gift: GateFrequency;
    siddhi: GateFrequency;
  };
  circuit: "Individual" | "Collective" | "Tribal";
  center: CenterName;
  inversion_protocols: InversionProtocol[];
}

// Type Types
export type HumanDesignType = 
  | "Generator" 
  | "Projector" 
  | "Manifestor" 
  | "Reflector" 
  | "Manifesting Generator";

export interface TypeDefinition {
  type: HumanDesignType;
  percentage_of_population: number;
  physics: {
    aura_type: string;
    aura_range: string;
    defined_centers: string[];
    motor: string;
    energy_mechanics: string;
  };
  strategy: {
    name: string;
    description: string;
    mechanics: string;
    examples?: string[];
  };
  signature: {
    name: string;
    description: string;
  };
  not_self_theme: {
    name: string;
    description: string;
    causes: string[];
  };
  failure_states: Array<{
    pattern: string;
    diagnosis: string;
    correction: string;
    experiment: string;
  }>;
  authority_types: string[];
  relationships: Record<string, {
    dynamics: string;
    friction_points: string;
    harmony_keys: string;
  }>;
  career_alignment: {
    ideal_work: string;
    signs_of_right_work: string[];
    signs_of_wrong_work: string[];
  };
  rest_requirements: {
    sleep: string;
    work_rhythm?: string;
    burnout_prevention?: string;
    restoration: string;
  };
  communication_style: {
    speaking: string;
    listening: string;
    decision_making: string;
  };
  conflict_resolution: {
    pattern: string;
    healthy_approach: string;
    unhealthy_pattern: string;
  };
  core_wound: {
    description: string;
    conditioning: string;
    healing: string;
  };
  healing_modality: {
    primary: string;
    practices: string[];
  };
  spiritual_pathway: {
    essence: string;
    evolution: string;
    transcendence: string;
  };
}

// Center Types
export type CenterName = 
  | "HEAD" 
  | "AJNA" 
  | "THROAT" 
  | "G_CENTER" 
  | "HEART" 
  | "SOLAR_PLEXUS" 
  | "SACRAL" 
  | "SPLEEN" 
  | "ROOT";

export interface CenterDefinition {
  name: string;
  display_name: string;
  function: string;
  neural_correlate: string;
  location: string;
  pressure_type: string;
  gates: number[];
  defined_mechanics: {
    description: string;
    traits: string[];
    challenges: string[];
  };
  open_mechanics: {
    description: string;
    traits: string[];
    challenges: string[];
    conditioning: string;
  };
  somatic_scan_instructions: string;
  regulation_techniques: string[];
  neuroception: {
    safety_signals: string;
    threat_signals: string;
  };
}

// God Engine Loader Functions
export async function loadGate(gateId: number): Promise<Gate> {
  const gateNumber = String(gateId).padStart(3, '0');
  const module = await import(`./gates/gate-${gateNumber}.json`);
  return module.default || module;
}

export async function loadType(type: string): Promise<TypeDefinition> {
  const typeName = type.toLowerCase().replace(/\s+/g, '-');
  const module = await import(`./types/${typeName}.json`);
  return module.default || module;
}

export async function loadCenter(centerName: string): Promise<CenterDefinition> {
  const name = centerName.toLowerCase().replace(/_/g, '-');
  const module = await import(`./centers/${name}.json`);
  return module.default || module;
}

export async function loadAllGates(): Promise<Gate[]> {
  const gates: Gate[] = [];
  for (let i = 1; i <= 64; i++) {
    gates.push(await loadGate(i));
  }
  return gates;
}

export const ALL_TYPES: HumanDesignType[] = [
  "Generator",
  "Projector", 
  "Manifestor",
  "Reflector",
  "Manifesting Generator"
];

export const ALL_CENTERS: CenterName[] = [
  "HEAD",
  "AJNA",
  "THROAT",
  "G_CENTER",
  "HEART",
  "SOLAR_PLEXUS",
  "SACRAL",
  "SPLEEN",
  "ROOT"
];

/**
 * God Engine Query Interface
 * 
 * Main interface for querying the God Engine data
 */
export class GodEngine {
  private gateCache: Map<number, Gate> = new Map();
  private typeCache: Map<string, TypeDefinition> = new Map();
  private centerCache: Map<string, CenterDefinition> = new Map();

  async getGate(gateId: number): Promise<Gate> {
    if (!this.gateCache.has(gateId)) {
      const gate = await loadGate(gateId);
      this.gateCache.set(gateId, gate);
    }
    return this.gateCache.get(gateId)!;
  }

  async getType(type: HumanDesignType): Promise<TypeDefinition> {
    if (!this.typeCache.has(type)) {
      const typeDef = await loadType(type);
      this.typeCache.set(type, typeDef);
    }
    return this.typeCache.get(type)!;
  }

  async getCenter(centerName: CenterName): Promise<CenterDefinition> {
    if (!this.centerCache.has(centerName)) {
      const center = await loadCenter(centerName);
      this.centerCache.set(centerName, center);
    }
    return this.centerCache.get(centerName)!;
  }

  async getGatesByCenter(centerName: CenterName): Promise<Gate[]> {
    const center = await this.getCenter(centerName);
    const gates = await Promise.all(
      center.gates.map(gateId => this.getGate(gateId))
    );
    return gates;
  }

  async getInversionProtocol(
    gateId: number,
    severityLevel: number
  ): Promise<InversionProtocol | undefined> {
    const gate = await this.getGate(gateId);
    return gate.inversion_protocols.find(
      protocol => protocol.severity_level === severityLevel
    );
  }
}

// Singleton instance
export const godEngine = new GodEngine();
