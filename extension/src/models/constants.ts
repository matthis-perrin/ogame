import {
  CrystalMine,
  CrystalStorage,
  DeuteriumSynthesizer,
  DeuteriumTank,
  MetalMine,
  MetalStorage,
  MissileSilo,
  NaniteFactory,
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

export const SESSION_ID = Math.random()
  .toString()
  .substr(2);
export const SESSION_ID_LOCAL_STORAGE_KEY = 'titanraccoonid';
localStorage.setItem(SESSION_ID_LOCAL_STORAGE_KEY, SESSION_ID);

/* eslint-disable @typescript-eslint/no-magic-numbers */
export const INACTIVITY_TIME = 8; // 8h
export const DEBRIS_PERCENTAGE = 0.3;
export const UI_REFRESH_RATE = 500;
export const PROBES_AMOUNT = 10;
export const NUMBER_OF_SS = 500;

// Class bonus
export const COLLECTOR_BONUS_FRET = 0.25;
export const COLLECTOR_BONUS_ENERGY = 0.1;

// Defense ratio for 1M lootable resource
export const RATIO_LM = 2000 / 1000000;
export const RATIO_ALO = 600 / 1000000;
export const RATIO_GAU = 143 / 1000000;
export const RATIO_PLA = 50 / 1000000;

// Sum of units that goes into debris field (all but deut)
export const DEBRIS_SAT = 2000;

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

export const COLOR_WHITE = '#aaa';
export const COLOR_GREEN = '#9c0';
export const COLOR_RED = '#d43635';
export const COLOR_ORANGE = '#d29d00';

export const NAME_METAL = 'Métal';
export const NAME_CRYSTAL = 'Cristal';
export const NAME_DEUTERIUM = 'Deutérium';
