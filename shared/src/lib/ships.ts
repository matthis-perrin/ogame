import {getDistance, getFlightDuration, getFuelConsumption} from '@shared/lib/formula';
import {Class} from '@shared/models/account';
import {Coordinates, SpeedModifier} from '@shared/models/coordinates';
import {DeuteriumAmount, ZERO_DEUTERIUM} from '@shared/models/resource';
import {
  Bomber,
  CargoShip,
  EspionageProbe,
  Recycler,
  Ship,
  ShipFuelConsumption,
  ShipSpeed,
  SmallCargo,
  WarShips,
} from '@shared/models/ships';
import {CombustionDrive, HyperspaceDrive, ImpulseDrive} from '@shared/models/technology';
import {Milliseconds} from '@shared/models/time';
import {Universe} from '@shared/models/universe';
import {floor, min, multiply, sum} from '@shared/utils/type_utils';

export function getShipDrive(
  ship: Ship,
  universe: Universe,
  combustionDriveLevel: number,
  impulseDriveLevel: number,
  hyperspaceDriveLevel: number,
  accountClass: Class
): {
  speed: ShipSpeed;
  fuelConsumption: ShipFuelConsumption;
} {
  let driveTechnology = ship.initialDriveTechnology;
  let speed = ship.baseSpeed;
  let fuelConsumption = ship.fuelConsumption;

  /* eslint-disable @typescript-eslint/no-magic-numbers */
  if (hyperspaceDriveLevel >= 15 && ship === Recycler) {
    driveTechnology = HyperspaceDrive;
    speed = 6000 as ShipSpeed;
    fuelConsumption = 900 as ShipFuelConsumption;
  }
  if (hyperspaceDriveLevel >= 8 && ship === Bomber) {
    driveTechnology = HyperspaceDrive;
    speed = 5000 as ShipSpeed;
  }

  if (impulseDriveLevel >= 17 && ship === Recycler) {
    driveTechnology = ImpulseDrive;
    speed = 4000 as ShipSpeed;
    fuelConsumption = 600 as ShipFuelConsumption;
  }
  if (impulseDriveLevel >= 5 && ship === SmallCargo) {
    driveTechnology = ImpulseDrive;
    speed = 10000 as ShipSpeed;
    fuelConsumption = 20 as ShipFuelConsumption;
  }

  let speedClassBonus = 0;
  if (accountClass === Class.Collector) {
    if (CargoShip.includes(ship)) {
      speedClassBonus = 1;
    }
  } else if (accountClass === Class.General) {
    if (WarShips.includes(ship) || ship === Recycler) {
      speedClassBonus = 1;
    }
    fuelConsumption = multiply(fuelConsumption, 0.75);
  }

  const combustionDriveSpeedBonus =
    driveTechnology === CombustionDrive ? 1 + combustionDriveLevel * 0.1 : 1;
  const impulseDriveSpeedBonus = driveTechnology === ImpulseDrive ? 1 + impulseDriveLevel * 0.2 : 1;
  const hyperspaceDriveSpeedBonus =
    driveTechnology === HyperspaceDrive ? 1 + hyperspaceDriveLevel * 0.3 : 1;
  const technoSpeedBonus =
    combustionDriveSpeedBonus * impulseDriveSpeedBonus * hyperspaceDriveSpeedBonus - 1;
  /* eslint-enable @typescript-eslint/no-magic-numbers */

  return {
    speed: floor(sum(speed, multiply(speed, technoSpeedBonus), multiply(speed, speedClassBonus))),
    fuelConsumption: multiply(fuelConsumption, universe.deuteriumConsumptionFactor),
  };
}

export interface FlightInformation {
  flightDuration: Milliseconds;
  fuelConsumption: DeuteriumAmount;
}

export function getFlightInformation(
  from: Coordinates,
  to: Coordinates,
  ships: {ship: Ship; quantity: number}[],
  speedModifier: SpeedModifier,
  accountClass: Class,
  universe: Universe,
  combustionDriveLevel: number,
  impulseDriveLevel: number,
  hyperspaceDriveLevel: number
): FlightInformation {
  const shipsWithDrive = ships.map(s => ({
    ...s,
    drive: getShipDrive(
      s.ship,
      universe,
      combustionDriveLevel,
      impulseDriveLevel,
      hyperspaceDriveLevel,
      accountClass
    ),
  }));
  const distance = getDistance(from, to, universe);
  const fleetSpeed = min(...shipsWithDrive.map(s => s.drive.speed));
  const flightDuration = getFlightDuration(distance, fleetSpeed, speedModifier, universe);
  const fuelConsumption = shipsWithDrive.reduce(
    (fuel, {ship, quantity, drive}) =>
      sum(
        fuel,
        ship === EspionageProbe
          ? (1 as DeuteriumAmount)
          : getFuelConsumption(drive.fuelConsumption, distance, drive.speed, fleetSpeed, quantity)
      ),
    ZERO_DEUTERIUM
  );
  return {flightDuration, fuelConsumption};
}
