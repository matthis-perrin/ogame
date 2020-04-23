/* eslint-disable @typescript-eslint/no-magic-numbers */
import {Officers} from '@shared/models/officers';
import {Planet, PlanetId} from '@shared/models/planet';
import {Technology} from '@shared/models/technology';
import {Milliseconds} from '@shared/models/time';
import {Universe} from '@shared/models/universe';

export enum Class {
  Collector = 'Collector',
  General = 'General',
  Discoverer = 'Discoverer',
}

export interface InProgressTechnology {
  readonly technology: Technology;
  readonly level: number;
  readonly startTime: Milliseconds;
  readonly endTime: Milliseconds;
}

export interface Account {
  // Dynamic
  readonly planets: ReadonlyMap<PlanetId, Planet>;
  readonly technologyLevels: ReadonlyMap<Technology, number>;
  readonly inProgressTechnology?: InProgressTechnology;
  readonly currentTime: Milliseconds;
  // Static
  readonly universe: Universe;
  readonly class: Class;
  readonly officers: Officers;
  readonly preferences: {
    readonly maxProdHoursOnPlanet: number;
    readonly resourcesRatio: {
      readonly metal: number;
      readonly crystal: number;
      readonly deuterium: number;
    };
  };
}
