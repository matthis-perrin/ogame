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

export interface Coords {
  galaxy: number;
  system: number;
  position: number;
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
export function getCoords(planetCoords: PlanetCoords): Coords {
  const match = coordsRegex.exec(planetCoords);
  // eslint-disable-next-line no-null/no-null
  if (match !== null) {
    return {
      galaxy: parseFloat(match[1]),
      system: parseFloat(match[2]),
      // eslint-disable-next-line @typescript-eslint/no-magic-numbers
      position: parseFloat(match[3]),
    };
  }
  return {galaxy: 1, system: 1, position: 1};
}
