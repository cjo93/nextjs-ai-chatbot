/**
 * DEFRAG Inversion Engine
 * Processes events and generates diagnosis, scripts, and experiments
 */

import type { HumanDesignChart } from "./resolver";
import type { VectorState } from "./physics";
import type { SeverityLevel } from "./stress-mapper";

export interface InversionResult {
  diagnosis: {
    mechanism: string;
    distortion: string;
    gateActivations: number[];
  };
  script: string;
  scriptSource: "deterministic" | "ai";
  experiments: Array<{
    hypothesis: string;
    action: string;
    successCriteria: string[];
  }>;
}

/**
 * Process event through inversion engine
 */
export async function processEvent(
  blueprint: HumanDesignChart,
  context: string,
  severityNumeric: number,
  vectorState: VectorState
): Promise<InversionResult> {
  try {
    // Identify relevant gates from blueprint
    const relevantGates = identifyRelevantGates(blueprint, context, severityNumeric);

    // Generate diagnosis
    const diagnosis = generateDiagnosis(
      blueprint,
      context,
      severityNumeric,
      relevantGates,
      vectorState
    );

    // Generate script (inversion protocol)
    const script = generateScript(
      blueprint,
      diagnosis,
      severityNumeric,
      relevantGates
    );

    // Generate experiments
    const experiments = generateExperiments(
      blueprint,
      diagnosis,
      relevantGates
    );

    return {
      diagnosis,
      script,
      scriptSource: "deterministic",
      experiments,
    };
  } catch (error) {
    console.error("Error processing event:", error);
    throw new Error("Failed to process event through inversion engine");
  }
}

/**
 * Identify relevant gates from blueprint based on context
 */
function identifyRelevantGates(
  blueprint: HumanDesignChart,
  context: string,
  severity: number
): number[] {
  const lowerContext = context.toLowerCase();

  // Map context keywords to gates (simplified mapping)
  const gateKeywords: Record<number, string[]> = {
    1: ["creative", "express", "unique"],
    2: ["receptive", "response", "intuition"],
    7: ["leadership", "direction", "guide"],
    13: ["listener", "memory", "story"],
    25: ["innocent", "love", "spirit"],
    27: ["care", "nourish", "responsibility"],
    29: ["commitment", "perseverance", "saying yes"],
    34: ["power", "strength", "action"],
    46: ["body", "physical", "timing"],
    59: ["intimacy", "breaking down", "barriers"],
  };

  const relevantGates: number[] = [];

  // Check which gates are activated in the blueprint
  const activatedGates = new Set(blueprint.gates.map((g) => g.number));

  // Find gates that match context AND are in blueprint
  for (const [gateNum, keywords] of Object.entries(gateKeywords)) {
    const gate = parseInt(gateNum);
    if (!activatedGates.has(gate)) continue;

    for (const keyword of keywords) {
      if (lowerContext.includes(keyword)) {
        relevantGates.push(gate);
        break;
      }
    }
  }

  // If no specific matches, use most prominent gates from blueprint
  if (relevantGates.length === 0 && severity >= 3) {
    // Use personality sun and earth gates (most significant)
    const sunGate = blueprint.gates.find(
      (g) => g.planet === "sun" && g.activation === "personality"
    );
    const earthGate = blueprint.gates.find(
      (g) => g.planet === "earth" && g.activation === "personality"
    );

    if (sunGate) relevantGates.push(sunGate.number);
    if (earthGate) relevantGates.push(earthGate.number);
  }

  return relevantGates.slice(0, 3); // Limit to top 3 gates
}

/**
 * Generate diagnosis
 */
function generateDiagnosis(
  blueprint: HumanDesignChart,
  context: string,
  severity: number,
  relevantGates: number[],
  vectorState: VectorState
): InversionResult["diagnosis"] {
  // Determine mechanism based on type and authority
  let mechanism = "";

  if (blueprint.type === "Generator" || blueprint.type === "Manifesting Generator") {
    mechanism = "Not following Sacral response. Initiating instead of responding.";
  } else if (blueprint.type === "Manifestor") {
    mechanism = "Not informing before acting. Creating resistance and reaction.";
  } else if (blueprint.type === "Projector") {
    mechanism = "Working without invitation or recognition. Energy depletion.";
  } else if (blueprint.type === "Reflector") {
    mechanism = "Not allowing full lunar cycle. Making decisions too quickly.";
  }

  // Determine distortion based on vector state
  let distortion = "";
  const lowestDimension =
    vectorState.xResilience < vectorState.yAutonomy
      ? vectorState.xResilience < vectorState.zConnectivity
        ? "resilience"
        : "connectivity"
      : vectorState.yAutonomy < vectorState.zConnectivity
        ? "autonomy"
        : "connectivity";

  if (lowestDimension === "resilience") {
    distortion = "Energy system depleted. Sacral/Root centers under stress.";
  } else if (lowestDimension === "autonomy") {
    distortion = "Decision-making compromised. Authority not being honored.";
  } else {
    distortion = "Relational field fragmented. G-center or Heart disconnection.";
  }

  return {
    mechanism,
    distortion,
    gateActivations: relevantGates,
  };
}

/**
 * Generate script (inversion protocol)
 */
function generateScript(
  blueprint: HumanDesignChart,
  diagnosis: InversionResult["diagnosis"],
  severity: number,
  relevantGates: number[]
): string {
  let script = `# Inversion Protocol - ${blueprint.type}\n\n`;

  script += `## Current State\n`;
  script += `Your ${blueprint.type} design is experiencing distortion:\n`;
  script += `${diagnosis.mechanism}\n\n`;

  script += `## Root Cause\n`;
  script += `${diagnosis.distortion}\n\n`;

  if (relevantGates.length > 0) {
    script += `## Activated Gates\n`;
    script += `Gates ${relevantGates.join(", ")} are currently in play.\n\n`;
  }

  script += `## Inversion Steps\n\n`;

  // Add type-specific guidance
  if (blueprint.type === "Generator" || blueprint.type === "Manifesting Generator") {
    script += `1. **PAUSE** - Stop initiating. Return to waiting.\n`;
    script += `2. **LISTEN** - What is your Sacral responding to right now?\n`;
    script += `3. **RESPOND** - Only act on clear yes/no from your gut.\n`;
    script += `4. **TRUST** - Your Sacral knows. Your mind doesn't need to understand.\n`;
  } else if (blueprint.type === "Manifestor") {
    script += `1. **INFORM** - Tell people what you're about to do.\n`;
    script += `2. **OBSERVE** - Notice the peace that comes from informing.\n`;
    script += `3. **INITIATE** - Now act with the resistance removed.\n`;
    script += `4. **TRUST** - Your power is in your impact, not in secrecy.\n`;
  } else if (blueprint.type === "Projector") {
    script += `1. **REST** - You're not designed for sustained work. Stop pushing.\n`;
    script += `2. **WAIT** - The right invitation will come when you're ready.\n`;
    script += `3. **STUDY** - Use this time to deepen your mastery.\n`;
    script += `4. **TRUST** - Recognition comes when you stop seeking it.\n`;
  } else if (blueprint.type === "Reflector") {
    script += `1. **SLOW DOWN** - You need a full lunar cycle (28 days).\n`;
    script += `2. **SAMPLE** - Experience the decision from many angles.\n`;
    script += `3. **DISCUSS** - Talk it through with your trusted circle.\n`;
    script += `4. **TRUST** - Clarity emerges when you give it time.\n`;
  }

  script += `\n## Authority Guidance\n`;
  script += `Your ${blueprint.authority} is your decision-making compass.\n`;

  if (blueprint.authority === "Emotional Authority") {
    script += `Wait for emotional clarity. No truth in the now. Sleep on it.\n`;
  } else if (blueprint.authority === "Sacral Authority") {
    script += `Listen for the uh-huh (yes) or uh-uh (no) from your gut.\n`;
  } else if (blueprint.authority === "Splenic Authority") {
    script += `Trust your first instinct. It speaks once, quietly, in the moment.\n`;
  }

  script += `\n## Somatic Anchor\n`;
  script += `Place your hand on your `;

  if (blueprint.authority.includes("Sacral")) {
    script += `belly. Feel the life force.\n`;
  } else if (blueprint.authority.includes("Solar Plexus") || blueprint.authority.includes("Emotional")) {
    script += `solar plexus. Feel the wave.\n`;
  } else if (blueprint.authority.includes("Spleen")) {
    script += `spleen (left side, below ribs). Feel the knowing.\n`;
  } else {
    script += `heart. Feel your truth.\n`;
  }

  script += `Breathe. You are designed for this.\n`;

  return script;
}

/**
 * Generate experiments
 */
function generateExperiments(
  blueprint: HumanDesignChart,
  diagnosis: InversionResult["diagnosis"],
  relevantGates: number[]
): InversionResult["experiments"] {
  const experiments: InversionResult["experiments"] = [];

  // Strategy experiment
  experiments.push({
    hypothesis: `Following my ${blueprint.type} strategy will reduce distortion`,
    action: `For the next 24 hours, strictly follow: ${blueprint.strategy}`,
    successCriteria: [
      "Reduced anxiety or stress",
      "Increased sense of flow",
      "Better outcomes with less effort",
    ],
  });

  // Authority experiment
  experiments.push({
    hypothesis: `Honoring my ${blueprint.authority} will improve decision quality`,
    action: `Make no decisions today without consulting your ${blueprint.authority}`,
    successCriteria: [
      "Decisions feel more aligned",
      "Reduced regret or second-guessing",
      "More peace with choices made",
    ],
  });

  // Energy experiment (type-specific)
  if (blueprint.type === "Generator" || blueprint.type === "Manifesting Generator") {
    experiments.push({
      hypothesis: "Responding vs initiating will restore energy",
      action: "Stop all initiated activities. Only engage with what you're responding to.",
      successCriteria: [
        "Energy levels improve",
        "Work feels more satisfying",
        "Less frustration",
      ],
    });
  } else if (blueprint.type === "Projector") {
    experiments.push({
      hypothesis: "Reducing work hours will increase effectiveness",
      action: "Work only 3-4 focused hours. Rest the remainder.",
      successCriteria: [
        "Better quality of work",
        "Reduced bitterness",
        "Increased recognition",
      ],
    });
  }

  return experiments;
}
