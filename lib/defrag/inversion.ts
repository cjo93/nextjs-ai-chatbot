/**
 * Inversion Engine
 * Converts stress events into behavioral scripts
 * "Inverts" the problem into actionable solutions
 */

import { loadType } from "./god-engine/loader";

export interface InversionScript {
  event: {
    title: string;
    severity: number;
  };
  script: {
    immediate: string[];     // Immediate actions (0-24 hours)
    shortTerm: string[];     // Short-term steps (1-7 days)
    longTerm: string[];      // Long-term strategies (1+ weeks)
  };
  rationale: string;
  expectedOutcome: string;
}

/**
 * Generate behavioral script from event
 */
export function generateScript(
  event: {
    title: string;
    description: string;
    severity: number;
    category: string;
  },
  blueprintType: string,
  activatedGates: number[]
): InversionScript {
  const typeProtocol = loadType(blueprintType);
  
  // Generate context-aware script
  const immediate = generateImmediateActions(event, typeProtocol);
  const shortTerm = generateShortTermSteps(event, typeProtocol);
  const longTerm = generateLongTermStrategies(event, typeProtocol);
  
  const rationale = generateRationale(event, typeProtocol);
  const expectedOutcome = generateExpectedOutcome(event, typeProtocol);
  
  return {
    event: {
      title: event.title,
      severity: event.severity
    },
    script: {
      immediate,
      shortTerm,
      longTerm
    },
    rationale,
    expectedOutcome
  };
}

/**
 * Generate immediate actions (0-24 hours)
 */
function generateImmediateActions(event: any, typeProtocol: any): string[] {
  const actions: string[] = [];
  
  // Type-specific first response
  actions.push(`Honor your ${typeProtocol.strategy || 'Strategy'}: ${getStrategyGuidance(typeProtocol)}`);
  
  // Severity-based immediate actions
  if (event.severity >= 8) {
    actions.push("Create physical and emotional safety first");
    actions.push("Reach out to your support system immediately");
  } else if (event.severity >= 5) {
    actions.push("Take a pause before reacting");
    actions.push("Ground yourself with a brief centering practice");
  }
  
  // Category-specific actions
  const categoryActions: Record<string, string> = {
    work: "Set a boundary around the immediate situation",
    relationship: "Allow space for emotional processing before responding",
    health: "Contact appropriate healthcare provider if needed",
    finance: "Assess immediate financial needs and resources",
    personal: "Practice self-compassion and avoid self-judgment",
    family: "Communicate your needs clearly and calmly"
  };
  
  if (categoryActions[event.category]) {
    actions.push(categoryActions[event.category]);
  }
  
  return actions;
}

/**
 * Generate short-term steps (1-7 days)
 */
function generateShortTermSteps(event: any, typeProtocol: any): string[] {
  const steps: string[] = [];
  
  steps.push(`Use your ${typeProtocol.authority || 'Authority'} to guide next decisions`);
  
  if (event.severity >= 7) {
    steps.push("Create a simple daily structure to maintain stability");
    steps.push("Check in with yourself twice daily to assess state");
    steps.push("Limit additional stressors where possible");
  } else {
    steps.push("Observe how this situation reveals your patterns");
    steps.push("Notice what support and practices help most");
  }
  
  // Type-specific processing
  const typeSteps: Record<string, string> = {
    Generator: "Notice what you're being drawn to respond to",
    Projector: "Rest more than usual and wait for clarity",
    Manifestor: "Inform those affected by your next moves",
    Reflector: "Give yourself the full lunar cycle to decide",
    MG: "Trust your gut responses as you move through this"
  };
  
  if (typeSteps[typeProtocol.type]) {
    steps.push(typeSteps[typeProtocol.type]);
  }
  
  return steps;
}

/**
 * Generate long-term strategies (1+ weeks)
 */
function generateLongTermStrategies(event: any, typeProtocol: any): string[] {
  const strategies: string[] = [];
  
  strategies.push("Reflect on what this event teaches about your design");
  strategies.push("Identify patterns and how to honor your strategy better");
  
  if (event.severity >= 6) {
    strategies.push("Consider if life structure needs adjustment");
    strategies.push("Strengthen practices that support your Authority");
    strategies.push("Build resilience through aligned relationships and routines");
  }
  
  // Not-self theme awareness
  strategies.push(`Watch for ${typeProtocol.not_self_theme || 'not-self'} patterns returning`);
  strategies.push(`Move toward ${typeProtocol.signature || 'alignment'} as your indicator`);
  
  return strategies;
}

/**
 * Generate rationale for script
 */
function generateRationale(event: any, typeProtocol: any): string {
  return `This script is designed for your ${typeProtocol.type} type, honoring your ${typeProtocol.strategy} strategy and ${typeProtocol.authority || 'Authority'}. The approach balances immediate stabilization with long-term alignment, helping you move from ${typeProtocol.not_self_theme || 'resistance'} toward ${typeProtocol.signature || 'alignment'}.`;
}

/**
 * Generate expected outcome
 */
function generateExpectedOutcome(event: any, typeProtocol: any): string {
  if (event.severity >= 8) {
    return `By following this script, you should experience stabilization within 7-14 days, with gradual return to ${typeProtocol.signature || 'alignment'}. The process respects your design's natural pace of recovery.`;
  } else if (event.severity >= 5) {
    return `Following this approach should help you process the event within 3-7 days, emerging with greater clarity about your patterns and stronger alignment with your strategy.`;
  } else {
    return `This event can be integrated quickly (1-3 days) when you stay aligned with your design, potentially revealing useful insights about your growth edge.`;
  }
}

/**
 * Get strategy-specific guidance
 */
function getStrategyGuidance(typeProtocol: any): string {
  const guidance: Record<string, string> = {
    "To Respond": "Wait for something to respond to rather than initiating action",
    "Wait for the Invitation": "Wait for recognition and invitation before engaging deeply",
    "To Inform": "Inform those who will be impacted before taking action",
    "Wait 28 Days": "Give yourself a full lunar cycle before making major decisions"
  };
  
  return guidance[typeProtocol.strategy] || "Follow your natural process";
}
