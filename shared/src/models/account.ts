/* eslint-disable @typescript-eslint/no-magic-numbers */
import {Officers} from '@shared/models/officers';
import {Planet} from '@shared/models/planet';
import {Technology} from '@shared/models/technology';
import {Universe} from '@shared/models/universe';

export enum Class {
  Collector = 'Collector',
  General = 'General',
  Discoverer = 'Discoverer',
}
export interface Account {
  universe: Universe;
  planets: Planet[];
  technologyLevels: Map<Technology, number>;
  inProgressTechnology?: {technology: Technology; level: number};
  class: Class;
  officers: Officers;
  preferences: {
    resourcesRatio: {
      metal: number;
      crystal: number;
      deuterium: number;
    };
  };
}
