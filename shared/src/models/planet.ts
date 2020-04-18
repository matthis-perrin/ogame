import {Building} from '@shared/models/building';
import {Coordinate} from '@shared/models/coordinate';
import {Defense} from '@shared/models/defense';
import {Ship} from '@shared/models/ships';

export interface Planet {
  metadata: PlanetMetadata;
  buildingLevels: Map<Building, number>;
  upgradingBuilding: Building;
  defense: Map<Defense, number>;
  defenseQueue: {defense: Defense; quantity: number}[];
  ships: Map<Ship, number>;
  shipQueue: {ship: Ship; quantity: number}[];
}

export interface PlanetMetadata {
  coordinate: Coordinate;
  fields: number;
  temperatureMin: number;
  temperatureMax: number;
}
