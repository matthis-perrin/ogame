import {SpeedModifier} from '@shared/models/coordinates';

import {PlanetId} from '@src/models/planets';

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
// REC
DefaultGhosts.set('3-1', '5-1');
DefaultGhosts.set('5-1', '3-2');
DefaultGhosts.set('3-2', '5-2');
DefaultGhosts.set('5-2', '3-1');
// BOM
DefaultGhosts.set('4-1', '5-4');
DefaultGhosts.set('5-4', '4-2');
DefaultGhosts.set('4-2', '5-3');
DefaultGhosts.set('5-3', '4-1');
DefaultGhosts.set('4-3', '5-1');
