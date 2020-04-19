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
  isUseful: boolean;
}

function makeTechnology(
  name: string,
  baseCost: Resources,
  costExponential: number,
  isUseful: boolean
): Technology {
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
    isUseful,
  };
}

export const ComputerTechnology = makeTechnology(
  'Ordinateur',
  makeResources({m: 0, c: 400, d: 600}),
  2,
  false // Automatically added after each odd level of Astro
);

export const EnergyTechnology = makeTechnology(
  'Energie',
  makeResources({m: 0, c: 800, d: 400}),
  2,
  false // TODO - Increase fusion reactor energy production, but not implemented yet
);

export const EspionageTechnology = makeTechnology(
  'Espionnage',
  makeResources({m: 200, c: 1000, d: 200}),
  2,
  false // Automatically added whe the cost is lower than a percentage of the previous build item
);

export const WeaponTechnology = makeTechnology(
  'Armes',
  makeResources({m: 800, c: 200, d: 0}),
  2,
  true // Impacts how much defense needs to be built
);

export const ShieldingTechnology = makeTechnology(
  'Bouclier',
  makeResources({m: 200, c: 600, d: 0}),
  2,
  true // Impacts how much defense needs to be built
);

export const ArmourTechnology = makeTechnology(
  'Protection des vaisseaux',
  makeResources({m: 1000, c: 0, d: 0}),
  2,
  true // Impacts how much defense needs to be built
);

export const HyperspaceTechnology = makeTechnology(
  'Hyperspace',
  makeResources({m: 0, c: 4000, d: 2000}),
  2,
  false // Negligeable gains. Each level increases cargo capacity by 5%
);

export const CombustionDrive = makeTechnology(
  'Réacteur à combustion',
  makeResources({m: 400, c: 0, d: 600}),
  2,
  false // Negligeable gains. Increase the speed of some ships
);

export const ImpulseDrive = makeTechnology(
  'Réacteur à impulsion',
  makeResources({m: 2000, c: 4000, d: 600}),
  2,
  false // Negligeable gains. Increase the speed of some ships
);

export const HyperspaceDrive = makeTechnology(
  'Propulsion hyperespace',
  makeResources({m: 10000, c: 20000, d: 6000}),
  2,
  false // Negligeable gains. Increase the speed of some ships and reduce fuel consumption
);

export const LaserTechnology = makeTechnology(
  'Laser',
  makeResources({m: 200, c: 100, d: 0}),
  2,
  false // No bonus
);

export const IonTechnology = makeTechnology(
  'Ions',
  makeResources({m: 1000, c: 300, d: 100}),
  2,
  false // Reduce deconstruction costs
);

export const PlasmaTechnology = makeTechnology(
  'Plasma',
  makeResources({m: 2000, c: 4000, d: 1000}),
  2,
  true // Increase crystal and metal production
);

export const IntergalacticResearchNetworkTechnology = makeTechnology(
  'Réseau de recherche intergalactique',
  makeResources({m: 240000, c: 400000, d: 160000}),
  2,
  false // TODO - Multi planets not handled yet
);

export const AstrophysicsTechnology = makeTechnology(
  'Astrophysique',
  makeResources({m: 4000, c: 8000, d: 4000}),
  1.75,
  true // TODO - Multi planets not handled yet
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
