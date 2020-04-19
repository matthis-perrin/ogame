/* eslint-disable @typescript-eslint/no-magic-numbers */
import {Account, Class} from '@shared/models/account';
import {
  CrystalMine,
  DeuteriumSynthesizer,
  FusionReactor,
  MetalMine,
  SolarPlant,
} from '@shared/models/building';
import {Planet} from '@shared/models/planet';
import {
  CrystalAmount,
  DeuteriumAmount,
  EnergyAmount,
  makeResources,
  MetalAmount,
  Resources,
  sumResources,
} from '@shared/models/resource';
import {Crawler, SolarSatellite} from '@shared/models/ships';
import {EnergyTechnology, PlasmaTechnology} from '@shared/models/technology';
import {sum} from '@shared/utils/type_utils';

export function getMaxCrawlerCount(
  metalMineLevel: number,
  crystalMineLevel: number,
  deuteriumSynthesizerLevel: number
): number {
  return 8 * (metalMineLevel + crystalMineLevel + deuteriumSynthesizerLevel);
}

//
// RESOURCE PRODUCTION/CONSUMPTION
//

export function getMetalMineProductionPerHour(economySpeed: number, level: number): MetalAmount {
  return Math.floor(economySpeed * 30 * level * Math.pow(1.1, level)) as MetalAmount;
}

export function getCrystalMineProductionPerHour(
  economySpeed: number,
  level: number
): CrystalAmount {
  return Math.floor(economySpeed * 20 * level * Math.pow(1.1, level)) as CrystalAmount;
}

export function getDeuteriumSynthesizerProductionPerHour(
  economySpeed: number,
  level: number,
  planetTemperature: number
): DeuteriumAmount {
  return Math.floor(
    economySpeed * 20 * level * Math.pow(1.1, level) * (0.68 - 0.002 * planetTemperature)
  ) as DeuteriumAmount;
}

export function getFusionReactorDeuteriumConsumptionPerHour(
  economySpeed: number,
  level: number
): DeuteriumAmount {
  return Math.floor(-economySpeed * 10 * level * Math.pow(1.1, level)) as DeuteriumAmount;
}

export function getMetalProductionBonusFromPlasmaTechnology(level: number): MetalAmount {
  return (level * 0.01) as MetalAmount;
}

export function getCrystalProductionBonusFromPlasmaTechnology(level: number): CrystalAmount {
  return (level * 0.0066) as CrystalAmount;
}

export function getDeuteriumProductionBonusFromPlasmaTechnology(level: number): DeuteriumAmount {
  return (level * 0.0033) as DeuteriumAmount;
}

export function getResourceProductionBonusFromCrawlers(
  crawlerCount: number,
  accountClass: Class
): number {
  const accountClassBonus = accountClass === Class.Collector ? 1.5 : 1;
  return (crawlerCount * accountClassBonus * 0.02) / 100;
}

//
// ENERGY PRODUCTION/CONSUMPTION
//

export function getMetalMineEnergyConsumptionPerHour(level: number): EnergyAmount {
  return Math.floor(10 * level * Math.pow(1.1, level)) as EnergyAmount;
}

export function getCrystalMineEnergyConsumptionPerHour(level: number): EnergyAmount {
  return Math.floor(10 * level * Math.pow(1.1, level)) as EnergyAmount;
}

export function getDeuteriumSynthesizerEnergyConsumptionPerHour(level: number): EnergyAmount {
  return Math.floor(20 * level * Math.pow(1.1, level)) as EnergyAmount;
}

export function getCrawlerEnergyConsumptionPerHour(crawlerCount: number): EnergyAmount {
  return (50 * crawlerCount) as EnergyAmount;
}

export function getSolarPlantEnergyProductionPerHour(level: number): EnergyAmount {
  return Math.floor(20 * level * Math.pow(1.1, level)) as EnergyAmount;
}

export function getFusionReactorEnergyProductionPerHour(
  level: number,
  energyLevel: number
): EnergyAmount {
  return Math.floor(30 * level * Math.pow(1.05 + 0.01 * energyLevel, level)) as EnergyAmount;
}

export function getSatelliteEnergyProductionPerHour(
  solarSatelliteCount: number,
  planetTemperature: number
): EnergyAmount {
  return (solarSatelliteCount * Math.floor((planetTemperature + 160) / 6)) as EnergyAmount;
}

//
// Aggregation
//

export function getPlanetProductionPerHour(
  account: Account,
  planet: Planet
): {prod: Resources; energyConsumption: EnergyAmount; energyProduction: EnergyAmount} {
  const metalMineLevel = planet.buildingLevels.get(MetalMine) ?? 0;
  const crystalMineLevel = planet.buildingLevels.get(CrystalMine) ?? 0;
  const deuteriumSynthesizerLevel = planet.buildingLevels.get(DeuteriumSynthesizer) ?? 0;
  const maxCrawlerCount = getMaxCrawlerCount(
    metalMineLevel,
    crystalMineLevel,
    deuteriumSynthesizerLevel
  );

  const fusionReactorLevel = planet.buildingLevels.get(FusionReactor) ?? 0;
  const solarPlantLevel = planet.buildingLevels.get(SolarPlant) ?? 0;

  const crawlerCount = Math.min(planet.ships.get(Crawler) ?? 0, maxCrawlerCount);
  const solarSatelliteCount = planet.ships.get(SolarSatellite) ?? 0;

  const planetTemperature = planet.metadata.temperature;
  const plasmaLevel = account.technologyLevels.get(PlasmaTechnology) ?? 0;
  const energyLevel = account.technologyLevels.get(EnergyTechnology) ?? 0;

  const economySpeed = account.universe.economySpeed;
  const classProductionBonus = account.class === Class.Collector ? 0.25 : 0;
  const classEnergyBonus = (account.class === Class.Collector ? 0.1 : 0) as EnergyAmount;

  const {commander, engineer, fleetAdmiral, geologist, technocrat} = account.officers;
  const hasAllOfficers = commander && engineer && fleetAdmiral && geologist && technocrat;
  const geologProductionBonus = geologist ? 0.1 : 0;
  const engineerEnergyProductionBonus = (engineer ? 0.1 : 0) as EnergyAmount;
  const allOfficerProductionBonus = hasAllOfficers ? 0.02 : 0;
  const allOfficerEnergyBonus = (hasAllOfficers ? 0.02 : 0) as EnergyAmount;

  const resourceProductionBonusFromCrawlers = getResourceProductionBonusFromCrawlers(
    crawlerCount,
    account.class
  );

  // Metal

  const metalBaseProdPerHour = 30 * economySpeed;
  const metalProdPerHour = getMetalMineProductionPerHour(economySpeed, metalMineLevel);
  const metalProdBonusFromCrawlers = resourceProductionBonusFromCrawlers * metalProdPerHour;
  const metalProdBonusFromPlasma =
    getMetalProductionBonusFromPlasmaTechnology(plasmaLevel) * metalProdPerHour;
  const metalProdBonusFromGeologist = geologProductionBonus * metalProdPerHour;
  const metalProdBonusFromAllOfficers = allOfficerProductionBonus * metalProdPerHour;
  const metalProdBonusFromClass = classProductionBonus * metalProdPerHour;

  const totalMetalProdPerHour = sum(
    metalProdPerHour,
    (metalProdBonusFromCrawlers +
      metalProdBonusFromPlasma +
      metalProdBonusFromGeologist +
      metalProdBonusFromAllOfficers +
      metalProdBonusFromClass) as MetalAmount
  );

  // Crystal

  const crystalBaseProdPerHour = 15 * economySpeed;
  const crystalProdPerHour = getCrystalMineProductionPerHour(economySpeed, crystalMineLevel);
  const crystalProdBonusFromCrawlers = resourceProductionBonusFromCrawlers * crystalProdPerHour;
  const crystalProdBonusFromPlasma =
    getCrystalProductionBonusFromPlasmaTechnology(plasmaLevel) * crystalProdPerHour;
  const crystalProdBonusFromGeologist = geologProductionBonus * crystalProdPerHour;
  const crystalProdBonusFromAllOfficers = allOfficerProductionBonus * crystalProdPerHour;
  const crystalProdBonusFromClass = classProductionBonus * crystalProdPerHour;

  const totalCrystalProdPerHour = sum(
    crystalProdPerHour,
    (crystalProdBonusFromCrawlers +
      crystalProdBonusFromPlasma +
      crystalProdBonusFromGeologist +
      crystalProdBonusFromAllOfficers +
      crystalProdBonusFromClass) as CrystalAmount
  );

  // Deuterium

  const deuteriumProdPerHour = getDeuteriumSynthesizerProductionPerHour(
    economySpeed,
    deuteriumSynthesizerLevel,
    planetTemperature
  );
  const deuteriumProdBonusFromCrawlers = resourceProductionBonusFromCrawlers * deuteriumProdPerHour;
  const deuteriumProdBonusFromPlasma =
    getDeuteriumProductionBonusFromPlasmaTechnology(plasmaLevel) * deuteriumProdPerHour;
  const deuteriumProdBonusFromGeologist = geologProductionBonus * deuteriumProdPerHour;
  const deuteriumProdBonusFromAllOfficers = allOfficerProductionBonus * deuteriumProdPerHour;
  const deuteriumProdBonusFromClass = classProductionBonus * deuteriumProdPerHour;
  const deuteriumConsumptionPerHour = getFusionReactorDeuteriumConsumptionPerHour(
    economySpeed,
    fusionReactorLevel
  );

  const totalDeuteriumProdPerHour = sum(
    deuteriumProdPerHour,
    (deuteriumProdBonusFromCrawlers +
      deuteriumProdBonusFromPlasma +
      deuteriumProdBonusFromGeologist +
      deuteriumProdBonusFromAllOfficers +
      deuteriumProdBonusFromClass) as DeuteriumAmount,
    deuteriumConsumptionPerHour
  );

  // Energy Consumption

  const metalMineEnergyConsumption = getMetalMineEnergyConsumptionPerHour(metalMineLevel);
  const crystalMineEnergyConsumption = getCrystalMineEnergyConsumptionPerHour(crystalMineLevel);
  const deuteriumSynthesizerEnergyConsumption = getDeuteriumSynthesizerEnergyConsumptionPerHour(
    deuteriumSynthesizerLevel
  );
  const crawlerEnergyConsumption = getCrawlerEnergyConsumptionPerHour(crawlerCount);

  const totalEnergyConsumption = Math.floor(
    sum(
      metalMineEnergyConsumption,
      crystalMineEnergyConsumption,
      deuteriumSynthesizerEnergyConsumption,
      crawlerEnergyConsumption
    )
  ) as EnergyAmount;

  // Energy Production

  const solarPlantEnergyProduction = getSolarPlantEnergyProductionPerHour(solarPlantLevel);
  const fusionReactorEnergyProduction = getFusionReactorEnergyProductionPerHour(
    fusionReactorLevel,
    energyLevel
  );
  const satelliteEnergyProduction = getSatelliteEnergyProductionPerHour(
    solarSatelliteCount,
    planetTemperature
  );
  const energyProductionBeforeBonuses = sum(
    solarPlantEnergyProduction,
    fusionReactorEnergyProduction,
    satelliteEnergyProduction
  );
  const energyBonusFromEngineer = engineerEnergyProductionBonus * energyProductionBeforeBonuses;
  const energyBonusFromAllOfficer = allOfficerEnergyBonus * energyProductionBeforeBonuses;
  const energyBonusFromClass = classEnergyBonus * energyProductionBeforeBonuses;

  const totalEnergyProduction = sum(
    energyProductionBeforeBonuses,
    (energyBonusFromEngineer + energyBonusFromAllOfficer + energyBonusFromClass) as EnergyAmount
  );

  // Aggregation

  const efficiency =
    totalEnergyConsumption !== 0 ? Math.min(1, totalEnergyProduction / totalEnergyConsumption) : 1;

  return {
    prod: {
      metal: (metalBaseProdPerHour + totalMetalProdPerHour * efficiency) as MetalAmount,
      crystal: (crystalBaseProdPerHour + totalCrystalProdPerHour * efficiency) as CrystalAmount,
      deuterium: (totalDeuteriumProdPerHour * efficiency) as DeuteriumAmount,
    },
    energyProduction: totalEnergyProduction,
    energyConsumption: totalEnergyConsumption,
  };
}

export function getAccountProductionPerHour(account: Account): Resources {
  let accountProd: Resources = makeResources({});
  for (const planet of account.planets) {
    const {prod} = getPlanetProductionPerHour(account, planet);
    accountProd = sumResources(accountProd, prod);
  }
  return accountProd;
}
