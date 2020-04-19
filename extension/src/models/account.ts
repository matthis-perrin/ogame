import {Fleet} from '@src/models/fleets';
import {Planet, PlanetId} from '@src/models/planets';
import {ResourceAmount} from '@src/models/resources';
import {Technology} from '@src/models/technologies';

export interface Account {
  planetList: Planet[];
  planetDetails: {[planetId: string]: AccountPlanet};
  maxTechnologies: {[techId: string]: number};
  accountTechnologies: {[techId: string]: Technology};
  fleets: {[fleetId: string]: Fleet};
}

export interface AccountPlanet {
  id: PlanetId;
  resources: {
    metal: ResourceAmount;
    crystal: ResourceAmount;
    deuterium: ResourceAmount;
    energy: ResourceAmount;
  };
  storages: {
    metal: ResourceAmount;
    crystal: ResourceAmount;
    deuterium: ResourceAmount;
  };
  productions: {
    metal: ResourceAmount;
    crystal: ResourceAmount;
    deuterium: ResourceAmount;
  };
  technologies: {[techId: string]: Technology};
}
