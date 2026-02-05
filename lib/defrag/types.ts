/**
 * DEFRAG Types - Core type definitions for the Human Design system
 */

// =============================================================================
// SUBSCRIPTION TIERS
// =============================================================================

export type SubscriptionTier = "free" | "basic" | "pro";

export interface TierLimits {
  blueprints: number;
  eventsPerMonth: number;
  experiments: boolean;
  relationships: boolean;
  analytics: boolean;
}

export const TIER_LIMITS: Record<SubscriptionTier, TierLimits> = {
  free: {
    blueprints: 1,
    eventsPerMonth: 5,
    experiments: false,
    relationships: false,
    analytics: false,
  },
  basic: {
    blueprints: 3,
    eventsPerMonth: 10,
    experiments: false,
    relationships: false,
    analytics: true,
  },
  pro: {
    blueprints: 999,
    eventsPerMonth: 999,
    experiments: true,
    relationships: true,
    analytics: true,
  },
};

// =============================================================================
// HUMAN DESIGN CORE TYPES
// =============================================================================

export type HumanDesignType = "Manifestor" | "Generator" | "Manifesting Generator" | "Projector" | "Reflector";

export type Authority = 
  | "Emotional"
  | "Sacral"
  | "Splenic"
  | "Ego Manifested"
  | "Ego Projected"
  | "Self Projected"
  | "Mental"
  | "Lunar";

export type Profile = 
  | "1/3"
  | "1/4"
  | "2/4"
  | "2/5"
  | "3/5"
  | "3/6"
  | "4/6"
  | "4/1"
  | "5/1"
  | "5/2"
  | "6/2"
  | "6/3";

export interface Gate {
  number: number; // 1-64
  name: string;
  hexagram: string;
  keywords: string[];
  description: string;
  activations: {
    personality?: boolean; // Conscious (Black)
    design?: boolean; // Unconscious (Red)
  };
}

export interface Center {
  name: string;
  defined: boolean;
  gates: number[]; // Gate numbers in this center
}

export const CENTERS = [
  "Head",
  "Ajna",
  "Throat",
  "G Center",
  "Heart",
  "Spleen",
  "Solar Plexus",
  "Sacral",
  "Root",
] as const;

export type CenterName = (typeof CENTERS)[number];

export interface Channel {
  gates: [number, number];
  name: string;
  circuitry: string;
}

// =============================================================================
// CHART DATA STRUCTURE
// =============================================================================

export interface ChartData {
  type: HumanDesignType;
  authority: Authority;
  profile: Profile;
  gates: Gate[];
  centers: Center[];
  channels: Channel[];
  definition: "Single" | "Split" | "Triple Split" | "Quadruple Split" | "No Definition";
  incarnationCross: string;
}

// =============================================================================
// BIRTH INFORMATION
// =============================================================================

export interface BirthInfo {
  date: Date;
  time: string; // HH:MM format
  location: string;
  latitude: number;
  longitude: number;
}

// =============================================================================
// VECTOR STATE (PHYSICS ENGINE)
// =============================================================================

export interface VectorState {
  magnitude: number; // 0-100 scale
  direction: string; // Descriptive direction (e.g., "resistance", "flow")
  affectedGates: number[]; // Gates under stress
  timestamp: Date;
}

// =============================================================================
// EVENT PROCESSING
// =============================================================================

export interface EventInput {
  title: string;
  description: string;
  severity: number; // 1-10
  category: string;
  timestamp: Date;
}

export interface ProcessedEvent extends EventInput {
  vectorState: VectorState;
  generatedScript: string;
}

// =============================================================================
// GOD ENGINE PROTOCOL
// =============================================================================

export interface GateProtocol {
  gateNumber: number;
  name: string;
  hexagram: string;
  keywords: string[];
  inversionProtocols: {
    low: string[]; // Protocols for low-severity stress
    medium: string[]; // Protocols for medium-severity stress
    high: string[]; // Protocols for high-severity stress
  };
  wisdomText: string;
}

export interface TypeProtocol {
  type: HumanDesignType;
  strategy: string;
  signature: string;
  notSelfTheme: string;
  wisdomText: string;
}

export interface CenterProtocol {
  name: CenterName;
  defined: {
    wisdom: string;
    strengths: string[];
    shadows: string[];
  };
  undefined: {
    wisdom: string;
    openness: string[];
    conditioning: string[];
  };
}

// =============================================================================
// STRIPE PRICING
// =============================================================================

export const STRIPE_PRICES = {
  basic: {
    monthly: process.env.STRIPE_BASIC_MONTHLY_PRICE_ID || "price_basic_monthly",
    amount: 9.99,
  },
  pro: {
    monthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID || "price_pro_monthly",
    amount: 29.99,
  },
} as const;
