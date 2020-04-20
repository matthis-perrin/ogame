/* eslint-disable @typescript-eslint/no-magic-numbers */
import {Class} from '@shared/models/account';
import {CrystalAmount, DeuteriumAmount, EnergyAmount, MetalAmount} from '@shared/models/resource';

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
