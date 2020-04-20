import {BuildableType} from '@shared/models/buildable';
import {Building} from '@shared/models/building';
import {Defense} from '@shared/models/defense';
import {Planet} from '@shared/models/planet';
import {Ship} from '@shared/models/ships';
import {Technology} from '@shared/models/technology';

interface BuildTargetBase {
  type: BuildableType;
  time: number;
}

export interface ShipBuildTarget extends BuildTargetBase {
  type: 'ship';
  ship: Ship;
  quantity: number;
  planet: Planet;
}

export interface DefenseBuildTarget extends BuildTargetBase {
  type: 'defense';
  defense: Defense;
  quantity: number;
  planet: Planet;
}

export interface BuildingBuildTarget extends BuildTargetBase {
  type: 'building';
  building: Building;
  level: number;
  planet: Planet;
}

export interface TechnologyBuildTarget extends BuildTargetBase {
  type: 'technology';
  technology: Technology;
  level: number;
}

export type BuildTarget =
  | ShipBuildTarget
  | DefenseBuildTarget
  | BuildingBuildTarget
  | TechnologyBuildTarget;
