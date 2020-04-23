import {Brand, multiply, substract, sum} from '@shared/utils/type_utils';

export enum ResourceType {
  Metal = 'metal',
  Crystal = 'crystal',
  Deuterium = 'metal',
}

export type MetalAmount = Brand<number, 'MetalAmount'>;
export type CrystalAmount = Brand<number, 'CrystalAmount'>;
export type DeuteriumAmount = Brand<number, 'DeuteriumAmount'>;
export type StandardUnitAmount = Brand<number, 'StandardUnitAmount'>;
export type EnergyAmount = Brand<number, 'EnergyAmount'>;

export const ZERO_METAL = 0 as MetalAmount;
export const ZERO_CRYSTAL = 0 as CrystalAmount;
export const ZERO_DEUTERIUM = 0 as DeuteriumAmount;
export const ZERO_ENERGY = 0 as EnergyAmount;
export interface Resources {
  readonly metal: MetalAmount;
  readonly crystal: CrystalAmount;
  readonly deuterium: DeuteriumAmount;
}

export function makeResources(values: {m?: number; c?: number; d?: number}): Resources {
  const {m = 0, c = 0, d = 0} = values;
  return {
    metal: m as MetalAmount,
    crystal: c as CrystalAmount,
    deuterium: d as DeuteriumAmount,
  };
}

export function addResources(r1: Resources, r2: Resources): Resources {
  return {
    metal: sum(r1.metal, r2.metal),
    crystal: sum(r1.crystal, r2.crystal),
    deuterium: sum(r1.deuterium, r2.deuterium),
  };
}

export function multiplyResources(r: Resources, times: number): Resources {
  return {
    metal: multiply(r.metal, times),
    crystal: multiply(r.crystal, times),
    deuterium: multiply(r.deuterium, times),
  };
}

export function substractResources(r1: Resources, r2: Resources): Resources {
  return {
    metal: substract(r1.metal, r2.metal),
    crystal: substract(r1.crystal, r2.crystal),
    deuterium: substract(r1.deuterium, r2.deuterium),
  };
}

export function hasNegativeAmount({metal, crystal, deuterium}: Resources): boolean {
  return metal < 0 || crystal < 0 || deuterium < 0;
}
