import {buildItemsCost, buildItemsToUnlockBuildableOnPlanet} from '@shared/lib/build_items';
import {
  getExtraDefensesToBuildOnPlanet,
  getRequiredDefenseForStealableResources,
  getStealableResourcesProtectedByDefense,
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
import {getRecyclableStandardUnitFromShips} from '@shared/lib/planet';
import {toStandardUnits} from '@shared/lib/resources';
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
import {
  addResources,
  divideResources,
  EnergyAmount,
  multiplyResources,
  ZERO_ENERGY,
} from '@shared/models/resource';
import {Crawler, SolarSatellite} from '@shared/models/ships';
import {multiply, substract, sum} from '@shared/utils/type_utils';

// Note - We assume the SolarPlant and the SolarSatellite don't have requirements
// TODO - Include FusionReactor and EnergyTechnology?
export function getCheapestEnergyBuildItemsForEnergyPerHour(
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
  const solarPlantEnergyIncrease = substract(
    getSolarPlantEnergyProductionPerHour(solarPlantLevel + 1),
    getSolarPlantEnergyProductionPerHour(solarPlantLevel)
  );
  const solarPlantCostPerEnergy = divideResources(
    nextLevelSolarPlantCost,
    solarPlantEnergyIncrease
  );

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

  const requiredSatellitesCount = Math.max(1, Math.ceil(energy / energyProductionPerSatellite));
  const satelliteCountToCompareWithSolarPlant = Math.max(
    requiredSatellitesCount,
    Math.ceil(solarPlantEnergyIncrease / energyProductionPerSatellite)
  );

  const recyclableStandardUnit = getRecyclableStandardUnitFromShips(account, [
    {ship: SolarSatellite, quantity: satelliteCountToCompareWithSolarPlant},
  ]);
  const standardUnitProtectedByDefense = getStealableResourcesProtectedByDefense(
    Array.from(planet.defenses.entries()).map(([defense, quantity]) => ({defense, quantity}))
  );
  const defenseRequired = getRequiredDefenseForStealableResources(
    sum(recyclableStandardUnit, standardUnitProtectedByDefense)
  );
  const extraDefenseRequired = getExtraDefensesToBuildOnPlanet(planet, defenseRequired);

  let totalSatelliteCost = multiplyResources(
    SolarSatellite.cost,
    satelliteCountToCompareWithSolarPlant
  );
  const extraSatelliteBuildItems = buildItemsToUnlockBuildableOnPlanet(
    account,
    planet,
    SolarSatellite
  );
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
  totalSatelliteCost = addResources(totalSatelliteCost, buildItemsCost(extraSatelliteBuildItems));
  totalSatelliteCost = addResources(totalSatelliteCost, buildItemsCost(extraDefenseBuildItems));

  const satelliteCostPerEnergy = divideResources(
    totalSatelliteCost,
    satelliteCountToCompareWithSolarPlant * energyProductionPerSatellite
  );

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

  console.log('');
  console.log('');
  console.log(`------ ENERGY ${energy} CHECK ------`);
  console.log('solarPlantLevel', solarPlantLevel);
  console.log('nextLevelSolarPlantCost', nextLevelSolarPlantCost);
  console.log('solarPlantEnergyIncrease', solarPlantEnergyIncrease);
  console.log('solarPlantCostPerEnergy', solarPlantCostPerEnergy);
  console.log('energyProductionPerSatellite', energyProductionPerSatellite);
  console.log('requiredSatellitesCount', requiredSatellitesCount);
  console.log('satelliteCountToCompareWithSolarPlant', satelliteCountToCompareWithSolarPlant);
  console.log('recyclableStandardUnit', recyclableStandardUnit);
  console.log('standardUnitProtectedByDefense', standardUnitProtectedByDefense);
  console.log('defenseRequired', defenseRequired);
  console.log('extraDefenseRequired', extraDefenseRequired);
  console.log('extraSatelliteBuildItems', extraSatelliteBuildItems);
  console.log('extraDefenseBuildItems', extraDefenseBuildItems);
  console.log('buildItemsCost(extraDefenseBuildItems)', buildItemsCost(extraDefenseBuildItems));
  console.log('totalSatelliteCost', totalSatelliteCost);
  console.log('satelliteCostPerEnergy', satelliteCostPerEnergy);
  console.log(
    'toStandardUnits(account, solarPlantCostPerEnergy)',
    toStandardUnits(account, solarPlantCostPerEnergy)
  );
  console.log(
    'toStandardUnits(account, satelliteCostPerEnergy)',
    toStandardUnits(account, satelliteCostPerEnergy)
  );
  console.log('--------------------------');

  // Choose the best (cheapest) one
  if (
    toStandardUnits(account, solarPlantCostPerEnergy) >
    toStandardUnits(account, satelliteCostPerEnergy)
  ) {
    console.log(`========> CHOSE ${requiredSatellitesCount} SATELLITE <========`);
    return [
      ...extraSatelliteBuildItems,
      {
        type: 'ship',
        buildable: SolarSatellite,
        quantity: requiredSatellitesCount,
        planetId: planet.id,
      },
      ...extraDefenseBuildItems,
    ];
  } else {
    console.log(`========> CHOSE SOLAR PLANT ${solarPlantLevel + 1} <========`);
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
