import {createMainPlanet} from '@shared/lib/planet';
import {Account} from '@shared/models/account';
import {Technology} from '@shared/models/technology';
import {Universe} from '@shared/models/universe';

export function createNewAccount(universe: Universe): Account {
  return {
    universe,
    planets: [createMainPlanet(universe)],
    technologyLevels: new Map<Technology, number>(),
  };
}
