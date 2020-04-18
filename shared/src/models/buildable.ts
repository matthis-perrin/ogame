import {Building} from '@shared/models/building';
import {Resources} from '@shared/models/resource';
import {Technology} from '@shared/models/technology';

export type BuildableType = 'technology' | 'building';

export interface BuildableRequirement {
  buildable: Buildable;
  level: number;
}

export interface BuildableBase {
  type: BuildableType;
  name: string;
  cost(level: number): Resources;
  requirements: BuildableRequirement[];
}

export type Buildable = Technology | Building;
