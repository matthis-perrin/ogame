/* eslint-disable @typescript-eslint/no-magic-numbers */
import {BuildableBase} from '@shared/models/buildable';
import {
  CrystalAmount,
  DeuteriumAmount,
  makeResources,
  MetalAmount,
  Resources,
} from '@shared/models/resource';

export interface Technology extends BuildableBase {
  type: 'technology';
  cost(level: number): Resources;
}

function makeTechnology(name: string, baseCost: Resources, costExponential = 2): Technology {
  return {
    type: 'technology',
    name,
    cost: (level: number) => ({
      metal: Math.floor(baseCost.metal * Math.pow(costExponential, level - 1)) as MetalAmount,
      crystal: Math.floor(baseCost.crystal * Math.pow(costExponential, level - 1)) as CrystalAmount,
      deuterium: Math.floor(
        baseCost.deuterium * Math.pow(costExponential, level - 1)
      ) as DeuteriumAmount,
    }),
    requirements: [],
  };
}

export const ComputerTechnology = makeTechnology(
  'Ordinateur',
  makeResources({m: 0, c: 400, d: 600})
);

export const EnergyTechnology = makeTechnology('Energie', makeResources({m: 0, c: 800, d: 400}));

export const EspionageTechnology = makeTechnology(
  'Espionnage',
  makeResources({m: 200, c: 1000, d: 200})
);

export const WeaponTechnology = makeTechnology('Armes', makeResources({m: 800, c: 200, d: 0}));

export const ShieldingTechnology = makeTechnology(
  'Bouclier',
  makeResources({m: 200, c: 600, d: 0})
);

export const ArmourTechnology = makeTechnology(
  'Protection des vaisseaux',
  makeResources({m: 1000, c: 0, d: 0})
);

export const HyperspaceTechnology = makeTechnology(
  'Hyperspace',
  makeResources({m: 0, c: 4000, d: 2000})
);

export const CombustionDrive = makeTechnology(
  'Réacteur à combustion',
  makeResources({m: 400, c: 0, d: 600})
);

export const ImpulseDrive = makeTechnology(
  'Réacteur à impulsion',
  makeResources({m: 2000, c: 4000, d: 600})
);

export const HyperspaceDrive = makeTechnology(
  'Propulsion hyperespace',
  makeResources({m: 10000, c: 20000, d: 6000})
);

export const LaserTechnology = makeTechnology('Laser', makeResources({m: 200, c: 100, d: 0}));

export const IonTechnology = makeTechnology('Ions', makeResources({m: 1000, c: 300, d: 100}));

export const PlasmaTechnology = makeTechnology(
  'Plasma',
  makeResources({m: 2000, c: 4000, d: 1000})
);

export const IntergalacticResearchNetworkTechnology = makeTechnology(
  'Réseau de recherche intergalactique',
  makeResources({m: 240000, c: 400000, d: 160000})
);

export const AstrophysicsTechnology = makeTechnology(
  'Astrophysique',
  makeResources({m: 4000, c: 8000, d: 4000}),
  1.75
);

export const AllTechnologies: Technology[] = [
  EspionageTechnology,
  ComputerTechnology,
  WeaponTechnology,
  ShieldingTechnology,
  ArmourTechnology,
  EnergyTechnology,
  HyperspaceTechnology,
  CombustionDrive,
  ImpulseDrive,
  HyperspaceDrive,
  LaserTechnology,
  IonTechnology,
  PlasmaTechnology,
  IntergalacticResearchNetworkTechnology,
  AstrophysicsTechnology,
];
