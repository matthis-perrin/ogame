/* eslint-disable @typescript-eslint/no-magic-numbers */
import {Class} from '@shared/models/account';
import {Building} from '@shared/models/building';
import {
  Coordinates,
  Distance,
  DISTANCE_BETWEEN_GALAXY,
  DISTANCE_BETWEEN_PLANET,
  DISTANCE_BETWEEN_SYSTEM,
  SpeedModifier,
} from '@shared/models/coordinates';
import {Defense} from '@shared/models/defense';
import {CrystalAmount, DeuteriumAmount, EnergyAmount, MetalAmount} from '@shared/models/resource';
import {Ship, ShipFuelConsumption, ShipSpeed} from '@shared/models/ships';
import {Technology} from '@shared/models/technology';
import {hoursToMilliseconds, Milliseconds} from '@shared/models/time';
import {Universe} from '@shared/models/universe';
import {floor, multiply, sum} from '@shared/utils/type_utils';

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

export function getMetalBaseProdPerHour(): MetalAmount {
  return 30 as MetalAmount;
}

export function getCrystalBaseProdPerHour(): CrystalAmount {
  return 15 as CrystalAmount;
}

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

// Returns a negative DeuteriumAmount
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
// STORAGE CAPACITY
//

export function getMetalStorageCapacity(level: number): MetalAmount {
  return (5000 * Math.floor(2.5 * Math.exp((level * 20) / 33))) as MetalAmount;
}

export function getCrystalStorageCapacity(level: number): CrystalAmount {
  return (5000 * Math.floor(2.5 * Math.exp((level * 20) / 33))) as CrystalAmount;
}

export function getDeuteriumTankCapacity(level: number): DeuteriumAmount {
  return (5000 * Math.floor(2.5 * Math.exp((level * 20) / 33))) as DeuteriumAmount;
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
  planetTemperature: number,
  classBonus: number
): EnergyAmount {
  return ((1 + classBonus) *
    solarSatelliteCount *
    Math.floor((planetTemperature + 160) / 6)) as EnergyAmount;
}

//
// BUILD TIME
//

export function getTechnologyBuildTime(
  technology: Technology,
  level: number,
  researchLabLevel: number,
  universeResearchSpeed: number
): Milliseconds {
  const {metal, crystal} = technology.cost(level);
  const hours = ((metal as number) + (crystal as number)) / (1000 * (1 + researchLabLevel));
  return floor(hoursToMilliseconds(hours / universeResearchSpeed));
}

export function getBuildingBuildTime(
  building: Building,
  level: number,
  roboticsFactoryLevel: number,
  naniteFactoryLevel: number,
  universeEconomySpeed: number
): Milliseconds {
  const {metal, crystal} = building.cost(level);
  const lowLevelSpeedup = level > 5 ? 1 : 2 / (7 - level - 1);
  const hours =
    (lowLevelSpeedup * ((metal as number) + (crystal as number))) /
    (2500 * (1 + roboticsFactoryLevel) * Math.pow(2, naniteFactoryLevel));
  return floor(hoursToMilliseconds(hours / universeEconomySpeed));
}

export function getShipsBuildTime(
  ship: Ship,
  quantity: number,
  shipyardLevel: number,
  naniteFactoryLevel: number,
  universeEconomySpeed: number
): Milliseconds {
  const {metal, crystal} = ship.cost;
  const hours =
    ((metal as number) + (crystal as number)) /
    (2500 * (1 + shipyardLevel) * Math.pow(2, naniteFactoryLevel));
  return multiply(floor(hoursToMilliseconds(hours / universeEconomySpeed)), quantity);
}

export function getDefensesBuildTime(
  defense: Defense,
  quantity: number,
  shipyardLevel: number,
  naniteFactoryLevel: number,
  universeEconomySpeed: number
): Milliseconds {
  const {metal, crystal} = defense.cost;
  const hours =
    ((metal as number) + (crystal as number)) /
    (2500 * (1 + shipyardLevel) * Math.pow(2, naniteFactoryLevel));
  return multiply(floor(hoursToMilliseconds(hours / universeEconomySpeed)), quantity);
}

//
// SHIPS FLIGHT
//

export function getShipCargoCapacity(
  ship: Ship,
  hyperspaceTechnologyLevel: number,
  classBonus: number
): number {
  return Math.floor(ship.cargoCapacity * (1 + 0.05 * hyperspaceTechnologyLevel + classBonus));
}

function entityGap(e1: number, e2: number, count: number, isCircular: boolean): number {
  const smallest = Math.min(e1, e2);
  const largest = Math.max(e1, e2);
  return isCircular ? Math.min(largest - smallest, smallest - largest + count) : largest - smallest;
}

export function getDistance(from: Coordinates, to: Coordinates, universe: Universe): Distance {
  const {numberOfGalaxy, numberOfSystem, circularGalaxy, circularSystem} = universe;
  if (from.galaxy !== to.galaxy) {
    const galaxyGap = entityGap(from.galaxy, to.galaxy, numberOfGalaxy, true);
    return multiply(DISTANCE_BETWEEN_GALAXY, galaxyGap);
  }
  if (from.solarSystem !== to.solarSystem) {
    const systemGap = entityGap(from.solarSystem, to.solarSystem, numberOfSystem, circularGalaxy);
    return sum(multiply(DISTANCE_BETWEEN_SYSTEM, systemGap), 2700 as Distance);
  }
  if (from.position !== to.position) {
    const positionGap = entityGap(from.position, to.position, numberOfSystem, circularSystem);
    return sum(multiply(DISTANCE_BETWEEN_PLANET, positionGap), 1000 as Distance);
  }
  return DISTANCE_BETWEEN_PLANET;
}

export function getFlightDuration(
  distance: Distance,
  speed: ShipSpeed,
  speedModifier: SpeedModifier,
  universe: Universe
): Milliseconds {
  return ((1000 * (10 + (3500 / speedModifier) * Math.sqrt((10 * distance) / speed))) /
    universe.flightSpeed) as Milliseconds;
}

export function getFuelConsumption(
  baseFuelConsumption: ShipFuelConsumption,
  distance: Distance,
  shipSpeed: number,
  fleetSpeed: number,
  shipCount: number
): DeuteriumAmount {
  if (shipSpeed < fleetSpeed) {
    throw new Error(
      `Ship speed (${shipSpeed}) can not be smaller than the fleet speed (${fleetSpeed})`
    );
  }
  return (1 +
    Math.ceil(
      shipCount *
        ((baseFuelConsumption * distance) / 35000) *
        Math.pow(1 + fleetSpeed / shipSpeed, 2)
    )) as DeuteriumAmount;
}
