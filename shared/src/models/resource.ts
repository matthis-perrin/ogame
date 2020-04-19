import {Brand} from '@shared/utils/type_utils';

export enum ResourceType {
  Metal = 'metal',
  Crystal = 'crystal',
  Deuterium = 'metal',
}

export type MetalAmount = Brand<number, 'MetalAmount'>;
export type CrystalAmount = Brand<number, 'CrystalAmount'>;
export type DeuteriumAmount = Brand<number, 'DeuteriumAmount'>;
export type StandardUnitAmount = Brand<number, 'StandardUnitAmount'>;

export function makeResources(values: {m?: number; c?: number; d?: number}): Resources {
  const {m = 0, c = 0, d = 0} = values;
  return {
    metal: m as MetalAmount,
    crystal: c as CrystalAmount,
    deuterium: d as DeuteriumAmount,
  };
}

export interface Resources {
  metal: MetalAmount;
  crystal: CrystalAmount;
  deuterium: DeuteriumAmount;
}
