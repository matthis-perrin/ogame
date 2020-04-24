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
  readonly type: 'technology';
  cost(level: number): Resources;
  readonly isUseful: boolean;
}

function makeTechnology(
  id: number,
  name: string,
  shortName: string,
  sprite: string,
  baseCost: Resources,
  costExponential: number,
  isUseful: boolean
): Technology {
  return {
    id,
    type: 'technology',
    name,
    shortName,
    sprite,
    cost: (level: number) => ({
      metal: Math.floor(baseCost.metal * Math.pow(costExponential, level - 1)) as MetalAmount,
      crystal: Math.floor(baseCost.crystal * Math.pow(costExponential, level - 1)) as CrystalAmount,
      deuterium: Math.floor(
        baseCost.deuterium * Math.pow(costExponential, level - 1)
      ) as DeuteriumAmount,
    }),
    requirements: [],
    isUseful,
    component: 'research',
  };
}

export const ComputerTechnology = makeTechnology(
  108,
  'Technologie Ordinateur',
  'Ordinateur',
  '47.36% 68.96%',
  makeResources({m: 0, c: 400, d: 600}),
  2,
  false // Automatically added after each odd level of Astro
);

export const EnergyTechnology = makeTechnology(
  113,
  'Technologie énergétique',
  'Énergie',
  '0 68.96%',
  makeResources({m: 0, c: 800, d: 400}),
  2,
  false // TODO - Increase fusion reactor energy production, but not implemented yet
);

export const EspionageTechnology = makeTechnology(
  106,
  'Technologie Espionnage',
  'Espionnage',
  '42.1% 68.96%',
  makeResources({m: 200, c: 1000, d: 200}),
  2,
  false // Automatically added whe the cost is lower than a percentage of the previous build item
);

export const WeaponTechnology = makeTechnology(
  109,
  'Technologie Armes',
  'Armes',
  '73.68% 68.96%',
  makeResources({m: 800, c: 200, d: 0}),
  2,
  true // Impacts how much defense needs to be built
);

export const ShieldingTechnology = makeTechnology(
  110,
  'Technologie Bouclier',
  'Bouclier',
  '78.94% 68.96%',
  makeResources({m: 200, c: 600, d: 0}),
  2,
  true // Impacts how much defense needs to be built
);

export const ArmourTechnology = makeTechnology(
  111,
  'Technologie Protection des vaisseaux spatiaux',
  'Prot. des vaisseaux',
  '68.42% 68.96%',
  makeResources({m: 1000, c: 0, d: 0}),
  2,
  true // Impacts how much defense needs to be built
);

export const HyperspaceTechnology = makeTechnology(
  114,
  'Technologie hyperespace',
  'Hyperespace',
  '15.78% 68.96%',
  makeResources({m: 0, c: 4000, d: 2000}),
  2,
  false // Negligeable gains. Each level increases cargo capacity by 5%
);

export const CombustionDrive = makeTechnology(
  115,
  'Réacteur à combustion',
  'Combustion',
  '26.31% 68.96%',
  makeResources({m: 400, c: 0, d: 600}),
  2,
  false // Negligeable gains. Increase the speed of some ships
);

export const ImpulseDrive = makeTechnology(
  117,
  'Réacteur à impulsion',
  'Impulsion',
  '31.57% 68.96%',
  makeResources({m: 2000, c: 4000, d: 600}),
  2,
  false // Negligeable gains. Increase the speed of some ships and sometimes the fuel consumption
);

export const HyperspaceDrive = makeTechnology(
  118,
  'Propulsion hyperespace',
  'Prop. hyperespace',
  '36.84% 68.96%',
  makeResources({m: 10000, c: 20000, d: 6000}),
  2,
  false // Negligeable gains. Increase the speed of some ships and sometimes the fuel consumption
);

export const LaserTechnology = makeTechnology(
  120,
  'Technologie Laser',
  'Laser',
  '5.25% 68.96%',
  makeResources({m: 200, c: 100, d: 0}),
  2,
  false // No bonus
);

export const IonTechnology = makeTechnology(
  121,
  'Technologie à ions',
  'Ions',
  '10.52% 68.96%',
  makeResources({m: 1000, c: 300, d: 100}),
  2,
  false // Reduce deconstruction costs
);

export const PlasmaTechnology = makeTechnology(
  122,
  'Technologie Plasma',
  'Plasma',
  '21.05% 68.96%',
  makeResources({m: 2000, c: 4000, d: 1000}),
  2,
  true // Increase crystal and metal production
);

export const IntergalacticResearchNetworkTechnology = makeTechnology(
  123,
  'Réseau de recherche intergalactique',
  'Réseau Intergalactique',
  '57.88% 68.96%',
  makeResources({m: 240000, c: 400000, d: 160000}),
  2,
  false // TODO - Multi planets not handled yet
);

// TODO - Astrophysics cost is rounded to the nearest 100
export const AstrophysicsTechnology = makeTechnology(
  124,
  'Astrophysique',
  'Astrophysique',
  '52.62% 68.96%',
  makeResources({m: 4000, c: 8000, d: 4000}),
  1.75,
  true // TODO - Multi planets not handled yet
);

export const GravitonTechnology = makeTechnology(
  199,
  'Technologie Graviton',
  'Graviton',
  '63.15% 68.96%',
  makeResources({m: 0, c: 0, d: 0}),
  3,
  false
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
  GravitonTechnology,
];
