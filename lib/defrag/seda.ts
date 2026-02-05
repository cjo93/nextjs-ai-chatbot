/**
 * DEFRAG SEDA Protocol
 * Somatic Emergency De-escalation Algorithm
 */

/**
 * SEDA trigger keywords (crisis detection)
 */
export const SEDA_KEYWORDS = [
  "suicide",
  "suicidal",
  "kill myself",
  "end my life",
  "end it all",
  "want to die",
  "can't go on",
  "no point living",
  "no reason to live",
  "self-harm",
  "hurt myself",
  "cut myself",
  "emergency",
  "crisis",
  "breakdown",
  "can't cope",
  "losing it",
  "completely lost",
];

/**
 * SEDA protocol phases
 */
export const SEDA_PHASES = {
  phase1: {
    name: "Somatic Grounding",
    duration: "2-3 minutes",
    instructions: [
      "Place both feet flat on the floor",
      "Feel the ground beneath you",
      "Press your hands firmly on your thighs",
      "Take 3 deep breaths: 4 counts in, hold 4, 8 counts out",
      "Say out loud: 'I am here. I am safe right now.'",
    ],
  },
  phase2: {
    name: "Resource Activation",
    duration: "3-5 minutes",
    instructions: [
      "Look around the room and name 5 things you can see",
      "Name 4 things you can touch",
      "Name 3 things you can hear",
      "Name 2 things you can smell",
      "Name 1 thing you can taste",
      "This is called the 5-4-3-2-1 technique",
    ],
  },
  phase3: {
    name: "Connection Check",
    duration: "5 minutes",
    instructions: [
      "Text or call someone you trust",
      "If no one is available, call a crisis hotline",
      "National Suicide Prevention Lifeline: 988",
      "Crisis Text Line: Text HOME to 741741",
      "You don't have to explain everything. Just say you need support.",
    ],
  },
  phase4: {
    name: "Commitment to Safety",
    duration: "5 minutes",
    instructions: [
      "Can you commit to staying safe for the next hour?",
      "Remove any immediate means of harm from your space",
      "Make a list of 3 actions you'll take if thoughts return",
      "Save these crisis numbers in your phone now",
      "Remember: This is a moment, not forever",
    ],
  },
};

/**
 * Check if SEDA protocol should be triggered
 */
export function checkSEDATrigger(context: string, severity: number): boolean {
  const lowerContext = context.toLowerCase();

  // Check for keywords
  const hasKeyword = SEDA_KEYWORDS.some((keyword) =>
    lowerContext.includes(keyword)
  );

  // High severity + keywords = trigger
  if (hasKeyword && severity >= 4) {
    return true;
  }

  // Multiple strong keywords even at lower severity
  const keywordCount = SEDA_KEYWORDS.filter((keyword) =>
    lowerContext.includes(keyword)
  ).length;

  return keywordCount >= 2;
}

/**
 * Get SEDA protocol instructions
 */
export function getSEDAProtocol(): {
  message: string;
  phases: typeof SEDA_PHASES;
  resources: Array<{ name: string; contact: string; available: string }>;
} {
  return {
    message: `🚨 CRISIS SUPPORT ACTIVATED

You're in a moment of intense distortion. This is the SEDA Protocol—designed to help you regulate right now.

**THIS IS CRITICAL**: If you are in immediate danger, please call 911 or go to your nearest emergency room.

If you're safe enough to proceed, we'll go through 4 phases together. Each phase is designed to bring you back into your body and out of the crisis state.`,

    phases: SEDA_PHASES,

    resources: [
      {
        name: "National Suicide Prevention Lifeline",
        contact: "988",
        available: "24/7",
      },
      {
        name: "Crisis Text Line",
        contact: "Text HOME to 741741",
        available: "24/7",
      },
      {
        name: "SAMHSA National Helpline",
        contact: "1-800-662-4357",
        available: "24/7",
      },
      {
        name: "Veterans Crisis Line",
        contact: "988 then press 1",
        available: "24/7",
      },
      {
        name: "Trevor Project (LGBTQ Youth)",
        contact: "1-866-488-7386",
        available: "24/7",
      },
    ],
  };
}

/**
 * Get follow-up protocol after SEDA
 */
export function getSEDAFollowUp(): {
  title: string;
  instructions: string[];
  checkInSchedule: string;
} {
  return {
    title: "Post-SEDA Care Plan",
    instructions: [
      "Schedule appointment with mental health professional within 48 hours",
      "Share this experience with your support person",
      "Complete a safety plan with specific contacts and coping strategies",
      "Monitor for return of crisis thoughts",
      "Return to SEDA protocol if needed—no limit on usage",
      "Consider inpatient care if thoughts persist or intensify",
    ],
    checkInSchedule:
      "DEFRAG will check in with you in 24 hours, 48 hours, and 7 days",
  };
}

/**
 * Format SEDA protocol for display
 */
export function formatSEDADisplay(): string {
  const protocol = getSEDAProtocol();
  let display = protocol.message + "\n\n";

  display += "## IMMEDIATE CRISIS RESOURCES\n\n";
  for (const resource of protocol.resources) {
    display += `**${resource.name}**\n`;
    display += `${resource.contact}\n`;
    display += `Available: ${resource.available}\n\n`;
  }

  display += "---\n\n";
  display += "## THE 4-PHASE PROTOCOL\n\n";

  for (const [phaseKey, phase] of Object.entries(protocol.phases)) {
    display += `### ${phase.name} (${phase.duration})\n\n`;
    for (let i = 0; i < phase.instructions.length; i++) {
      display += `${i + 1}. ${phase.instructions[i]}\n`;
    }
    display += "\n";
  }

  const followUp = getSEDAFollowUp();
  display += "---\n\n";
  display += `## ${followUp.title}\n\n`;
  for (let i = 0; i < followUp.instructions.length; i++) {
    display += `${i + 1}. ${followUp.instructions[i]}\n`;
  }
  display += `\n**${followUp.checkInSchedule}**\n`;

  return display;
}

/**
 * Log SEDA event (for tracking and follow-up)
 */
export interface SEDAEventData {
  userId: string;
  blueprintId?: string;
  triggerSource: string;
  severityAtTrigger: number;
  keywordsMatched: string[];
  userContext: string;
  protocolVersion: string;
}

/**
 * Create SEDA event log entry
 */
export function createSEDAEvent(data: SEDAEventData): SEDAEventData {
  return {
    ...data,
    protocolVersion: "v2",
  };
}
