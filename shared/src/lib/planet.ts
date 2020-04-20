import {Building} from '@shared/models/building';
import {Coordinates} from '@shared/models/coordinates';
import {Defense} from '@shared/models/defense';
import {Planet} from '@shared/models/planet';
import {makeResources} from '@shared/models/resource';
import {Ship} from '@shared/models/ships';
import {Universe} from '@shared/models/universe';
import {rand} from '@shared/utils/rand';

export function createPlanet(
  coordinates: Coordinates,
  fields: number,
  planetTemperature: number
): Planet {
  return {
    resources: makeResources({}),
    metadata: {
      coordinates,
      fields,
      temperature: planetTemperature,
    },
    buildingLevels: new Map<Building, number>(),
    defense: new Map<Defense, number>(),
    ships: new Map<Ship, number>(),
  };
}

const mainPlanetFields = 163;
const mainPlanetTemperature = -19;
const mainPlanetMinPosition = 4;
const mainPlanetMaxPosition = 12;

export function createRandomMainPlanet(universe: Universe): Planet {
  return createPlanet(
    {
      galaxy: rand(1, universe.numberOfGalaxy),
      solarSystem: rand(1, universe.numberOfSystem),
      position: rand(mainPlanetMinPosition, mainPlanetMaxPosition),
    },
    mainPlanetFields,
    mainPlanetTemperature
  );
}
