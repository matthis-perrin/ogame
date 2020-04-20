import {BuildableType} from '@shared/models/buildable';
import {Building} from '@shared/models/building';
import {Defense} from '@shared/models/defense';
import {Planet} from '@shared/models/planet';
import {Ship} from '@shared/models/ships';
import {Technology} from '@shared/models/technology';

interface BuildItemBase {
  type: BuildableType;
}

export interface ShipBuildItem extends BuildItemBase {
  type: 'ship';
  ship: Ship;
  quantity: number;
  planet: Planet;
}

export interface DefenseBuildItem extends BuildItemBase {
  type: 'defense';
  defense: Defense;
  quantity: number;
  planet: Planet;
}

export interface BuildingBuildItem extends BuildItemBase {
  type: 'building';
  building: Building;
  level: number;
  planet: Planet;
}

export interface TechnologyBuildItem extends BuildItemBase {
  type: 'technology';
  technology: Technology;
  level: number;
}

export type BuildItem = ShipBuildItem | DefenseBuildItem | BuildingBuildItem | TechnologyBuildItem;
