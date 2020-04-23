import {getBuildingBuildTime, getTechnologyBuildTime} from '@shared/lib/formula';
import {getPlanetProductionPerHour} from '@shared/lib/production';
import {isBuildableAvailableOnPlanet} from '@shared/lib/requirement_tree';
import {Account} from '@shared/models/account';
import {BuildItem} from '@shared/models/build_item';
import {Buildable, BuildableRequirement} from '@shared/models/buildable';
import {
  CrystalMine,
  DeuteriumSynthesizer,
  FusionReactor,
  MetalMine,
  NaniteFactory,
  ResearchLab,
  RoboticsFactory,
  SolarPlant,
} from '@shared/models/building';
import {Planet} from '@shared/models/planet';
import {
  CrystalAmount,
  DeuteriumAmount,
  MetalAmount,
  multiplyResources,
  Resources,
  substractResources,
  ZERO_CRYSTAL,
  ZERO_DEUTERIUM,
  ZERO_METAL,
} from '@shared/models/resource';
import {Crawler, SolarSatellite} from '@shared/models/ships';
import {hoursToMilliseconds, Milliseconds, ZERO} from '@shared/models/time';
import {divide, max, neverHappens, substract, sum} from '@shared/utils/type_utils';

export function getBuildItemCost(buildItem: BuildItem): Resources {
  if (buildItem.type === 'building') {
    return buildItem.buildable.cost(buildItem.level);
  }
  if (buildItem.type === 'technology') {
    return buildItem.buildable.cost(buildItem.level);
  }
  if (buildItem.type === 'ship') {
    return multiplyResources(buildItem.buildable.cost, buildItem.quantity);
  }
  if (buildItem.type === 'defense') {
    return multiplyResources(buildItem.buildable.cost, buildItem.quantity);
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
      items.push({type: 'technology', buildable: entity, level: nextLevel, planetId: planet.id});
    } else if (entity.type === 'building') {
      items.push({type: 'building', buildable: entity, level: nextLevel, planetId: planet.id});
    } else {
      neverHappens(entity, `Unknown entity type ${entity['type']}`);
    }
  }

  if (currentLevel === 0 && !isBuildableAvailableOnPlanet(account, planet, entity).isAvailable) {
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
  if (isBuildableAvailableOnPlanet(account, planet, buildable).isAvailable) {
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
    return buildItem.buildable.cost(buildItem.level);
  }
  if (buildItem.type === 'technology') {
    return buildItem.buildable.cost(buildItem.level);
  }
  if (buildItem.type === 'ship') {
    return multiplyResources(buildItem.buildable.cost, buildItem.quantity);
  }
  if (buildItem.type === 'defense') {
    return multiplyResources(buildItem.buildable.cost, buildItem.quantity);
  }
  neverHappens(buildItem, `Unknown build item type ${buildItem['type']}`);
}

export function buildItemsCost(buildItems: BuildItem[]): Resources {
  const metal: MetalAmount = ZERO_METAL;
  const crystal: CrystalAmount = ZERO_CRYSTAL;
  const deuterium: DeuteriumAmount = ZERO_DEUTERIUM;
  for (const buildItem of buildItems) {
    const cost = buildItemCost(buildItem);
    sum(metal, cost.metal);
    sum(crystal, cost.crystal);
    sum(deuterium, cost.deuterium);
  }
  return {metal, crystal, deuterium};
}

export function buildItemToString(buildItem: BuildItem): string {
  return buildItem.type === 'technology' || buildItem.type === 'building'
    ? `${buildItem.buildable.name} lvl ${buildItem.level} on ${buildItem.planetId}`
    : `${buildItem.buildable.name} x ${buildItem.quantity} on ${buildItem.planetId}`;
}

export function buildableRequirementToString(item: BuildableRequirement): string {
  return `${item.entity.name} lvl ${item.level}`;
}

export function isEnergyConsumerBuildable(buildable: Buildable): boolean {
  return (
    (buildable.type === 'building' &&
      (buildable === MetalMine ||
        buildable === CrystalMine ||
        buildable === DeuteriumSynthesizer)) ||
    (buildable.type === 'ship' && buildable === Crawler)
  );
}

export function isEnergyProducerBuildable(buildable: Buildable): boolean {
  return (
    (buildable.type === 'building' && buildable === SolarPlant && buildable === FusionReactor) ||
    (buildable.type === 'ship' && buildable === SolarSatellite)
  );
}
