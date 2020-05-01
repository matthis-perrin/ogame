import {PlanetId} from '@src/models/planets';

export enum SpeedModifier {
  TenPercent = 0.1,
  TwentyPercent = 0.2,
}

export interface GhostSpeed {
  name: string;
  techId: number;
  timeSeconds: number;
  speedModifier: SpeedModifier;
}

export interface Ghost {
  destination: PlanetId;
  distance: number;
  speeds: GhostSpeed[];
}

export const DefaultGhosts: Map<string, string> = new Map();
// RECYCLER
DefaultGhosts.set('3-1', '5-1');
DefaultGhosts.set('5-1', '3-2');
DefaultGhosts.set('3-2', '5-4');
DefaultGhosts.set('5-4', '3-1');
// BOMBER
DefaultGhosts.set('4-1', '5-2');
DefaultGhosts.set('5-2', '4-2');
DefaultGhosts.set('4-2', '5-3');
DefaultGhosts.set('5-3', '4-1');
