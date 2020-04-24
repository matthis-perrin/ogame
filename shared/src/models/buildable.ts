import {Building} from '@shared/models/building';
import {Defense} from '@shared/models/defense';
import {Ship} from '@shared/models/ships';
import {Technology} from '@shared/models/technology';

export type BuildableType = 'technology' | 'building' | 'ship' | 'defense';

export interface BuildableRequirement {
  readonly entity: Building | Technology;
  readonly level: number;
}

export interface BuildableBase {
  readonly id: number;
  readonly type: BuildableType;
  readonly name: string;
  readonly shortName: string;
  // Not readonly because we need to update it post creation to avoid circular dependencies
  readonly requirements: BuildableRequirement[];
  readonly component: string; // In URL
  readonly sprite?: string;
}

export type Buildable = Technology | Building | Ship | Defense;
