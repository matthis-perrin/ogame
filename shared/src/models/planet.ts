import {Building} from '@shared/models/building';
import {Coordinates} from '@shared/models/coordinates';
import {Defense} from '@shared/models/defense';
import {Ship} from '@shared/models/ships';

export interface Planet {
  metadata: PlanetMetadata;
  buildingLevels: Map<Building, number>;
  inProgressBuildings: {building: Building; quantity: number}[];
  defense: Map<Defense, number>;
  inProgressDefenses: {defense: Defense; quantity: number}[];
  ships: Map<Ship, number>;
  inProgressShips: {ship: Ship; quantity: number}[];
}

export interface PlanetMetadata {
  coordinates: Coordinates;
  fields: number;
  temperature: number;
}
