import {PlanetId} from '@src/models/planets';
import {BaseResources} from '@src/models/resources';
import {Technology} from '@src/models/technologies';

export interface Objectives {
  planetId: PlanetId;
  technologies: Technology[];
  neededResources: BaseResources;
}
