import {BuildableBase} from '@shared/models/buildable';
import {AllBuildings} from '@shared/models/building';
import {AllDefenses} from '@shared/models/defense';
import {AllShips} from '@shared/models/ships';
import {AllTechnologies} from '@shared/models/technology';

import {PlanetId, PlanetName} from '@src/models/planets';

export type TechnologyValue = number & {_: 'TechnologyValue'};
export type ConstructionId = string & {_: 'ConstructionId'};

export interface Technology {
  techId: number;
  value: TechnologyValue;
  target?: TechnologyValue;
  targetEndSeconds?: number;
  constructionPlanetName?: PlanetName;
}

export interface Construction {
  constructionId: ConstructionId;
  planetId: PlanetId;
  techId: number;
  value: TechnologyValue;
  target: TechnologyValue;
  targetEndSeconds: number;
}

export function generateConstructionId(planetId: PlanetId, techId: number): ConstructionId {
  return `${planetId}_${techId}` as ConstructionId;
}

export const TechnologyIndex: Map<number, BuildableBase> = new Map();
function buildIndex(buildable: BuildableBase): void {
  TechnologyIndex.set(buildable.id, buildable);
}
AllTechnologies.forEach(buildIndex);
AllBuildings.forEach(buildIndex);
AllDefenses.forEach(buildIndex);
AllShips.forEach(buildIndex);

export function techShortName(techId: number): string {
  const name = TechnologyIndex.get(techId)?.name;
  if (name === undefined) {
    return `TECHID_${techId}`;
  }
  // eslint-disable-next-line @typescript-eslint/no-magic-numbers
  if (techId === 111) {
    return 'Protection des vaisseaux';
  }
  return name;
}
