import {Building} from '@shared/models/building';
import {Coordinates} from '@shared/models/coordinates';
import {Defense} from '@shared/models/defense';
import {Resources} from '@shared/models/resource';
import {Ship} from '@shared/models/ships';
import {Milliseconds} from '@shared/models/time';
import {Brand} from '@shared/utils/type_utils';

export type PlanetId = Brand<string, 'PlanetId'>;

export interface InProgressBuilding {
  readonly startTime: Milliseconds;
  readonly endTime: Milliseconds;
  readonly building: Building;
  readonly level: number;
}

export interface InProgressDefenses {
  readonly startTime: Milliseconds;
  readonly endTime: Milliseconds;
  readonly defenses: readonly {readonly defense: Defense; readonly quantity: number}[];
}

export interface InProgressShips {
  readonly startTime: Milliseconds;
  readonly endTime: Milliseconds;
  readonly ships: readonly {readonly ship: Ship; readonly quantity: number}[];
}

export interface Planet {
  readonly id: PlanetId;
  readonly metadata: PlanetMetadata;
  readonly resources: Resources;
  readonly buildingLevels: ReadonlyMap<Building, number>;
  readonly inProgressBuilding?: InProgressBuilding;
  readonly defenses: ReadonlyMap<Defense, number>;
  readonly inProgressDefenses?: InProgressDefenses;
  readonly ships: ReadonlyMap<Ship, number>;
  readonly inProgressShips?: InProgressShips;
}

export interface PlanetMetadata {
  readonly coordinates: Coordinates;
  readonly fields: number;
  readonly temperature: number;
}
