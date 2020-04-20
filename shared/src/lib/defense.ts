import {toStandardUnits} from '@shared/lib/resources';
import {Account} from '@shared/models/account';
import {
  Defense,
  GaussCannon,
  HeavyLaser,
  PlasmaTurret,
  RocketLauncher,
} from '@shared/models/defense';
import {Resources, StandardUnitAmount} from '@shared/models/resource';

/* eslint-disable @typescript-eslint/no-magic-numbers */
const baseDefenseLineForOneMillion = new Map<Defense, number>([
  [RocketLauncher, 2000],
  [HeavyLaser, 600],
  [GaussCannon, 143],
  [PlasmaTurret, 50],
]);

const DEFENSE_LINES: {
  minResources: StandardUnitAmount;
  defenses: Defense[];
}[] = [
  {
    minResources: 400000 as StandardUnitAmount,
    defenses: [RocketLauncher, HeavyLaser, GaussCannon, PlasmaTurret],
  },
  {minResources: 150000 as StandardUnitAmount, defenses: [RocketLauncher, HeavyLaser, GaussCannon]},
  {minResources: 20000 as StandardUnitAmount, defenses: [RocketLauncher, HeavyLaser]},
  {minResources: 5000 as StandardUnitAmount, defenses: [RocketLauncher]},
  {minResources: 0 as StandardUnitAmount, defenses: []},
];
/* eslint-enable @typescript-eslint/no-magic-numbers */

export function getRequiredDefenseToStealableResources(
  account: Account,
  resources: Resources
): {defense: Defense; quantity: number}[] {
  const standardUnitToProtect = toStandardUnits(account, resources);
  for (const defenseLine of DEFENSE_LINES) {
    if (defenseLine.minResources > standardUnitToProtect) {
      continue;
    }
    const millionsToProtect = standardUnitToProtect / (1000 * 1000);
    return defenseLine.defenses.map(defense => ({
      defense,
      quantity: Math.round(millionsToProtect * (baseDefenseLineForOneMillion.get(defense) ?? 0)),
    }));
  }
  throw new Error(
    `Could not find a defense line to protect ${standardUnitToProtect} standard units`
  );
}
