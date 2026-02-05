/**
 * SEDA (Stabilize, Establish, Direct, Actualize) Protocol
 * Crisis intervention system for high-severity events
 */

/**
 * SEDA Protocol Version
 */
export const SEDA_VERSION = "v2";

/**
 * SEDA Phase definitions
 */
export type SEDAPhase = "stabilize" | "establish" | "direct" | "actualize";

/**
 * SEDA Session state
 */
export interface SEDASession {
  userId: string;
  blueprintId?: string;
  triggerEventId?: string;
  severityAtTrigger: number;
  keywordsMatched: string[];
  currentPhase: SEDAPhase;
  phasesCompleted: SEDAPhase[];
  startTime: Date;
  responses: Record<SEDAPhase, string | null>;
  assessments: {
    immediateSafety: boolean;
    professionalHelpNeeded: boolean;
    supportSystemAvailable: boolean;
  };
}

/**
 * SEDA Phase content structure
 */
interface SEDAPhaseContent {
  title: string;
  objective: string;
  prompts: string[];
  assessmentQuestions: string[];
  completionCriteria: string;
  duration: string;
}

/**
 * Complete SEDA protocol content
 */
const SEDA_PROTOCOL: Record<SEDAPhase, SEDAPhaseContent> = {
  stabilize: {
    title: "Stabilize",
    objective: "Ensure immediate safety and reduce acute distress",
    prompts: [
      "First, I need to know: Are you physically safe right now?",
      "Let's focus on this moment. Take three deep breaths with me.",
      "Your nervous system is in high alert. That's your body trying to protect you, and we're going to help it calm down.",
      "Can you find something nearby to ground you? Touch something textured, cold, or warm.",
    ],
    assessmentQuestions: [
      "Are you in immediate danger?",
      "Do you have thoughts of harming yourself or others?",
      "Are you currently using substances?",
      "Is there someone you can be with right now?",
    ],
    completionCriteria: "User confirms physical safety and shows reduced acute distress",
    duration: "5-10 minutes",
  },
  establish: {
    title: "Establish",
    objective: "Create clarity about what happened and validate the experience",
    prompts: [
      "You're safe now, and we can take our time. What happened?",
      "There's no wrong way to feel about this. Whatever you're experiencing is valid.",
      "Let's name what you're feeling. Sometimes just naming it reduces its power.",
      "This reaction makes sense given what you've been through. Your system is responding exactly as it should.",
    ],
    assessmentQuestions: [
      "What triggered this crisis?",
      "How long have you been feeling this way?",
      "Have you experienced something similar before?",
      "What typically helps you feel better?",
    ],
    completionCriteria: "User has articulated their experience and feels validated",
    duration: "10-15 minutes",
  },
  direct: {
    title: "Direct",
    objective: "Identify immediate next steps and available resources",
    prompts: [
      "Let's figure out what you need right now—not tomorrow, not next week, but in the next hour.",
      "Who in your life knows how to help you when you're struggling?",
      "What has worked for you before when things felt this hard?",
      "Let's make a specific plan for the next 24 hours.",
    ],
    assessmentQuestions: [
      "Do you have a therapist or counselor you can contact?",
      "Who can you reach out to for support tonight?",
      "What specific action would help you feel even slightly better?",
      "Do you need help connecting to professional resources?",
    ],
    completionCriteria: "User has identified specific resources and immediate next steps",
    duration: "10-15 minutes",
  },
  actualize: {
    title: "Actualize",
    objective: "Commit to action and establish follow-up",
    prompts: [
      "Let's commit to one small action you'll take in the next hour.",
      "I'm going to check in with you. When would be a good time?",
      "You've moved through something incredibly difficult. That takes real strength.",
      "This crisis is showing you something important about what needs to change. We'll work on that together, but first, just focus on getting through today.",
    ],
    assessmentQuestions: [
      "What specific action will you take in the next hour?",
      "Who will you tell about this conversation?",
      "When can we follow up to see how you're doing?",
      "What will you do if things get worse before we connect again?",
    ],
    completionCriteria: "User has committed to immediate action and follow-up is scheduled",
    duration: "5-10 minutes",
  },
};

/**
 * Emergency resources
 */
export const EMERGENCY_RESOURCES = {
  us: {
    suicidePrevention: {
      name: "988 Suicide & Crisis Lifeline",
      phone: "988",
      text: "Text 'HELLO' to 741741",
      web: "https://988lifeline.org",
    },
    domesticViolence: {
      name: "National Domestic Violence Hotline",
      phone: "1-800-799-7233",
      text: "Text 'START' to 88788",
      web: "https://www.thehotline.org",
    },
    substanceAbuse: {
      name: "SAMHSA National Helpline",
      phone: "1-800-662-4357",
      web: "https://www.samhsa.gov/find-help/national-helpline",
    },
    mentalHealth: {
      name: "NAMI Helpline",
      phone: "1-800-950-6264",
      text: "Text 'NAMI' to 741741",
      web: "https://www.nami.org/help",
    },
  },
  international: {
    name: "International Crisis Lines",
    web: "https://findahelpline.com",
  },
};

/**
 * Initiates a SEDA protocol session
 */
export function initiateSEDA(
  userId: string,
  severityAtTrigger: number,
  keywordsMatched: string[],
  blueprintId?: string,
  triggerEventId?: string
): SEDASession {
  return {
    userId,
    blueprintId,
    triggerEventId,
    severityAtTrigger,
    keywordsMatched,
    currentPhase: "stabilize",
    phasesCompleted: [],
    startTime: new Date(),
    responses: {
      stabilize: null,
      establish: null,
      direct: null,
      actualize: null,
    },
    assessments: {
      immediateSafety: false,
      professionalHelpNeeded: false,
      supportSystemAvailable: false,
    },
  };
}

/**
 * Gets content for current SEDA phase
 */
export function getPhaseContent(phase: SEDAPhase): SEDAPhaseContent {
  return SEDA_PROTOCOL[phase];
}

/**
 * Advances SEDA session to next phase
 */
export function advancePhase(
  session: SEDASession,
  response: string,
  assessmentAnswers: Record<string, boolean | string>
): SEDASession {
  // Record response for current phase
  session.responses[session.currentPhase] = response;

  // Mark current phase as completed
  session.phasesCompleted.push(session.currentPhase);

  // Update assessments based on phase
  if (session.currentPhase === "stabilize") {
    session.assessments.immediateSafety = assessmentAnswers.safe === true;
    session.assessments.professionalHelpNeeded =
      assessmentAnswers.harmThoughts === true || assessmentAnswers.substances === true;
    session.assessments.supportSystemAvailable = assessmentAnswers.hasSomeone === true;
  }

  // Determine next phase
  const phaseOrder: SEDAPhase[] = ["stabilize", "establish", "direct", "actualize"];
  const currentIndex = phaseOrder.indexOf(session.currentPhase);

  if (currentIndex < phaseOrder.length - 1) {
    session.currentPhase = phaseOrder[currentIndex + 1];
  }

  return session;
}

/**
 * Checks if SEDA session is complete
 */
export function isSEDAComplete(session: SEDASession): boolean {
  return session.phasesCompleted.length === 4;
}

/**
 * Generates follow-up plan from completed SEDA session
 */
export function generateFollowUpPlan(session: SEDASession): {
  immediateActions: string[];
  checkInSchedule: string;
  resources: typeof EMERGENCY_RESOURCES.us;
  professionalReferralNeeded: boolean;
} {
  const immediateActions: string[] = [];

  // Extract actions from responses
  if (session.responses.direct) {
    immediateActions.push("Complete the immediate next step identified in Direct phase");
  }

  if (session.responses.actualize) {
    immediateActions.push("Take the committed action from Actualize phase");
  }

  // Always include grounding
  immediateActions.push("Practice grounding techniques when distress increases");

  // Add resource-seeking if needed
  if (session.assessments.professionalHelpNeeded) {
    immediateActions.push("Contact a mental health professional within 24 hours");
  }

  // Default check-in timing based on severity
  const checkInSchedule =
    session.severityAtTrigger >= 8
      ? "Within 2-4 hours"
      : session.severityAtTrigger >= 6
        ? "Within 24 hours"
        : "Within 48 hours";

  return {
    immediateActions,
    checkInSchedule,
    resources: EMERGENCY_RESOURCES.us,
    professionalReferralNeeded: session.assessments.professionalHelpNeeded,
  };
}

/**
 * Determines if user needs immediate emergency intervention
 */
export function needsEmergencyIntervention(
  responses: Record<string, boolean | string>
): {
  needsIntervention: boolean;
  reason: string;
  recommendedAction: string;
} {
  // Check for immediate danger
  if (responses.immediateDanger === true) {
    return {
      needsIntervention: true,
      reason: "User reports immediate danger",
      recommendedAction: "Call 911 or go to nearest emergency room",
    };
  }

  // Check for suicidal ideation
  if (responses.harmThoughts === true) {
    return {
      needsIntervention: true,
      reason: "User reports thoughts of self-harm",
      recommendedAction: "Call 988 Suicide & Crisis Lifeline immediately",
    };
  }

  // Check for substance use in crisis
  if (responses.substances === true && responses.safe === false) {
    return {
      needsIntervention: true,
      reason: "User reports substance use while in crisis",
      recommendedAction:
        "Call SAMHSA National Helpline (1-800-662-4357) or 911 if in immediate danger",
    };
  }

  return {
    needsIntervention: false,
    reason: "",
    recommendedAction: "",
  };
}

/**
 * Calculates SEDA protocol completion metrics
 */
export function calculateSEDAMetrics(session: SEDASession): {
  timeInProtocol: number; // seconds
  phasesCompleted: number;
  completionRate: number; // 0-1
  followUpRequired: boolean;
} {
  const now = new Date();
  const timeInProtocol = Math.floor(
    (now.getTime() - session.startTime.getTime()) / 1000
  );

  const phasesCompleted = session.phasesCompleted.length;
  const completionRate = phasesCompleted / 4;

  const followUpRequired =
    session.assessments.professionalHelpNeeded ||
    !session.assessments.immediateSafety ||
    !session.assessments.supportSystemAvailable;

  return {
    timeInProtocol,
    phasesCompleted,
    completionRate,
    followUpRequired,
  };
}
