import {TechId} from '@src/models/resources';

export type TechnologyValue = number & {_: 'TechnologyValue'};

export interface Technology {
  techId: TechId;
  value: TechnologyValue;
}
