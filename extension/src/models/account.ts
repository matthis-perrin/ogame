import {Fleet} from '@src/models/fleets';
import {Planet, PlanetId, PlanetName} from '@src/models/planets';
import {ResourceAmount} from '@src/models/resources';
import {Construction, Technology} from '@src/models/technologies';

export interface Account {
  planetList: Planet[];
  planetDetails: {[planetId: string]: AccountPlanet};
  maxTechnologies: {[techId: number]: number};
  accountTechnologies: {[techId: number]: Technology};
  fleets: {[fleetId: string]: Fleet};
  planetSum: AccountPlanet | undefined;
  constructions: {[constructionId: string]: Construction};
}

export interface AccountPlanet {
  planetId: PlanetId;
  truth: {
    serverTimeSeconds: number;
    metal: ResourceAmount;
    crystal: ResourceAmount;
    deuterium: ResourceAmount;
  };
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
  technologies: {[techId: number]: Technology};
  ships: {[techId: number]: Technology};
}

export function findPlanetName(planetList: Planet[], planetId: PlanetId): PlanetName {
  return planetList.find(_ => _.id === planetId)?.name ?? ('' as PlanetName);
}

export function findPlanetId(planetList: Planet[], planetName: PlanetName): PlanetId | undefined {
  return planetList.find(_ => _.name === planetName)?.id;
}
