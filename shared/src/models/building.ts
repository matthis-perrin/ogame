/* eslint-disable @typescript-eslint/no-magic-numbers */
import {BuildableBase} from '@shared/models/buildable';
import {
  CrystalAmount,
  DeuteriumAmount,
  makeResources,
  MetalAmount,
  Resources,
} from '@shared/models/resource';

export interface Building extends BuildableBase {
  readonly type: 'building';
  cost(level: number): Resources;
}

function makeBuilding(
  id: number,
  name: string,
  baseCost: Resources,
  component: string,
  costExponential = 2
): Building {
  return {
    id,
    type: 'building',
    name,
    cost: (level: number) => ({
      metal: Math.floor(baseCost.metal * Math.pow(costExponential, level - 1)) as MetalAmount,
      crystal: Math.floor(baseCost.crystal * Math.pow(costExponential, level - 1)) as CrystalAmount,
      deuterium: Math.floor(
        baseCost.deuterium * Math.pow(costExponential, level - 1)
      ) as DeuteriumAmount,
    }),
    requirements: [],
    component,
  };
}

export const MetalMine = makeBuilding(
  1,
  'Mine de métal',
  makeResources({m: 60, c: 15, d: 0}),
  'supplies',
  1.5
);

export const MetalStorage = makeBuilding(
  22,
  'Hangar de métal',
  makeResources({m: 1000, c: 0, d: 0}),
  'supplies',
  2
);

export const CrystalMine = makeBuilding(
  2,
  'Mine de cristal',
  makeResources({m: 48, c: 24, d: 0}),
  'supplies',
  1.6
);

export const CrystalStorage = makeBuilding(
  23,
  'Hangar de cristal',
  makeResources({m: 1000, c: 500, d: 0}),
  'supplies',
  2
);

export const DeuteriumSynthesizer = makeBuilding(
  3,
  'Synthétiseur de deutérium',
  makeResources({m: 225, c: 75, d: 0}),
  'supplies',
  1.5
);

export const DeuteriumTank = makeBuilding(
  24,
  'Réservoir de deutérium',
  makeResources({m: 1000, c: 1000, d: 0}),
  'supplies',
  2
);

export const SolarPlant = makeBuilding(
  4,
  'Centrale électrique solaire',
  makeResources({m: 75, c: 30, d: 0}),
  'supplies',
  1.5
);

export const FusionReactor = makeBuilding(
  12,
  'Centrale électrique de fusion',
  makeResources({m: 900, c: 360, d: 180}),
  'supplies',
  1.8
);

export const ResearchLab = makeBuilding(
  31,
  'Laboratoire de recherche',
  makeResources({m: 200, c: 400, d: 200}),
  'facilities',
  2
);

export const RoboticsFactory = makeBuilding(
  14,
  'Usine de robots',
  makeResources({m: 400, c: 120, d: 200}),
  'facilities',
  2
);

export const Shipyard = makeBuilding(
  21,
  'Chantier spatial',
  makeResources({m: 400, c: 200, d: 100}),
  'facilities',
  1.8
);

export const NaniteFactory = makeBuilding(
  15,
  'Usine de nanites',
  makeResources({m: 1000000, c: 500000, d: 100000}),
  'facilities',
  2
);

export const MissileSilo = makeBuilding(
  44,
  'Silo de missiles',
  makeResources({m: 20000, c: 20000, d: 1000}),
  'facilities',
  2
);

export const AllBuildings: Building[] = [
  MetalMine,
  MetalStorage,
  CrystalMine,
  CrystalStorage,
  DeuteriumSynthesizer,
  DeuteriumTank,
  SolarPlant,
  FusionReactor,
  ResearchLab,
  RoboticsFactory,
  Shipyard,
  NaniteFactory,
  MissileSilo,
];
