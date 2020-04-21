import {buildItemsCost, buildItemsToUnlockBuildableOnPlanet} from '@shared/lib/build_items';
import {
  getExtraDefensesToBuildOnPlanet,
  getRequiredDefenseForStealableResources,
} from '@shared/lib/defense';
import {
  getBuildingBuildTime,
  getSatelliteEnergyProductionPerHour,
  getShipsBuildTime,
} from '@shared/lib/formula';
import {
  getMaxStealableStandardUnitOnPlanet,
  getRecyclableStandardUnitOnPlanet,
} from '@shared/lib/planet';
import {timeToProduceAtLeast} from '@shared/lib/production';
import {Account} from '@shared/models/account';
import {BuildItem} from '@shared/models/build_item';
import {NaniteFactory, RoboticsFactory, Shipyard, SolarPlant} from '@shared/models/building';
import {Planet} from '@shared/models/planet';
import {
  EnergyAmount,
  incrementResources,
  multiplyResources,
  Resources,
  substractResources,
} from '@shared/models/resource';
import {SolarSatellite} from '@shared/models/ships';
import {max, substract, sum} from '@shared/utils/type_utils';

// Note - We assume the SolarPlant and the SolarSatellite don't have requirements
// TODO - Include FusionReactor and EnergyTechnology?
export function getFastestBuildItemsForMissingEnergyPerHour(
  account: Account,
  planet: Planet,
  energy: EnergyAmount,
  prodPerHour: Resources
): BuildItem[] {
  const roboticsFactoryLevel =
    (planet.buildingLevels.get(RoboticsFactory) ?? 0) +
    (planet.inProgressBuilding?.building === RoboticsFactory ? 1 : 0);
  const naniteFactoryLevel =
    (planet.buildingLevels.get(NaniteFactory) ?? 0) +
    (planet.inProgressBuilding?.building === NaniteFactory ? 1 : 0);
  const shipyardLevel =
    (planet.buildingLevels.get(Shipyard) ?? 0) +
    (planet.inProgressBuilding?.building === Shipyard ? 1 : 0);

  // Solar Plant cost
  const solarPlantLevel = planet.buildingLevels.get(SolarPlant) ?? 0;
  const nextLevelSolarPlantCost = SolarPlant.cost(solarPlantLevel + 1);

  // Solar Plant time to build
  const timeToGetResourcesForSolarPlant = timeToProduceAtLeast(
    substractResources(nextLevelSolarPlantCost, planet.resources),
    prodPerHour
  );
  const timeForCurrentBuildingToFinish = substract(
    planet.inProgressBuilding?.endTime ?? account.currentTime,
    account.currentTime
  );
  const timeToBuildSolarPlant = getBuildingBuildTime(
    SolarPlant,
    solarPlantLevel + 1,
    roboticsFactoryLevel,
    naniteFactoryLevel,
    account.universe.economySpeed
  );
  const timeToReachNextLevelSolarPlant = sum(
    max(timeToGetResourcesForSolarPlant, timeForCurrentBuildingToFinish),
    timeToBuildSolarPlant
  );

  // Satellite cost
  const energyProductionPerSatellite = getSatelliteEnergyProductionPerHour(
    1,
    planet.metadata.temperature
  );
  const neededSatellites = Math.ceil(energy / energyProductionPerSatellite);

  const recyclableStandardUnit = getRecyclableStandardUnitOnPlanet(account, planet, [
    {ship: SolarSatellite, quantity: neededSatellites},
  ]);
  const maxStealableStandardUnitOnPlanet = getMaxStealableStandardUnitOnPlanet(account, planet);
  const defenseRequired = getRequiredDefenseForStealableResources(
    sum(recyclableStandardUnit, maxStealableStandardUnitOnPlanet)
  );
  const extraDefenseRequired = getExtraDefensesToBuildOnPlanet(planet, defenseRequired);

  const extraSatelliteCost = multiplyResources(SolarSatellite.cost, neededSatellites);
  const extraDefenseBuildItems: BuildItem[] = [];
  for (const {defense, quantity} of extraDefenseRequired) {
    extraDefenseBuildItems.push(...buildItemsToUnlockBuildableOnPlanet(account, planet, defense));
    extraDefenseBuildItems.push({type: 'defense', quantity, defense, planet});
  }
  incrementResources(extraSatelliteCost, buildItemsCost(extraDefenseBuildItems));

  // Satellite time to build
  const timeToGetResourcesForSatelliteAndDefense = timeToProduceAtLeast(
    substractResources(extraSatelliteCost, planet.resources),
    prodPerHour
  );
  const timeForInProgressShipyardToFinish = substract(
    planet.inProgressBuilding?.building === Shipyard
      ? planet.inProgressBuilding.endTime
      : account.currentTime,
    account.currentTime
  );
  const timeForInProgressShipsToFinish = substract(
    planet.inProgressShips?.endTime ?? account.currentTime,
    account.currentTime
  );
  const timeToBuildHalfOfTheSatellites = getShipsBuildTime(
    SolarSatellite,
    neededSatellites / 2,
    shipyardLevel,
    naniteFactoryLevel,
    account.universe.economySpeed
  );
  const timeToReachHalfTheSatellites = sum(
    max(
      timeToGetResourcesForSatelliteAndDefense,
      sum(timeForInProgressShipyardToFinish, timeForInProgressShipsToFinish)
    ),
    timeToBuildHalfOfTheSatellites
  );

  // Choose the best (fastest) one
  if (timeToReachNextLevelSolarPlant > timeToReachHalfTheSatellites) {
    return [
      {type: 'ship', ship: SolarSatellite, quantity: neededSatellites, planet},
      ...extraDefenseBuildItems,
    ];
  } else {
    return [{type: 'building', building: SolarPlant, level: solarPlantLevel, planet}];
  }
}
