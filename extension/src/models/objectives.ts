import {PlanetId} from '@src/models/planets';
import {ResourcesWithSum} from '@src/models/resources';
import {Technology} from '@src/models/technologies';

export interface ResourceTransfer {
  from: PlanetId;
  to: PlanetId;
  resources: ResourcesWithSum;
}

export interface Objectives {
  planetId: PlanetId;
  technologies: Technology[];
  neededResources: ResourcesWithSum;
  resourceTransfers: ResourceTransfer[];
  enoughResources: boolean;
}
