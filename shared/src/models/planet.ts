import {Building} from '@shared/models/building';
import {Coordinates} from '@shared/models/coordinates';
import {Defense} from '@shared/models/defense';
import {Resources} from '@shared/models/resource';
import {Ship} from '@shared/models/ships';
import {Milliseconds} from '@shared/models/time';

export interface Planet {
  metadata: PlanetMetadata;
  resources: Resources;
  buildingLevels: Map<Building, number>;
  inProgressBuilding?: {
    startTime: Milliseconds;
    endTime: Milliseconds;
    building: Building;
    level: number;
  };
  defense: Map<Defense, number>;
  inProgressDefenses?: {
    startTime: Milliseconds;
    endTime: Milliseconds;
    defenses: {defense: Defense; quantity: number}[];
  };
  ships: Map<Ship, number>;
  inProgressShips?: {
    startTime: Milliseconds;
    endTime: Milliseconds;
    ships: {ship: Ship; quantity: number}[];
  };
}

export interface PlanetMetadata {
  coordinates: Coordinates;
  fields: number;
  temperature: number;
}
