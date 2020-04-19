import {Planet} from '@shared/models/planet';
import {Technology} from '@shared/models/technology';
import {Universe} from '@shared/models/universe';

export interface Account {
  universe: Universe;
  planets: Planet[];
  technologyLevels: Map<Technology, number>;
  inProgressTechnologies: {technology: Technology; quantity: number}[];
}
