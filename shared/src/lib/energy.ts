import {buildItemsCost, buildItemsToUnlockBuildableOnPlanet} from '@shared/lib/build_items';
import {
  getExtraDefensesToBuildOnPlanet,
  getRequiredDefenseForStealableResources,
} from '@shared/lib/defense';
import {
  getCrawlerEnergyConsumptionPerHour,
  getCrystalMineEnergyConsumptionPerHour,
  getDeuteriumSynthesizerEnergyConsumptionPerHour,
  getFusionReactorEnergyProductionPerHour,
  getMetalMineEnergyConsumptionPerHour,
  getSatelliteEnergyProductionPerHour,
  getSolarPlantEnergyProductionPerHour,
} from '@shared/lib/formula';
import {
  getMaxStealableStandardUnitOnPlanet,
  getRecyclableStandardUnitOnPlanet,
} from '@shared/lib/planet';
import {Account, Class} from '@shared/models/account';
import {BuildItem} from '@shared/models/build_item';
import {
  CrystalMine,
  DeuteriumSynthesizer,
  FusionReactor,
  MetalMine,
  SolarPlant,
} from '@shared/models/building';
import {Planet} from '@shared/models/planet';
import {addResources, EnergyAmount, multiplyResources, ZERO_ENERGY} from '@shared/models/resource';
import {Crawler, SolarSatellite} from '@shared/models/ships';
import {multiply, substract, sum} from '@shared/utils/type_utils';

// Note - We assume the SolarPlant and the SolarSatellite don't have requirements
// TODO - Include FusionReactor and EnergyTechnology?
export function getCheapestBuildItemsForMissingEnergyPerHour(
  account: Account,
  planet: Planet,
  energy: EnergyAmount
  // prodPerHour: Resources
): BuildItem[] {
  // const roboticsFactoryLevel = planet.buildingLevels.get(RoboticsFactory) ?? 0;
  // const naniteFactoryLevel = planet.buildingLevels.get(NaniteFactory) ?? 0;
  // const shipyardLevel = planet.buildingLevels.get(Shipyard) ?? 0;

  // Solar Plant cost
  const solarPlantLevel = planet.buildingLevels.get(SolarPlant) ?? 0;
  const nextLevelSolarPlantCost = SolarPlant.cost(solarPlantLevel + 1);

  // // Solar Plant time to build
  // const timeToGetResourcesForSolarPlant = timeToProduceAtLeast(
  //   substractResources(nextLevelSolarPlantCost, planet.resources),
  //   prodPerHour
  // );
  // const timeForCurrentBuildingToFinish = substract(
  //   planet.inProgressBuilding?.endTime ?? account.currentTime,
  //   account.currentTime
  // );
  // const timeToBuildSolarPlant = getBuildingBuildTime(
  //   SolarPlant,
  //   solarPlantLevel + 1,
  //   roboticsFactoryLevel,
  //   naniteFactoryLevel,
  //   account.universe.economySpeed
  // );
  // const timeToReachNextLevelSolarPlant = sum(
  //   max(timeToGetResourcesForSolarPlant, timeForCurrentBuildingToFinish),
  //   timeToBuildSolarPlant
  // );

  // Satellite cost
  const energyProductionPerSatellite = getSatelliteEnergyProductionPerHour(
    1,
    planet.metadata.temperature,
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    account.class === Class.Collector ? 0.1 : 0
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

  let totalSatelliteCost = multiplyResources(SolarSatellite.cost, neededSatellites);
  const extraDefenseBuildItems: BuildItem[] = [];
  for (const {defense, quantity} of extraDefenseRequired) {
    extraDefenseBuildItems.push(...buildItemsToUnlockBuildableOnPlanet(account, planet, defense));
    extraDefenseBuildItems.push({
      type: 'defense',
      quantity,
      buildable: defense,
      planetId: planet.id,
    });
  }
  totalSatelliteCost = addResources(totalSatelliteCost, buildItemsCost(extraDefenseBuildItems));

  // // Satellite time to build
  // const timeToGetResourcesForSatelliteAndDefense = timeToProduceAtLeast(
  //   substractResources(totalSatelliteCost, planet.resources),
  //   prodPerHour
  // );
  // const timeForInProgressShipyardToFinish = substract(
  //   planet.inProgressBuilding?.building === Shipyard
  //     ? planet.inProgressBuilding.endTime
  //     : account.currentTime,
  //   account.currentTime
  // );
  // const timeForInProgressShipsToFinish = substract(
  //   planet.inProgressShips?.endTime ?? account.currentTime,
  //   account.currentTime
  // );
  // const timeToBuildHalfOfTheSatellites = getShipsBuildTime(
  //   SolarSatellite,
  //   neededSatellites / 2,
  //   shipyardLevel,
  //   naniteFactoryLevel,
  //   account.universe.economySpeed
  // );
  // const timeToReachHalfTheSatellites = sum(
  //   max(
  //     timeToGetResourcesForSatelliteAndDefense,
  //     sum(timeForInProgressShipyardToFinish, timeForInProgressShipsToFinish)
  //   ),
  //   timeToBuildHalfOfTheSatellites
  // );

  // Choose the best (cheapest) one
  if (nextLevelSolarPlantCost > totalSatelliteCost) {
    return [
      {type: 'ship', buildable: SolarSatellite, quantity: neededSatellites, planetId: planet.id},
      ...extraDefenseBuildItems,
    ];
  } else {
    return [
      {type: 'building', buildable: SolarPlant, level: solarPlantLevel + 1, planetId: planet.id},
    ];
  }
}

export function getInProgressEnergyDeltaPerHour(
  account: Account,
  planet: Planet,
  energyLevel: number
): EnergyAmount {
  let energy = ZERO_ENERGY;
  if (planet.inProgressBuilding) {
    const level = planet.inProgressBuilding.level;
    if (planet.inProgressBuilding.building === SolarPlant) {
      energy = sum(
        energy,
        substract(
          getSolarPlantEnergyProductionPerHour(level),
          getSolarPlantEnergyProductionPerHour(level - 1)
        )
      );
    } else if (planet.inProgressBuilding.building === FusionReactor) {
      energy = sum(
        energy,
        substract(
          getFusionReactorEnergyProductionPerHour(level, energyLevel),
          getFusionReactorEnergyProductionPerHour(level - 1, energyLevel)
        )
      );
    } else if (planet.inProgressBuilding.building === MetalMine) {
      energy = sum(
        energy,
        substract(
          getMetalMineEnergyConsumptionPerHour(level - 1),
          getMetalMineEnergyConsumptionPerHour(level)
        )
      );
    } else if (planet.inProgressBuilding.building === CrystalMine) {
      energy = sum(
        energy,
        substract(
          getCrystalMineEnergyConsumptionPerHour(level - 1),
          getCrystalMineEnergyConsumptionPerHour(level)
        )
      );
    } else if (planet.inProgressBuilding.building === DeuteriumSynthesizer) {
      energy = sum(
        energy,
        substract(
          getDeuteriumSynthesizerEnergyConsumptionPerHour(level - 1),
          getDeuteriumSynthesizerEnergyConsumptionPerHour(level)
        )
      );
    }
  }
  if (planet.inProgressShips) {
    const inProgressSatellites = planet.inProgressShips.ships.reduce(
      (total, ships) => total + (ships.ship === SolarSatellite ? ships.quantity : 0),
      0
    );
    const inProgressCrawler = planet.inProgressShips.ships.reduce(
      (total, ships) => total + (ships.ship === Crawler ? ships.quantity : 0),
      0
    );
    energy = sum(
      energy,
      multiply(
        getSatelliteEnergyProductionPerHour(
          inProgressSatellites,
          planet.metadata.temperature,
          // eslint-disable-next-line @typescript-eslint/no-magic-numbers
          account.class === Class.Collector ? 0.1 : 0
        ),
        inProgressSatellites
      ),
      multiply(getCrawlerEnergyConsumptionPerHour(inProgressCrawler), inProgressCrawler)
    );
  }
  return energy;
}
