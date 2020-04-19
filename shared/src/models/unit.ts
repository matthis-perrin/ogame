import {BuildableBase} from '@shared/models/buildable';
import {Resources} from '@shared/models/resource';

export interface Unit extends BuildableBase {
  cost: Resources;
  structuralintegrity: number;
  shieldPower: number;
  weaponPower: number;
  rapidFire: Map<Unit, number>;
}
