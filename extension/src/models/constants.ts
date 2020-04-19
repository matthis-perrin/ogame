import {Tech} from '@src/models/tech';

/* eslint-disable @typescript-eslint/no-magic-numbers */
export const INACTIVITY_TIME = 6.5; // 6h30m
export const DEBRIS_PERCENTAGE = 0.3;
export const GT_FRET = 31250;
export const SUM_PLANET = 'SUM';

// Defense ratio for 1M lootable resource
export const LM_RATIO = 2000 / 1000000;
export const ALO_RATIO = 600 / 1000000;
export const GAU_RATIO = 143 / 1000000;
export const PLA_RATIO = 50 / 1000000;

// Sum of units that goes into debris field (all but deut)
export const SAT_DEBRIS = 2000;

// Required max technologies
export const MAX_TECHNOLOGIES = [
  Tech.MetalMine,
  Tech.CrystalMine,
  Tech.DeuteriumSynthesizer,
  Tech.MetalStorage,
  Tech.CrystalStorage,
  Tech.DeuteriumStorage,
  Tech.SolarPlant,
  Tech.MissileSilo,
  Tech.RoboticsFactory,
  Tech.Shipyard,
  Tech.NaniteFactory,
];

export const TECHNOLOGY_PAGES = [
  'component=supplies',
  'component=facilities',
  'component=defenses',
  'component=shipyard',
  'component=research',
];

export const ACCOUNT_TECHNOLOGIES = [
  Tech.EspionageTechnology,
  Tech.ComputerTechnology,
  Tech.WeaponsTechnology,
  Tech.ShieldingTechnology,
  Tech.ArmorTechnology,
  Tech.EnergyTechnology,
  Tech.HyperspaceTechnology,
  Tech.CombustionDriveTechnology,
  Tech.ImpulseDriveTechnology,
  Tech.HyperspaceDriveTechnology,
  Tech.LaserTechnology,
  Tech.IonTechnology,
  Tech.PlasmaTechnology,
  Tech.AstrophysicsTechnology,
  Tech.ResearchNetworkTechnology,
  Tech.GravitonTechnology,
];
