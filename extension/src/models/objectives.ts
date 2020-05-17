import {SpeedModifier} from '@shared/models/coordinates';

import {PlanetId} from '@src/models/planets';
import {ResourcesWithSumAndFuel} from '@src/models/resources';
import {Technology} from '@src/models/technologies';

export interface ResourceTransfer {
  from: PlanetId;
  to: PlanetId;
  sendInSeconds: number;
  resources: ResourcesWithSumAndFuel;
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
  longestTimeSeconds: number;
  speedModifier: SpeedModifier;
}
