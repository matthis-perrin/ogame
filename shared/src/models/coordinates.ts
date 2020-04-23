import {Brand} from '@shared/utils/type_utils';

export interface Coordinates {
  galaxy: number;
  solarSystem: number;
  position: number;
}

export type Distance = Brand<number, 'Distance'>;

/* eslint-disable @typescript-eslint/no-magic-numbers */
export const DISTANCE_BETWEEN_GALAXY = 20000 as Distance;
export const DISTANCE_BETWEEN_SYSTEM = 95 as Distance;
export const DISTANCE_BETWEEN_PLANET = 5 as Distance;
/* eslint-enable @typescript-eslint/no-magic-numbers */

export const FULL_SPEED = 1;
export type SpeedModifier = 0.1 | 0.2 | 0.3 | 0.4 | 0.5 | 0.6 | 0.7 | 0.8 | 0.9 | 1;
