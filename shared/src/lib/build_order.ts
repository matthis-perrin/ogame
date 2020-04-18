import {Account} from '@shared/models/account';
import {Buildable} from '@shared/models/buildable';
import {AllBuildings, Building} from '@shared/models/building';
import {Planet} from '@shared/models/planet';
import {AllTechnologies, Technology} from '@shared/models/technology';

export interface BuildOrderItem {
  entity: Building | Technology;
  level: number;
  planet: Planet;
}

function isBuildable(account: Account, planet: Planet, buildable: Buildable): boolean {
  for (const requirement of buildable.requirements) {
    if (
      requirement.entity.type === 'building' &&
      (planet.buildingLevels.get(requirement.entity) ?? 0) < requirement.level
    ) {
      return false;
    }
    if (
      requirement.entity.type === 'technology' &&
      (account.technologyLevels.get(requirement.entity) ?? 0) < requirement.level
    ) {
      return false;
    }
  }
  return true;
}

export function getAllPossibleBuildOrderItemForPlanet(
  account: Account,
  planet: Planet
): BuildOrderItem[] {
  const items: BuildOrderItem[] = [];
  for (const building of AllBuildings) {
    if (planet.inProgressBuilding?.building === building) {
      continue;
    }
    const currentLevel = planet.buildingLevels.get(building) ?? 0;
    if (currentLevel > 0) {
      items.push({entity: building, level: currentLevel + 1, planet});
    } else if (isBuildable(account, planet, building)) {
      items.push({entity: building, level: 1, planet});
    }
  }

  if (account.inProgressTechnology === undefined) {
    for (const technology of AllTechnologies) {
      const currentLevel = account.technologyLevels.get(technology) ?? 0;
      if (currentLevel > 0) {
        items.push({entity: technology, level: currentLevel + 1, planet});
      } else if (isBuildable(account, planet, technology)) {
        items.push({entity: technology, level: 1, planet});
      }
    }
  }
  return items;
}
