import {PlanetCoords, PlanetName} from '@src/models/planets';
import {ResourcesWithSum} from '@src/models/resources';

export interface Message {
  messageId: string;
  planetName: PlanetName;
  planetCoords: PlanetCoords;
  resources: ResourcesWithSum;
  noUnits: boolean;
  timeSeconds: number;
}
