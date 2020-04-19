import {BuildOrderItem} from '@shared/lib/build_order';
import {createMainPlanet} from '@shared/lib/planet';
import {Account} from '@shared/models/account';
import {Technology} from '@shared/models/technology';
import {Universe} from '@shared/models/universe';

export function createNewAccount(universe: Universe): Account {
  return {
    universe,
    planets: [createMainPlanet(universe)],
    technologyLevels: new Map<Technology, number>(),
    preferences: {
      resourcesRatio: {
        metal: 2,
        crystal: 1.5,
        deuterium: 1,
      },
    },
  };
}

export function applyBuildItem(account: Account, item: BuildOrderItem): void {
  const {entity, level, planet} = item;
  if (entity.type === 'technology') {
    account.technologyLevels.set(entity, level);
  } else {
    planet.buildingLevels.set(entity, level);
  }
}
