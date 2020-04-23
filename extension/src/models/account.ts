import {Fleet} from '@src/models/fleets';
import {Message} from '@src/models/messages';
import {Objectives} from '@src/models/objectives';
import {Planet, PlanetId, PlanetName} from '@src/models/planets';
import {BaseResources, ResourcesWithEnergyAndSum, ResourcesWithSum} from '@src/models/resources';
import {Construction, Technology} from '@src/models/technologies';

export interface Account {
  currentPlanetId: PlanetId;
  planetList: Planet[];
  planetDetails: {[planetId: string]: AccountPlanet};
  maxTechnologies: {[techId: number]: number};
  accountTechnologies: {[techId: number]: Technology};
  fleets: {[fleetId: string]: Fleet};
  planetSum: AccountPlanet | undefined;
  constructions: {[constructionId: string]: Construction};
  inFlightResources: {[planetCoords: string]: ResourcesWithSum};
  inFlightSum: ResourcesWithSum;
  messages: {[messageId: string]: Message};
  objectives: Objectives | undefined;
}

export interface ResourcesWithServerTime extends BaseResources {
  serverTimeSeconds: number;
}

export interface AccountPlanet {
  planetId: PlanetId;
  truth: ResourcesWithServerTime;
  resources: ResourcesWithEnergyAndSum;
  storages: ResourcesWithSum;
  productions: ResourcesWithSum;
  technologies: {[techId: number]: Technology};
  ships: {[techId: number]: Technology};
}

export function findPlanetName(planetList: Planet[], planetId: PlanetId): PlanetName {
  return planetList.find(_ => _.id === planetId)?.name ?? ('' as PlanetName);
}

export function findPlanetId(planetList: Planet[], planetName: PlanetName): PlanetId | undefined {
  return planetList.find(_ => _.name === planetName)?.id;
}
