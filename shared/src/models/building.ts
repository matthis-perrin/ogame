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
  sprite: string,
  baseCost: Resources,
  component: string,
  costExponential = 2
): Building {
  return {
    id,
    type: 'building',
    sprite,
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

// metalMine '0 0',
// crystalMine '5.25% 0',
// deuteriumSynthesizer '0.52% 0',
// solarPlant '15.78% 0',
// fusionPlant '21.05% 0',
// roboticsFactory '0 17.24%',
// naniteFactory '26.31% 17.24%',
// shipyard '5.25% 17.24%',
// metalStorage '31.57% 0',
// crystalStorage '6.84% 0',
// deuteriumStorage '2.1% 0',
// researchLaboratory '0.52% 17.24%',
// terraformer '31.57% 17.24%',
// allianceDepot '15.78% 17.24%',
// moonbase '36.84% 17.24%',
// sensorPhalanx '42.1% 17.24%',
// jumpGate '47.36% 17.24%',
// missileSilo '21.05% 17.24%',
// repairDock '52.62% 17.24%',

export const MetalMine = makeBuilding(
  1,
  'Mine de métal',
  '0 0',
  makeResources({m: 60, c: 15, d: 0}),
  'supplies',
  1.5
);

export const MetalStorage = makeBuilding(
  22,
  'Hangar de métal',
  '31.57% 0',
  makeResources({m: 1000, c: 0, d: 0}),
  'supplies',
  2
);

export const CrystalMine = makeBuilding(
  2,
  'Mine de cristal',
  '5.25% 0',
  makeResources({m: 48, c: 24, d: 0}),
  'supplies',
  1.6
);

export const CrystalStorage = makeBuilding(
  23,
  'Hangar de cristal',
  '6.84% 0',
  makeResources({m: 1000, c: 500, d: 0}),
  'supplies',
  2
);

export const DeuteriumSynthesizer = makeBuilding(
  3,
  'Synthétiseur de deutérium',
  '0.52% 0',
  makeResources({m: 225, c: 75, d: 0}),
  'supplies',
  1.5
);

export const DeuteriumTank = makeBuilding(
  24,
  'Réservoir de deutérium',
  '2.1% 0',
  makeResources({m: 1000, c: 1000, d: 0}),
  'supplies',
  2
);

export const SolarPlant = makeBuilding(
  4,
  'Centrale électrique solaire',
  '15.78% 0',
  makeResources({m: 75, c: 30, d: 0}),
  'supplies',
  1.5
);

export const FusionReactor = makeBuilding(
  12,
  'Centrale électrique de fusion',
  '21.05% 0',
  makeResources({m: 900, c: 360, d: 180}),
  'supplies',
  1.8
);

export const ResearchLab = makeBuilding(
  31,
  'Laboratoire de recherche',
  '0.52% 17.24%',
  makeResources({m: 200, c: 400, d: 200}),
  'facilities',
  2
);

export const RoboticsFactory = makeBuilding(
  14,
  'Usine de robots',
  '0 17.24%',
  makeResources({m: 400, c: 120, d: 200}),
  'facilities',
  2
);

export const Shipyard = makeBuilding(
  21,
  'Chantier spatial',
  '5.25% 17.24%',
  makeResources({m: 400, c: 200, d: 100}),
  'facilities',
  1.8
);

export const NaniteFactory = makeBuilding(
  15,
  'Usine de nanites',
  '26.31% 17.24%',
  makeResources({m: 1000000, c: 500000, d: 100000}),
  'facilities',
  2
);

export const MissileSilo = makeBuilding(
  44,
  'Silo de missiles',
  '21.05% 17.24%',
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
