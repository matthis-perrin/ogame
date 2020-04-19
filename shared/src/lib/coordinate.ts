import {Coordinates} from '@shared/models/coordinates';

export function coordinateToString(coordinate: Coordinates): string {
  const {galaxy, solarSystem, position} = coordinate;
  return `${galaxy}:${solarSystem}:${position}`;
}
