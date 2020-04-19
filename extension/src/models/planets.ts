export type PlanetId = string & {_: 'PlanetId'};
export type PlanetName = string & {_: 'PlanetName'};
export type PlanetCoords = string & {_: 'PlanetCoords'};

export interface Planet {
  id: PlanetId;
  name: PlanetName;
  coords: PlanetCoords;
}
