import {Buildable, BuildableType} from '@shared/models/buildable';
import {Building} from '@shared/models/building';
import {Defense} from '@shared/models/defense';
import {PlanetId} from '@shared/models/planet';
import {Ship} from '@shared/models/ships';
import {Stock} from '@shared/models/stock';
import {Technology} from '@shared/models/technology';

interface BuildItemBase {
  type: BuildableType;
  planetId: PlanetId;
  buildable: Buildable;
}

export interface ShipBuildItem extends BuildItemBase {
  type: 'ship';
  buildable: Ship;
  quantity: number;
}

export interface DefenseBuildItem extends BuildItemBase {
  type: 'defense';
  buildable: Defense;
  quantity: number;
}

export interface BuildingBuildItem extends BuildItemBase {
  type: 'building';
  buildable: Building;
  level: number;
}

export interface TechnologyBuildItem extends BuildItemBase {
  type: 'technology';
  buildable: Technology;
  level: number;
}

export interface StockBuildItem extends BuildItemBase {
  type: 'stock';
  buildable: Stock;
  quantity: number;
}

export type BuildItem =
  | ShipBuildItem
  | DefenseBuildItem
  | BuildingBuildItem
  | TechnologyBuildItem
  | StockBuildItem;
