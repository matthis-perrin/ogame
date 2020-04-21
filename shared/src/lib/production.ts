import {
  getCrawlerEnergyConsumptionPerHour,
  getCrystalBaseProdPerHour,
  getCrystalMineEnergyConsumptionPerHour,
  getCrystalMineProductionPerHour,
  getCrystalProductionBonusFromPlasmaTechnology,
  getCrystalStorageCapacity,
  getDeuteriumProductionBonusFromPlasmaTechnology,
  getDeuteriumSynthesizerEnergyConsumptionPerHour,
  getDeuteriumSynthesizerProductionPerHour,
  getDeuteriumTankCapacity,
  getFusionReactorDeuteriumConsumptionPerHour,
  getFusionReactorEnergyProductionPerHour,
  getMaxCrawlerCount,
  getMetalBaseProdPerHour,
  getMetalMineEnergyConsumptionPerHour,
  getMetalMineProductionPerHour,
  getMetalProductionBonusFromPlasmaTechnology,
  getMetalStorageCapacity,
  getResourceProductionBonusFromCrawlers,
  getSatelliteEnergyProductionPerHour,
  getSolarPlantEnergyProductionPerHour,
} from '@shared/lib/formula';
import {toStandardUnits} from '@shared/lib/resources';
import {Account, Class} from '@shared/models/account';
import {
  CrystalMine,
  CrystalStorage,
  DeuteriumSynthesizer,
  DeuteriumTank,
  FusionReactor,
  MetalMine,
  MetalStorage,
  SolarPlant,
} from '@shared/models/building';
import {Planet} from '@shared/models/planet';
import {
  addResources,
  EnergyAmount,
  makeResources,
  Resources,
  StandardUnitAmount,
} from '@shared/models/resource';
import {Crawler, SolarSatellite} from '@shared/models/ships';
import {EnergyTechnology, PlasmaTechnology} from '@shared/models/technology';
import {hoursToMilliseconds, Milliseconds} from '@shared/models/time';
import {floor, multiply, sum} from '@shared/utils/type_utils';

const COLLECTOR_PRODUCTION_BONUS = 0.25;
const COLLECTOR_ENERGY_BONUS = 0.1;
const GEOLOG_PRODUCTION_BONUS = 0.1;
const ENGINEER_ENERGY_BONUS = 0.1;
const ALL_OFFICERS_ENERGY_BONUS = 0.02;
const ALL_OFFICERS_PRODUCTION_BONUS = 0.02;

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
  const classProductionBonus = account.class === Class.Collector ? COLLECTOR_PRODUCTION_BONUS : 0;
  const classEnergyBonus = account.class === Class.Collector ? COLLECTOR_ENERGY_BONUS : 0;

  const {commander, engineer, fleetAdmiral, geologist, technocrat} = account.officers;
  const hasAllOfficers = commander && engineer && fleetAdmiral && geologist && technocrat;
  const geologProductionBonus = geologist ? GEOLOG_PRODUCTION_BONUS : 0;
  const engineerEnergyProductionBonus = engineer ? ENGINEER_ENERGY_BONUS : 0;
  const allOfficerProductionBonus = hasAllOfficers ? ALL_OFFICERS_ENERGY_BONUS : 0;
  const allOfficerEnergyBonus = hasAllOfficers ? ALL_OFFICERS_PRODUCTION_BONUS : 0;

  const resourceProductionBonusFromCrawlers = getResourceProductionBonusFromCrawlers(
    crawlerCount,
    account.class
  );

  // Metal

  const metalBaseProdPerHour = multiply(getMetalBaseProdPerHour(), economySpeed);
  const metalProdPerHour = getMetalMineProductionPerHour(economySpeed, metalMineLevel);
  const metalProdBonusFromCrawlers = multiply(
    metalProdPerHour,
    resourceProductionBonusFromCrawlers
  );
  const metalProdBonusFromPlasma = multiply(
    metalProdPerHour,
    getMetalProductionBonusFromPlasmaTechnology(plasmaLevel)
  );
  const metalProdBonusFromGeologist = multiply(metalProdPerHour, geologProductionBonus);
  const metalProdBonusFromAllOfficers = multiply(metalProdPerHour, allOfficerProductionBonus);
  const metalProdBonusFromClass = multiply(metalProdPerHour, classProductionBonus);

  const totalMetalProdPerHour = sum(
    metalProdPerHour,
    metalProdBonusFromCrawlers,
    metalProdBonusFromPlasma,
    metalProdBonusFromGeologist,
    metalProdBonusFromAllOfficers,
    metalProdBonusFromClass
  );

  // Crystal

  const crystalBaseProdPerHour = multiply(getCrystalBaseProdPerHour(), economySpeed);
  const crystalProdPerHour = getCrystalMineProductionPerHour(economySpeed, crystalMineLevel);
  const crystalProdBonusFromCrawlers = multiply(
    crystalProdPerHour,
    resourceProductionBonusFromCrawlers
  );
  const crystalProdBonusFromPlasma = multiply(
    crystalProdPerHour,
    getCrystalProductionBonusFromPlasmaTechnology(plasmaLevel)
  );
  const crystalProdBonusFromGeologist = multiply(crystalProdPerHour, geologProductionBonus);
  const crystalProdBonusFromAllOfficers = multiply(crystalProdPerHour, allOfficerProductionBonus);
  const crystalProdBonusFromClass = multiply(crystalProdPerHour, classProductionBonus);

  const totalCrystalProdPerHour = sum(
    crystalProdPerHour,
    crystalProdBonusFromCrawlers,
    crystalProdBonusFromPlasma,
    crystalProdBonusFromGeologist,
    crystalProdBonusFromAllOfficers,
    crystalProdBonusFromClass
  );

  // Deuterium

  const deuteriumProdPerHour = getDeuteriumSynthesizerProductionPerHour(
    economySpeed,
    deuteriumSynthesizerLevel,
    planetTemperature
  );
  const deuteriumProdBonusFromCrawlers = multiply(
    deuteriumProdPerHour,
    resourceProductionBonusFromCrawlers
  );
  const deuteriumProdBonusFromPlasma = multiply(
    deuteriumProdPerHour,
    getDeuteriumProductionBonusFromPlasmaTechnology(plasmaLevel)
  );
  const deuteriumProdBonusFromGeologist = multiply(deuteriumProdPerHour, geologProductionBonus);
  const deuteriumProdBonusFromAllOfficers = multiply(
    deuteriumProdPerHour,
    allOfficerProductionBonus
  );
  const deuteriumProdBonusFromClass = multiply(deuteriumProdPerHour, classProductionBonus);
  const deuteriumConsumptionPerHour = getFusionReactorDeuteriumConsumptionPerHour(
    economySpeed,
    fusionReactorLevel
  );

  const totalDeuteriumProdPerHour = sum(
    deuteriumProdPerHour,
    deuteriumProdBonusFromCrawlers,
    deuteriumProdBonusFromPlasma,
    deuteriumProdBonusFromGeologist,
    deuteriumProdBonusFromAllOfficers,
    deuteriumProdBonusFromClass,
    deuteriumConsumptionPerHour
  );

  // Energy Consumption

  const metalMineEnergyConsumption = getMetalMineEnergyConsumptionPerHour(metalMineLevel);
  const crystalMineEnergyConsumption = getCrystalMineEnergyConsumptionPerHour(crystalMineLevel);
  const deuteriumSynthesizerEnergyConsumption = getDeuteriumSynthesizerEnergyConsumptionPerHour(
    deuteriumSynthesizerLevel
  );
  const crawlerEnergyConsumption = getCrawlerEnergyConsumptionPerHour(crawlerCount);

  const totalEnergyConsumption = floor(
    sum(
      metalMineEnergyConsumption,
      crystalMineEnergyConsumption,
      deuteriumSynthesizerEnergyConsumption,
      crawlerEnergyConsumption
    )
  );

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
  const energyBonusFromEngineer = multiply(
    energyProductionBeforeBonuses,
    engineerEnergyProductionBonus
  );
  const energyBonusFromAllOfficer = multiply(energyProductionBeforeBonuses, allOfficerEnergyBonus);
  const energyBonusFromClass = multiply(energyProductionBeforeBonuses, classEnergyBonus);

  const totalEnergyProduction = sum(
    energyProductionBeforeBonuses,
    energyBonusFromEngineer,
    energyBonusFromAllOfficer,
    energyBonusFromClass
  );

  // Aggregation

  const efficiency =
    totalEnergyConsumption !== 0 ? Math.min(1, totalEnergyProduction / totalEnergyConsumption) : 1;

  return {
    prod: {
      metal: sum(metalBaseProdPerHour, multiply(totalMetalProdPerHour, efficiency)),
      crystal: sum(crystalBaseProdPerHour, multiply(totalCrystalProdPerHour, efficiency)),
      deuterium: multiply(totalDeuteriumProdPerHour, efficiency),
    },
    energyProduction: totalEnergyProduction,
    energyConsumption: totalEnergyConsumption,
  };
}

export function getAccountProductionPerHour(account: Account): Resources {
  let accountProd: Resources = makeResources({});
  for (const planet of account.planets) {
    const {prod} = getPlanetProductionPerHour(account, planet);
    accountProd = addResources(accountProd, prod);
  }
  return accountProd;
}

export function getMaxAllowedStandardUnitOnPlanet(
  account: Account,
  planet: Planet
): StandardUnitAmount {
  const {prod} = getPlanetProductionPerHour(account, planet);
  return multiply(toStandardUnits(account, prod), account.preferences.maxProdHoursOnPlanet);
}

export function getPlanetStorageCapacity(planet: Planet): Resources {
  return makeResources({
    m: getMetalStorageCapacity(planet.buildingLevels.get(MetalStorage) ?? 0),
    c: getCrystalStorageCapacity(planet.buildingLevels.get(CrystalStorage) ?? 0),
    d: getDeuteriumTankCapacity(planet.buildingLevels.get(DeuteriumTank) ?? 0),
  });
}

export function timeToProduceAtLeast(toProduce: Resources, prodPerHour: Resources): Milliseconds {
  const hoursToProduceMetal = toProduce.metal / prodPerHour.metal;
  const hoursToProduceCrystal = toProduce.crystal / prodPerHour.crystal;
  const hoursToProduceDeuterium = toProduce.deuterium / prodPerHour.deuterium;
  return hoursToMilliseconds(
    Math.max(0, hoursToProduceMetal, hoursToProduceCrystal, hoursToProduceDeuterium)
  );
}
