import {fixFloatingPointAmount} from '@shared/lib/resources';
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
    metal: fixFloatingPointAmount(m) as MetalAmount,
    crystal: fixFloatingPointAmount(c) as CrystalAmount,
    deuterium: fixFloatingPointAmount(d) as DeuteriumAmount,
  };
}

export function addResources(r1: Resources, r2: Resources): Resources {
  return {
    metal: fixFloatingPointAmount(sum(r1.metal, r2.metal)),
    crystal: fixFloatingPointAmount(sum(r1.crystal, r2.crystal)),
    deuterium: fixFloatingPointAmount(sum(r1.deuterium, r2.deuterium)),
  };
}

export function multiplyResources(r: Resources, times: number): Resources {
  return {
    metal: fixFloatingPointAmount(multiply(r.metal, times)),
    crystal: fixFloatingPointAmount(multiply(r.crystal, times)),
    deuterium: fixFloatingPointAmount(multiply(r.deuterium, times)),
  };
}

export function substractResources(r1: Resources, r2: Resources): Resources {
  return {
    metal: fixFloatingPointAmount(substract(r1.metal, r2.metal)),
    crystal: fixFloatingPointAmount(substract(r1.crystal, r2.crystal)),
    deuterium: fixFloatingPointAmount(substract(r1.deuterium, r2.deuterium)),
  };
}

export function hasNegativeAmount({metal, crystal, deuterium}: Resources): boolean {
  return metal < 0 || crystal < 0 || deuterium < 0;
}
