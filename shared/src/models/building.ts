import {BuildableBase, BuildableRequirement} from '@shared/models/buildable';
import {
  CrystalAmount,
  DeuteriumAmount,
  makeResources,
  MetalAmount,
  Resources,
} from '@shared/models/resource';

export interface Building extends BuildableBase {
  type: 'building';
  // isUseful: (level: number) => boolean;
}

function makeBuilding(
  name: string,
  baseCost: Resources,
  requirements: BuildableRequirement[],
  costExponential = 2
): Building {
  return {
    type: 'building',
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

/* eslint-disable @typescript-eslint/no-magic-numbers */
export const MetalMine = makeBuilding(
  'Mine de métal',
  makeResources({m: 60, c: 15, d: 0}),
  [],
  1.5
);

export const CrystalMine = makeBuilding(
  'Mine de cristal',
  makeResources({m: 48, c: 24, d: 0}),
  [],
  1.6
);

export const DeuteriumSynthesizer = makeBuilding(
  'Synthétiseur de deutérium',
  makeResources({m: 225, c: 75, d: 0}),
  [],
  1.5
);

export const ResearchLab = makeBuilding(
  'Laboratoire de recherche',
  makeResources({m: 200, c: 400, d: 200}),
  [],
  2
);
/* eslint-enable @typescript-eslint/no-magic-numbers */

export const Allbuildings: Building[] = [MetalMine, CrystalMine, DeuteriumSynthesizer, ResearchLab];
