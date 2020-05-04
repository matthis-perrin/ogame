import {BotProbes} from '@src/bots/espionage';
import {BotTransfer} from '@src/bots/objectives';
import {Fleet} from '@src/models/fleets';
import {Ghost} from '@src/models/ghost';
import {Message, MessageSort} from '@src/models/messages';
import {Objectives} from '@src/models/objectives';
import {Planet, PlanetId} from '@src/models/planets';
import {
  BaseResources,
  ResourcesWithEnergyAndSum,
  ResourcesWithSum,
  ResourcesWithSumAndLargeCargos,
} from '@src/models/resources';
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
  inFlightResources: {[planetCoords: string]: ResourcesWithSumAndLargeCargos};
  inFlightSum: ResourcesWithSum;
  messages: {[messageId: string]: Message};
  objectives: Objectives | undefined;
  bots: {
    objectives: BotTransfer | undefined;
    espionage: BotProbes | undefined;
  };
  ghosts: {[planetId: string]: Ghost};
  emptyPlanets: {[planetCoords: string]: boolean};
  messageSort: MessageSort;
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
