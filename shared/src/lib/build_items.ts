import {getBuildingBuildTime, getTechnologyBuildTime} from '@shared/lib/formula';
import {getPlanetProductionPerHour} from '@shared/lib/production';
import {isBuildableAvailableOnPlanet} from '@shared/lib/requirement_tree';
import {Account} from '@shared/models/account';
import {BuildItem} from '@shared/models/build_item';
import {Buildable, BuildableRequirement} from '@shared/models/buildable';
import {NaniteFactory, ResearchLab, RoboticsFactory} from '@shared/models/building';
import {Planet} from '@shared/models/planet';
import {
  incrementResources,
  makeResources,
  multiplyResources,
  Resources,
  substractResources,
} from '@shared/models/resource';
import {hoursToMilliseconds, Milliseconds, ZERO} from '@shared/models/time';
import {divide, max, neverHappens, substract, sum} from '@shared/utils/type_utils';

export function getBuildItemCost(buildItem: BuildItem): Resources {
  if (buildItem.type === 'building') {
    return buildItem.building.cost(buildItem.level);
  }
  if (buildItem.type === 'technology') {
    return buildItem.technology.cost(buildItem.level);
  }
  if (buildItem.type === 'ship') {
    return multiplyResources(buildItem.ship.cost, buildItem.quantity);
  }
  if (buildItem.type === 'defense') {
    return multiplyResources(buildItem.defense.cost, buildItem.quantity);
  }
  neverHappens(
    buildItem,
    `Cannot compute build buildItem cost. Unknown type "${buildItem['type']}"`
  );
}

export function getTimeToGetResources(
  account: Account,
  planet: Planet,
  resources: Resources
): Milliseconds {
  const {metal, crystal, deuterium} = substractResources(planet.resources, resources);
  const {prod} = getPlanetProductionPerHour(account, planet);
  const metalHours = metal <= 0 ? 0 : metal / prod.metal;
  const crystalHours = crystal <= 0 ? 0 : crystal / prod.crystal;
  const deuteriumHours = deuterium <= 0 ? 0 : deuterium / prod.deuterium;

  const prodHours = Math.max(metalHours, crystalHours, deuteriumHours);
  return hoursToMilliseconds(prodHours);
}

export function getTimeBeforeBuildItemQueueable(
  account: Account,
  planet: Planet,
  buildItem: BuildItem
): Milliseconds {
  const timeLeft = (baseDuration: Milliseconds, startTime: Milliseconds): Milliseconds => {
    const left = substract(
      sum(divide(baseDuration, account.universe.researchSpeed), startTime),
      account.currentTime
    );
    if (left < ZERO) {
      throw new Error('Account has an in progress build that is finished');
    }
    return left;
  };

  if (buildItem.type === 'technology') {
    if (account.inProgressTechnology) {
      return timeLeft(
        getTechnologyBuildTime(
          account.inProgressTechnology.technology,
          account.inProgressTechnology.level,
          planet.buildingLevels.get(ResearchLab) ?? 0,
          account.universe.researchSpeed
        ),
        account.inProgressTechnology.startTime
      );
    } else {
      return ZERO;
    }
  }

  if (buildItem.type === 'building') {
    if (planet.inProgressBuilding) {
      return timeLeft(
        getBuildingBuildTime(
          planet.inProgressBuilding.building,
          planet.inProgressBuilding.level,
          planet.buildingLevels.get(RoboticsFactory) ?? 0,
          planet.buildingLevels.get(NaniteFactory) ?? 0,
          account.universe.economySpeed
        ),
        planet.inProgressBuilding.startTime
      );
    } else {
      return ZERO;
    }
  }

  if (buildItem.type === 'ship' || buildItem.type === 'defense') {
    return ZERO;
  }

  neverHappens(
    buildItem,
    `Cannot compute time before buildItem is queueable. Unknwon buildItem "${buildItem['type']}"`
  );
}

export function getTimeBeforeBuildItemBuildable(
  account: Account,
  planet: Planet,
  buildItem: BuildItem
): Milliseconds {
  const cost = getBuildItemCost(buildItem);
  const timeToGetResources = getTimeToGetResources(account, planet, cost);
  const timeBeforeBuildItemQueueable = getTimeBeforeBuildItemQueueable(account, planet, buildItem);
  return max(timeToGetResources, timeBeforeBuildItemQueueable);
}

export function buildItemsToMeetRequirementOnPlanet(
  account: Account,
  planet: Planet,
  requirement: BuildableRequirement
): BuildItem[] {
  const {entity, level} = requirement;
  const items: BuildItem[] = [];

  let currentLevel = 0;
  if (entity.type === 'technology') {
    currentLevel = account.technologyLevels.get(entity) ?? 0;
  } else if (entity.type === 'building') {
    currentLevel = planet.buildingLevels.get(entity) ?? 0;
  } else {
    neverHappens(entity, `Unknown entity type ${entity['type']}`);
  }

  if (currentLevel >= level) {
    return items;
  }

  for (let nextLevel = currentLevel + 1; nextLevel <= level; nextLevel++) {
    if (entity.type === 'technology') {
      items.push({type: entity.type, technology: entity, level: nextLevel});
    } else if (entity.type === 'building') {
      items.push({type: entity.type, building: entity, level: nextLevel, planet});
    } else {
      neverHappens(entity, `Unknown entity type ${entity['type']}`);
    }
  }

  if (currentLevel === 0 && !isBuildableAvailableOnPlanet(account, planet, entity)) {
    for (const entityRequirement of entity.requirements) {
      items.push(...buildItemsToMeetRequirementOnPlanet(account, planet, entityRequirement));
    }
  }

  return items;
}

export function buildItemsToUnlockBuildableOnPlanet(
  account: Account,
  planet: Planet,
  buildable: Buildable
): BuildItem[] {
  if (isBuildableAvailableOnPlanet(account, planet, buildable)) {
    return [];
  }
  const items: BuildItem[] = [];
  for (const requirement of buildable.requirements) {
    items.push(...buildItemsToMeetRequirementOnPlanet(account, planet, requirement));
  }
  return items;
}

export function buildItemCost(buildItem: BuildItem): Resources {
  if (buildItem.type === 'building') {
    return buildItem.building.cost(buildItem.level);
  }
  if (buildItem.type === 'technology') {
    return buildItem.technology.cost(buildItem.level);
  }
  if (buildItem.type === 'ship') {
    return multiplyResources(buildItem.ship.cost, buildItem.quantity);
  }
  if (buildItem.type === 'defense') {
    return multiplyResources(buildItem.defense.cost, buildItem.quantity);
  }
  neverHappens(buildItem, `Unknown build item type ${buildItem['type']}`);
}

export function buildItemsCost(buildItems: BuildItem[]): Resources {
  const cost = makeResources({});
  for (const buildItem of buildItems) {
    incrementResources(cost, buildItemCost(buildItem));
  }
  return cost;
}
