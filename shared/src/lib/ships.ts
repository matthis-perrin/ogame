import {Bomber, Recycler, Ship, SmallCargo} from '@shared/models/ships';
import {CombustionDrive, HyperspaceDrive, ImpulseDrive} from '@shared/models/technology';

export function getShipDrive(
  combustionDriveLevel: number,
  impulseDriveLevel: number,
  hyperspaceDriveLevel: number,
  ship: Ship
): {
  speed: number;
  fuelConsumption: number;
} {
  let driveTechnology = ship.initialDriveTechnology;
  let speed = ship.baseSpeed;
  let fuelConsumption = ship.fuelConsumption;

  /* eslint-disable @typescript-eslint/no-magic-numbers */
  if (hyperspaceDriveLevel >= 15 && ship === Recycler) {
    driveTechnology = HyperspaceDrive;
    speed = 6000;
    fuelConsumption = 900;
  }
  if (hyperspaceDriveLevel >= 8 && ship === Bomber) {
    driveTechnology = HyperspaceDrive;
    speed = 5000;
  }

  if (impulseDriveLevel >= 17 && ship === Recycler) {
    driveTechnology = ImpulseDrive;
    speed = 4000;
    fuelConsumption = 600;
  }
  if (impulseDriveLevel >= 5 && ship === SmallCargo) {
    driveTechnology = ImpulseDrive;
    speed = 10000;
    fuelConsumption = 20;
  }

  const combustionDriveSpeedBonus =
    driveTechnology === CombustionDrive ? 1 + combustionDriveLevel * 0.1 : 0;
  const impulseDriveSpeedBonus = driveTechnology === ImpulseDrive ? 1 + impulseDriveLevel * 0.2 : 0;
  const hyperspaceDriveSpeedBonus =
    driveTechnology === HyperspaceDrive ? 1 + hyperspaceDriveLevel * 0.3 : 0;
  /* eslint-enable @typescript-eslint/no-magic-numbers */

  return {
    speed: Math.floor(
      speed * combustionDriveSpeedBonus * impulseDriveSpeedBonus * hyperspaceDriveSpeedBonus
    ),
    fuelConsumption,
  };
}
