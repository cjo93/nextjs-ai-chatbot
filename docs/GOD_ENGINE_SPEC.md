# God Engine Specification

## Overview

The God Engine is the knowledge base for DEFRAG's Human Design system integration. It contains all gate definitions, type characteristics, center properties, and inversion protocols.

## Data Structure

### Directory Layout

```
lib/defrag/god-engine/
├── gates/
│   ├── gate-001.json
│   ├── gate-002.json
│   └── ... (gate-064.json)
├── types/
│   ├── generator.json
│   ├── manifestor.json
│   ├── projector.json
│   ├── reflector.json
│   └── manifesting-generator.json
├── centers/
│   ├── head.json
│   ├── ajna.json
│   ├── throat.json
│   ├── g-center.json
│   ├── heart.json
│   ├── solar-plexus.json
│   ├── sacral.json
│   ├── spleen.json
│   └── root.json
└── loader.ts
```

## Gate Structure

Each gate file (`gate-XXX.json`) follows this schema:

```json
{
  "id": 1,
  "hexagram": 1,
  "name": "The Creative",
  "circuit": "Individual",
  "subcircuit": "Knowing",
  "center": "g-center",
  "quarter": "Initiation",
  "theme": "Purpose",
  "shadow": "ENTROPY",
  "gift": "FRESHNESS",
  "siddhi": "BEAUTY",
  "keywords": {
    "shadow": ["stuck", "stagnant", "repetitive", "boring"],
    "gift": ["fresh", "innovative", "spontaneous", "new"],
    "siddhi": ["beauty", "perfection", "divine"]
  },
  "description": {
    "shadow": "The Shadow of Entropy is the state of being stuck in repetitive patterns, unable to create anything new.",
    "gift": "The Gift of Freshness brings spontaneous creativity and the ability to see things with new eyes.",
    "siddhi": "The Siddhi of Beauty is the recognition of divine perfection in all things."
  },
  "inversion_protocols": [
    {
      "severity_level": 2,
      "trigger_contexts": ["stuck", "blocked", "repetitive"],
      "script_template": "You're experiencing the Shadow of Entropy. This gate thrives on FRESHNESS. Your experiment: {{experiment}}",
      "somatic_anchor": "Place both hands on your heart center. Feel the stagnation. Now imagine fresh spring water flowing through you.",
      "experiment": {
        "hypothesis": "If I intentionally disrupt my routine, I will experience more creative flow",
        "action": "Change one major habit for 3 days (different route to work, new morning routine, etc.)",
        "success_criteria": [
          "Feel less stuck",
          "Generate at least one new idea",
          "Notice increased energy"
        ],
        "duration_days": 3
      }
    },
    {
      "severity_level": 4,
      "trigger_contexts": ["crisis", "breakdown", "despair"],
      "script_template": "SEDA PROTOCOL: This is the Shadow of Entropy in full distortion. You need immediate grounding. {{somatic_anchor}}",
      "somatic_anchor": "Sit or lie down. Place one hand on belly, one on heart. Breathe: 4 counts in, 7 counts hold, 8 counts out. Repeat 5 times.",
      "experiment": {
        "hypothesis": "Physical grounding will restore my sense of fresh possibility",
        "action": "Spend 20 minutes in nature touching different textures (bark, grass, water, stone)",
        "success_criteria": [
          "Breathing normalized",
          "Body feels present",
          "One small action feels possible"
        ],
        "duration_days": 1
      }
    }
  ],
  "planetaryActivations": {
    "sun": "Core identity and life purpose",
    "earth": "Grounding and supportive energy",
    "moon": "Emotional and intuitive drive",
    "north_node": "Life direction and growth",
    "south_node": "Past life gifts and talents"
  }
}
```

## Type Structure

Each type file follows this schema:

```json
{
  "id": "generator",
  "name": "Generator",
  "percentage": 37,
  "strategy": "To Respond",
  "notSelfTheme": "Frustration",
  "signature": "Satisfaction",
  "description": "Generators are the builders and life force of humanity. They have a defined Sacral center and must wait to respond to life.",
  "characteristics": {
    "defined_centers": ["sacral"],
    "aura": "Open and enveloping",
    "sleep": "Go to bed before tired to discharge excess energy",
    "decision_making": "Wait for gut response, listen to sacral sounds"
  },
  "authorities": {
    "sacral": "Pure Sacral Authority - respond with gut sounds (uh-huh/uhn-uhn)",
    "emotional": "Emotional Authority - wait for emotional clarity",
    "splenic": "Splenic Authority - trust instinctive knowing in the moment"
  },
  "physics_constants": {
    "base_mass": 5.0,
    "base_permeability": 0.7,
    "base_elasticity": 0.8,
    "modifiers": {
      "defined_solar_plexus": {
        "mass": 1.2,
        "permeability": 0.8
      },
      "defined_heart": {
        "mass": 1.1,
        "elasticity": 0.9
      }
    }
  },
  "common_challenges": {
    "not_responding": {
      "description": "Initiating without waiting for something to respond to",
      "symptoms": ["frustration", "exhaustion", "wrong opportunities"],
      "remedy": "Practice noticing opportunities to respond throughout the day"
    },
    "ignoring_sacral": {
      "description": "Overriding gut response with mental reasoning",
      "symptoms": ["confusion", "regret", "lack of satisfaction"],
      "remedy": "Ask yes/no questions and listen for sacral sounds"
    }
  }
}
```

## Center Structure

Each center file follows this schema:

```json
{
  "id": "solar-plexus",
  "name": "Solar Plexus",
  "aka": "Emotional Center",
  "color": "orange",
  "bodyLocation": "Below ribcage, above navel",
  "theme": "Emotions and feelings",
  "motor": true,
  "awareness": false,
  "gates": [6, 22, 36, 37, 49, 55],
  "defined": {
    "description": "You have consistent emotional waves. Your emotions are a reliable authority when given time.",
    "characteristics": [
      "Experience emotional waves",
      "Can be sensitive to others' emotions",
      "Need time to gain emotional clarity",
      "Can influence emotional atmosphere"
    ],
    "authority": "Emotional Authority - Wait through emotional wave before deciding",
    "physics_impact": {
      "mass": 1.3,
      "permeability": 0.6
    }
  },
  "undefined": {
    "description": "You sample and amplify others' emotions but release them. You can be emotionally wise.",
    "characteristics": [
      "Take in and amplify others' emotions",
      "Can avoid confrontation to escape emotions",
      "Potential for emotional wisdom",
      "Important to release amplified emotions"
    ],
    "not_self": "Avoiding emotional truth or confrontation",
    "physics_impact": {
      "permeability": 1.2,
      "elasticity": 0.6
    }
  },
  "open": {
    "description": "Completely open Solar Plexus - you are here to learn emotional wisdom without consistency.",
    "characteristics": [
      "Sample all emotional frequencies",
      "Can become emotionally wise over time",
      "Vulnerable to emotional conditioning",
      "Should never make decisions in emotional moments"
    ],
    "physics_impact": {
      "permeability": 1.5,
      "elasticity": 0.5
    }
  }
}
```

## Loader Implementation

The `loader.ts` file provides caching and access:

```typescript
// lib/defrag/god-engine/loader.ts

import type { Gate, Type, Center } from './types';

let gateCache: Map<number, Gate> | null = null;
let typeCache: Map<string, Type> | null = null;
let centerCache: Map<string, Center> | null = null;

export async function loadGate(gateNumber: number): Promise<Gate> {
  if (!gateCache) {
    gateCache = new Map();
  }
  
  if (gateCache.has(gateNumber)) {
    return gateCache.get(gateNumber)!;
  }
  
  const gate = await import(`./gates/gate-${String(gateNumber).padStart(3, '0')}.json`);
  gateCache.set(gateNumber, gate.default);
  return gate.default;
}

export async function loadAllGates(): Promise<Gate[]> {
  const gates: Gate[] = [];
  for (let i = 1; i <= 64; i++) {
    gates.push(await loadGate(i));
  }
  return gates;
}

export async function loadType(typeName: string): Promise<Type> {
  if (!typeCache) {
    typeCache = new Map();
  }
  
  if (typeCache.has(typeName)) {
    return typeCache.get(typeName)!;
  }
  
  const type = await import(`./types/${typeName}.json`);
  typeCache.set(typeName, type.default);
  return type.default;
}

export async function loadCenter(centerName: string): Promise<Center> {
  if (!centerCache) {
    centerCache = new Map();
  }
  
  if (centerCache.has(centerName)) {
    return centerCache.get(centerName)!;
  }
  
  const center = await import(`./centers/${centerName}.json`);
  centerCache.set(centerName, center.default);
  return center.default;
}

export function clearCache(): void {
  gateCache = null;
  typeCache = null;
  centerCache = null;
}
```

## Inversion Protocol Selection

The inversion engine matches context to protocols:

1. **Extract keywords** from event context
2. **Match to gate shadow keywords** 
3. **Check severity level** compatibility
4. **Select appropriate protocol** for that gate + severity
5. **Generate script** using template
6. **Create experiment** from experiment definition
7. **Apply somatic anchor** for grounding

## Physics Constants Derivation

Physics constants are derived from blueprint:

```typescript
function derivePhysicsConstants(blueprint: Blueprint): PhysicsConstants {
  const type = await loadType(blueprint.humanDesign.type);
  
  let mass = type.physics_constants.base_mass;
  let permeability = type.physics_constants.base_permeability;
  let elasticity = type.physics_constants.base_elasticity;
  
  // Apply center modifiers
  for (const center of blueprint.humanDesign.definedCenters) {
    const centerData = await loadCenter(center);
    if (centerData.defined.physics_impact) {
      mass *= centerData.defined.physics_impact.mass || 1.0;
      permeability *= centerData.defined.physics_impact.permeability || 1.0;
      elasticity *= centerData.defined.physics_impact.elasticity || 1.0;
    }
  }
  
  return { mass, permeability, elasticity };
}
```

## Data Sources

Gate, type, and center definitions should be sourced from:

1. **Gene Keys** by Richard Rudd (for Shadow/Gift/Siddhi)
2. **Human Design** by Ra Uru Hu (for gates, types, centers)
3. **The Definitive Book of Human Design** by Lynda Bunnell & Ra Uru Hu
4. **Inversion protocols** are custom-created based on Gene Keys framework

## Implementation Priority

1. **Phase 1**: Implement 10 core gates (1, 2, 3, 4, 5, 7, 13, 27, 29, 59)
2. **Phase 2**: All 5 types with basic physics constants
3. **Phase 3**: All 9 centers with physics impacts
4. **Phase 4**: Complete all 64 gates
5. **Phase 5**: Refine inversion protocols based on user feedback

## Quality Assurance

Each gate definition should be:
- Verified against source material
- Reviewed by Human Design expert
- Tested with real user scenarios
- Refined based on feedback

## Updates and Versioning

- Gate data versioned in JSON files
- Changes tracked in Git
- Migration path for updated protocols
- Backward compatibility maintained
