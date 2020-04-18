import {Building} from '@shared/models/building';
import {Resources} from '@shared/models/resource';
import {Ship} from '@shared/models/ships';
import {Technology} from '@shared/models/technology';

export type BuildableType = 'technology' | 'building' | 'ship';

export interface BuildableRequirement {
  entity: Building | Technology;
  level: number;
}

export interface BuildableBase {
  type: BuildableType;
  name: string;
  requirements: BuildableRequirement[];
}

export type Buildable = Technology | Building | Ship;
