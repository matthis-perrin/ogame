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

/* eslint-disable @typescript-eslint/no-magic-numbers */
export const INACTIVITY_TIME = 6.5; // 6h30m
export const DEBRIS_PERCENTAGE = 0.3;
export const GT_FRET = 31250;
export const UI_REFRESH_RATE = 500;

// Defense ratio for 1M lootable resource
export const LM_RATIO = 2000 / 1000000;
export const ALO_RATIO = 600 / 1000000;
export const GAU_RATIO = 143 / 1000000;
export const PLA_RATIO = 50 / 1000000;

// Sum of units that goes into debris field (all but deut)
export const SAT_DEBRIS = 2000;

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

export const TECHNOLOGY_PAGES = [
  'component=supplies',
  'component=facilities',
  'component=defenses',
  'component=shipyard',
  'component=research',
  'component=fleetdispatch',
];

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
];
