/* eslint-disable @typescript-eslint/no-magic-numbers */
import {makeResources} from '@shared/models/resource';
import {Unit} from '@shared/models/unit';

export interface Defense extends Unit {
  type: 'defense';
}

export const RocketLauncher: Defense = {
  id: 401,
  name: 'Lanceur de missiles',
  type: 'defense',
  cost: makeResources({m: 2000, c: 0, d: 0}),
  structuralintegrity: 2000,
  shieldPower: 20,
  weaponPower: 80,
  rapidFire: new Map<Unit, number>(),
  requirements: [],
};

export const LightLaser: Defense = {
  id: 402,
  name: 'Artillerie laser légère',
  type: 'defense',
  cost: makeResources({m: 1500, c: 500, d: 0}),
  structuralintegrity: 2000,
  shieldPower: 25,
  weaponPower: 100,
  rapidFire: new Map<Unit, number>(),
  requirements: [],
};

export const HeavyLaser: Defense = {
  id: 403,
  name: 'Artillerie laser lourde',
  type: 'defense',
  cost: makeResources({m: 6000, c: 2000, d: 0}),
  structuralintegrity: 8000,
  shieldPower: 100,
  weaponPower: 250,
  rapidFire: new Map<Unit, number>(),
  requirements: [],
};

export const IonCannon: Defense = {
  id: 405,
  name: 'Artillerie à ions',
  type: 'defense',
  cost: makeResources({m: 2000, c: 6000, d: 0}),
  structuralintegrity: 8000,
  shieldPower: 500,
  weaponPower: 150,
  rapidFire: new Map<Unit, number>(),
  requirements: [],
};

// TODO - Max 1 by planet
export const SmallShieldDome: Defense = {
  id: 407,
  name: 'Petit bouclier',
  type: 'defense',
  cost: makeResources({m: 10000, c: 10000, d: 0}),
  structuralintegrity: 20000,
  shieldPower: 2000,
  weaponPower: 1,
  rapidFire: new Map<Unit, number>(),
  requirements: [],
};

// TODO - Max 1 by planet
export const LargeShieldDome: Defense = {
  id: 408,
  name: 'Grand bouclier',
  type: 'defense',
  cost: makeResources({m: 50000, c: 50000, d: 0}),
  structuralintegrity: 100000,
  shieldPower: 10000,
  weaponPower: 1,
  rapidFire: new Map<Unit, number>(),
  requirements: [],
};

export const GaussCannon: Defense = {
  id: 404,
  name: 'Canon de Gauss',
  type: 'defense',
  cost: makeResources({m: 20000, c: 15000, d: 2000}),
  structuralintegrity: 35000,
  shieldPower: 200,
  weaponPower: 1100,
  rapidFire: new Map<Unit, number>(),
  requirements: [],
};

export const PlasmaTurret: Defense = {
  id: 406,
  name: 'Lanceur de plasma',
  type: 'defense',
  cost: makeResources({m: 50000, c: 50000, d: 30000}),
  structuralintegrity: 100000,
  shieldPower: 300,
  weaponPower: 3000,
  rapidFire: new Map<Unit, number>(),
  requirements: [],
};

export const MissileInterceptor: Defense = {
  id: 502,
  name: 'Missile d`interception',
  type: 'defense',
  cost: makeResources({m: 8000, c: 0, d: 2000}),
  structuralintegrity: 8000,
  shieldPower: 1,
  weaponPower: 1,
  rapidFire: new Map<Unit, number>(),
  requirements: [],
};

export const MissileInterplanetary: Defense = {
  id: 503,
  name: 'Missile interplanétaire',
  type: 'defense',
  cost: makeResources({m: 12500, c: 2500, d: 10000}),
  structuralintegrity: 15000,
  shieldPower: 1,
  weaponPower: 12000,
  rapidFire: new Map<Unit, number>(),
  requirements: [],
};

export const AllDefenses: Defense[] = [
  RocketLauncher,
  LightLaser,
  HeavyLaser,
  IonCannon,
  SmallShieldDome,
  LargeShieldDome,
  GaussCannon,
  PlasmaTurret,
  MissileInterceptor,
  MissileInterplanetary,
];
