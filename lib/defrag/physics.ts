/**
 * Physics Engine
 * Calculates vector mechanics for momentum, velocity, and energy
 * 
 * Models life events as forces that affect an individual's momentum and energy state
 */

export interface VectorState {
  momentum: number;        // Current momentum (accumulated velocity)
  velocity: number;        // Rate of change
  acceleration: number;    // Rate of change of velocity
  frictionCoefficient: number; // Resistance factor (based on stress)
  kineticEnergy: number;   // Energy of motion
  potentialEnergy: number; // Stored energy
  totalEnergy: number;     // Total system energy
}

export interface ForceInput {
  magnitude: number;       // Strength of force (1-10)
  direction: "momentum" | "resistance"; // Direction of force
  duration: number;        // How long the force acts (in days)
}

/**
 * Initialize a new vector state
 */
export function initializeVectorState(): VectorState {
  return {
    momentum: 0,
    velocity: 0,
    acceleration: 0,
    frictionCoefficient: 1.0,
    kineticEnergy: 0,
    potentialEnergy: 0,
    totalEnergy: 0
  };
}

/**
 * Apply a force to a vector state
 * Returns the new state after force application
 */
export function applyForce(
  currentState: VectorState,
  force: ForceInput
): VectorState {
  // Calculate force effect on acceleration
  const forceMagnitude = force.direction === "momentum" 
    ? force.magnitude 
    : -force.magnitude;
  
  // F = ma, so a = F/m (assuming unit mass)
  const acceleration = forceMagnitude;
  
  // Update velocity: v = v0 + at (simplified to single time step)
  const newVelocity = currentState.velocity + acceleration;
  
  // Update momentum: p = mv (assuming unit mass, p = v)
  const newMomentum = currentState.momentum + newVelocity;
  
  // Apply friction to velocity (energy dissipation)
  const velocityAfterFriction = newVelocity * (1 - currentState.frictionCoefficient * 0.1);
  
  // Calculate energies
  const kineticEnergy = 0.5 * Math.pow(velocityAfterFriction, 2);
  const potentialEnergy = Math.max(0, newMomentum * 0.5); // Simplified potential
  const totalEnergy = kineticEnergy + potentialEnergy;
  
  return {
    momentum: newMomentum,
    velocity: velocityAfterFriction,
    acceleration,
    frictionCoefficient: currentState.frictionCoefficient,
    kineticEnergy,
    potentialEnergy,
    totalEnergy
  };
}

/**
 * Update friction coefficient based on stress level
 */
export function updateFriction(
  currentState: VectorState,
  stressLevel: number // 0-10 scale
): VectorState {
  // Higher stress = higher friction (more resistance to movement)
  const newFrictionCoefficient = 0.5 + (stressLevel / 10) * 0.5; // Range: 0.5 - 1.0
  
  return {
    ...currentState,
    frictionCoefficient: newFrictionCoefficient
  };
}

/**
 * Calculate system stability (0-1 scale, 1 = stable)
 */
export function calculateStability(state: VectorState): number {
  // Stability decreases with high velocity and low momentum
  const velocityFactor = Math.min(1, 1 / (Math.abs(state.velocity) + 1));
  const momentumFactor = Math.min(1, Math.abs(state.momentum) / 10);
  const frictionFactor = 1 - state.frictionCoefficient;
  
  return (velocityFactor * 0.4 + momentumFactor * 0.4 + frictionFactor * 0.2);
}

/**
 * Predict future state after time period
 */
export function predictState(
  currentState: VectorState,
  days: number
): VectorState {
  let state = { ...currentState };
  
  // Apply natural decay over time
  for (let i = 0; i < days; i++) {
    // Velocity decays due to friction
    state.velocity *= (1 - state.frictionCoefficient * 0.05);
    
    // Momentum gradually decreases
    state.momentum *= 0.98;
    
    // Recalculate energies
    state.kineticEnergy = 0.5 * Math.pow(state.velocity, 2);
    state.potentialEnergy = Math.max(0, state.momentum * 0.5);
    state.totalEnergy = state.kineticEnergy + state.potentialEnergy;
  }
  
  return state;
}

/**
 * Calculate recovery time to baseline (days)
 */
export function calculateRecoveryTime(state: VectorState): number {
  // Time to return to near-zero velocity
  if (Math.abs(state.velocity) < 0.1) return 0;
  
  const decayRate = state.frictionCoefficient * 0.05;
  const daysToRecover = Math.log(0.1 / Math.abs(state.velocity)) / Math.log(1 - decayRate);
  
  return Math.max(0, Math.ceil(daysToRecover));
}

/**
 * Get system health assessment
 */
export function assessSystemHealth(state: VectorState): {
  status: "healthy" | "stressed" | "critical";
  score: number; // 0-100
  recommendations: string[];
} {
  const stability = calculateStability(state);
  const energyRatio = state.totalEnergy > 0 
    ? state.kineticEnergy / state.totalEnergy 
    : 0;
  const friction = state.frictionCoefficient;
  
  // Calculate overall health score
  const score = Math.round(
    stability * 40 +
    (1 - friction) * 30 +
    Math.min(1, energyRatio) * 30
  );
  
  const recommendations: string[] = [];
  
  if (friction > 0.8) {
    recommendations.push("High stress detected - prioritize rest and recovery");
  }
  if (Math.abs(state.velocity) > 5) {
    recommendations.push("High rate of change - focus on stability practices");
  }
  if (state.momentum < 0) {
    recommendations.push("Negative momentum - address resistance sources");
  }
  if (stability < 0.4) {
    recommendations.push("Low stability - return to strategy and authority");
  }
  
  let status: "healthy" | "stressed" | "critical";
  if (score >= 70) status = "healthy";
  else if (score >= 40) status = "stressed";
  else status = "critical";
  
  return { status, score, recommendations };
}
