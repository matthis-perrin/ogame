/* eslint-disable @typescript-eslint/no-magic-numbers */
import {Officers} from '@shared/models/officers';
import {Planet} from '@shared/models/planet';
import {Technology} from '@shared/models/technology';
import {Milliseconds} from '@shared/models/time';
import {Universe} from '@shared/models/universe';

export enum Class {
  Collector = 'Collector',
  General = 'General',
  Discoverer = 'Discoverer',
}
export interface Account {
  // Dynamic
  planets: Planet[];
  technologyLevels: Map<Technology, number>;
  inProgressTechnology?: {technology: Technology; level: number; startTime: Milliseconds};
  currentTime: Milliseconds;
  // Static
  universe: Universe;
  class: Class;
  officers: Officers;
  preferences: {
    maxProdHoursOnPlanet: number;
    resourcesRatio: {
      metal: number;
      crystal: number;
      deuterium: number;
    };
  };
}
