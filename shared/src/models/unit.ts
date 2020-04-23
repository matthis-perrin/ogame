import {BuildableBase} from '@shared/models/buildable';

export interface Unit extends BuildableBase {
  structuralintegrity: number;
  shieldPower: number;
  weaponPower: number;
  rapidFire: Map<Unit, number>;
}
