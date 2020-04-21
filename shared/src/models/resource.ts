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
export interface Resources {
  metal: MetalAmount;
  crystal: CrystalAmount;
  deuterium: DeuteriumAmount;
}

export function makeResources(values: {m?: number; c?: number; d?: number}): Resources {
  const {m = 0, c = 0, d = 0} = values;
  return {
    metal: m as MetalAmount,
    crystal: c as CrystalAmount,
    deuterium: d as DeuteriumAmount,
  };
}

export function incrementResources(r1: Resources, increment: Resources): void {
  const {metal, crystal, deuterium} = increment;
  r1.metal = sum(r1.metal, metal);
  r1.crystal = sum(r1.crystal, crystal);
  r1.deuterium = sum(r1.deuterium, deuterium);
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
