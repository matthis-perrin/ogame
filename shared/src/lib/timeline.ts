/* eslint-disable @typescript-eslint/no-use-before-define */
import {
  finishAccountInProgressTechnology,
  updateAccountCurrentTime,
  updateAccountInProgressTechnology,
  updateAccountPlanet,
} from '@shared/lib/account';
import {
  buildItemCost,
  buildItemsToUnlockBuildableOnPlanet,
  buildItemToString,
  isEnergyConsumerBuildable,
} from '@shared/lib/build_items';
import {
  getExtraDefensesToBuildOnPlanet,
  getRequiredDefenseForStealableResources,
} from '@shared/lib/defense';
import {
  getCheapestEnergyBuildItemsForEnergyPerHour,
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
  getRecyclableStandardUnitOnPlanet,
  updatePlanetDefenses,
  updatePlanetInProgressBuilding,
  updatePlanetInProgressDefenses,
  updatePlanetInProgressShips,
  updatePlanetResources,
  updatePlanetShips,
} from '@shared/lib/planet';
import {
  getMaxAllowedStandardUnitOnPlanet,
  getPlanetProductionPerHour,
} from '@shared/lib/production';
import {isBuildItemAvailable} from '@shared/lib/requirement_tree';
import {resourcesToString, toStandardUnits} from '@shared/lib/resources';
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
import {
  hoursToMilliseconds,
  Milliseconds,
  millisecondsToHours,
  NEVER,
  ONE_HOUR,
  timeToString,
  ZERO,
} from '@shared/models/time';
import {AccountTimeline, BuildItemTimeline, TransitionnedAccount} from '@shared/models/timeline';
import {ceil, max, min, multiply, neverHappens, substract, sum} from '@shared/utils/type_utils';

interface AccountTimelineLib {
  createAccountTimeline(account: Account, buildItems: BuildItem[]): AccountTimeline;
  advanceAccountTowardBuildItem(account: Account, buildItem: BuildItem): TransitionnedAccount[];
}

function getAccountTimelineLib(mode: 'perf' | 'debug'): AccountTimelineLib {
  let transitionId = 0;
  const isPerf = mode === 'perf';
  const isDebug = mode === 'debug';
  const noReason = '';

  function createAccountTimeline(account: Account, buildItems: BuildItem[]): AccountTimeline {
    const buildItemTimelines: BuildItemTimeline[] = [];
    let currentAccount = account;

    for (const buildItem of buildItems) {
      // try {
      const transitions = advanceAccountTowardBuildItem(currentAccount, buildItem);
      if (transitions.length > 0) {
        currentAccount = transitions[transitions.length - 1].transitionnedAccount;
      }
      buildItemTimelines.push({buildItem, transitions});
      // } catch (err) {
      //   console.log(`Error creating the account timeline while applying item`, buildItem);
      //   console.log(`Cost for item: ${resourcesToString(getBuildItemCost(buildItem))}`);
      //   console.error(err);
      //   // console.log('Transitions applied');
      //   // function transitionToString(transition: Transition): string {
      //   //   if (transition.type === 'wait') {
      //   //     return `[WAIT] ${transition.duration} (Reason: ${
      //   //       transition.reason
      //   //     })\nEvents: ${JSON.stringify(transition.events)}`;
      //   //   }
      //   //   return `[BUILD] ${buildItemToString(transition.buildItem)}`;
      //   // }
      //   // for (const transition of transitions) {
      //   //   console.log(transitionToString(transition.transition));
      //   // }
      //   // advanceAccountTowardBuildItem(currentAccount, buildItem);
      //   break;
      // }
    }

    return {
      start: account,
      buildItemTimelines,
      currentAccount,
    };
  }

  // NO CHANGE
  function buildItemAlreadyApplied(account: Account, buildItem: BuildItem): boolean {
    if (buildItem.type === 'ship' || buildItem.type === 'defense' || buildItem.type === 'stock') {
      return false;
    }
    if (buildItem.type === 'technology') {
      if ((account.technologyLevels.get(buildItem.buildable) ?? 0) >= buildItem.level) {
        return true;
      }
      if (
        account.inProgressTechnology &&
        account.inProgressTechnology.technology === buildItem.buildable &&
        account.inProgressTechnology.level >= buildItem.level
      ) {
        return true;
      }
      return false;
    }
    if (buildItem.type === 'building') {
      const planet = account.planets.get(buildItem.planetId);
      if (!planet) {
        throw new Error(`No planet with id ${buildItem.planetId} on the account`);
      }
      if ((planet.buildingLevels.get(buildItem.buildable) ?? 0) >= buildItem.level) {
        return true;
      }
      if (
        planet.inProgressBuilding &&
        planet.inProgressBuilding.building === buildItem.buildable &&
        planet.inProgressBuilding.level >= buildItem.level
      ) {
        return true;
      }
      return false;
    }
    neverHappens(buildItem, `Unknown build item type "${buildItem['type']}"`);
  }

  // NO CHANGE
  function advanceAccountTowardBuildItem(
    account: Account,
    buildItem: BuildItem
  ): TransitionnedAccount[] {
    if (buildItemAlreadyApplied(account, buildItem)) {
      return [];
    }
    const planet = account.planets.get(buildItem.planetId);
    if (!planet) {
      throw new Error(`No planet with id ${buildItem.planetId} on the account`);
    }

    // ENERGY
    const buildItemsFromEnergyCheck = requiredBuildItemsFromEnergyCheck(account);
    const isEnergyConsumingBuildItem = isEnergyConsumerBuildable(buildItem.buildable);
    const hasRequiredBuildItemFromEnergyCheck = buildItemsFromEnergyCheck.reduce(
      (res, item) => res || buildItem.planetId === item.planetId,
      false
    );
    if (buildItemsFromEnergyCheck.length > 0) {
      if (isEnergyConsumingBuildItem && hasRequiredBuildItemFromEnergyCheck) {
        const steps = buildItemsToTransitions(account, buildItemsFromEnergyCheck);
        return [
          ...steps,
          ...advanceAccountTowardBuildItem(steps[steps.length - 1].transitionnedAccount, buildItem),
        ];
      } else {
        return buildItemsToTransitions(
          account,
          dedupBuildItems([...buildItemsFromEnergyCheck, buildItem])
        );
      }
    }

    // TODO - Ghost

    // DEFENSE
    const buildItemsFromDefenseCheck = requiredBuildItemsFromDefenseCheck(account, buildItem);
    if (buildItemsFromDefenseCheck.length > 0) {
      return buildItemsToTransitions(
        account,
        dedupBuildItems([...buildItemsFromDefenseCheck, buildItem])
      );
    }

    // TODO - Storage / Non useful tech checks

    const waitTime = timeBeforeApplyingBuildItem(account, buildItem);
    if (waitTime.time === 0) {
      return [
        {
          transition: isPerf ? undefined : {type: 'build', id: transitionId++, buildItem},
          transitionnedAccount: applyBuildItem(account, buildItem),
        },
      ];
    } else {
      const {newAccount, events, actualAdvanceTime} = advanceAccountInTime(account, waitTime.time);
      return [
        {
          transition: isPerf
            ? undefined
            : {
                type: 'wait',
                id: transitionId++,
                duration: actualAdvanceTime,
                reason: waitTime.reason,
                events,
              },
          transitionnedAccount: newAccount,
        },
        ...advanceAccountTowardBuildItem(newAccount, buildItem),
      ];
    }
  }

  // NO CHANGE
  function requiredBuildItemsFromEnergyCheck(account: Account): BuildItem[] {
    const requiredBuildItems: BuildItem[] = [];
    const energyLevel = account.technologyLevels.get(EnergyTechnology) ?? 0;
    for (const planet of account.planets.values()) {
      const {energyConsumption, energyProduction} = getPlanetProductionPerHour(account, planet);
      const energyNeeded = substract(
        energyConsumption,
        sum(energyProduction, getInProgressEnergyDeltaPerHour(account, planet, energyLevel))
      );
      if (energyNeeded > 0) {
        const buildItems = getCheapestEnergyBuildItemsForEnergyPerHour(
          account,
          planet,
          energyNeeded
        );
        requiredBuildItems.push(...buildItems);
      }
    }
    return requiredBuildItems;
  }

  // NO CHANGE
  function dedupBuildItems(buildItems: BuildItem[]): BuildItem[] {
    const dedupedBuildItems: BuildItem[] = [];
    const alreadyUsed = new Set<string>();
    for (const buildItem of buildItems) {
      if (buildItem.type === 'defense' || buildItem.type === 'ship' || buildItem.type === 'stock') {
        dedupedBuildItems.push(buildItem);
      } else if (buildItem.buildable.type === 'building') {
        const hash = `${buildItem.buildable.id}-${buildItem.level}-${buildItem.planetId}`;
        if (!alreadyUsed.has(hash)) {
          alreadyUsed.add(hash);
          dedupedBuildItems.push(buildItem);
        }
      } else {
        const hash = `${buildItem.buildable.id}-${buildItem.level}`;
        if (!alreadyUsed.has(hash)) {
          alreadyUsed.add(hash);
          dedupedBuildItems.push(buildItem);
        }
      }
    }

    return dedupedBuildItems;
  }

  // NO CHANGE
  function requiredBuildItemsFromDefenseCheck(
    account: Account,
    nextBuildItem: BuildItem
  ): BuildItem[] {
    let requiredBuildItems: BuildItem[] = [];
    for (const planet of account.planets.values()) {
      const cost = buildItemCost(nextBuildItem);
      const {resources} = timeForResourcesOnPlanet(account, planet, cost);
      const stealableResources = sum(
        getRecyclableStandardUnitOnPlanet(account, planet),
        min(toStandardUnits(account, resources), getMaxAllowedStandardUnitOnPlanet(account, planet))
      );
      const defenseRequired = getRequiredDefenseForStealableResources(stealableResources);
      const extraDefenseRequired = getExtraDefensesToBuildOnPlanet(planet, defenseRequired);
      for (const {defense} of extraDefenseRequired) {
        requiredBuildItems = [
          ...buildItemsToUnlockBuildableOnPlanet(account, planet, defense),
          ...requiredBuildItems,
        ];
      }
      requiredBuildItems.push(
        ...extraDefenseRequired.map<BuildItem>(({defense, quantity}) => ({
          type: 'defense',
          quantity,
          buildable: defense,
          planetId: planet.id,
        }))
      );
    }
    return dedupBuildItems(requiredBuildItems);
  }

  const APPLY_NOW = {time: ZERO, reason: noReason};

  // NO CHANGE
  function timeBeforeBuildingTechnologyRelatedItem(
    account: Account
  ): {time: Milliseconds; reason: string} {
    // Check if already a technology in progress on the account
    if (account.inProgressTechnology) {
      return {
        time: substract(account.inProgressTechnology.endTime, account.currentTime),
        reason: isPerf
          ? noReason
          : `Technology ${account.inProgressTechnology.technology.name} in progress`,
      };
    }
    // Check if any planet is upgrading the research lab
    for (const planet of account.planets.values()) {
      if (planet.inProgressBuilding?.building === ResearchLab) {
        return {
          time: substract(planet.inProgressBuilding.endTime, account.currentTime),
          reason: isPerf ? noReason : `Research lab is upgrading on planet ${planet.id}`,
        };
      }
    }
    return APPLY_NOW;
  }

  // NO CHANGE
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
        reason: isPerf
          ? noReason
          : `Building ${planet.inProgressBuilding.building.name} is upgrading on the planet`,
      };
    }
    return APPLY_NOW;
  }

  // NO CHANGE
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
        reason: isPerf ? noReason : `Defenses are in progress on the planet`,
      };
    } else if (timeWhenDefensesDone === undefined) {
      return {
        time: substract(timeWhenShipsDone, account.currentTime),
        reason: isPerf ? noReason : `Ships are in progress on the planet`,
      };
    } else {
      return {
        time: substract(max(timeWhenShipsDone, timeWhenDefensesDone), account.currentTime),
        reason: isPerf ? noReason : `Ships and defenses are in progress on the planet`,
      };
    }
  }

  // NO CHANGE
  function timeForResourcesOnPlanet(
    account: Account,
    planet: Planet,
    target: Resources
  ): {time: Milliseconds; resources: Resources} {
    const requiredResources = substractResources(target, planet.resources);
    const {prod} = getPlanetProductionPerHour(account, planet);
    const timeForMetal =
      requiredResources.metal > 0
        ? hoursToMilliseconds(requiredResources.metal / prod.metal)
        : ZERO;
    const timeForCrystal =
      requiredResources.crystal > 0
        ? hoursToMilliseconds(requiredResources.crystal / prod.crystal)
        : ZERO;
    const timeForDeuterium =
      requiredResources.deuterium > 0
        ? hoursToMilliseconds(requiredResources.deuterium / prod.deuterium)
        : ZERO;
    const timeForResources = ceil(max(ZERO, timeForMetal, timeForCrystal, timeForDeuterium));
    return {
      time: timeForResources,
      resources: addResources(
        planet.resources,
        multiplyResources(prod, millisecondsToHours(timeForResources))
      ),
    };
  }

  // NO CHANGE
  function timeBeforeApplyingBuildItem(
    account: Account,
    buildItem: BuildItem
  ): {time: Milliseconds; reason: string} {
    const planet = account.planets.get(buildItem.planetId);
    if (!planet) {
      throw new Error(`No planet with id ${buildItem.planetId} on the account`);
    }

    const availability = isBuildItemAvailable(account, buildItem);
    if (!availability.isAvailable && availability.willBeAvailableAt === NEVER) {
      return {time: availability.willBeAvailableAt, reason: availability.reason};
    }

    const cost = buildItemCost(buildItem);
    const timeForResources = timeForResourcesOnPlanet(account, planet, cost);

    const mergeWaitTime = (wait: {
      time: Milliseconds;
      reason: string;
    }): {time: Milliseconds; reason: string} => {
      const times: Milliseconds[] = [];
      const reasons: string[] = [];

      if (availability.willBeAvailableAt !== ZERO) {
        times.push(substract(availability.willBeAvailableAt, account.currentTime));
        if (isDebug) {
          reasons.push(availability.reason);
        }
      }
      if (timeForResources.time !== ZERO) {
        times.push(timeForResources.time);
        if (isDebug) {
          reasons.push(
            `Waiting for resources to get ${buildItemToString(buildItem)} (need ${resourcesToString(
              cost
            )}, should take ${timeToString(timeForResources.time)})`
          );
        }
      }
      if (wait.time !== 0) {
        times.push(wait.time);
        if (isDebug) {
          reasons.push(wait.reason);
        }
      }
      if (times.length === 0) {
        return APPLY_NOW;
      }

      const maxTime = max(...times);
      return {
        time: maxTime,
        reason: isPerf ? noReason : reasons.join(' + '),
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
          reason: isPerf
            ? noReason
            : `Building ${planet.inProgressBuilding.building.name} is upgrading on the planet`,
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

    // Stocks
    if (buildItem.type === 'stock') {
      return mergeWaitTime(APPLY_NOW);
    }

    neverHappens(buildItem, `Unknown build item type "${buildItem['type']}"`);
  }

  // NO CHANGE
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
      const {events, newAccount, fullyAdvanced, actualAdvanceTime} = advanceAccountInTime(
        account,
        earliest.time
      );
      currentAccount = newAccount;
      transitions.push({
        transitionnedAccount: newAccount,
        transition: isPerf
          ? undefined
          : {
              type: 'wait',
              id: transitionId++,
              duration: actualAdvanceTime,
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
      transition: isPerf
        ? undefined
        : {
            type: 'build',
            id: transitionId++,
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

  // NO CHANGE
  function applyBuildItem(account: Account, buildItem: BuildItem): Account {
    let newAccount = account;

    // Planet exists check
    const planet = newAccount.planets.get(buildItem.planetId);
    if (!planet) {
      throw new Error(`No planet with id ${buildItem.planetId} on the account`);
    }
    let newPlanet = planet;

    // Requirements met check
    const availability = isBuildItemAvailable(newAccount, buildItem);
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
        const ships = newPlanet.inProgressShips.ships;
        const newShips =
          ships.length > 0 && ships[ships.length - 1].ship === buildItem.buildable
            ? [
                ...ships.slice(0, -1),
                {
                  ship: buildItem.buildable,
                  quantity: ships[ships.length - 1].quantity + buildItem.quantity,
                },
              ]
            : [...ships, {ship: buildItem.buildable, quantity: buildItem.quantity}];
        newPlanet = updatePlanetInProgressShips(newPlanet, {
          ...newPlanet.inProgressShips,
          endTime: sum(newPlanet.inProgressShips.endTime, duration),
          ships: newShips,
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
        const defenses = newPlanet.inProgressDefenses.defenses;
        const newDefenses =
          defenses.length > 0 && defenses[defenses.length - 1].defense === buildItem.buildable
            ? [
                ...defenses.slice(0, -1),
                {
                  defense: buildItem.buildable,
                  quantity: defenses[defenses.length - 1].quantity + buildItem.quantity,
                },
              ]
            : [...defenses, {defense: buildItem.buildable, quantity: buildItem.quantity}];
        newPlanet = updatePlanetInProgressDefenses(newPlanet, {
          ...newPlanet.inProgressDefenses,
          endTime: sum(newPlanet.inProgressDefenses.endTime, duration),
          defenses: newDefenses,
        });
      } else {
        newPlanet = updatePlanetInProgressDefenses(newPlanet, {
          startTime: newAccount.currentTime,
          endTime: sum(newAccount.currentTime, duration),
          defenses: [{defense: buildItem.buildable, quantity: buildItem.quantity}],
        });
      }
      return updateAccountPlanet(newAccount, newPlanet);
    }

    if (buildItem.type === 'stock') {
      return newAccount;
    }

    neverHappens(buildItem, `Unknown build item type "${buildItem['type']}"`);
  }

  // NO CHANGE
  function advanceAccountInTime(
    account: Account,
    time: Milliseconds
  ): {
    newAccount: Account;
    events: string[];
    fullyAdvanced: boolean;
    actualAdvanceTime: Milliseconds;
  } {
    const newCurrentTime = sum(account.currentTime, time);
    if (newCurrentTime > 1000 * 3600 * 24 * 365 * 3) {
      throw new Error('Passed 3 years');
    }
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
            if (timeCursor > maxTime && timeCursor > account.currentTime) {
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
            if (timeCursor > account.currentTime) {
              break;
            }
          }
        }
      }
    }

    // Always advance by a whole number of milliseconds to prevent rounding errors
    maxTime = ceil(maxTime);

    // We got the maxTime, we increase the resources on each planet and update
    // finished constructions.
    const actualAdvanceTime = substract(maxTime, newAccount.currentTime);
    for (const planet of newAccount.planets.values()) {
      const {prod} = getPlanetProductionPerHour(newAccount, planet);
      const {newPlanet, newEvents} = directlyAdvancePlanetInTime(
        planet,
        prod,
        newAccount.currentTime,
        maxTime,
        newAccount.universe.economySpeed
      );
      if (isDebug) {
        events.push(...newEvents);
      }
      newAccount = updateAccountPlanet(newAccount, newPlanet);
    }

    // Finish in progress technology
    if (
      newAccount.inProgressTechnology !== undefined &&
      newAccount.inProgressTechnology.endTime <= newCurrentTime
    ) {
      const toFinish = newAccount.inProgressTechnology;
      newAccount = finishAccountInProgressTechnology(newAccount, toFinish);
      if (isDebug) {
        events.push(
          `Finishing in progress technology "${toFinish.technology.name}" lvl ${toFinish?.level}.`
        );
      }
    }

    newAccount = updateAccountCurrentTime(newAccount, maxTime);
    return {
      newAccount,
      events,
      fullyAdvanced: maxTime === newCurrentTime,
      actualAdvanceTime,
    };
  }

  // Do not use directly! This function does not perform any check regarding the prod rate changing
  // over time.
  // NO CHANGE
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
    const resourcesIncrease = multiplyResources(planetProdPerHour, additionalTime / ONE_HOUR);
    newPlanet = updatePlanetResources(
      newPlanet,
      addResources(newPlanet.resources, resourcesIncrease)
    );
    if (isDebug) {
      events.push(
        `Increase resources on planet ${planet.id} by ${resourcesToString(
          resourcesIncrease
        )} (from ${resourcesToString(newPlanet.resources)} to ${resourcesToString(
          newPlanet.resources
        )})`
      );
    }

    // Finish in progress building
    if (newPlanet.inProgressBuilding && newPlanet.inProgressBuilding.endTime <= newCurrentTime) {
      const toFinish = newPlanet.inProgressBuilding;
      newPlanet = finishPlanetInProgressBuilding(newPlanet, toFinish);
      if (isDebug) {
        events.push(
          `Finishing in progress building "${toFinish.building.name}" lvl ${toFinish.level} on planet ${planet.id}.`
        );
      }
    }

    // TODO - Refactor this copypasta

    // Finish in progress defenses
    if (newPlanet.inProgressDefenses) {
      const remainingDefensesToBuild: {defense: Defense; quantity: number}[] = [];
      const planetDefenses = new Map(newPlanet.defenses.entries());

      let timeCursor = newPlanet.inProgressDefenses.startTime;
      let newDefenseStart = timeCursor;
      let done = false;
      for (const {defense, quantity} of newPlanet.inProgressDefenses.defenses) {
        if (done) {
          remainingDefensesToBuild.push({defense, quantity});
          continue;
        }
        const defenseBuildTime = getDefensesBuildTime(
          defense,
          1,
          shipyardLevel,
          naniteLevel,
          economySpeed
        );
        const allDefensesBuildTime = multiply(defenseBuildTime, quantity);
        const timeAfterAllDefensesBuilt = sum(timeCursor, allDefensesBuildTime);
        if (timeAfterAllDefensesBuilt <= newCurrentTime) {
          timeCursor = timeAfterAllDefensesBuilt;
          planetDefenses.set(defense, (planetDefenses.get(defense) ?? 0) + quantity);
          if (isDebug) {
            events.push(
              `${quantity} x ${defense.name} created (0 left in queue) on planet ${planet.id}.`
            );
          }
        } else {
          const maxBuildableDefenses = Math.max(
            0,
            Math.floor(substract(newCurrentTime, timeCursor) / defenseBuildTime)
          );
          timeCursor = sum(timeCursor, multiply(defenseBuildTime, maxBuildableDefenses));
          newDefenseStart = timeCursor;
          planetDefenses.set(defense, (planetDefenses.get(defense) ?? 0) + maxBuildableDefenses);
          const remainingDefense = quantity - maxBuildableDefenses;
          if (isDebug) {
            events.push(
              `${maxBuildableDefenses} x ${defense.name} created (${remainingDefense} left in queue) on planet ${planet.id}.`
            );
          }
          if (remainingDefense > 0) {
            if (
              remainingDefensesToBuild.length > 0 &&
              remainingDefensesToBuild[remainingDefensesToBuild.length - 1].defense === defense
            ) {
              remainingDefensesToBuild[
                remainingDefensesToBuild.length - 1
              ].quantity += remainingDefense;
            } else {
              remainingDefensesToBuild.push({defense, quantity: remainingDefense});
            }
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

      let timeCursor = newPlanet.inProgressShips.startTime;
      let newShipStart = timeCursor;
      let done = false;
      for (const {ship, quantity} of newPlanet.inProgressShips.ships) {
        if (done) {
          remainingShipsToBuild.push({ship, quantity});
        }
        const shipBuildTime = getShipsBuildTime(ship, 1, shipyardLevel, naniteLevel, economySpeed);
        const allShipsBuildTime = multiply(shipBuildTime, quantity);
        const timeAfterAllShipsBuilt = sum(timeCursor, allShipsBuildTime);
        if (timeAfterAllShipsBuilt <= newCurrentTime) {
          timeCursor = timeAfterAllShipsBuilt;
          planetShips.set(ship, (planetShips.get(ship) ?? 0) + quantity);
          if (isDebug) {
            events.push(
              `${quantity} x ${ship.name} created (0 left in queue) on planet ${planet.id}.`
            );
          }
        } else {
          const maxBuildableShips = Math.max(
            0,
            Math.floor(substract(newCurrentTime, timeCursor) / shipBuildTime)
          );
          timeCursor = sum(timeCursor, multiply(shipBuildTime, maxBuildableShips));
          newShipStart = timeCursor;
          planetShips.set(ship, (planetShips.get(ship) ?? 0) + maxBuildableShips);
          const remainingShip = quantity - maxBuildableShips;
          if (isDebug) {
            events.push(
              `${maxBuildableShips} x ${ship.name} created (${remainingShip} left in queue) on planet ${planet.id}.`
            );
          }
          if (remainingShip > 0) {
            if (
              remainingShipsToBuild.length > 0 &&
              remainingShipsToBuild[remainingShipsToBuild.length - 1].ship === ship
            ) {
              remainingShipsToBuild[remainingShipsToBuild.length - 1].quantity += remainingShip;
            } else {
              remainingShipsToBuild.push({ship, quantity: remainingShip});
            }
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

  return {createAccountTimeline, advanceAccountTowardBuildItem};
}

export const accountTimelineLibInPerfMode = getAccountTimelineLib('perf');
export const accountTimelineLibInDebugMode = getAccountTimelineLib('debug');
