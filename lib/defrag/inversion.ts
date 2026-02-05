/**
 * Inversion Engine
 * Generates personalized scripts and experiments based on gate data and event context
 */

import type { GateData } from "./god-engine/loader";
import { getGate, getInversionProtocol } from "./god-engine/loader";
import type { SeverityLevel } from "./stress-mapper";

/**
 * Generated inversion script with experiments
 */
export interface InversionScript {
  script: string;
  experiments: string[];
  source: "deterministic" | "ai-generated";
  gatesReferenced: number[];
  personalizations: string[];
}

/**
 * Context for AI-enhanced script generation
 */
export interface AIContext {
  eventDescription: string;
  recentHistory?: string[];
  userPreferences?: {
    communicationStyle?: "direct" | "gentle" | "exploratory";
    experimentTypes?: ("physical" | "creative" | "relational" | "introspective")[];
  };
}

/**
 * Generates an inversion script from gate data and event context
 */
export async function generateInversionScript(
  gateNumbers: number[],
  severity: SeverityLevel,
  eventContext: string,
  aiContext?: AIContext
): Promise<InversionScript> {
  // Get relevant gates
  const gates = await Promise.all(
    gateNumbers.map(async (num) => {
      const gate = await getGate(num);
      const protocol = await getInversionProtocol(num, severity);
      return { gate, protocol };
    })
  );

  // Filter out nulls
  const validGates = gates.filter(
    (g): g is { gate: GateData; protocol: NonNullable<typeof g.protocol> } =>
      g.gate !== null && g.protocol !== null
  );

  if (validGates.length === 0) {
    return generateFallbackScript(severity, eventContext);
  }

  // Use first gate as primary, others as supporting context
  const primary = validGates[0];
  const supporting = validGates.slice(1);

  // Build script from gate protocols
  let script = primary.protocol.script;

  // Add personalization based on supporting gates
  const personalizations: string[] = [];
  for (const { gate } of supporting) {
    if (gate.keywords.some((kw) => eventContext.toLowerCase().includes(kw))) {
      personalizations.push(
        `Your ${gate.name} gate suggests this resonates with themes of ${gate.keywords.slice(0, 3).join(", ")}.`
      );
    }
  }

  // Combine experiments from all gates
  const allExperiments = validGates.flatMap((g) => g.protocol.experiments);

  // Deduplicate and select most relevant experiments
  const uniqueExperiments = [...new Set(allExperiments)];
  const selectedExperiments = selectRelevantExperiments(
    uniqueExperiments,
    eventContext,
    aiContext
  );

  return {
    script,
    experiments: selectedExperiments,
    source: "deterministic",
    gatesReferenced: validGates.map((g) => g.gate.gateNumber),
    personalizations,
  };
}

/**
 * Selects the most relevant experiments based on context
 */
function selectRelevantExperiments(
  experiments: string[],
  eventContext: string,
  aiContext?: AIContext
): string[] {
  const context = eventContext.toLowerCase();

  // Score each experiment by relevance
  const scored = experiments.map((exp) => {
    let score = 0;
    const expLower = exp.toLowerCase();

    // Keyword matching
    if (context.includes("relationship") && expLower.includes("relationship")) {
      score += 3;
    }
    if (context.includes("creative") && expLower.includes("creat")) score += 3;
    if (context.includes("body") && expLower.includes("physical")) score += 3;
    if (context.includes("work") && expLower.includes("work")) score += 3;

    // User preference matching
    if (aiContext?.userPreferences?.experimentTypes) {
      const types = aiContext.userPreferences.experimentTypes;
      if (types.includes("physical") && expLower.includes("physical")) score += 2;
      if (types.includes("creative") && expLower.includes("creat")) score += 2;
      if (types.includes("relational") && expLower.includes("relationship"))
        score += 2;
      if (types.includes("introspective") && expLower.includes("journal"))
        score += 2;
    }

    return { exp, score };
  });

  // Sort by score and take top 3
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((s) => s.exp);
}

/**
 * Generates a fallback script when no gate data is available
 */
function generateFallbackScript(
  severity: SeverityLevel,
  eventContext: string
): InversionScript {
  const scripts: Record<SeverityLevel, string> = {
    signal: "You're experiencing an early signal that something needs attention. Trust this awareness—it's your system's wisdom.",
    friction: "This friction is showing you where your energy isn't flowing smoothly. What needs to shift?",
    breakpoint: "You've reached a significant threshold. This isn't failure—it's transformation asking you to evolve.",
    distortion: "Your system is under significant stress. Immediate care and support are needed.",
    anomaly: "You're experiencing a critical event. Please prioritize your safety and reach out for professional support.",
  };

  const experiments: Record<SeverityLevel, string[]> = {
    signal: [
      "Take 10 minutes to journal about what you're noticing",
      "Share your observation with someone you trust",
      "Do one small thing to address what you're sensing",
    ],
    friction: [
      "Identify the specific point of resistance",
      "Try the opposite of what you've been doing",
      "Ask: 'What am I avoiding here?'",
    ],
    breakpoint: [
      "Take a complete break from the situation for 24 hours",
      "Seek guidance from a mentor or therapist",
      "Document this moment—you're at an important threshold",
    ],
    distortion: [
      "Reach out to your support system immediately",
      "Remove yourself from the stressful environment",
      "Practice grounding: 5 things you see, 4 you hear, 3 you feel, 2 you smell, 1 you taste",
    ],
    anomaly: [
      "Call a crisis helpline: 988 (Suicide & Crisis Lifeline)",
      "Go to a safe place with people you trust",
      "Contact a mental health professional today",
    ],
  };

  return {
    script: scripts[severity],
    experiments: experiments[severity],
    source: "deterministic",
    gatesReferenced: [],
    personalizations: [],
  };
}

/**
 * Enhances a script with AI personalization (placeholder for AI integration)
 */
export async function enhanceScriptWithAI(
  baseScript: InversionScript,
  aiContext: AIContext,
  aiModel?: string
): Promise<InversionScript> {
  // This is a placeholder for AI enhancement
  // In production, this would call an AI service to personalize the script

  const communicationStyle = aiContext.userPreferences?.communicationStyle || "direct";

  let enhancedScript = baseScript.script;

  // Adjust tone based on communication style
  if (communicationStyle === "gentle") {
    enhancedScript = `I want you to know that what you're experiencing makes complete sense. ${enhancedScript}`;
  } else if (communicationStyle === "exploratory") {
    enhancedScript = `${enhancedScript} What do you notice as you sit with this?`;
  }

  // Add context-specific personalization
  if (aiContext.recentHistory && aiContext.recentHistory.length > 0) {
    enhancedScript += ` I notice this builds on what you've been working through recently.`;
  }

  return {
    ...baseScript,
    script: enhancedScript,
    source: "ai-generated",
  };
}

/**
 * Generates experiment tracking structure
 */
export function createExperimentStructure(
  hypothesis: string,
  action: string,
  successCriteria: Record<string, unknown>
): {
  hypothesis: string;
  action: string;
  successCriteria: Record<string, unknown>;
} {
  return {
    hypothesis,
    action,
    successCriteria,
  };
}

/**
 * Suggests experiments based on user's past outcomes
 */
export function suggestNextExperiments(
  completedExperiments: Array<{
    action: string;
    success: boolean | null;
    insights?: string;
  }>,
  currentContext: string
): string[] {
  // Analyze what's worked before
  const successfulActions = completedExperiments
    .filter((exp) => exp.success === true)
    .map((exp) => exp.action.toLowerCase());

  const suggestions: string[] = [];

  // If creative experiments worked, suggest more
  if (successfulActions.some((action) => action.includes("creat"))) {
    suggestions.push("Try expressing this through art or writing");
  }

  // If physical experiments worked, suggest more
  if (successfulActions.some((action) => action.includes("physical") || action.includes("body"))) {
    suggestions.push("Engage your body through movement or somatic practice");
  }

  // If relational experiments worked, suggest more
  if (successfulActions.some((action) => action.includes("relationship") || action.includes("share"))) {
    suggestions.push("Connect with someone about what you're experiencing");
  }

  // If nothing has worked, suggest changing approach
  if (completedExperiments.length > 2 && suggestions.length === 0) {
    suggestions.push(
      "Try something completely different from what you've attempted before",
      "Seek professional guidance to explore new approaches",
      "Focus on basic self-care before attempting experiments"
    );
  }

  return suggestions.slice(0, 3);
}
