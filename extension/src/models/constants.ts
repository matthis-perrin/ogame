import {
  CrystalMine,
  CrystalStorage,
  DeuteriumSynthesizer,
  DeuteriumTank,
  MetalMine,
  MetalStorage,
  MissileSilo,
  NaniteFactory,
  ResearchLab,
  RoboticsFactory,
  Shipyard,
  SolarPlant,
} from '@shared/models/building';
import {
  ArmourTechnology,
  AstrophysicsTechnology,
  CombustionDrive,
  ComputerTechnology,
  EnergyTechnology,
  EspionageTechnology,
  GravitonTechnology,
  HyperspaceDrive,
  HyperspaceTechnology,
  ImpulseDrive,
  IntergalacticResearchNetworkTechnology,
  IonTechnology,
  LaserTechnology,
  PlasmaTechnology,
  ShieldingTechnology,
  WeaponTechnology,
} from '@shared/models/technology';

import {setItem} from '@src/controllers/networkstorage';

export const SESSION_ID = Math.random()
  .toString()
  .substr(2);
export const SESSION_ID_LOCAL_STORAGE_KEY = 'titanraccoonid';
// eslint-disable-next-line no-console
setItem(SESSION_ID_LOCAL_STORAGE_KEY, SESSION_ID).catch(console.error);

/* eslint-disable @typescript-eslint/no-magic-numbers */
export const INACTIVITY_TIME = 7.75; // 7h45
export const UI_REFRESH_RATE = 500;
export const PROBES_AMOUNT = 5;
export const MAX_CRAWLERS_FACTOR = 8;
export const MAX_CRAWLERS_AMOUNT = 1680;

// Class bonus
export const COLLECTOR_BONUS_FRET = 0.25;
export const COLLECTOR_BONUS_ENERGY = 0.1;

// Defense ratio for 1M lootable resource
export const RATIO_LM = 2000 / 1000000;
export const RATIO_ALO = 450 / 1000000;
export const RATIO_GAU = 100 / 1000000;
export const RATIO_PLA = 50 / 1000000;

// Sum of units that goes into debris field (all but deut)
export const DEBRIS_SAT = 2000;
export const DEBRIS_FOR = 4000;

// Required max technologies
export const MAX_TECHNOLOGIES = [
  MetalMine.id,
  CrystalMine.id,
  DeuteriumSynthesizer.id,
  MetalStorage.id,
  CrystalStorage.id,
  DeuteriumTank.id,
  SolarPlant.id,
  MissileSilo.id,
  RoboticsFactory.id,
  Shipyard.id,
  NaniteFactory.id,
  ResearchLab.id,
];

export const PAGES_TECHNOLOGIES = [
  'component=supplies',
  'component=facilities',
  'component=defenses',
  'component=research',
];

export const PAGES_SHIPS = ['component=shipyard', 'component=fleetdispatch'];

export const ACCOUNT_TECHNOLOGIES = [
  EspionageTechnology.id,
  ComputerTechnology.id,
  WeaponTechnology.id,
  ShieldingTechnology.id,
  ArmourTechnology.id,
  EnergyTechnology.id,
  HyperspaceTechnology.id,
  CombustionDrive.id,
  ImpulseDrive.id,
  HyperspaceDrive.id,
  LaserTechnology.id,
  IonTechnology.id,
  PlasmaTechnology.id,
  AstrophysicsTechnology.id,
  IntergalacticResearchNetworkTechnology.id,
  GravitonTechnology.id,
];

export const ResearchLabPlanets = ['3-1', '3-2', '4-1', '5-1', '5-2'];

export const COLOR_WHITE = '#aaa';
export const COLOR_WHITEDARK = '#555';
export const COLOR_GREEN = '#9c0';
export const COLOR_RED = '#d43635';
export const COLOR_ORANGE = '#d29d00';
