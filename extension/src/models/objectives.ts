import {PlanetId} from '@src/models/planets';
import {ResourcesWithSum, ResourcesWithSumAndFuel} from '@src/models/resources';
import {Technology} from '@src/models/technologies';

export interface ResourceTransfer {
  from: PlanetId;
  to: PlanetId;
  sendInSeconds: number;
  resources: ResourcesWithSum;
  timeFromOriginSeconds: number;
  isTransferring: boolean;
}

export interface Objectives {
  planetId: PlanetId;
  technologies: Technology[];
  neededResources: ResourcesWithSumAndFuel;
  readyTimeSeconds: {
    metal: number;
    crystal: number;
    deuterium: number;
    max: number;
  };
  resourceTransfers: ResourceTransfer[];
  startTime: number | undefined;
  botEnabled: boolean;
  bannedPlanets: PlanetId[];
}
