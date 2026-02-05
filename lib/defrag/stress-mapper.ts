/**
 * DEFRAG Stress Mapper
 * Maps event context and severity to stress vector
 */

import type { StressVector } from "./physics";

export type SeverityLevel = "signal" | "friction" | "breakpoint" | "distortion" | "anomaly";

/**
 * Map severity level to numeric value
 */
export function severityToNumeric(severity: SeverityLevel): number {
  const map = {
    signal: 1,
    friction: 2,
    breakpoint: 3,
    distortion: 4,
    anomaly: 5,
  };
  return map[severity];
}

/**
 * Map numeric severity to level
 */
export function numericToSeverity(numeric: number): SeverityLevel {
  if (numeric <= 1) return "signal";
  if (numeric <= 2) return "friction";
  if (numeric <= 3) return "breakpoint";
  if (numeric <= 4) return "distortion";
  return "anomaly";
}

/**
 * Analyze context text for dimensional signals
 */
export function analyzeContext(context: string): {
  resilienceImpact: number;
  autonomyImpact: number;
  connectivityImpact: number;
} {
  const lowerContext = context.toLowerCase();

  // Resilience keywords (X-axis: survival, stress, energy)
  const resilienceKeywords = [
    "tired",
    "exhausted",
    "overwhelmed",
    "stressed",
    "anxious",
    "panic",
    "fatigue",
    "burnout",
    "drained",
    "depleted",
    "sick",
    "pain",
    "suffering",
  ];

  // Autonomy keywords (Y-axis: control, decision-making, agency)
  const autonomyKeywords = [
    "trapped",
    "stuck",
    "powerless",
    "helpless",
    "forced",
    "pressure",
    "controlled",
    "manipulated",
    "confused",
    "indecisive",
    "lost",
    "uncertain",
  ];

  // Connectivity keywords (Z-axis: relationships, belonging, isolation)
  const connectivityKeywords = [
    "alone",
    "isolated",
    "lonely",
    "rejected",
    "abandoned",
    "misunderstood",
    "disconnected",
    "conflict",
    "argument",
    "betrayed",
    "hurt",
    "broken",
  ];

  // Count keyword matches (normalized)
  let resilienceCount = 0;
  let autonomyCount = 0;
  let connectivityCount = 0;

  for (const keyword of resilienceKeywords) {
    if (lowerContext.includes(keyword)) resilienceCount++;
  }

  for (const keyword of autonomyKeywords) {
    if (lowerContext.includes(keyword)) autonomyCount++;
  }

  for (const keyword of connectivityKeywords) {
    if (lowerContext.includes(keyword)) connectivityCount++;
  }

  // Normalize to -1 to 0 range (negative impact)
  const maxKeywords = Math.max(
    resilienceKeywords.length,
    autonomyKeywords.length,
    connectivityKeywords.length
  );

  return {
    resilienceImpact: -(resilienceCount / maxKeywords) * 3, // Scale to -3
    autonomyImpact: -(autonomyCount / maxKeywords) * 3,
    connectivityImpact: -(connectivityCount / maxKeywords) * 3,
  };
}

/**
 * Map event to stress vector
 */
export function mapEventToStress(
  context: string,
  severity: number
): StressVector {
  // Analyze context for dimensional impacts
  const analysis = analyzeContext(context);

  // Base impact from severity (1-5 maps to magnitude)
  const baseMagnitude = severity;

  // If no specific dimensional signals, distribute evenly
  const totalImpact =
    Math.abs(analysis.resilienceImpact) +
    Math.abs(analysis.autonomyImpact) +
    Math.abs(analysis.connectivityImpact);

  let dx: number;
  let dy: number;
  let dz: number;

  if (totalImpact < 0.1) {
    // No specific signals, distribute based on severity patterns
    if (severity <= 2) {
      // Low severity: mainly resilience
      dx = -baseMagnitude * 0.7;
      dy = -baseMagnitude * 0.2;
      dz = -baseMagnitude * 0.1;
    } else if (severity === 3) {
      // Medium severity: balanced
      dx = -baseMagnitude * 0.4;
      dy = -baseMagnitude * 0.3;
      dz = -baseMagnitude * 0.3;
    } else {
      // High severity: all dimensions affected
      dx = -baseMagnitude * 0.4;
      dy = -baseMagnitude * 0.3;
      dz = -baseMagnitude * 0.3;
    }
  } else {
    // Use detected dimensional impacts, scaled by severity
    const scale = baseMagnitude / totalImpact;
    dx = analysis.resilienceImpact * scale;
    dy = analysis.autonomyImpact * scale;
    dz = analysis.connectivityImpact * scale;
  }

  const magnitude = Math.sqrt(dx * dx + dy * dy + dz * dz);

  return {
    dx,
    dy,
    dz,
    magnitude,
  };
}

/**
 * Detect SEDA trigger keywords in context
 */
export function detectSedaTriggers(context: string): string[] {
  const lowerContext = context.toLowerCase();

  const sedaKeywords = [
    "suicide",
    "kill myself",
    "end it",
    "can't go on",
    "want to die",
    "no point",
    "self-harm",
    "hurt myself",
    "emergency",
    "crisis",
    "breakdown",
    "can't cope",
  ];

  const matched: string[] = [];

  for (const keyword of sedaKeywords) {
    if (lowerContext.includes(keyword)) {
      matched.push(keyword);
    }
  }

  return matched;
}

/**
 * Calculate trend from event history
 */
export function calculateTrend(
  severities: number[],
  windowSize: number = 5
): "improving" | "stable" | "worsening" {
  if (severities.length < 2) return "stable";

  const recent = severities.slice(-windowSize);
  const avg = recent.reduce((sum, s) => sum + s, 0) / recent.length;

  const earlier = severities.slice(-windowSize * 2, -windowSize);
  if (earlier.length === 0) return "stable";

  const earlierAvg = earlier.reduce((sum, s) => sum + s, 0) / earlier.length;

  const change = avg - earlierAvg;

  if (change < -0.5) return "improving";
  if (change > 0.5) return "worsening";
  return "stable";
}
