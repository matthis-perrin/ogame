/* eslint-disable @typescript-eslint/no-magic-numbers */
import {makeResources} from '@shared/models/resource';
import {
  CombustionDrive,
  HyperspaceDrive,
  ImpulseDrive,
  Technology,
} from '@shared/models/technology';
import {Unit} from '@shared/models/unit';

export interface Ship extends Unit {
  type: 'ship';
  cargoCapacity: number;
  baseSpeed: number;
  initialDriveTechnology: Technology | undefined;
  fuelConsumption: number;
}

export const EspionageProbe: Ship = {
  id: 210,
  name: 'Sonde d`espionnage',
  type: 'ship',
  cost: makeResources({m: 0, c: 1000, d: 0}),
  structuralintegrity: 1000,
  shieldPower: 0,
  weaponPower: 0,
  cargoCapacity: 1, // TODO - 5 on some universes
  baseSpeed: 100000000,
  initialDriveTechnology: CombustionDrive,
  fuelConsumption: 1,
  rapidFire: new Map<Unit, number>(),
  requirements: [],
  component: 'shipyard',
};

// TODO - Produce energy
export const SolarSatellite: Ship = {
  id: 212,
  name: 'Satellite solaire',
  type: 'ship',
  cost: makeResources({m: 0, c: 2000, d: 500}),
  structuralintegrity: 2000,
  shieldPower: 1,
  weaponPower: 1,
  cargoCapacity: 0,
  baseSpeed: 0,
  initialDriveTechnology: undefined,
  fuelConsumption: 0,
  rapidFire: new Map<Unit, number>(),
  requirements: [],
  component: 'supplies',
};

export const Crawler: Ship = {
  id: 217,
  name: 'Foreuse',
  type: 'ship',
  cost: makeResources({m: 2000, c: 2000, d: 1000}), // TODO - Include energy cost
  structuralintegrity: 4000,
  shieldPower: 1,
  weaponPower: 1,
  cargoCapacity: 0,
  baseSpeed: 0,
  initialDriveTechnology: undefined,
  fuelConsumption: 0,
  rapidFire: new Map<Unit, number>(),
  requirements: [],
  component: 'shipyard',
};

export const SmallCargo: Ship = {
  id: 202,
  name: 'Petit transporteur',
  type: 'ship',
  cost: makeResources({m: 2000, c: 2000, d: 0}),
  structuralintegrity: 4000,
  shieldPower: 10,
  weaponPower: 5,
  cargoCapacity: 5000,
  baseSpeed: 5000,
  initialDriveTechnology: CombustionDrive,
  fuelConsumption: 10,
  rapidFire: new Map<Unit, number>(),
  requirements: [],
  component: 'shipyard',
};

export const LargeCargo: Ship = {
  id: 203,
  name: 'Grand transporteur',
  type: 'ship',
  cost: makeResources({m: 6000, c: 6000, d: 0}),
  structuralintegrity: 12000,
  shieldPower: 25,
  weaponPower: 5,
  cargoCapacity: 25000,
  baseSpeed: 7500,
  initialDriveTechnology: CombustionDrive,
  fuelConsumption: 50,
  rapidFire: new Map<Unit, number>(),
  requirements: [],
  component: 'shipyard',
};

// TODO - Can recycle 100% of debris fields
export const Recycler: Ship = {
  id: 209,
  name: 'Recycleur',
  type: 'ship',
  cost: makeResources({m: 10000, c: 6000, d: 2000}),
  structuralintegrity: 16000,
  shieldPower: 10,
  weaponPower: 1,
  cargoCapacity: 20000,
  baseSpeed: 2000,
  initialDriveTechnology: CombustionDrive,
  fuelConsumption: 300,
  rapidFire: new Map<Unit, number>(),
  requirements: [],
  component: 'shipyard',
};

export const ColonyShip: Ship = {
  id: 208,
  name: 'Vaisseau de colonisation',
  type: 'ship',
  cost: makeResources({m: 10000, c: 20000, d: 10000}),
  structuralintegrity: 30000,
  shieldPower: 100,
  weaponPower: 50,
  cargoCapacity: 7500,
  baseSpeed: 2500,
  initialDriveTechnology: ImpulseDrive,
  fuelConsumption: 1000,
  rapidFire: new Map<Unit, number>(),
  requirements: [],
  component: 'shipyard',
};

export const LightFighter: Ship = {
  id: 204,
  name: 'Chasseur léger',
  type: 'ship',
  cost: makeResources({m: 3000, c: 1000, d: 0}),
  structuralintegrity: 4000,
  shieldPower: 10,
  weaponPower: 50,
  cargoCapacity: 50,
  baseSpeed: 12500,
  initialDriveTechnology: CombustionDrive,
  fuelConsumption: 20,
  rapidFire: new Map<Unit, number>(),
  requirements: [],
  component: 'shipyard',
};

export const Cruiser: Ship = {
  id: 206,
  name: 'Croiseur',
  type: 'ship',
  cost: makeResources({m: 20000, c: 7000, d: 2000}),
  structuralintegrity: 27000,
  shieldPower: 50,
  weaponPower: 400,
  cargoCapacity: 800,
  baseSpeed: 15000,
  initialDriveTechnology: ImpulseDrive,
  fuelConsumption: 300,
  rapidFire: new Map<Unit, number>(),
  requirements: [],
  component: 'shipyard',
};

export const HeavyFighter: Ship = {
  id: 205,
  name: 'Chasseur lourd',
  type: 'ship',
  cost: makeResources({m: 6000, c: 4000, d: 0}),
  structuralintegrity: 10000,
  shieldPower: 25,
  weaponPower: 150,
  cargoCapacity: 100,
  baseSpeed: 10000,
  initialDriveTechnology: ImpulseDrive,
  fuelConsumption: 75,
  rapidFire: new Map<Unit, number>(),
  requirements: [],
  component: 'shipyard',
};

export const Pathfinder: Ship = {
  id: 219,
  name: 'Éclaireur',
  type: 'ship',
  cost: makeResources({m: 8000, c: 15000, d: 8000}),
  structuralintegrity: 23000,
  shieldPower: 100,
  weaponPower: 200,
  cargoCapacity: 10000,
  baseSpeed: 12000,
  initialDriveTechnology: HyperspaceDrive,
  fuelConsumption: 300,
  rapidFire: new Map<Unit, number>(),
  requirements: [],
  component: 'shipyard',
};

export const Battleship: Ship = {
  id: 207,
  name: 'Vaisseau de bataille',
  type: 'ship',
  cost: makeResources({m: 45000, c: 15000, d: 0}),
  structuralintegrity: 60000,
  shieldPower: 200,
  weaponPower: 1000,
  cargoCapacity: 1500,
  baseSpeed: 10000,
  initialDriveTechnology: HyperspaceDrive,
  fuelConsumption: 500,
  rapidFire: new Map<Unit, number>(),
  requirements: [],
  component: 'shipyard',
};

export const BattleCruiser: Ship = {
  id: 215,
  name: 'Traqueur',
  type: 'ship',
  cost: makeResources({m: 30000, c: 40000, d: 15000}),
  structuralintegrity: 70000,
  shieldPower: 400,
  weaponPower: 700,
  cargoCapacity: 750,
  baseSpeed: 10000,
  initialDriveTechnology: HyperspaceDrive,
  fuelConsumption: 250,
  rapidFire: new Map<Unit, number>(),
  requirements: [],
  component: 'shipyard',
};

export const Destroyer: Ship = {
  id: 213,
  name: 'Destructeur',
  type: 'ship',
  cost: makeResources({m: 60000, c: 50000, d: 15000}),
  structuralintegrity: 110000,
  shieldPower: 500,
  weaponPower: 2000,
  cargoCapacity: 2000,
  baseSpeed: 5000,
  initialDriveTechnology: HyperspaceDrive,
  fuelConsumption: 1000,
  rapidFire: new Map<Unit, number>(),
  requirements: [],
  component: 'shipyard',
};

export const Bomber: Ship = {
  id: 211,
  name: 'Bombardier',
  type: 'ship',
  cost: makeResources({m: 50000, c: 25000, d: 15000}),
  structuralintegrity: 75000,
  shieldPower: 500,
  weaponPower: 1000,
  cargoCapacity: 500,
  baseSpeed: 4000,
  initialDriveTechnology: ImpulseDrive,
  fuelConsumption: 700,
  rapidFire: new Map<Unit, number>(),
  requirements: [],
  component: 'shipyard',
};

// TODO - Can recycle 25% of debris fields
export const Reaper: Ship = {
  id: 218,
  name: 'Faucheur',
  type: 'ship',
  cost: makeResources({m: 85000, c: 55000, d: 20000}),
  structuralintegrity: 140000,
  shieldPower: 700,
  weaponPower: 2800,
  cargoCapacity: 10000,
  baseSpeed: 7000,
  initialDriveTechnology: HyperspaceDrive,
  fuelConsumption: 1100,
  rapidFire: new Map<Unit, number>(),
  requirements: [],
  component: 'shipyard',
};

export const AllShips: Ship[] = [
  EspionageProbe,
  SolarSatellite,
  Crawler,
  SmallCargo,
  LargeCargo,
  Recycler,
  ColonyShip,
  LightFighter,
  Cruiser,
  HeavyFighter,
  Pathfinder,
  Battleship,
  BattleCruiser,
  Destroyer,
  Bomber,
  Reaper,
];
