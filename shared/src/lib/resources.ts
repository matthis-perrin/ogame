import {Account} from '@shared/models/account';
import {Resources, StandardUnitAmount} from '@shared/models/resource';
import {Brand} from '@shared/utils/type_utils';

export function toStandardUnits(account: Account, resources: Resources): StandardUnitAmount {
  const {resourcesRatio} = account.preferences;
  return (resources.metal / resourcesRatio.metal +
    resources.crystal / resourcesRatio.crystal +
    resources.deuterium / resourcesRatio.deuterium) as StandardUnitAmount;
}

export function resourcesToString(resources: Resources): string {
  const {metal, crystal, deuterium} = resources;
  return `M ${metal.toLocaleString()} - C ${crystal.toLocaleString()} - D ${deuterium.toLocaleString()}`;
}

export function fixFloatingPointAmount<U, T extends number | Brand<number, U>>(amount: T): T {
  // eslint-disable-next-line @typescript-eslint/no-magic-numbers
  return (Math.round((amount as number) * 10e8) / 10e8) as T;
}
