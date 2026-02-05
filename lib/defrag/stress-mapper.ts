/**
 * Stress Mapper
 * Converts user-reported events into force vectors that affect vector state
 */

import type { ForceVector } from "./physics";

/**
 * Severity levels for events
 */
export type SeverityLevel = "signal" | "friction" | "breakpoint" | "distortion" | "anomaly";

/**
 * Event context provided by user
 */
export interface EventContext {
  description: string;
  severity: SeverityLevel;
  severityNumeric: number; // 1-10
  keywords?: string[];
  domains?: ("work" | "relationships" | "health" | "finance" | "identity")[];
}

/**
 * Diagnosed event with force vector
 */
export interface DiagnosedEvent {
  forceVector: ForceVector;
  affectedDimensions: {
    resilience: boolean;
    autonomy: boolean;
    connectivity: boolean;
  };
  diagnosis: {
    primaryStressor: string;
    secondaryFactors: string[];
    recommendation: string;
  };
}

/**
 * Maps severity level to numeric value
 */
export function severityToNumeric(severity: SeverityLevel): number {
  const map: Record<SeverityLevel, number> = {
    signal: 2,
    friction: 4,
    breakpoint: 6,
    distortion: 8,
    anomaly: 10,
  };
  return map[severity];
}

/**
 * Maps numeric severity to level
 */
export function numericToSeverity(numeric: number): SeverityLevel {
  if (numeric <= 2) return "signal";
  if (numeric <= 4) return "friction";
  if (numeric <= 6) return "breakpoint";
  if (numeric <= 8) return "distortion";
  return "anomaly";
}

/**
 * Analyzes event context to determine which dimensions are affected
 */
function analyzeDimensionalImpact(context: EventContext): {
  resilience: number;
  autonomy: number;
  connectivity: number;
} {
  const { description, keywords = [], domains = [] } = context;

  const text = (description + " " + keywords.join(" ")).toLowerCase();

  // Keywords that indicate impact on each dimension
  const resilienceKeywords = [
    "exhausted", "tired", "overwhelmed", "burnout", "sick", "pain",
    "health", "energy", "stamina", "stress", "pressure", "deadline",
  ];

  const autonomyKeywords = [
    "control", "choice", "freedom", "decision", "independence", "trapped",
    "stuck", "forced", "obligated", "dependent", "powerless", "agency",
  ];

  const connectivityKeywords = [
    "relationship", "partner", "friend", "family", "team", "lonely",
    "isolated", "conflict", "disconnected", "misunderstood", "rejected",
    "community", "belonging", "intimacy",
  ];

  // Count keyword matches
  const resilienceMatches = resilienceKeywords.filter((kw) =>
    text.includes(kw)
  ).length;
  const autonomyMatches = autonomyKeywords.filter((kw) =>
    text.includes(kw)
  ).length;
  const connectivityMatches = connectivityKeywords.filter((kw) =>
    text.includes(kw)
  ).length;

  // Domain-based scoring
  const domainScores = {
    resilience: domains.includes("health") ? 3 : 0,
    autonomy: domains.includes("work") || domains.includes("identity") ? 3 : 0,
    connectivity: domains.includes("relationships") ? 3 : 0,
  };

  // Combine keyword and domain analysis
  const total = resilienceMatches + autonomyMatches + connectivityMatches;

  if (total === 0) {
    // If no clear signals, distribute evenly
    return { resilience: 0.33, autonomy: 0.33, connectivity: 0.34 };
  }

  return {
    resilience: Math.min(
      1,
      (resilienceMatches / total) * 0.7 + domainScores.resilience * 0.3
    ),
    autonomy: Math.min(
      1,
      (autonomyMatches / total) * 0.7 + domainScores.autonomy * 0.3
    ),
    connectivity: Math.min(
      1,
      (connectivityMatches / total) * 0.7 + domainScores.connectivity * 0.3
    ),
  };
}

/**
 * Determines if the stress is depleting (negative) or energizing (positive)
 */
function determineStressPolarity(context: EventContext): -1 | 1 {
  const { description } = context;
  const text = description.toLowerCase();

  // Positive stress indicators (eustress)
  const positiveIndicators = [
    "excited", "opportunity", "growth", "challenge", "adventure",
    "new", "learning", "developing", "motivated", "inspired",
  ];

  // Negative stress indicators (distress)
  const negativeIndicators = [
    "anxious", "worried", "afraid", "sad", "angry", "frustrated",
    "hopeless", "lost", "confused", "betrayed", "rejected", "failing",
  ];

  const positiveCount = positiveIndicators.filter((ind) =>
    text.includes(ind)
  ).length;
  const negativeCount = negativeIndicators.filter((ind) =>
    text.includes(ind)
  ).length;

  // Default to negative stress if unclear
  return positiveCount > negativeCount ? 1 : -1;
}

/**
 * Maps an event to a force vector that will affect vector state
 */
export function mapEventToForce(context: EventContext): DiagnosedEvent {
  const impact = analyzeDimensionalImpact(context);
  const polarity = determineStressPolarity(context);
  const magnitude = context.severityNumeric;

  // Create force vector components
  const forceVector: ForceVector = {
    xComponent: polarity * magnitude * impact.resilience * 0.5,
    yComponent: polarity * magnitude * impact.autonomy * 0.5,
    zComponent: polarity * magnitude * impact.connectivity * 0.5,
    magnitude: Math.sqrt(
      Math.pow(magnitude * impact.resilience, 2) +
        Math.pow(magnitude * impact.autonomy, 2) +
        Math.pow(magnitude * impact.connectivity, 2)
    ),
  };

  // Determine which dimensions are significantly affected (>20%)
  const affectedDimensions = {
    resilience: impact.resilience > 0.2,
    autonomy: impact.autonomy > 0.2,
    connectivity: impact.connectivity > 0.2,
  };

  // Generate diagnosis
  const primaryDimension =
    impact.resilience > impact.autonomy && impact.resilience > impact.connectivity
      ? "resilience"
      : impact.autonomy > impact.connectivity
        ? "autonomy"
        : "connectivity";

  const diagnosis = {
    primaryStressor: `This event primarily affects your ${primaryDimension}`,
    secondaryFactors: Object.entries(affectedDimensions)
      .filter(([dim, affected]) => affected && dim !== primaryDimension)
      .map(([dim]) => `Secondary impact on ${dim}`),
    recommendation:
      polarity === -1
        ? `Focus on restoring ${primaryDimension} through targeted recovery`
        : `Channel this positive energy into growth in ${primaryDimension}`,
  };

  return {
    forceVector,
    affectedDimensions,
    diagnosis,
  };
}

/**
 * Determines if SEDA protocol should be triggered
 */
export function shouldTriggerSEDA(
  severity: SeverityLevel,
  severityNumeric: number,
  keywords: string[]
): {
  shouldTrigger: boolean;
  reason?: string;
  matchedKeywords?: string[];
} {
  // SEDA triggers on high severity
  if (severity === "distortion" || severity === "anomaly" || severityNumeric >= 8) {
    return {
      shouldTrigger: true,
      reason: "High severity event detected",
    };
  }

  // SEDA triggers on crisis keywords
  const crisisKeywords = [
    "suicide", "suicidal", "kill myself", "end it all",
    "can't go on", "no point", "hopeless", "worthless",
    "panic", "breakdown", "crisis", "emergency",
  ];

  const matchedKeywords = keywords.filter((kw) =>
    crisisKeywords.some((crisis) => kw.toLowerCase().includes(crisis))
  );

  if (matchedKeywords.length > 0) {
    return {
      shouldTrigger: true,
      reason: "Crisis indicators detected",
      matchedKeywords,
    };
  }

  return { shouldTrigger: false };
}

/**
 * Calculates event-to-event stress delta (for tracking progression)
 */
export function calculateSeverityDelta(
  previousSeverity: number,
  currentSeverity: number
): {
  delta: number;
  trend: "improving" | "stable" | "worsening";
  description: string;
} {
  const delta = currentSeverity - previousSeverity;

  let trend: "improving" | "stable" | "worsening";
  let description: string;

  if (delta <= -2) {
    trend = "improving";
    description = "Significant improvement in stress level";
  } else if (delta < 0) {
    trend = "improving";
    description = "Mild improvement in stress level";
  } else if (delta === 0) {
    trend = "stable";
    description = "Stress level remains stable";
  } else if (delta <= 2) {
    trend = "worsening";
    description = "Stress level is increasing";
  } else {
    trend = "worsening";
    description = "Significant increase in stress level";
  }

  return { delta, trend, description };
}
