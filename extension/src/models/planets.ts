export type PlanetId = string & {_: 'PlanetId'};
export type PlanetName = string & {_: 'PlanetName'};
export type PlanetCoords = string & {_: 'PlanetCoords'};

export interface Planet {
  id: PlanetId;
  name: PlanetName;
  coords: PlanetCoords;
}

export interface Coords {
  galaxy: number;
  system: number;
  position: number;
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
