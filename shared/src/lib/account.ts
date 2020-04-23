/* eslint-disable @typescript-eslint/no-magic-numbers */
import {createRandomMainPlanet} from '@shared/lib/planet';
import {updateReadonlyMap} from '@shared/lib/readonly_update';
import {Account, Class, InProgressTechnology} from '@shared/models/account';
import {ResearchLab} from '@shared/models/building';
import {Planet} from '@shared/models/planet';
import {Technology} from '@shared/models/technology';
import {Milliseconds, ZERO} from '@shared/models/time';
import {Universe} from '@shared/models/universe';

//
// Account Creation
//

export function createNewAccount(universe: Universe): Account {
  const mainPlanet = createRandomMainPlanet(universe);
  return {
    currentTime: ZERO,
    planets: new Map([[mainPlanet.id, mainPlanet]]),
    technologyLevels: new Map<Technology, number>(),
    universe,
    class: Class.Collector,
    officers: {
      commander: false,
      fleetAdmiral: false,
      engineer: false,
      geologist: false,
      technocrat: false,
    },
    preferences: {
      maxProdHoursOnPlanet: 6,
      resourcesRatio: {
        metal: 2.5,
        crystal: 1.5,
        deuterium: 1,
      },
    },
  };
}

//
// Account Mutation
//

export function updateAccountPlanet(account: Account, newPlanet: Planet): Account {
  return {...account, planets: updateReadonlyMap(account.planets, newPlanet.id, newPlanet)};
}

export function updateAccountTechnology(
  account: Account,
  technology: Technology,
  level: number
): Account {
  return {
    ...account,
    technologyLevels: updateReadonlyMap(account.technologyLevels, technology, level),
  };
}

export function updateAccountCurrentTime(account: Account, newCurrentTime: Milliseconds): Account {
  return {...account, currentTime: newCurrentTime};
}

export function updateAccountInProgressTechnology(
  account: Account,
  inProgressTechnology: InProgressTechnology | undefined
): Account {
  return {...account, inProgressTechnology};
}

export function finishAccountInProgressTechnology(
  account: Account,
  inProgressTechnology: InProgressTechnology
): Account {
  return {
    ...account,
    inProgressTechnology: undefined,
    technologyLevels: updateReadonlyMap(
      account.technologyLevels,
      inProgressTechnology.technology,
      inProgressTechnology.level
    ),
  };
}

//
// Others
//

export function bestPlanetForResearch(
  account: Account
): {bestPlanet: Planet; researchLabLevel: number} {
  const bestResearchLabLevel = 0;
  let bestPlanet: Planet | undefined;
  for (const planet of account.planets.values()) {
    const researchLabLevel = planet.buildingLevels.get(ResearchLab) ?? 0;
    if (researchLabLevel > bestResearchLabLevel) {
      bestPlanet = planet;
    }
  }
  if (!bestPlanet) {
    throw new Error(`No planet with a research lab`);
  }
  return {bestPlanet, researchLabLevel: bestResearchLabLevel};
}
