import {getMaxAllowedStandardUnitOnPlanet} from '@shared/lib/production';
import {toStandardUnits} from '@shared/lib/resources';
import {Account} from '@shared/models/account';
import {Building} from '@shared/models/building';
import {Coordinates} from '@shared/models/coordinates';
import {Defense} from '@shared/models/defense';
import {Planet} from '@shared/models/planet';
import {
  incrementResources,
  makeResources,
  multiplyResources,
  StandardUnitAmount,
  ZERO_DEUTERIUM,
} from '@shared/models/resource';
import {Ship} from '@shared/models/ships';
import {Universe} from '@shared/models/universe';
import {rand} from '@shared/utils/rand';
import {divide, floor, multiply} from '@shared/utils/type_utils';

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

// Note: Does not support defense in the debris field
export function getRecyclableStandardUnitOnPlanet(
  account: Account,
  planet: Planet,
  extraShips: {ship: Ship; quantity: number}[] = []
): StandardUnitAmount {
  const destructableShipResources = makeResources({});
  for (const [ship, quantity] of planet.ships.entries()) {
    incrementResources(destructableShipResources, multiplyResources(ship.cost, quantity));
  }
  for (const {ship, quantity} of extraShips) {
    incrementResources(destructableShipResources, multiplyResources(ship.cost, quantity));
  }
  return toStandardUnits(account, {
    metal: floor(
      multiply(destructableShipResources.metal, account.universe.shipInDebrisFieldRatio)
    ),
    crystal: floor(
      multiply(destructableShipResources.crystal, account.universe.shipInDebrisFieldRatio)
    ),
    deuterium: ZERO_DEUTERIUM,
  });
}

// TODO - Include "cachette"
export function getMaxStealableStandardUnitOnPlanet(
  account: Account,
  planet: Planet
): StandardUnitAmount {
  return divide(getMaxAllowedStandardUnitOnPlanet(account, planet), 2);
}
