import {Building} from '@shared/models/building';
import {Defense} from '@shared/models/defense';
import {Ship} from '@shared/models/ships';
import {Technology} from '@shared/models/technology';

export type BuildableType = 'technology' | 'building' | 'ship' | 'defense';

export interface BuildableRequirement {
  entity: Building | Technology;
  level: number;
}

export interface BuildableBase {
  id: number;
  type: BuildableType;
  name: string;
  requirements: BuildableRequirement[];
}

export type Buildable = Technology | Building | Ship | Defense;
