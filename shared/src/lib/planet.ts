import {getPlanetTemperature} from '@shared/lib/temperature';
import {Building} from '@shared/models/building';
import {Defense} from '@shared/models/defense';
import {Planet} from '@shared/models/planet';
import {Ship} from '@shared/models/ships';
import {Universe} from '@shared/models/universe';
import {rand} from '@shared/utils/rand';

const mainPlanetFields = 163;
const mainPlanetMinIndex = 4;
const mainPlanetMaxIndex = 12;

export function createMainPlanet(universe: Universe): Planet {
  const position = rand(mainPlanetMinIndex, mainPlanetMaxIndex);
  return {
    metadata: {
      coordinates: {
        galaxy: rand(1, universe.numberOfGalaxy),
        solarSystem: rand(1, universe.numberOfSystem),
        position,
      },
      fields: mainPlanetFields,
      temperature: getPlanetTemperature(position),
    },
    buildingLevels: new Map<Building, number>(),
    defense: new Map<Defense, number>(),
    inProgressDefenses: [],
    ships: new Map<Ship, number>(),
    inProgressShips: [],
  };
}
