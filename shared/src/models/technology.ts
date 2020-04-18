import {
  CrystalAmount,
  DeuteriumAmount,
  makeResources,
  MetalAmount,
  Resources,
} from '@shared/models/resource';

export type BuildableType = 'technology' | 'building';

interface BuildableRequirement {
  buildable: Buildable;
  level: number;
}

interface BuildableBase {
  type: BuildableType;
  name: string;
  cost(level: number): Resources;
  requirements: BuildableRequirement[];
}

export type Buildable = Technology;

interface Technology extends BuildableBase {
  type: 'technology';
  // isUseful: (level: number) => boolean;
}

function makeTechnology(
  name: string,
  baseCost: Resources,
  requirements: BuildableRequirement[],
  costExponential = 2
): Technology {
  return {
    type: 'technology',
    name,
    cost: (level: number) => ({
      metal: (baseCost.metal * Math.pow(costExponential, level - 1)) as MetalAmount,
      crystal: (baseCost.crystal * Math.pow(costExponential, level - 1)) as CrystalAmount,
      deuterium: (baseCost.deuterium * Math.pow(costExponential, level - 1)) as DeuteriumAmount,
    }),
    // isUseful: (level: number) => level < 1000,
    requirements,
  };
}

export const EspionageTechnology = makeTechnology(
  'Espionnage',
  makeResources({m: 200, c: 1000, d: 200}),
  [] // Research Lab (Level 3)
);

export const ComputerTechnology = makeTechnology(
  'Ordinateur',
  makeResources({m: 0, c: 400, d: 600}),
  [] // Research Lab Level 1
);

export const WeaponsTechnology = makeTechnology(
  'Armes',
  makeResources({m: 800, c: 200, d: 0}),
  [] // Research Lab Level 4
);

export const ShieldingTechnology = makeTechnology(
  'Bouclier',
  makeResources({m: 200, c: 600, d: 0}),
  [] // Energy Technology Level 3, Research Lab Level 6
);

export const ArmourTechnology = makeTechnology(
  'Protection des vaisseaux',
  makeResources({m: 1000, c: 0, d: 0}),
  [] // Research Lab Level 2
);

export const EnergyTechnology = makeTechnology(
  'Energie',
  makeResources({m: 0, c: 800, d: 400}),
  [] // Research Lab (Level 1)
);

export const HyperspaceTechnology = makeTechnology(
  'Hyperspace',
  makeResources({m: 0, c: 4000, d: 2000}),
  [] // Research Lab (Level 7), Shielding Technology (Level 5), Energy Technology (Level 5)
);

export const CombustionDriveTechnology = makeTechnology(
  'Réacteur à combustion',
  makeResources({m: 400, c: 0, d: 600}),
  [] // Energy Technology (Level 1), Research Lab (Level 1)
);

export const ImpulseDriveTechnology = makeTechnology(
  'Réacteur à impulsion',
  makeResources({m: 2000, c: 4000, d: 600}),
  [] // Research Lab (Level 2), Energy Technology (Level 1)
);

export const HyperspaceDriveTechnology = makeTechnology(
  'Propulsion hyperespace',
  makeResources({m: 10000, c: 20000, d: 6000}),
  [] // Research Lab (Level 7), Energy Technology (Level 5), Shielding Technology (Level 5), Hyperspace Technology (Level 3)
);

export const LaserTechnology = makeTechnology(
  'Laser',
  makeResources({m: 200, c: 100, d: 0}),
  [] // Research Lab (Level 1), Energy Technology (Level 2)
);

export const IonTechnology = makeTechnology(
  'Ions',
  makeResources({m: 1000, c: 300, d: 100}),
  [] // Research Lab (Level 4), Laser Technology (Level 5), Energy Technology (Level 4)
);

export const PlasmaTechnology = makeTechnology(
  'Plasma',
  makeResources({m: 2000, c: 4000, d: 1000}),
  [] // Research Lab (Level 4), Energy Technology (Level 8), Laser Technology (Level 10), Ion Technology (Level 5)
);

export const IntergalacticResearchNetworkTechnology = makeTechnology(
  'Réseau de recherche intergalactique',
  makeResources({m: 240000, c: 400000, d: 160000}),
  [] // Research Lab Level 10, Computer Technology Level 8, Hyperspace Technology Level 8
);

const astrophysicsCostExponential = 1.75;
export const Astrophysics = makeTechnology(
  'Astrophysique',
  makeResources({m: 4000, c: 8000, d: 4000}),
  [], // Espionage Technology (level 4), Impulse Drive (level 3), Research Lab (level 3)
  astrophysicsCostExponential
);

export const AllTechnologies: Technology[] = [
  EspionageTechnology,
  ComputerTechnology,
  WeaponsTechnology,
  ShieldingTechnology,
  ArmourTechnology,
  EnergyTechnology,
  HyperspaceTechnology,
  CombustionDriveTechnology,
  ImpulseDriveTechnology,
  HyperspaceDriveTechnology,
  LaserTechnology,
  IonTechnology,
  PlasmaTechnology,
  IntergalacticResearchNetworkTechnology,
  Astrophysics,
];
