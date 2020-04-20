import {PlanetId} from '@src/models/planets';

export type TechnologyValue = number & {_: 'TechnologyValue'};
export type ConstructionId = string & {_: 'ConstructionId'};

export interface Technology {
  techId: number;
  value: TechnologyValue;
  target?: TechnologyValue;
  targetEndSeconds?: number;
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
