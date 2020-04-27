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
  // Indicates if the building can be added to a build order.
  // Setting this to false means that the building is either useless or will be automatically
  // created when needed in the timeline.
  readonly isBuildOrderBuilding: boolean;
}

function makeBuilding(
  id: number,
  name: string,
  shortName: string,
  sprite: string,
  baseCost: Resources,
  component: string,
  isBuildOrderBuilding: boolean,
  costExponential = 2
): Building {
  return {
    id,
    type: 'building',
    sprite,
    name,
    shortName,
    cost: (level: number) => ({
      metal: Math.floor(baseCost.metal * Math.pow(costExponential, level - 1)) as MetalAmount,
      crystal: Math.floor(baseCost.crystal * Math.pow(costExponential, level - 1)) as CrystalAmount,
      deuterium: Math.floor(
        baseCost.deuterium * Math.pow(costExponential, level - 1)
      ) as DeuteriumAmount,
    }),
    requirements: [],
    component,
    isBuildOrderBuilding,
  };
}

// // Other sprites
// terraformer '31.57% 17.24%',
// allianceDepot '15.78% 17.24%',
// moonbase '36.84% 17.24%',
// sensorPhalanx '42.1% 17.24%',
// jumpGate '47.36% 17.24%',
// repairDock '52.62% 17.24%',

export const MetalMine = makeBuilding(
  1,
  'Mine de métal',
  'Mine de métal',
  '0 0',
  makeResources({m: 60, c: 15, d: 0}),
  'supplies',
  true, // Increases prod
  1.5
);

export const MetalStorage = makeBuilding(
  22,
  'Hangar de métal',
  'Hangar de métal',
  '31.57% 0',
  makeResources({m: 1000, c: 0, d: 0}),
  'supplies',
  false, // TODO - Automatically injected in the timeline
  2
);

export const CrystalMine = makeBuilding(
  2,
  'Mine de cristal',
  'Mine de cristal',
  '5.25% 0',
  makeResources({m: 48, c: 24, d: 0}),
  'supplies',
  true, // Increases prod
  1.6
);

export const CrystalStorage = makeBuilding(
  23,
  'Hangar de cristal',
  'Hangar de cristal',
  '6.84% 0',
  makeResources({m: 1000, c: 500, d: 0}),
  'supplies',
  false, // TODO - Automatically injected in the timeline
  2
);

export const DeuteriumSynthesizer = makeBuilding(
  3,
  'Synthétiseur de deutérium',
  'Synth. de deut',
  '0.52% 0',
  makeResources({m: 225, c: 75, d: 0}),
  'supplies',
  true, // Increases prod
  1.5
);

export const DeuteriumTank = makeBuilding(
  24,
  'Réservoir de deutérium',
  'Rés. de deut',
  '2.1% 0',
  makeResources({m: 1000, c: 1000, d: 0}),
  'supplies',
  false, // TODO - Automatically injected in the timeline
  2
);

export const SolarPlant = makeBuilding(
  4,
  'Centrale électrique solaire',
  'Centrale solaire',
  '15.78% 0',
  makeResources({m: 75, c: 30, d: 0}),
  'supplies',
  false, // Automatically injected in the timeline
  1.5
);

export const FusionReactor = makeBuilding(
  12,
  'Centrale électrique de fusion',
  'Centrale de fusion',
  '21.05% 0',
  makeResources({m: 900, c: 360, d: 180}),
  'supplies',
  false, // TODO - Automatically injected in the timeline
  1.8
);

export const ResearchLab = makeBuilding(
  31,
  'Laboratoire de recherche',
  'Laboratoire',
  '0.52% 17.24%',
  makeResources({m: 200, c: 400, d: 200}),
  'facilities',
  true, // Faster research time
  2
);

export const RoboticsFactory = makeBuilding(
  14,
  'Usine de robots',
  'Usine de robots',
  '0 17.24%',
  makeResources({m: 400, c: 120, d: 200}),
  'facilities',
  true, // Faster building, ships and defenses creation time
  2
);

export const Shipyard = makeBuilding(
  21,
  'Chantier spatial',
  'Chantier spatial',
  '5.25% 17.24%',
  makeResources({m: 400, c: 200, d: 100}),
  'facilities',
  true, // Faster ships and defenses creation time
  1.8
);

export const NaniteFactory = makeBuilding(
  15,
  'Usine de nanites',
  'Nanites',
  '26.31% 17.24%',
  makeResources({m: 1000000, c: 500000, d: 100000}),
  'facilities',
  true, // Faster building, ships and defenses creation time
  2
);

export const MissileSilo = makeBuilding(
  44,
  'Silo de missiles',
  'Silo de missiles',
  '21.05% 17.24%',
  makeResources({m: 20000, c: 20000, d: 1000}),
  'facilities',
  false, // TODO - Not handled in defenses yet
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
