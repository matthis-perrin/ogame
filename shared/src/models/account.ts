/* eslint-disable @typescript-eslint/no-magic-numbers */
import {Planet} from '@shared/models/planet';
import {Technology} from '@shared/models/technology';
import {Universe} from '@shared/models/universe';

export interface Account {
  universe: Universe;
  planets: Planet[];
  technologyLevels: Map<Technology, number>;
  inProgressTechnology?: {technology: Technology; level: number};
  preferences: {
    resourcesRatio: {
      metal: number;
      crystal: number;
      deuterium: number;
    };
  };
}
