/**
 * DEFRAG Inversion Engine - Event to Script Converter
 * Generates deterministic wisdom scripts from stress events
 */

import type { ChartData, EventInput, VectorState, ProcessedEvent } from "./types";
import { getGateProtocol } from "./god-engine/loader";

/**
 * Process an event and generate wisdom script
 * @param event - The stress event
 * @param chart - User's chart data
 * @param vectorState - Calculated vector state
 * @returns Processed event with generated script
 * 
 * TODO: Implement full inversion logic
 * - Use God Engine protocols for affected gates
 * - Consider chart type strategy
 * - Factor in authority alignment
 * - Generate personalized wisdom script
 */
export async function invertEvent(
  event: EventInput,
  chart: ChartData,
  vectorState: VectorState
): Promise<ProcessedEvent> {
  // Generate script based on vector state and affected gates
  const script = await generateScript(event, chart, vectorState);
  
  return {
    ...event,
    vectorState,
    generatedScript: script,
  };
}

/**
 * Generate wisdom script from event analysis
 */
async function generateScript(
  event: EventInput,
  chart: ChartData,
  vectorState: VectorState
): Promise<string> {
  // STUB: Simplified script generation
  // In production, this would:
  // 1. Load protocols for affected gates from God Engine
  // 2. Apply type-specific strategy wisdom
  // 3. Consider authority alignment
  // 4. Generate personalized, actionable guidance
  
  const scripts: string[] = [];
  
  // Add opening based on chart type
  scripts.push(getTypeOpening(chart.type, event.severity));
  
  // Add gate-specific wisdom for most affected gates
  for (const gateNumber of vectorState.affectedGates.slice(0, 3)) {
    try {
      const protocol = await getGateProtocol(gateNumber);
      const severity = event.severity <= 3 ? "low" : event.severity <= 7 ? "medium" : "high";
      const gateScript = protocol.inversionProtocols[severity][0] || protocol.wisdomText;
      scripts.push(`**Gate ${gateNumber} (${protocol.name}):** ${gateScript}`);
    } catch (error) {
      // Gate protocol not found, skip
      console.warn(`Protocol not found for gate ${gateNumber}`);
    }
  }
  
  // Add authority-based decision guidance
  scripts.push(getAuthorityGuidance(chart.authority, event.severity));
  
  // Add closing reflection
  scripts.push(getClosingReflection(chart.type, vectorState.direction));
  
  return scripts.join("\n\n");
}

/**
 * Get opening script based on type and severity
 */
function getTypeOpening(type: string, severity: number): string {
  const severityLevel = severity <= 3 ? "minor" : severity <= 7 ? "moderate" : "significant";
  
  const openings: Record<string, string> = {
    Generator: `As a Generator, this ${severityLevel} stress is an opportunity to check in with your Sacral response. What is your gut telling you about this situation?`,
    "Manifesting Generator": `As a Manifesting Generator, this ${severityLevel} challenge invites you to pause before responding. What does your Sacral say? And where is your energy wanting to move?`,
    Manifestor: `As a Manifestor, this ${severityLevel} event may be highlighting where you need to inform others or where your power is being restricted. How can you reclaim your initiating force?`,
    Projector: `As a Projector, this ${severityLevel} stress may indicate you're pushing when you need to wait for recognition. Are you being seen and invited appropriately?`,
    Reflector: `As a Reflector, this ${severityLevel} situation is a mirror of your environment. What is this experience reflecting back to you about your surroundings?`,
  };
  
  return openings[type] || "Observe this experience with curiosity.";
}

/**
 * Get authority-based guidance
 */
function getAuthorityGuidance(authority: string, severity: number): string {
  const guidance: Record<string, string> = {
    Emotional: "**Your Authority:** Give yourself time to ride the emotional wave. Wait for clarity before making any decisions about this situation.",
    Sacral: "**Your Authority:** Trust your gut response. Does this situation feel like a 'yes' or a 'no' in your body?",
    Splenic: "**Your Authority:** Your intuition spoke in the moment. What was your first instinctive response to this event?",
    "Ego Manifested": "**Your Authority:** What does your heart truly desire in relation to this? What choice serves your authentic will?",
    "Ego Projected": "**Your Authority:** What do you genuinely want? Where is your willpower being correctly directed?",
    "Self Projected": "**Your Authority:** What do you hear yourself saying about this? Your truth emerges through speaking.",
    Mental: "**Your Authority:** Discuss this with trusted others. Your clarity comes through sounding out your thoughts.",
    Lunar: "**Your Authority:** Give yourself a full lunar cycle to gain perspective on this situation.",
  };
  
  return guidance[authority] || "**Your Authority:** Trust your decision-making process.";
}

/**
 * Get closing reflection based on type and direction
 */
function getClosingReflection(type: string, direction: string): string {
  if (direction === "resistance") {
    return `Remember: Resistance often shows where you're not honoring your design. This challenge is an invitation to realign with your ${type} nature.`;
  } else if (direction === "friction") {
    return `This friction can be productive if you work with your ${type} strategy. Use it as fuel for growth.`;
  } else {
    return `You're in flow with your design. Continue following your ${type} strategy and trust the process.`;
  }
}

/**
 * Validate event for processing
 */
export function validateEvent(event: Partial<EventInput>): event is EventInput {
  if (!event.title || event.title.trim().length === 0) {
    throw new Error("Event title is required");
  }
  
  if (!event.description || event.description.trim().length === 0) {
    throw new Error("Event description is required");
  }
  
  if (typeof event.severity !== "number" || event.severity < 1 || event.severity > 10) {
    throw new Error("Severity must be between 1 and 10");
  }
  
  if (!event.category || event.category.trim().length === 0) {
    throw new Error("Event category is required");
  }
  
  if (!event.timestamp) {
    throw new Error("Event timestamp is required");
  }
  
  return true;
}
