/**
 * SEDA Engine (Stress Event Detection & Action)
 * Crisis protocol system for high-severity events
 * Activates when stress levels reach critical thresholds
 */

export interface SEDAProtocol {
  level: number; // 0-4
  status: "monitoring" | "active" | "stabilizing" | "resolved";
  triggerConditions: string[];
  immediateActions: string[];
  stabilizationPlan: string;
  escalationCriteria: string[];
  deescalationCriteria: string[];
  checkInSchedule: {
    frequency: string; // e.g., "every 4 hours", "daily"
    duration: string;  // how long to maintain this schedule
  };
}

/**
 * Activate SEDA protocol based on event severity
 */
export function activateSEDA(
  event: {
    title: string;
    severity: number;
    category: string;
  },
  sedaLevel: number,
  blueprintType: string
): SEDAProtocol {
  const triggerConditions = identifyTriggers(event, sedaLevel);
  const immediateActions = getImmediateActions(sedaLevel, event.category);
  const stabilizationPlan = getStabilizationPlan(sedaLevel, blueprintType);
  const escalationCriteria = getEscalationCriteria(sedaLevel);
  const deescalationCriteria = getDeescalationCriteria(sedaLevel);
  const checkInSchedule = getCheckInSchedule(sedaLevel);
  
  return {
    level: sedaLevel,
    status: "active",
    triggerConditions,
    immediateActions,
    stabilizationPlan,
    escalationCriteria,
    deescalationCriteria,
    checkInSchedule
  };
}

/**
 * Identify what triggered SEDA
 */
function identifyTriggers(event: any, level: number): string[] {
  const triggers: string[] = [];
  
  triggers.push(`High severity event: ${event.title}`);
  triggers.push(`Stress magnitude: ${event.severity}/10`);
  triggers.push(`Category: ${event.category}`);
  
  if (level >= 3) {
    triggers.push("Critical stress threshold exceeded");
  } else if (level >= 2) {
    triggers.push("High stress threshold exceeded");
  } else {
    triggers.push("Elevated stress threshold exceeded");
  }
  
  return triggers;
}

/**
 * Get immediate actions for SEDA level
 */
function getImmediateActions(level: number, category: string): string[] {
  const actions: string[] = [];
  
  // Universal immediate actions
  actions.push("🚨 SEDA PROTOCOL ACTIVATED");
  actions.push("Stop all non-essential activities immediately");
  
  if (level >= 4) {
    // Critical - immediate intervention
    actions.push("⚠️ CRITICAL: Seek immediate professional support");
    actions.push("Contact emergency contacts from your support network");
    actions.push("If health-related: Contact healthcare provider or emergency services");
    actions.push("Create immediate physical and emotional safety");
  } else if (level >= 3) {
    // Severe - urgent action
    actions.push("Reach out to trusted support person within 1 hour");
    actions.push("Clear calendar for next 24-48 hours");
    actions.push("Ensure basic needs (food, water, safe space) are met");
  } else if (level >= 2) {
    // High - significant intervention
    actions.push("Contact a trusted friend or support person");
    actions.push("Clear calendar for next 12-24 hours");
    actions.push("Create a calm, safe environment");
  } else {
    // Elevated - enhanced monitoring
    actions.push("Reduce commitments for next 6-12 hours");
    actions.push("Increase self-care and monitoring");
  }
  
  // Category-specific critical actions
  if (category === "health" && level >= 3) {
    actions.push("DO NOT DELAY: Contact healthcare provider immediately");
  }
  
  return actions;
}

/**
 * Get stabilization plan
 */
function getStabilizationPlan(level: number, type: string): string {
  if (level >= 4) {
    return `CRITICAL STABILIZATION: This requires immediate professional support. Once immediate safety is ensured, focus entirely on basic needs and professional guidance. Your Human Design strategy (${type}) takes a back seat to immediate stabilization. Recovery timeline: 2-4 weeks minimum.`;
  } else if (level >= 3) {
    return `SEVERE STABILIZATION: Clear all non-essential commitments for 3-7 days. Focus on: 1) Professional support if needed, 2) Basic self-care, 3) Trusted relationships, 4) Gentle return to your Strategy (${type}). Expected stabilization: 1-2 weeks.`;
  } else if (level >= 2) {
    return `HIGH-LEVEL STABILIZATION: Reduce activities by 50% for 2-5 days. Focus on rest, support, and honoring your ${type} strategy. Begin rebuilding stability through your Authority. Expected stabilization: 3-7 days.`;
  } else {
    return `ELEVATED MONITORING: Maintain heightened awareness for 1-3 days. Honor your ${type} design more strictly than usual. Return to baseline expected within 2-4 days.`;
  }
}

/**
 * Get criteria for escalation to higher SEDA level
 */
function getEscalationCriteria(level: number): string[] {
  const criteria: string[] = [];
  
  if (level === 4) {
    criteria.push("Already at maximum level - seek emergency intervention if worsening");
  } else {
    criteria.push("Symptoms worsening despite protocol adherence");
    criteria.push("New high-severity events compound the situation");
    criteria.push("Unable to maintain basic self-care");
    
    if (level >= 2) {
      criteria.push("Suicidal ideation or self-harm thoughts");
      criteria.push("Complete inability to function");
    }
  }
  
  return criteria;
}

/**
 * Get criteria for de-escalation
 */
function getDeescalationCriteria(level: number): string[] {
  return [
    "Stable improvement for 24+ hours",
    "Able to maintain basic routines",
    "Support systems engaged and responsive",
    "Return of hope and perspective",
    "Physical symptoms stabilizing",
    "Able to access your Authority again"
  ];
}

/**
 * Get check-in schedule
 */
function getCheckInSchedule(level: number): { frequency: string; duration: string } {
  if (level >= 4) {
    return {
      frequency: "Every 2-4 hours",
      duration: "Until level drops to 3 or below"
    };
  } else if (level >= 3) {
    return {
      frequency: "Every 6-8 hours",
      duration: "First 48 hours, then reduce to daily"
    };
  } else if (level >= 2) {
    return {
      frequency: "Twice daily (morning/evening)",
      duration: "First 3-5 days"
    };
  } else {
    return {
      frequency: "Daily check-in",
      duration: "First 2-3 days"
    };
  }
}

/**
 * Assess if SEDA can be deactivated
 */
export function assessDeactivation(
  protocol: SEDAProtocol,
  recentEvents: Array<{ severity: number; timestamp: Date }>
): { canDeactivate: boolean; reason: string } {
  // Must be at level 1 or monitoring status
  if (protocol.level > 1 && protocol.status !== "stabilizing") {
    return {
      canDeactivate: false,
      reason: "Level too high or status not stabilizing"
    };
  }
  
  // Check for recent high-severity events
  const recentHighSeverity = recentEvents.some(
    e => e.severity >= 7 && Date.now() - e.timestamp.getTime() < 48 * 60 * 60 * 1000
  );
  
  if (recentHighSeverity) {
    return {
      canDeactivate: false,
      reason: "High-severity event within last 48 hours"
    };
  }
  
  // If stabilizing for 48+ hours, can deactivate
  return {
    canDeactivate: true,
    reason: "Stability maintained, safe to return to normal monitoring"
  };
}
