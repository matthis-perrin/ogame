/* eslint-disable @typescript-eslint/no-use-before-define */
import {
  finishAccountInProgressTechnology,
  updateAccountCurrentTime,
  updateAccountInProgressTechnology,
  updateAccountPlanet,
} from '@shared/lib/account';
import {buildItemCost, buildItemToString, isEnergyConsumerBuildable} from '@shared/lib/build_items';
import {
  getCheapestBuildItemsForMissingEnergyPerHour,
  getInProgressEnergyDeltaPerHour,
} from '@shared/lib/energy';
import {
  getBuildingBuildTime,
  getDefensesBuildTime,
  getShipsBuildTime,
  getTechnologyBuildTime,
} from '@shared/lib/formula';
import {
  finishPlanetInProgressBuilding,
  updatePlanetDefenses,
  updatePlanetInProgressBuilding,
  updatePlanetInProgressDefenses,
  updatePlanetInProgressShips,
  updatePlanetResources,
  updatePlanetShips,
} from '@shared/lib/planet';
import {getPlanetProductionPerHour} from '@shared/lib/production';
import {isBuildableAvailableOnPlanet} from '@shared/lib/requirement_tree';
import {fixFloatingPointAmount, resourcesToString} from '@shared/lib/resources';
import {Account} from '@shared/models/account';
import {BuildItem} from '@shared/models/build_item';
import {
  CrystalMine,
  DeuteriumSynthesizer,
  FusionReactor,
  MetalMine,
  NaniteFactory,
  ResearchLab,
  RoboticsFactory,
  Shipyard,
  SolarPlant,
} from '@shared/models/building';
import {Defense} from '@shared/models/defense';
import {Planet} from '@shared/models/planet';
import {
  addResources,
  hasNegativeAmount,
  multiplyResources,
  Resources,
  substractResources,
} from '@shared/models/resource';
import {Crawler, Ship, SolarSatellite} from '@shared/models/ships';
import {EnergyTechnology, PlasmaTechnology} from '@shared/models/technology';
import {hoursToMilliseconds, Milliseconds, NEVER, ONE_HOUR, ZERO} from '@shared/models/time';
import {AccountTimeline, TransitionnedAccount} from '@shared/models/timeline';
import {max, multiply, neverHappens, substract, sum} from '@shared/utils/type_utils';

export function createAccountTimeline(account: Account, buildItems: BuildItem[]): AccountTimeline {
  const transitions: TransitionnedAccount[] = [];
  let currentAccount = account;

  for (const buildItem of buildItems) {
    try {
      // console.log(`Handling build item ${buildItemToString(buildItem)}`);
      const newTransactions = advanceAccountTowardBuildItem(currentAccount, buildItem);
      // console.log(newTransactions);
      transitions.push(...newTransactions);
      currentAccount = transitions[transitions.length - 1].transitionnedAccount;
    } catch (err) {
      console.log('Error while creating the account timeline');
      console.error(err);
      // console.log('Transitions applied');
      // function transitionToString(transition: Transition): string {
      //   if (transition.type === 'wait') {
      //     return `[WAIT] ${transition.duration} (Reason: ${
      //       transition.reason
      //     })\nEvents: ${JSON.stringify(transition.events)}`;
      //   }
      //   return `[BUILD] ${buildItemToString(transition.buildItem)}`;
      // }
      // for (const transition of transitions) {
      //   console.log(transitionToString(transition.transition));
      // }
      // advanceAccountTowardBuildItem(currentAccount, buildItem);
      break;
    }
  }

  return {
    start: account,
    transitions,
  };
}

// function nextTransitionForBuildItems(account: Account, previousStep: TimelineStep | undefined, remainingBuildItems: BuildItem[]): AccountTransition {
//   const nextItem = remainingBuildItems[0];
//   if (nextItem === undefined) {
//     throw new Error('Cannot create transition: no more build item');
//   }
// }

function advanceAccountTowardBuildItem(
  account: Account,
  buildItem: BuildItem
): TransitionnedAccount[] {
  const buildItemsFromEnergyCheck = requiredBuildItemsFromEnergyCheck(account);
  const isEnergyConsumingBuildItem = isEnergyConsumerBuildable(buildItem.buildable);
  const hasRequiredBuildItemFromEnergyCheck = buildItemsFromEnergyCheck.reduce(
    (res, item) => res || buildItem.planetId === item.planetId,
    false
  );

  const planet = account.planets.get(buildItem.planetId);
  if (!planet) {
    throw new Error(`No planet with id ${buildItem.planetId} on the account`);
  }

  // const hasEnergyProducerBuildItemsForPlanet;

  if (buildItemsFromEnergyCheck.length > 0) {
    if (isEnergyConsumingBuildItem && hasRequiredBuildItemFromEnergyCheck) {
      const steps = buildItemsToTransitions(account, buildItemsFromEnergyCheck);
      return [
        ...steps,
        ...advanceAccountTowardBuildItem(steps[steps.length - 1].transitionnedAccount, buildItem),
      ];
    } else {
      return buildItemsToTransitions(account, [...buildItemsFromEnergyCheck, buildItem]);
    }
  }

  // TODO - Ghost / Defense / Storage / Non useful tech checks

  const waitTime = timeBeforeApplyingBuildItem(account, buildItem);
  if (waitTime.time === 0) {
    return [
      {
        transition: {type: 'build', buildItem},
        transitionnedAccount: applyBuildItem(account, buildItem),
      },
    ];
  } else {
    const {newAccount, events} = advanceAccountInTime(account, waitTime.time);
    return [
      {
        transition: {type: 'wait', duration: waitTime.time, reason: waitTime.reason, events},
        transitionnedAccount: newAccount,
      },
      ...advanceAccountTowardBuildItem(newAccount, buildItem),
    ];
  }
}

function requiredBuildItemsFromEnergyCheck(account: Account): BuildItem[] {
  const requiredBuildItems: BuildItem[] = [];
  const energyLevel = account.technologyLevels.get(EnergyTechnology) ?? 0;
  for (const planet of account.planets.values()) {
    const {energyConsumption, energyProduction} = getPlanetProductionPerHour(account, planet);
    if (
      sum(energyProduction, getInProgressEnergyDeltaPerHour(account, planet, energyLevel)) <=
      energyConsumption
    ) {
      const buildItems = getCheapestBuildItemsForMissingEnergyPerHour(
        account,
        planet,
        substract(energyConsumption, energyProduction)
      );
      requiredBuildItems.push(...buildItems);
    }
  }
  return requiredBuildItems;
}

const APPLY_NOW = {time: ZERO, reason: ''};

function timeBeforeBuildingTechnologyRelatedItem(
  account: Account
): {time: Milliseconds; reason: string} {
  // Check if already a technology in progress on the account
  if (account.inProgressTechnology) {
    return {
      time: substract(account.inProgressTechnology.endTime, account.currentTime),
      reason: `Technology ${account.inProgressTechnology.technology.name} in progress`,
    };
  }
  // Check if any planet is upgrading the research lab
  for (const planet of account.planets.values()) {
    if (planet.inProgressBuilding?.building === ResearchLab) {
      return {
        time: substract(planet.inProgressBuilding.endTime, account.currentTime),
        reason: `Research lab is upgrading on planet ${planet.id}`,
      };
    }
  }
  return APPLY_NOW;
}

function timeBeforeShipyardOrNaniteDoneOnPlanet(
  account: Account,
  planet: Planet
): {time: Milliseconds; reason: string} {
  // Check if the shipyard or the nanite are in progress on the planet
  if (
    planet.inProgressBuilding &&
    [Shipyard, NaniteFactory].includes(planet.inProgressBuilding.building)
  ) {
    return {
      time: substract(planet.inProgressBuilding.endTime, account.currentTime),
      reason: `Building ${planet.inProgressBuilding.building.name} is upgrading on the planet`,
    };
  }
  return APPLY_NOW;
}

function timeBeforeUnitsDoneOnPlanet(
  account: Account,
  planet: Planet
): {time: Milliseconds; reason: string} {
  // Check if some defenses or ships are queued on the planet
  const timeWhenShipsDone = planet.inProgressShips?.endTime;
  const timeWhenDefensesDone = planet.inProgressDefenses?.endTime;
  if (timeWhenShipsDone === undefined) {
    if (timeWhenDefensesDone === undefined) {
      return APPLY_NOW;
    }
    return {
      time: substract(timeWhenDefensesDone, account.currentTime),
      reason: `Defenses are in progress on the planet`,
    };
  } else if (timeWhenDefensesDone === undefined) {
    return {
      time: substract(timeWhenShipsDone, account.currentTime),
      reason: `Ships are in progress on the planet`,
    };
  } else {
    return {
      time: substract(max(timeWhenShipsDone, timeWhenDefensesDone), account.currentTime),
      reason: `Ships and defenses are in progress on the planet`,
    };
  }
}

function timeBeforeApplyingBuildItem(
  account: Account,
  buildItem: BuildItem
): {time: Milliseconds; reason: string} {
  const planet = account.planets.get(buildItem.planetId);
  if (!planet) {
    throw new Error(`No planet with id ${buildItem.planetId} on the account`);
  }

  if (!isBuildableAvailableOnPlanet(account, planet, buildItem.buildable)) {
    return {time: NEVER, reason: 'requirements not met'};
  }

  const cost = buildItemCost(buildItem);
  const requiredResources = substractResources(cost, planet.resources);
  const {prod} = getPlanetProductionPerHour(account, planet);
  const timeForMetal =
    requiredResources.metal > 0 ? hoursToMilliseconds(requiredResources.metal / prod.metal) : ZERO;
  const timeForCrystal =
    requiredResources.crystal > 0
      ? hoursToMilliseconds(requiredResources.crystal / prod.crystal)
      : ZERO;
  const timeForDeuterium =
    requiredResources.deuterium > 0
      ? hoursToMilliseconds(requiredResources.deuterium / prod.deuterium)
      : ZERO;
  const timeForResources = fixFloatingPointAmount(
    max(ZERO, timeForMetal, timeForCrystal, timeForDeuterium)
  );

  const mergeWaitTime = (wait: {
    time: Milliseconds;
    reason: string;
  }): {time: Milliseconds; reason: string} => {
    if (timeForResources === 0) {
      return wait;
    }
    const timeForResourceReason = `Waiting for resources to get ${buildItemToString(
      buildItem
    )} (need ${resourcesToString(requiredResources)})`;
    if (wait.time === 0) {
      return {
        time: timeForResources,
        reason: timeForResourceReason,
      };
    }
    return {
      time: max(timeForResources, wait.time),
      reason: `${timeForResourceReason} + ${wait.reason}`,
    };
  };

  // Technology
  if (buildItem.type === 'technology') {
    return mergeWaitTime(timeBeforeBuildingTechnologyRelatedItem(account));
  }

  // Building
  if (buildItem.type === 'building') {
    if (planet.inProgressBuilding) {
      return mergeWaitTime({
        time: substract(planet.inProgressBuilding.endTime, account.currentTime),
        reason: `Building ${planet.inProgressBuilding.building.name} is upgrading on the planet`,
      });
    }
    if (buildItem.buildable === ResearchLab) {
      return mergeWaitTime(timeBeforeBuildingTechnologyRelatedItem(account));
    }
    if (buildItem.buildable === Shipyard || buildItem.buildable === NaniteFactory) {
      return mergeWaitTime(timeBeforeUnitsDoneOnPlanet(account, planet));
    }
    return mergeWaitTime(APPLY_NOW);
  }

  // Ship & Defense
  if (buildItem.type === 'ship' || buildItem.type === 'defense') {
    return mergeWaitTime(timeBeforeShipyardOrNaniteDoneOnPlanet(account, planet));
  }

  neverHappens(buildItem);
}

function buildItemsToTransitions(
  account: Account,
  buildItems: BuildItem[]
): TransitionnedAccount[] {
  if (buildItems.length === 0) {
    return [];
  }

  const buildItemsWithApplicationTime = buildItems
    .map(buildItem => ({
      buildItem,
      ...timeBeforeApplyingBuildItem(account, buildItem),
    }))
    .sort((a, b) => a.time - b.time);

  const earliest = buildItemsWithApplicationTime[0];
  let currentAccount = account;
  const transitions: TransitionnedAccount[] = [];
  if (earliest.time < ZERO) {
    throw new Error(`Item can not be applied in the past`);
  }
  if (earliest.time > ZERO) {
    const {events, newAccount, fullyAdvanced} = advanceAccountInTime(account, earliest.time);
    currentAccount = newAccount;
    transitions.push({
      transitionnedAccount: newAccount,
      transition: {
        type: 'wait',
        duration: earliest.time,
        reason: earliest.reason,
        events,
      },
    });
    if (!fullyAdvanced) {
      return [...transitions, ...buildItemsToTransitions(currentAccount, buildItems)];
    }
  }

  currentAccount = applyBuildItem(currentAccount, earliest.buildItem);
  transitions.push({
    transitionnedAccount: currentAccount,
    transition: {
      type: 'build',
      buildItem: earliest.buildItem,
    },
  });

  return [
    ...transitions,
    ...buildItemsToTransitions(
      currentAccount,
      buildItems.filter(buildItem => buildItem !== earliest.buildItem)
    ),
  ];
}

export function applyBuildItem(account: Account, buildItem: BuildItem): Account {
  let newAccount = account;

  // Planet exists check
  const planet = newAccount.planets.get(buildItem.planetId);
  if (!planet) {
    throw new Error(`No planet with id ${buildItem.planetId} on the account`);
  }
  let newPlanet = planet;

  // Requirements met check
  const availability = isBuildableAvailableOnPlanet(newAccount, planet, buildItem.buildable);
  if (!availability.isAvailable) {
    throw new Error(
      `Requirements not met for ${buildItemToString(buildItem)} (${availability.reason})`
    );
  }

  // Cost check
  const cost = buildItemCost(buildItem);
  const newPlanetResources = substractResources(newPlanet.resources, cost);
  if (hasNegativeAmount(newPlanetResources)) {
    throw new Error(
      `Not enough resources for ${buildItemToString(buildItem)} (has ${resourcesToString(
        newPlanet.resources
      )}, will have ${resourcesToString(newPlanetResources)} after building)`
    );
  }

  const researchLabLevel = newPlanet.buildingLevels.get(ResearchLab) ?? 0;
  const roboticsLevel = newPlanet.buildingLevels.get(RoboticsFactory) ?? 0;
  const naniteLevel = newPlanet.buildingLevels.get(NaniteFactory) ?? 0;
  const shipyardLevel = newPlanet.buildingLevels.get(Shipyard) ?? 0;

  newPlanet = updatePlanetResources(newPlanet, newPlanetResources);
  newAccount = updateAccountPlanet(newAccount, newPlanet);

  if (buildItem.type === 'technology') {
    if (newAccount.inProgressTechnology !== undefined) {
      throw new Error(
        `Cannot apply ${buildItemToString(buildItem)}. ${
          newAccount.inProgressTechnology.technology.name
        } is already in progress on the account`
      );
    }
    const duration = getTechnologyBuildTime(
      buildItem.buildable,
      buildItem.level,
      researchLabLevel,
      newAccount.universe.researchSpeed
    );
    return updateAccountInProgressTechnology(newAccount, {
      startTime: newAccount.currentTime,
      endTime: sum(newAccount.currentTime, duration),
      level: buildItem.level,
      technology: buildItem.buildable,
    });
  }

  if (buildItem.type === 'building') {
    if (newPlanet.inProgressBuilding !== undefined) {
      throw new Error(
        `Cannot apply ${buildItemToString(buildItem)}. ${
          newPlanet.inProgressBuilding.building.name
        } is already in progress on ${newPlanet.id}`
      );
    }
    const duration = getBuildingBuildTime(
      buildItem.buildable,
      buildItem.level,
      roboticsLevel,
      naniteLevel,
      newAccount.universe.economySpeed
    );
    newPlanet = updatePlanetInProgressBuilding(newPlanet, {
      startTime: newAccount.currentTime,
      endTime: sum(newAccount.currentTime, duration),
      level: buildItem.level,
      building: buildItem.buildable,
    });
    return updateAccountPlanet(newAccount, newPlanet);
  }

  if (buildItem.type === 'ship') {
    const duration = getShipsBuildTime(
      buildItem.buildable,
      buildItem.quantity,
      shipyardLevel,
      naniteLevel,
      newAccount.universe.economySpeed
    );
    if (newPlanet.inProgressShips) {
      newPlanet = updatePlanetInProgressShips(newPlanet, {
        ...newPlanet.inProgressShips,
        endTime: sum(newPlanet.inProgressShips.endTime, duration),
        ships: [
          ...newPlanet.inProgressShips.ships,
          {ship: buildItem.buildable, quantity: buildItem.quantity},
        ],
      });
    } else {
      newPlanet = updatePlanetInProgressShips(newPlanet, {
        startTime: newAccount.currentTime,
        endTime: sum(newAccount.currentTime, duration),
        ships: [{ship: buildItem.buildable, quantity: buildItem.quantity}],
      });
    }
    return updateAccountPlanet(newAccount, newPlanet);
  }

  if (buildItem.type === 'defense') {
    const duration = getDefensesBuildTime(
      buildItem.buildable,
      buildItem.quantity,
      shipyardLevel,
      naniteLevel,
      newAccount.universe.economySpeed
    );
    if (newPlanet.inProgressDefenses) {
      newPlanet = updatePlanetInProgressDefenses(newPlanet, {
        ...newPlanet.inProgressDefenses,
        endTime: sum(newPlanet.inProgressDefenses.endTime, duration),
        defenses: [
          ...newPlanet.inProgressDefenses.defenses,
          {defense: buildItem.buildable, quantity: buildItem.quantity},
        ],
      });
    } else {
      newPlanet = updatePlanetInProgressDefenses(newPlanet, {
        startTime: newAccount.currentTime,
        endTime: sum(newAccount.currentTime, duration),
        defenses: [{defense: buildItem.buildable, quantity: buildItem.quantity}],
      });
    }
    return newAccount;
  }

  neverHappens(buildItem, `Unknown build item type "${buildItem['type']}"`);
}

function advanceAccountInTime(
  account: Account,
  time: Milliseconds
): {newAccount: Account; events: string[]; fullyAdvanced: boolean} {
  const newCurrentTime = sum(account.currentTime, time);
  let newAccount = account;

  // We need to advance the account step by step if there is something in progress that
  // will finish and change the prod:
  // - Energy & Plasma techno
  // - Mines & SolarPlant & FusionReactor
  // - Satellite & Crawler
  let maxTime = newCurrentTime;
  const events: string[] = [];

  if (newAccount.inProgressTechnology) {
    if (
      newAccount.inProgressTechnology.endTime < maxTime &&
      [PlasmaTechnology, EnergyTechnology].includes(newAccount.inProgressTechnology.technology)
    ) {
      maxTime = newAccount.inProgressTechnology.endTime;
    }
  }

  for (const planet of newAccount.planets.values()) {
    if (planet.inProgressBuilding) {
      if (
        planet.inProgressBuilding.endTime < maxTime &&
        [MetalMine, CrystalMine, DeuteriumSynthesizer, SolarPlant, FusionReactor].includes(
          planet.inProgressBuilding.building
        )
      ) {
        maxTime = planet.inProgressBuilding.endTime;
      }
    }
    if (planet.inProgressShips) {
      const shipyardLevel = planet.buildingLevels.get(Shipyard) ?? 0;
      const naniteLevel = planet.buildingLevels.get(NaniteFactory) ?? 0;
      const economySpeed = newAccount.universe.economySpeed;
      let timeCursor = planet.inProgressShips.startTime;

      for (const {ship, quantity} of planet.inProgressShips.ships) {
        if (![SolarSatellite, Crawler].includes(ship)) {
          timeCursor = sum(
            timeCursor,
            getShipsBuildTime(ship, quantity, shipyardLevel, naniteLevel, economySpeed)
          );
          if (timeCursor > maxTime) {
            break;
          }
        } else {
          timeCursor = sum(
            timeCursor,
            getShipsBuildTime(ship, 1, shipyardLevel, naniteLevel, economySpeed)
          );
          if (timeCursor <= maxTime) {
            maxTime = timeCursor;
          }
          break;
        }
      }
    }
  }

  // We got the maxTime, we increase the resources on each planet and update
  // finished constructions.
  for (const planet of newAccount.planets.values()) {
    const {prod} = getPlanetProductionPerHour(newAccount, planet);
    const {newPlanet, newEvents} = directlyAdvancePlanetInTime(
      planet,
      prod,
      newAccount.currentTime,
      maxTime,
      newAccount.universe.economySpeed
    );
    events.push(...newEvents);
    newAccount = updateAccountPlanet(newAccount, newPlanet);
  }

  // Finish in progress technology
  if (
    newAccount.inProgressTechnology !== undefined &&
    newAccount.inProgressTechnology.endTime <= newCurrentTime
  ) {
    const toFinish = newAccount.inProgressTechnology;
    newAccount = finishAccountInProgressTechnology(newAccount, toFinish);
    events.push(
      `Finishing in progress technology "${toFinish.technology.name}" lvl ${toFinish?.level}.`
    );
  }

  newAccount = updateAccountCurrentTime(newAccount, maxTime);
  return {newAccount, events, fullyAdvanced: maxTime === newCurrentTime};
}

// Do not use directly! This function does not perform any check regarding the prod rate changing
// over time.
function directlyAdvancePlanetInTime(
  planet: Planet,
  planetProdPerHour: Resources,
  currentTime: Milliseconds,
  newCurrentTime: Milliseconds,
  economySpeed: number
): {newPlanet: Planet; newEvents: string[]} {
  let newPlanet = planet;
  const additionalTime = substract(newCurrentTime, currentTime);
  const shipyardLevel = planet.buildingLevels.get(Shipyard) ?? 0;
  const naniteLevel = planet.buildingLevels.get(NaniteFactory) ?? 0;
  const events: string[] = [];

  // Add the prod
  const previousResourcesString = resourcesToString(newPlanet.resources);
  newPlanet = updatePlanetResources(
    newPlanet,
    addResources(
      newPlanet.resources,
      multiplyResources(planetProdPerHour, additionalTime / ONE_HOUR)
    )
  );
  const currentResourcesString = resourcesToString(newPlanet.resources);
  events.push(
    `Increase resources on planet ${planet.id} from ${previousResourcesString} to ${currentResourcesString}`
  );

  // Finish in progress building
  if (newPlanet.inProgressBuilding && newPlanet.inProgressBuilding.endTime <= newCurrentTime) {
    const toFinish = newPlanet.inProgressBuilding;
    newPlanet = finishPlanetInProgressBuilding(newPlanet, toFinish);
    events.push(
      `Finishing in progress building "${toFinish.building.name}" lvl ${toFinish.level} on planet ${planet.id}.`
    );
  }

  // TODO - Refactor this copypasta

  // Finish in progress defenses
  if (newPlanet.inProgressDefenses) {
    const remainingDefensesToBuild: {defense: Defense; quantity: number}[] = [];
    const planetDefenses = new Map(newPlanet.defenses.entries());

    let timeCusor = newPlanet.inProgressDefenses.startTime;
    let newDefenseStart = timeCusor;
    let done = false;
    for (const {defense, quantity} of newPlanet.inProgressDefenses.defenses) {
      if (done) {
        remainingDefensesToBuild.push({defense, quantity});
      }
      const defenseBuildTime = getDefensesBuildTime(
        defense,
        1,
        shipyardLevel,
        naniteLevel,
        economySpeed
      );
      const allDefensesBuildTime = multiply(defenseBuildTime, quantity);
      const timeAfterAllDefensesBuilt = sum(timeCusor, allDefensesBuildTime);
      if (timeAfterAllDefensesBuilt <= newCurrentTime) {
        timeCusor = timeAfterAllDefensesBuilt;
        planetDefenses.set(defense, (planetDefenses.get(defense) ?? 0) + quantity);
        events.push(
          `Creating ${quantity} x ${defense.name} (0 left in queue) on planet ${planet.id}.`
        );
      } else {
        const maxBuildableDefenses = Math.floor(
          substract(newCurrentTime, timeCusor) / defenseBuildTime
        );
        timeCusor = sum(timeCusor, multiply(defenseBuildTime, maxBuildableDefenses));
        newDefenseStart = timeCusor;
        planetDefenses.set(defense, (planetDefenses.get(defense) ?? 0) + maxBuildableDefenses);
        const remainingDefense = quantity - maxBuildableDefenses;
        events.push(
          `Creating ${maxBuildableDefenses} x ${defense.name} (${remainingDefense} left in queue) on planet ${planet.id}.`
        );
        if (remainingDefense > 0) {
          remainingDefensesToBuild.push({defense, quantity: remainingDefense});
        }
        done = true;
      }
    }

    if (remainingDefensesToBuild.length > 0) {
      newPlanet = updatePlanetDefenses(
        newPlanet,
        {
          startTime: newDefenseStart,
          endTime: newPlanet.inProgressDefenses.endTime,
          defenses: remainingDefensesToBuild,
        },
        planetDefenses
      );
    } else {
      newPlanet = updatePlanetDefenses(newPlanet, undefined, planetDefenses);
    }
  }

  // Finish in progress ships
  if (newPlanet.inProgressShips) {
    const remainingShipsToBuild: {ship: Ship; quantity: number}[] = [];
    const planetShips = new Map(newPlanet.ships.entries());

    let timeCusor = newPlanet.inProgressShips.startTime;
    let newShipStart = timeCusor;
    let done = false;
    for (const {ship, quantity} of newPlanet.inProgressShips.ships) {
      if (done) {
        remainingShipsToBuild.push({ship, quantity});
      }
      const shipBuildTime = getShipsBuildTime(ship, 1, shipyardLevel, naniteLevel, economySpeed);
      const allShipsBuildTime = multiply(shipBuildTime, quantity);
      const timeAfterAllShipsBuilt = sum(timeCusor, allShipsBuildTime);
      if (timeAfterAllShipsBuilt <= newCurrentTime) {
        timeCusor = timeAfterAllShipsBuilt;
        planetShips.set(ship, (planetShips.get(ship) ?? 0) + quantity);
        events.push(
          `Creating ${quantity} x ${ship.name} (0 left in queue) on planet ${planet.id}.`
        );
      } else {
        const maxBuildableShips = Math.floor(substract(newCurrentTime, timeCusor) / shipBuildTime);
        timeCusor = sum(timeCusor, multiply(shipBuildTime, maxBuildableShips));
        newShipStart = timeCusor;
        planetShips.set(ship, (planetShips.get(ship) ?? 0) + maxBuildableShips);
        const remainingShip = quantity - maxBuildableShips;
        events.push(
          `Creating ${maxBuildableShips} x ${ship.name} (${remainingShip} left in queue) on planet ${planet.id}.`
        );
        if (remainingShip > 0) {
          remainingShipsToBuild.push({ship, quantity: remainingShip});
        }
        done = true;
      }
    }

    if (remainingShipsToBuild.length > 0) {
      newPlanet = updatePlanetShips(
        newPlanet,
        {
          startTime: newShipStart,
          endTime: newPlanet.inProgressShips.endTime,
          ships: remainingShipsToBuild,
        },
        planetShips
      );
    } else {
      newPlanet = updatePlanetShips(newPlanet, undefined, planetShips);
    }
  }

  return {newPlanet, newEvents: events};
}
