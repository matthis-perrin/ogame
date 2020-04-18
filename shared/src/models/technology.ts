import {BuildableBase, BuildableRequirement} from '@shared/models/buildable';
import {ResearchLab} from '@shared/models/building';
import {
  CrystalAmount,
  DeuteriumAmount,
  makeResources,
  MetalAmount,
  Resources,
} from '@shared/models/resource';

export interface Technology extends BuildableBase {
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

export const ComputerTechnology = makeTechnology(
  'Ordinateur',
  makeResources({m: 0, c: 400, d: 600}),
  [{buildable: ResearchLab, level: 1}]
);

export const EnergyTechnology = makeTechnology('Energie', makeResources({m: 0, c: 800, d: 400}), [
  {buildable: ResearchLab, level: 1},
]);

export const EspionageTechnology = makeTechnology(
  'Espionnage',
  makeResources({m: 200, c: 1000, d: 200}),
  [{buildable: ResearchLab, level: 3}]
);

export const WeaponsTechnology = makeTechnology('Armes', makeResources({m: 800, c: 200, d: 0}), [
  {buildable: ResearchLab, level: 4},
]);

export const ShieldingTechnology = makeTechnology(
  'Bouclier',
  makeResources({m: 200, c: 600, d: 0}),
  [
    {buildable: ResearchLab, level: 6},
    {buildable: EnergyTechnology, level: 3},
  ]
);

export const ArmourTechnology = makeTechnology(
  'Protection des vaisseaux',
  makeResources({m: 1000, c: 0, d: 0}),
  [{buildable: ResearchLab, level: 2}]
);

export const HyperspaceTechnology = makeTechnology(
  'Hyperspace',
  makeResources({m: 0, c: 4000, d: 2000}),
  [
    {buildable: ResearchLab, level: 7},
    {buildable: ShieldingTechnology, level: 5},
    {buildable: EnergyTechnology, level: 5},
  ]
);

export const CombustionDriveTechnology = makeTechnology(
  'Réacteur à combustion',
  makeResources({m: 400, c: 0, d: 600}),
  [
    {buildable: ResearchLab, level: 1},
    {buildable: EnergyTechnology, level: 1},
  ]
);

export const ImpulseDriveTechnology = makeTechnology(
  'Réacteur à impulsion',
  makeResources({m: 2000, c: 4000, d: 600}),
  [
    {buildable: ResearchLab, level: 2},
    {buildable: EnergyTechnology, level: 1},
  ]
);

export const HyperspaceDriveTechnology = makeTechnology(
  'Propulsion hyperespace',
  makeResources({m: 10000, c: 20000, d: 6000}),
  [
    {buildable: ResearchLab, level: 7},
    {buildable: EnergyTechnology, level: 5},
    {buildable: ShieldingTechnology, level: 5},
    {buildable: HyperspaceTechnology, level: 3},
  ]
);

export const LaserTechnology = makeTechnology('Laser', makeResources({m: 200, c: 100, d: 0}), [
  {buildable: ResearchLab, level: 1},
  {buildable: EnergyTechnology, level: 2},
]);

export const IonTechnology = makeTechnology('Ions', makeResources({m: 1000, c: 300, d: 100}), [
  {buildable: ResearchLab, level: 4},
  {buildable: EnergyTechnology, level: 5},
]);

export const PlasmaTechnology = makeTechnology(
  'Plasma',
  makeResources({m: 2000, c: 4000, d: 1000}),
  [
    {buildable: ResearchLab, level: 4},
    {buildable: EnergyTechnology, level: 8},
    {buildable: LaserTechnology, level: 10},
    {buildable: IonTechnology, level: 5},
  ]
);

export const IntergalacticResearchNetworkTechnology = makeTechnology(
  'Réseau de recherche intergalactique',
  makeResources({m: 240000, c: 400000, d: 160000}),
  [
    {buildable: ResearchLab, level: 10},
    {buildable: ComputerTechnology, level: 8},
    {buildable: HyperspaceTechnology, level: 8},
  ]
);

export const AstrophysicsTechnology = makeTechnology(
  'Astrophysique',
  makeResources({m: 4000, c: 8000, d: 4000}),
  [
    {buildable: ResearchLab, level: 3},
    {buildable: EspionageTechnology, level: 4},
    {buildable: ImpulseDriveTechnology, level: 3},
  ],
  // eslint-disable-next-line @typescript-eslint/no-magic-numbers
  1.75
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
  AstrophysicsTechnology,
];
