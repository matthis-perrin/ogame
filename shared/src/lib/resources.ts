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
  const parts: string[] = [];
  if (metal > 0) {
    parts.push(`M${metal.toLocaleString(undefined, {maximumFractionDigits: 1})}`);
  }
  if (crystal > 0) {
    parts.push(`C${crystal.toLocaleString(undefined, {maximumFractionDigits: 1})}`);
  }
  if (deuterium > 0) {
    parts.push(`D${deuterium.toLocaleString(undefined, {maximumFractionDigits: 1})}`);
  }
  return parts.length === 0 ? 'no resources' : parts.join(' - ');
}

export function fixFloatingPointAmount<U, T extends number | Brand<number, U>>(amount: T): T {
  // eslint-disable-next-line @typescript-eslint/no-magic-numbers
  return (Math.round((amount as number) * 10e8) / 10e8) as T;
}
