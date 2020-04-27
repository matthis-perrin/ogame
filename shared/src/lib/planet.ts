import {isEnergyProducerBuildable} from '@shared/lib/build_items';
import {getMaxAllowedStandardUnitOnPlanet} from '@shared/lib/production';
import {updateReadonlyMap} from '@shared/lib/readonly_update';
import {fixFloatingPointAmount, toStandardUnits} from '@shared/lib/resources';
import {Account} from '@shared/models/account';
import {Building} from '@shared/models/building';
import {Coordinates} from '@shared/models/coordinates';
import {Defense} from '@shared/models/defense';
import {
  InProgressBuilding,
  InProgressDefenses,
  InProgressShips,
  Planet,
  PlanetId,
} from '@shared/models/planet';
import {
  addResources,
  makeResources,
  multiplyResources,
  Resources,
  StandardUnitAmount,
  ZERO_DEUTERIUM,
} from '@shared/models/resource';
import {Ship} from '@shared/models/ships';
import {Universe} from '@shared/models/universe';
import {rand} from '@shared/utils/rand';
import {divide, floor, multiply} from '@shared/utils/type_utils';

//
// Creation
//

let counter = 0;

export function createPlanet(
  coordinates: Coordinates,
  fields: number,
  planetTemperature: number
): Planet {
  counter++;
  return {
    id: `P${counter}` as PlanetId,
    resources: makeResources({m: 500, c: 500}),
    metadata: {
      coordinates,
      fields,
      temperature: planetTemperature,
    },
    buildingLevels: new Map<Building, number>(),
    defenses: new Map<Defense, number>(),
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

//
// Mutation
//

export function finishPlanetInProgressBuilding(
  planet: Planet,
  inProgressBuilding: InProgressBuilding
): Planet {
  return {
    ...planet,
    inProgressBuilding: undefined,
    buildingLevels: updateReadonlyMap(
      planet.buildingLevels,
      inProgressBuilding.building,
      inProgressBuilding.level
    ),
  };
}

export function updatePlanetBuilding(planet: Planet, building: Building, level: number): Planet {
  return {
    ...planet,
    buildingLevels: updateReadonlyMap(planet.buildingLevels, building, level),
  };
}
export function updatePlanetInProgressBuilding(
  planet: Planet,
  inProgressBuilding: InProgressBuilding | undefined
): Planet {
  return {...planet, inProgressBuilding};
}

export function updatePlanetResources(planet: Planet, newResources: Resources): Planet {
  // We round the resources after 8 digits to avoid floating point crap
  return {
    ...planet,
    resources: {
      metal: fixFloatingPointAmount(newResources.metal),
      crystal: fixFloatingPointAmount(newResources.crystal),
      deuterium: fixFloatingPointAmount(newResources.deuterium),
    },
  };
}

export function updatePlanetInProgressDefenses(
  planet: Planet,
  newInProgressDefenses: InProgressDefenses | undefined
): Planet {
  return {...planet, inProgressDefenses: newInProgressDefenses};
}

export function updatePlanetDefenses(
  planet: Planet,
  newInProgressDefenses: InProgressDefenses | undefined,
  newDefenses: ReadonlyMap<Defense, number>
): Planet {
  return {
    ...planet,
    inProgressDefenses: newInProgressDefenses,
    defenses: newDefenses,
  };
}

export function updatePlanetInProgressShips(
  planet: Planet,
  newInProgressShips: InProgressShips | undefined
): Planet {
  return {...planet, inProgressShips: newInProgressShips};
}

export function updatePlanetShips(
  planet: Planet,
  newInProgressShips: InProgressShips | undefined,
  newShips: ReadonlyMap<Ship, number>
): Planet {
  return {
    ...planet,
    inProgressShips: newInProgressShips,
    ships: newShips,
  };
}

//
// Other
//

// Note: Does not support defense in the debris field
export function getRecyclableStandardUnitOnPlanet(
  account: Account,
  planet: Planet,
  extraShips: {ship: Ship; quantity: number}[] = []
): StandardUnitAmount {
  let destructableShipResources = makeResources({});
  for (const [ship, quantity] of planet.ships.entries()) {
    destructableShipResources = addResources(
      destructableShipResources,
      multiplyResources(ship.cost, quantity)
    );
  }
  for (const {ship, quantity} of extraShips) {
    destructableShipResources = addResources(
      destructableShipResources,
      multiplyResources(ship.cost, quantity)
    );
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

export function getRecyclableStandardUnitFromShips(
  account: Account,
  ships: {ship: Ship; quantity: number}[] = []
): StandardUnitAmount {
  let destructableShipResources = makeResources({});
  for (const {ship, quantity} of ships) {
    destructableShipResources = addResources(
      destructableShipResources,
      multiplyResources(ship.cost, quantity)
    );
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

// // TODO - Include "cachette"
export function getMaxStealableStandardUnitOnPlanet(
  account: Account,
  planet: Planet
): StandardUnitAmount {
  return divide(getMaxAllowedStandardUnitOnPlanet(account, planet), 2);
}

export function planetHasEnergyProducerInProgress(planet: Planet): boolean {
  return (
    ((planet.inProgressBuilding !== undefined &&
      isEnergyProducerBuildable(planet.inProgressBuilding.building)) ||
      planet.inProgressShips?.ships.reduce<boolean>(
        (energyProducer, ship) => energyProducer || isEnergyProducerBuildable(ship.ship),
        false
      )) ??
    false
  );
}
