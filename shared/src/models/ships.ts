import {Shipyard} from '@shared/models/building';
import {
  GaussCannon,
  HeavyLaser,
  IonCannon,
  LightLaser,
  PlasmaTurret,
  RocketLauncher,
} from '@shared/models/defense';
import {makeResources} from '@shared/models/resource';
import {
  ArmourTechnology,
  CombustionDrive,
  EspionageTechnology,
  HyperspaceDrive,
  HyperspaceTechnology,
  ImpulseDrive,
  IonTechnology,
  LaserTechnology,
  PlasmaTechnology,
  ShieldingTechnology,
} from '@shared/models/technology';
import {Unit} from '@shared/models/unit';

/* eslint-disable @typescript-eslint/no-magic-numbers */
export interface Ship extends Unit {
  type: 'ship';
  cargoCapacity: number;
  baseSpeed: number;
  fuelConsumption: number;
}

export const EspionageProbe: Ship = {
  name: "Sonde d'espionnage",
  type: 'ship',
  cost: makeResources({m: 0, c: 1000, d: 0}),
  structuralintegrity: 1000,
  shieldPower: 0,
  weaponPower: 0,
  cargoCapacity: 1, // TODO - 5 on some universes
  baseSpeed: 100000000,
  fuelConsumption: 1,
  rapidFire: new Map<Unit, number>(),
  requirements: [
    {entity: Shipyard, level: 3},
    {entity: CombustionDrive, level: 3},
    {entity: EspionageTechnology, level: 2},
  ],
};

// TODO - Produce energy
export const SolarSatellite: Ship = {
  name: 'Satellite solaire',
  type: 'ship',
  cost: makeResources({m: 0, c: 2000, d: 500}),
  structuralintegrity: 2000,
  shieldPower: 1,
  weaponPower: 1,
  cargoCapacity: 0,
  baseSpeed: 0,
  fuelConsumption: 0,
  rapidFire: new Map<Unit, number>(),
  requirements: [{entity: Shipyard, level: 1}],
};

export const Crawler: Ship = {
  name: 'Foreuse',
  type: 'ship',
  cost: makeResources({m: 2000, c: 2000, d: 1000}), // TODO - Include energy cost
  structuralintegrity: 4000,
  shieldPower: 1,
  weaponPower: 1,
  cargoCapacity: 0,
  baseSpeed: 0,
  fuelConsumption: 0,
  rapidFire: new Map<Unit, number>(),
  requirements: [
    {entity: Shipyard, level: 5},
    {entity: CombustionDrive, level: 4},
    {entity: ArmourTechnology, level: 4},
    {entity: LaserTechnology, level: 4},
  ],
};

export const SmallCargo: Ship = {
  name: 'Petit transporteur',
  type: 'ship',
  cost: makeResources({m: 2000, c: 2000, d: 0}),
  structuralintegrity: 4000,
  shieldPower: 10,
  weaponPower: 5,
  cargoCapacity: 5000,
  baseSpeed: 5000,
  fuelConsumption: 10,
  rapidFire: new Map<Unit, number>([
    [EspionageProbe, 5],
    [SolarSatellite, 5],
    [Crawler, 5],
  ]),
  requirements: [
    {entity: Shipyard, level: 2},
    {entity: CombustionDrive, level: 2},
  ],
};

export const LargeCargo: Ship = {
  name: 'Grand transporteur',
  type: 'ship',
  cost: makeResources({m: 6000, c: 6000, d: 0}),
  structuralintegrity: 12000,
  shieldPower: 25,
  weaponPower: 5,
  cargoCapacity: 25000,
  baseSpeed: 7500,
  fuelConsumption: 50,
  rapidFire: new Map<Unit, number>([
    [EspionageProbe, 5],
    [SolarSatellite, 5],
    [Crawler, 5],
  ]),
  requirements: [
    {entity: Shipyard, level: 4},
    {entity: CombustionDrive, level: 6},
  ],
};

// TODO - Can recycle 100% of debris fields
export const Recycler: Ship = {
  name: 'Recycleur',
  type: 'ship',
  cost: makeResources({m: 10000, c: 6000, d: 2000}),
  structuralintegrity: 16000,
  shieldPower: 10,
  weaponPower: 1,
  cargoCapacity: 20000,
  baseSpeed: 2000,
  fuelConsumption: 300,
  rapidFire: new Map<Unit, number>([
    [EspionageProbe, 5],
    [SolarSatellite, 5],
    [Crawler, 5],
  ]),
  requirements: [
    {entity: Shipyard, level: 4},
    {entity: CombustionDrive, level: 6},
    {entity: ShieldingTechnology, level: 2},
  ],
};

export const ColonyShip: Ship = {
  name: 'Vaisseau de colonisation',
  type: 'ship',
  cost: makeResources({m: 10000, c: 20000, d: 10000}),
  structuralintegrity: 30000,
  shieldPower: 100,
  weaponPower: 50,
  cargoCapacity: 7500,
  baseSpeed: 2500,
  fuelConsumption: 1000,
  rapidFire: new Map<Unit, number>([
    [EspionageProbe, 5],
    [SolarSatellite, 5],
    [Crawler, 5],
  ]),
  requirements: [
    {entity: ImpulseDrive, level: 3},
    {entity: Shipyard, level: 4},
  ],
};

export const LightFighter: Ship = {
  name: 'Chasseur léger',
  type: 'ship',
  cost: makeResources({m: 3000, c: 1000, d: 0}),
  structuralintegrity: 4000,
  shieldPower: 10,
  weaponPower: 50,
  cargoCapacity: 50,
  baseSpeed: 12500,
  fuelConsumption: 20,
  rapidFire: new Map<Unit, number>([
    [EspionageProbe, 5],
    [SolarSatellite, 5],
    [Crawler, 5],
  ]),
  requirements: [
    {entity: Shipyard, level: 1},
    {entity: CombustionDrive, level: 1},
  ],
};

export const Cruiser: Ship = {
  name: 'Croiseur',
  type: 'ship',
  cost: makeResources({m: 20000, c: 7000, d: 2000}),
  structuralintegrity: 27000,
  shieldPower: 50,
  weaponPower: 400,
  cargoCapacity: 800,
  baseSpeed: 15000,
  fuelConsumption: 300,
  rapidFire: new Map<Unit, number>([
    [EspionageProbe, 5],
    [SolarSatellite, 5],
    [LightFighter, 6],
    [Crawler, 5],
    [RocketLauncher, 10],
  ]),
  requirements: [
    {entity: Shipyard, level: 5},
    {entity: ImpulseDrive, level: 4},
    {entity: IonTechnology, level: 2},
  ],
};

export const HeavyFighter: Ship = {
  name: 'Chasseur lourd',
  type: 'ship',
  cost: makeResources({m: 6000, c: 4000, d: 0}),
  structuralintegrity: 10000,
  shieldPower: 25,
  weaponPower: 150,
  cargoCapacity: 100,
  baseSpeed: 10000,
  fuelConsumption: 75,
  rapidFire: new Map<Unit, number>([
    [SmallCargo, 3],
    [EspionageProbe, 5],
    [SolarSatellite, 5],
    [Crawler, 5],
  ]),
  requirements: [
    {entity: Shipyard, level: 3},
    {entity: ArmourTechnology, level: 2},
    {entity: ImpulseDrive, level: 2},
  ],
};

export const Pathfinder: Ship = {
  name: 'Éclaireur',
  type: 'ship',
  cost: makeResources({m: 8000, c: 15000, d: 8000}),
  structuralintegrity: 23000,
  shieldPower: 100,
  weaponPower: 200,
  cargoCapacity: 10000,
  baseSpeed: 12000,
  fuelConsumption: 300,
  rapidFire: new Map<Unit, number>([
    [EspionageProbe, 5],
    [SolarSatellite, 5],
    [Crawler, 5],
    [Cruiser, 3],
    [LightFighter, 3],
    [HeavyFighter, 2],
  ]),
  requirements: [
    {entity: Shipyard, level: 5},
    {entity: HyperspaceDrive, level: 2},
    {entity: ShieldingTechnology, level: 4},
    // TODO - Requires the "classe explorateur"
  ],
};

export const Battleship: Ship = {
  name: 'Vaisseau de bataille',
  type: 'ship',
  cost: makeResources({m: 45000, c: 15000, d: 0}),
  structuralintegrity: 60000,
  shieldPower: 200,
  weaponPower: 1000,
  cargoCapacity: 1500,
  baseSpeed: 10000,
  fuelConsumption: 500,
  rapidFire: new Map<Unit, number>([
    [EspionageProbe, 5],
    [SolarSatellite, 5],
    [Crawler, 5],
    [Pathfinder, 5],
  ]),
  requirements: [
    {entity: HyperspaceDrive, level: 4},
    {entity: Shipyard, level: 7},
  ],
};

export const BattleCruiser: Ship = {
  name: 'Traqueur',
  type: 'ship',
  cost: makeResources({m: 30000, c: 40000, d: 15000}),
  structuralintegrity: 70000,
  shieldPower: 400,
  weaponPower: 700,
  cargoCapacity: 750,
  baseSpeed: 10000,
  fuelConsumption: 250,
  rapidFire: new Map<Unit, number>([
    [EspionageProbe, 5],
    [SolarSatellite, 5],
    [SmallCargo, 3],
    [LargeCargo, 3],
    [HeavyFighter, 4],
    [Cruiser, 4],
    [Battleship, 7],
    [Crawler, 5],
  ]),
  requirements: [
    {entity: HyperspaceTechnology, level: 5},
    {entity: HyperspaceDrive, level: 5},
    {entity: Shipyard, level: 8},
    {entity: LaserTechnology, level: 12},
  ],
};

export const Destroyer: Ship = {
  name: 'Destructeur',
  type: 'ship',
  cost: makeResources({m: 60000, c: 50000, d: 15000}),
  structuralintegrity: 110000,
  shieldPower: 500,
  weaponPower: 2000,
  cargoCapacity: 2000,
  baseSpeed: 5000,
  fuelConsumption: 1000,
  rapidFire: new Map<Unit, number>([
    [EspionageProbe, 5],
    [SolarSatellite, 5],
    [BattleCruiser, 2],
    [Crawler, 5],
    [LightLaser, 10],
  ]),
  requirements: [
    {entity: Shipyard, level: 9},
    {entity: HyperspaceDrive, level: 6},
    {entity: HyperspaceTechnology, level: 5},
  ],
};

export const Bomber: Ship = {
  name: 'Bombardier',
  type: 'ship',
  cost: makeResources({m: 50000, c: 25000, d: 15000}),
  structuralintegrity: 75000,
  shieldPower: 500,
  weaponPower: 1000,
  cargoCapacity: 500,
  baseSpeed: 4000,
  fuelConsumption: 700,
  rapidFire: new Map<Unit, number>([
    [EspionageProbe, 5],
    [SolarSatellite, 5],
    [Crawler, 5],
    [RocketLauncher, 20],
    [LightLaser, 20],
    [HeavyLaser, 10],
    [IonCannon, 10],
    [GaussCannon, 5],
    [PlasmaTurret, 5],
  ]),
  requirements: [
    {entity: PlasmaTechnology, level: 5},
    {entity: ImpulseDrive, level: 6},
    {entity: Shipyard, level: 8},
  ],
};

// TODO - Can recycle 25% of debris fields
export const Reaper: Ship = {
  name: 'Faucheur',
  type: 'ship',
  cost: makeResources({m: 85000, c: 55000, d: 20000}),
  structuralintegrity: 140000,
  shieldPower: 700,
  weaponPower: 2800,
  cargoCapacity: 10000,
  baseSpeed: 7000,
  fuelConsumption: 1100,
  rapidFire: new Map<Unit, number>([
    [EspionageProbe, 5],
    [SolarSatellite, 5],
    [Crawler, 5],
    [Battleship, 7],
    [Bomber, 4],
    [Destroyer, 3],
  ]),
  requirements: [
    {entity: Shipyard, level: 10},
    {entity: HyperspaceTechnology, level: 6},
    {entity: HyperspaceDrive, level: 7},
    {entity: ShieldingTechnology, level: 6},
  ],
};

/* eslint-enable @typescript-eslint/no-magic-numbers */

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
