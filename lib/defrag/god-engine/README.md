# DEFRAG God Engine

The God Engine is the complete data foundation for the DEFRAG Human Design system. It contains comprehensive data for all gates, types, and centers.

## Structure

```
god-engine/
├── gates/           # All 64 gates (gate-001.json through gate-064.json)
├── types/           # All 5 Human Design types
├── centers/         # All 9 energy centers
└── index.ts         # TypeScript interface and loader
```

## Data Completeness

### ✅ Gates (64/64)
- **Priority Gates (24)**: Complete with detailed frequency data (shadow/gift/siddhi), behavioral signatures, somatic anchors, and inversion protocols
  - Most activated: 1, 2, 7, 13, 25, 27, 29, 34, 46, 59
  - Solar Plexus: 6, 22, 30, 36, 37, 49, 55
  - Throat: 8, 12, 20, 31, 33, 35, 45

- **Remaining Gates (40)**: Core structure with shadow/gift/siddhi, center assignments, and basic protocols

Each gate includes:
- I Ching name and meaning
- Shadow, Gift, and Siddhi frequencies
- Behavioral and somatic signatures
- Circuit assignment (Individual/Collective/Tribal)
- Center assignment
- Inversion protocols with experiments

### ✅ Types (5/5)
Complete profiles for all Human Design types:
1. **Generator** (37% of population)
2. **Projector** (20% of population)
3. **Manifestor** (9% of population)
4. **Reflector** (1% of population)
5. **Manifesting Generator** (33% of population)

Each type includes:
- Physics (aura, energy mechanics)
- Strategy and authority
- Signature and not-self theme
- Failure states with corrections
- Relationship dynamics with all other types
- Career alignment
- Rest requirements
- Communication and conflict resolution
- Core wounds and healing modalities
- Spiritual pathway

### ✅ Centers (9/9)
Complete data for all energy centers:
1. **Head** - Inspiration and mental pressure
2. **Ajna** - Mental awareness and conceptualization
3. **Throat** - Communication and manifestation
4. **G Center** - Identity and direction
5. **Heart/Ego** - Willpower and self-worth
6. **Solar Plexus** - Emotional awareness
7. **Sacral** - Life force energy
8. **Spleen** - Intuition and immune system
9. **Root** - Adrenaline pressure

Each center includes:
- Function and neural correlate
- Gates associated with center
- Defined vs Open mechanics
- Conditioning patterns
- Somatic scan instructions
- Regulation techniques
- Neuroception (safety/threat signals)

## Usage

### TypeScript Interface

```typescript
import { godEngine, loadGate, loadType, loadCenter } from '@/lib/defrag/god-engine';

// Load a specific gate
const gate1 = await godEngine.getGate(1);
console.log(gate1.frequencies.shadow.name); // "ENTROPY"

// Load a type profile
const generator = await godEngine.getType("Generator");
console.log(generator.strategy.name); // "To Respond"

// Load a center
const sacral = await godEngine.getCenter("SACRAL");
console.log(sacral.function); // "Life force energy and response"

// Get all gates for a center
const sacralGates = await godEngine.getGatesByCenter("SACRAL");
console.log(sacralGates.length); // 9 gates

// Get inversion protocol
const protocol = await godEngine.getInversionProtocol(1, 2);
console.log(protocol?.script); // Entropy script
```

### Direct JSON Import

```typescript
import gate1 from '@/lib/defrag/god-engine/gates/gate-001.json';
import generator from '@/lib/defrag/god-engine/types/generator.json';
import sacral from '@/lib/defrag/god-engine/centers/sacral.json';
```

## Data Format

### Gate Example
```json
{
  "id": 1,
  "label": "The Creative",
  "i_ching_name": "Qian / The Creative",
  "frequencies": {
    "shadow": {
      "name": "ENTROPY",
      "description": "...",
      "behavioral_signature": "...",
      "somatic_signature": "...",
      "thought_pattern": "...",
      "emotional_state": "..."
    },
    "gift": { ... },
    "siddhi": { ... }
  },
  "circuit": "Individual",
  "center": "G_CENTER",
  "inversion_protocols": [ ... ]
}
```

### Type Example
```json
{
  "type": "Generator",
  "percentage_of_population": 37,
  "physics": { ... },
  "strategy": {
    "name": "To Respond",
    "description": "...",
    "mechanics": "..."
  },
  "signature": { ... },
  "not_self_theme": { ... },
  ...
}
```

### Center Example
```json
{
  "name": "sacral",
  "display_name": "Sacral Center",
  "function": "Life force energy and response",
  "gates": [3, 9, 14, 27, 29, 34, 42, 5, 59],
  "defined_mechanics": { ... },
  "open_mechanics": { ... },
  ...
}
```

## Integration Points

The God Engine data is used by:

1. **Blueprint Calculator** - Determines user's gates, type, centers
2. **SEDA Event Processor** - Matches events to gate distortions
3. **Inversion Protocol Generator** - Creates personalized scripts
4. **Relationship Compatibility** - Analyzes type dynamics
5. **Vector State Calculator** - Maps emotional/behavioral state
6. **Experiment Designer** - Creates personalized experiments

## Future Enhancements

Planned additions:
- [ ] Channel definitions (36 channels)
- [ ] Authority detailed breakdowns
- [ ] Profile line descriptions (1-6)
- [ ] Variable combinations
- [ ] Incarnation cross data
- [ ] Planetary transit data
- [ ] Advanced relationship electromagnetic tables

## Contributing

When adding or updating God Engine data:
1. Maintain consistent JSON structure
2. Validate against TypeScript types
3. Include comprehensive frequency data
4. Add practical inversion protocols
5. Test loader functions
6. Update this README

## License

Proprietary - DEFRAG System
© 2026 All Rights Reserved
