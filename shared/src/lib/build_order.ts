import {Account} from '@shared/models/account';
import {Buildable, BuildableRequirement} from '@shared/models/buildable';
import {
  AllBuildings,
  CrystalStorage,
  DeuteriumTank,
  FusionReactor,
  MetalStorage,
  SolarPlant,
} from '@shared/models/building';
import {Planet, PlanetId} from '@shared/models/planet';
import {AllTechnologies} from '@shared/models/technology';

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

const buildingWhitelist = AllBuildings.filter(
  b => ![SolarPlant, FusionReactor, MetalStorage, CrystalStorage, DeuteriumTank].includes(b)
);

export function getAvailableBuildingsForPlanet(
  account: Account,
  planetId: PlanetId
): BuildableRequirement[] {
  const planet = account.planets.get(planetId);
  if (!planet) {
    throw new Error(`No planet with id ${planetId} on the account`);
  }
  const items: BuildableRequirement[] = [];
  for (const building of buildingWhitelist) {
    if (planet.inProgressBuilding?.building === building) {
      continue;
    }
    const currentLevel = planet.buildingLevels.get(building) ?? 0;
    if (currentLevel > 0) {
      items.push({
        entity: building,
        level: currentLevel + 1,
      });
    } else if (isBuildable(account, planet, building)) {
      items.push({entity: building, level: 1});
    }
  }
  return items;
}

const technologyWhitelist = AllTechnologies.filter(t => t.isUseful);

export function getAvailableTechnologiesForAccount(
  account: Account,
  planetId: PlanetId
): BuildableRequirement[] {
  const planet = account.planets.get(planetId);
  if (!planet) {
    throw new Error(`No planet with id ${planetId} on the account`);
  }
  const items: BuildableRequirement[] = [];
  if (account.inProgressTechnology === undefined) {
    for (const technology of technologyWhitelist) {
      const currentLevel = account.technologyLevels.get(technology) ?? 0;
      if (currentLevel > 0) {
        items.push({
          entity: technology,
          level: currentLevel + 1,
        });
      } else if (isBuildable(account, planet, technology)) {
        items.push({entity: technology, level: 1});
      }
    }
  }
  return items;
}
