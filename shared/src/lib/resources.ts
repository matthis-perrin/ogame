import {Account} from '@shared/models/account';
import {Resources, StandardUnitAmount} from '@shared/models/resource';

export function toStandardUnits(account: Account, resources: Resources): StandardUnitAmount {
  const {resourcesRatio} = account.preferences;
  return (resources.metal / resourcesRatio.metal +
    resources.crystal / resourcesRatio.crystal +
    resources.deuterium / resourcesRatio.deuterium) as StandardUnitAmount;
}
