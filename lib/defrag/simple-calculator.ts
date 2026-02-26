/**
 * MVP Human Design Calculator
 * Generates basic chart information for demonstration
 */

export interface SimpleChartData {
  type: string;
  strategy: string;
  authority: string;
  profile: string;
  description: string;
}

/**
 * Generates a simplified Human Design chart
 * Note: This is a placeholder for MVP. Production should use accurate ephemeris calculations.
 */
export function calculateSimpleChart(birthDate: Date): SimpleChartData {
  // Extract date components for calculation
  const month = birthDate.getMonth() + 1;
  const day = birthDate.getDate();
  const year = birthDate.getFullYear();
  
  // Create a simple hash from birth data
  const birthHash = (month * 100) + day + (year % 100);
  
  // Define Human Design types with their characteristics
  const designTypes = {
    0: { name: "Generator", action: "Wait to respond" },
    1: { name: "Manifesting Generator", action: "Wait to respond, then inform" },
    2: { name: "Projector", action: "Wait for invitation" },
    3: { name: "Manifestor", action: "Inform before acting" },
    4: { name: "Reflector", action: "Wait 28 days" },
  };
  
  const selectedType = designTypes[birthHash % 5 as keyof typeof designTypes];
  
  // Authority options
  const authorityList = ["Emotional", "Sacral", "Splenic", "Ego", "Self-Projected", "Mental", "Lunar"];
  const selectedAuthority = authorityList[(day + month) % 7];
  
  // Calculate profile lines
  // Note: In actual Human Design, only certain profile combinations are valid (1/3, 1/4, 2/4, 2/5, 3/5, 3/6, 4/6, 5/1, 5/2, 6/2, 6/3)
  // This MVP calculator may generate invalid combinations for simplicity
  // Invalid profiles will still display but may not have accurate interpretations
  // Production version should use proper ephemeris calculation with valid profile logic
  const firstLine = ((birthHash % 6) + 1);
  const secondLine = ((Math.floor(birthHash / 10) % 6) + 1);
  const profileNumbers = `${firstLine}/${secondLine}`;
  
  const summaryText = `You are a ${selectedType.name} with ${selectedAuthority} authority. Your strategy is to ${selectedType.action}.`;

  return {
    type: selectedType.name,
    strategy: selectedType.action,
    authority: selectedAuthority,
    profile: profileNumbers,
    description: summaryText,
  };
}
