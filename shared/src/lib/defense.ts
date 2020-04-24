import {
  Defense,
  GaussCannon,
  HeavyLaser,
  PlasmaTurret,
  RocketLauncher,
} from '@shared/models/defense';
import {Planet} from '@shared/models/planet';
import {StandardUnitAmount} from '@shared/models/resource';

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

export function getRequiredDefenseForStealableResources(
  standardUnit: StandardUnitAmount
): {defense: Defense; quantity: number}[] {
  for (const defenseLine of DEFENSE_LINES) {
    if (defenseLine.minResources > standardUnit) {
      continue;
    }
    const millionsToProtect = standardUnit / (1000 * 1000);
    return defenseLine.defenses.map(defense => ({
      defense,
      quantity: Math.round(millionsToProtect * (baseDefenseLineForOneMillion.get(defense) ?? 0)),
    }));
  }
  throw new Error(`Could not find a defense line to protect ${standardUnit} standard units`);
}

export function getStealableResourcesProtectedByDefense(
  defenses: {defense: Defense; quantity: number}[]
): StandardUnitAmount {
  const defenseLineCoef = defenses.map(({defense, quantity}) => {
    const quantityForOneMillion = baseDefenseLineForOneMillion.get(defense) ?? 0;
    return quantityForOneMillion > 0 ? quantity / quantityForOneMillion : 0;
  });
  return (Math.max(0, ...defenseLineCoef) * 1000 * 1000) as StandardUnitAmount;
}

export function getExtraDefensesToBuildOnPlanet(
  planet: Planet,
  targetDefenses: {defense: Defense; quantity: number}[]
): {defense: Defense; quantity: number}[] {
  const defensesToBuild: {defense: Defense; quantity: number}[] = [];
  for (const {defense, quantity} of targetDefenses) {
    const currentQuantity = planet.defenses.get(defense) ?? 0;
    let inProgressQuantity = 0;
    planet.inProgressDefenses?.defenses.forEach(d => {
      if (d.defense === defense) {
        inProgressQuantity += d.quantity;
      }
    });
    if (currentQuantity + inProgressQuantity < quantity) {
      defensesToBuild.push({defense, quantity: quantity - currentQuantity - inProgressQuantity});
    }
  }
  return defensesToBuild;
}
