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
  type: 'building';
  cost(level: number): Resources;
}

function makeBuilding(name: string, baseCost: Resources, costExponential = 2): Building {
  return {
    type: 'building',
    name,
    cost: (level: number) => ({
      metal: (baseCost.metal * Math.pow(costExponential, level - 1)) as MetalAmount,
      crystal: (baseCost.crystal * Math.pow(costExponential, level - 1)) as CrystalAmount,
      deuterium: (baseCost.deuterium * Math.pow(costExponential, level - 1)) as DeuteriumAmount,
    }),
    requirements: [],
  };
}

export const MetalMine = makeBuilding('Mine de métal', makeResources({m: 60, c: 15, d: 0}), 1.5);

export const MetalStorage = makeBuilding(
  'Hangar de métal',
  makeResources({m: 1000, c: 0, d: 0}),
  2
);

export const CrystalMine = makeBuilding(
  'Mine de cristal',
  makeResources({m: 48, c: 24, d: 0}),
  1.6
);

export const CrystalStorage = makeBuilding(
  'Hangar de cristal',
  makeResources({m: 1000, c: 500, d: 0}),
  2
);

export const DeuteriumSynthesizer = makeBuilding(
  'Synthétiseur de deutérium',
  makeResources({m: 225, c: 75, d: 0}),
  1.5
);

export const DeuteriumTank = makeBuilding(
  'Réservoir de deutérium',
  makeResources({m: 1000, c: 1000, d: 0}),
  2
);

export const SolarPlant = makeBuilding(
  'Centrale électrique solaire',
  makeResources({m: 75, c: 30, d: 0}),
  1.5
);

export const FusionReactor = makeBuilding(
  'Centrale électrique de fusion',
  makeResources({m: 900, c: 360, d: 180}),
  1.8
);

export const ResearchLab = makeBuilding(
  'Laboratoire de recherche',
  makeResources({m: 200, c: 400, d: 200}),
  2
);

export const RoboticsFactory = makeBuilding(
  'Usine de robots',
  makeResources({m: 400, c: 120, d: 200}),
  2
);

export const Shipyard = makeBuilding(
  'Chantier spatial',
  makeResources({m: 400, c: 200, d: 100}),
  1.8
);

export const NaniteFactory = makeBuilding(
  'Usine de nanites',
  makeResources({m: 1000000, c: 500000, d: 100000}),
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
];
