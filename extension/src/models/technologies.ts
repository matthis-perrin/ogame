import {getShipCargoCapacity} from '@shared/lib/formula';
import {Buildable} from '@shared/models/buildable';
import {AllBuildings} from '@shared/models/building';
import {AllDefenses} from '@shared/models/defense';
import {AllShips, Ship} from '@shared/models/ships';
import {AllTechnologies, HyperspaceTechnology} from '@shared/models/technology';

import {COLLECTOR_BONUS_FRET} from '@src/models/constants';
import {PlanetId, PlanetName} from '@src/models/planets';

export type ConstructionId = string & {_: 'ConstructionId'};

export interface Technology {
  techId: number;
  value: number;
  target?: number;
  targetEndSeconds?: number;
  constructionPlanetName?: PlanetName;
}

export interface Construction {
  constructionId: ConstructionId;
  planetId: PlanetId;
  techId: number;
  value: number;
  target: number;
  targetEndSeconds: number;
}

export function generateConstructionId(planetId: PlanetId, techId: number): ConstructionId {
  return `${planetId}_${techId}` as ConstructionId;
}

export const TechnologyIndex: Map<number, Buildable> = new Map();
function buildIndex(buildable: Buildable): void {
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

export function getFretCapacity(technologies: {[techId: number]: Technology}, ship: Ship): number {
  const hyperLevel = technologies.hasOwnProperty(HyperspaceTechnology.id)
    ? technologies[HyperspaceTechnology.id].value
    : 0;
  return getShipCargoCapacity(ship, hyperLevel, COLLECTOR_BONUS_FRET);
}
