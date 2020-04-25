import {ResearchLab} from '@shared/models/building';
import {Coordinates} from '@shared/models/coordinates';

import {Account} from '@src/models/account';

export type PlanetId = string & {_: 'PlanetId'};
export type PlanetName = string & {_: 'PlanetName'};
export type PlanetCoords = string & {_: 'PlanetCoords'};

export interface Planet {
  id: PlanetId;
  name: PlanetName;
  coords: PlanetCoords;
  tempLow: number;
  tempHigh: number;
}

export function findPlanetName(planetList: Planet[], planetId: PlanetId): PlanetName {
  return planetList.find(_ => _.id === planetId)?.name ?? ('' as PlanetName);
}

export function findPlanetId(planetList: Planet[], planetName: PlanetName): PlanetId | undefined {
  return planetList.find(_ => _.name === planetName)?.id;
}

export function findPlanetCoords(planetList: Planet[], planetId: PlanetId): PlanetCoords {
  return planetList.find(_ => _.id === planetId)?.coords ?? ('[1:1:1]' as PlanetCoords);
}

const coordsRegex = /^\[(\d+):(\d+):(\d+)\]$/;
export function getCoords(planetCoords: PlanetCoords): Coordinates {
  const match = coordsRegex.exec(planetCoords);
  // eslint-disable-next-line no-null/no-null
  if (match !== null) {
    return {
      galaxy: parseFloat(match[1]),
      solarSystem: parseFloat(match[2]),
      // eslint-disable-next-line @typescript-eslint/no-magic-numbers
      position: parseFloat(match[3]),
    };
  }
  return {galaxy: 1, solarSystem: 1, position: 1};
}

export function findResearchPlanet(account: Account): PlanetId | undefined {
  let researchPlanetId: PlanetId | undefined;
  let maxLevel = 0;
  for (const planetId in account.planetDetails) {
    if (account.planetDetails.hasOwnProperty(planetId)) {
      const planetDetail = account.planetDetails[planetId];
      if (planetDetail.technologies.hasOwnProperty(ResearchLab.id)) {
        const tech = planetDetail.technologies[ResearchLab.id];
        if (tech.value > 0 && (researchPlanetId === undefined || tech.value > maxLevel)) {
          researchPlanetId = planetId as PlanetId;
          maxLevel = tech.value;
        }
      }
    }
  }
  return researchPlanetId;
}
