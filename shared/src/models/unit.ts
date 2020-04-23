import {BuildableBase} from '@shared/models/buildable';
import {Resources} from '@shared/models/resource';

export interface Unit extends BuildableBase {
  readonly cost: Resources;
  readonly structuralintegrity: number;
  readonly shieldPower: number;
  readonly weaponPower: number;
  // Not readonly because we need to update it post creation to avoid circular dependencies
  readonly rapidFire: Map<Unit, number>;
}
