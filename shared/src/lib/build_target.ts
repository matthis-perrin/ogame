import {getBuildingBuildTime, getTechnologyBuildTime} from '@shared/lib/formula';
import {getPlanetProductionPerHour} from '@shared/lib/production';
import {Account} from '@shared/models/account';
import {BuildTarget} from '@shared/models/build_target';
import {NaniteFactory, ResearchLab, RoboticsFactory} from '@shared/models/building';
import {Planet} from '@shared/models/planet';
import {multiplyResources, Resources, substractResources} from '@shared/models/resource';
import {hoursToMilliseconds, Milliseconds, ZERO} from '@shared/models/time';
import {divide, max, neverHappens, substract, sum} from '@shared/utils/type_utils';

export function getBuildTargetCost(target: BuildTarget): Resources {
  if (target.type === 'building') {
    return target.building.cost(target.level);
  }
  if (target.type === 'technology') {
    return target.technology.cost(target.level);
  }
  if (target.type === 'ship') {
    return multiplyResources(target.ship.cost, target.quantity);
  }
  if (target.type === 'defense') {
    return multiplyResources(target.defense.cost, target.quantity);
  }
  neverHappens(
    target,
    `Cannot compute build target cost. Unknown type "${(target as BuildTarget).type}"`
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

export function getTimeBeforeTargetQueueable(
  account: Account,
  planet: Planet,
  target: BuildTarget
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

  if (target.type === 'technology') {
    if (account.inProgressTechnology) {
      return timeLeft(
        getTechnologyBuildTime(
          account.inProgressTechnology.technology,
          account.inProgressTechnology.level,
          planet.buildingLevels.get(ResearchLab) ?? 0
        ),
        account.inProgressTechnology.startTime
      );
    } else {
      return ZERO;
    }
  }

  if (target.type === 'building') {
    if (planet.inProgressBuilding) {
      return timeLeft(
        getBuildingBuildTime(
          planet.inProgressBuilding.building,
          planet.inProgressBuilding.level,
          planet.buildingLevels.get(RoboticsFactory) ?? 0,
          planet.buildingLevels.get(NaniteFactory) ?? 0
        ),
        planet.inProgressBuilding.startTime
      );
    } else {
      return ZERO;
    }
  }

  if (target.type === 'ship' || target.type === 'defense') {
    return ZERO;
  }

  neverHappens(
    target,
    `Cannot compute time before target is queueable. Unknwon target "${
      (target as BuildTarget).type
    }"`
  );
}

export function getTimeBeforeTargetBuildable(
  account: Account,
  planet: Planet,
  target: BuildTarget
): Milliseconds {
  const cost = getBuildTargetCost(target);
  const timeToGetResources = getTimeToGetResources(account, planet, cost);
  const timeBeforeTargetQueueable = getTimeBeforeTargetQueueable(account, planet, target);
  return max(timeToGetResources, timeBeforeTargetQueueable);
}
