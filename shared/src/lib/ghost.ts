import {
  buildItemsCost,
  buildItemsToMeetRequirementOnPlanet,
  buildItemsToUnlockBuildableOnPlanet,
} from '@shared/lib/build_items';
import {getShipCargoCapacity} from '@shared/lib/formula';
import {Account} from '@shared/models/account';
import {BuildItem} from '@shared/models/build_item';
import {Planet} from '@shared/models/planet';
import {
  incrementResources,
  makeResources,
  multiplyResources,
  Resources,
} from '@shared/models/resource';
import {LargeCargo, SmallCargo} from '@shared/models/ships';
import {HyperspaceTechnology} from '@shared/models/technology';

export function getCheapestBuildItemsRequiredToGhost(
  account: Account,
  planet: Planet,
  resources: Resources
): BuildItem[] {
  const {metal, crystal, deuterium} = resources;
  const resourcesToGhost = (metal as number) + (crystal as number) + (deuterium as number);
  const hyperspaceTechnologyLevel = account.technologyLevels.get(HyperspaceTechnology) ?? 0;

  const smallCargoCapacity = getShipCargoCapacity(SmallCargo, hyperspaceTechnologyLevel);
  const smallCargoAvailable = planet.ships.get(SmallCargo) ?? 0;
  const largeCargoCapacity = getShipCargoCapacity(LargeCargo, hyperspaceTechnologyLevel);
  const largeCargoAvailable = planet.ships.get(LargeCargo) ?? 0;

  const availableCargoCapacity =
    smallCargoCapacity * smallCargoAvailable + largeCargoCapacity * largeCargoAvailable;
  const requiredExtraCargoCapacity = resourcesToGhost - availableCargoCapacity;

  if (requiredExtraCargoCapacity < 0) {
    return [];
  }

  // Build items and cost required to unlock things
  const buildItemsToUnlockSmallCargo = buildItemsToUnlockBuildableOnPlanet(
    account,
    planet,
    SmallCargo
  );
  const buildItemsToUnlockLargeCargo = buildItemsToUnlockBuildableOnPlanet(
    account,
    planet,
    LargeCargo
  );
  const buildItemsToUpgradeHyperspaceTechnology = buildItemsToMeetRequirementOnPlanet(
    account,
    planet,
    {entity: HyperspaceTechnology, level: hyperspaceTechnologyLevel + 1}
  );
  const costToUnlockSmallCargo = buildItemsCost(buildItemsToUnlockSmallCargo);
  const costToUnlockLargeCargo = buildItemsCost(buildItemsToUnlockLargeCargo);
  const costToUpgradeHyperspaceTechnology = buildItemsCost(buildItemsToUpgradeHyperspaceTechnology);

  // Small cargo only strategy
  const smallCargoCost = makeResources({});
  incrementResources(smallCargoCost, costToUnlockSmallCargo);
  const smallCargoQuantity = Math.ceil(requiredExtraCargoCapacity / smallCargoCapacity);
  incrementResources(smallCargoCost, multiplyResources(SmallCargo.cost, smallCargoQuantity));

  // Large cargo only strategy
  const largeCargoCost = makeResources({});
  incrementResources(largeCargoCost, costToUnlockLargeCargo);
  const largeCargoQuantity = Math.ceil(requiredExtraCargoCapacity / largeCargoCapacity);
  incrementResources(largeCargoCost, multiplyResources(LargeCargo.cost, largeCargoQuantity));

  // Small cargo with HyperspaceTechnology upgrade strategy
  const smallCargoWithHyperspaceUpgradeCost = makeResources({});
  incrementResources(smallCargoWithHyperspaceUpgradeCost, costToUnlockSmallCargo);
  incrementResources(smallCargoWithHyperspaceUpgradeCost, costToUpgradeHyperspaceTechnology);
  const smallCargoWithHyperspaceUpgradeCapacity = getShipCargoCapacity(
    SmallCargo,
    hyperspaceTechnologyLevel + 1
  );
  const smallCargoWithHyperspaceUpgradeQuantity = Math.ceil(
    requiredExtraCargoCapacity / smallCargoWithHyperspaceUpgradeCapacity
  );
  incrementResources(
    smallCargoWithHyperspaceUpgradeCost,
    multiplyResources(SmallCargo.cost, smallCargoWithHyperspaceUpgradeQuantity)
  );

  // Large cargo with HyperspaceTechnology upgrade strategy
  const largeCargoWithHyperspaceUpgradeCost = makeResources({});
  incrementResources(largeCargoWithHyperspaceUpgradeCost, costToUnlockLargeCargo);
  incrementResources(largeCargoWithHyperspaceUpgradeCost, costToUpgradeHyperspaceTechnology);
  const largeCargoWithHyperspaceUpgradeCapacity = getShipCargoCapacity(
    LargeCargo,
    hyperspaceTechnologyLevel + 1
  );
  const largeCargoWithHyperspaceUpgradeQuantity = Math.ceil(
    requiredExtraCargoCapacity / largeCargoWithHyperspaceUpgradeCapacity
  );
  incrementResources(
    largeCargoWithHyperspaceUpgradeCost,
    multiplyResources(LargeCargo.cost, largeCargoWithHyperspaceUpgradeQuantity)
  );

  // Return the best one
  if (
    smallCargoCost < largeCargoCost &&
    smallCargoCost < smallCargoWithHyperspaceUpgradeCost &&
    smallCargoCost < largeCargoWithHyperspaceUpgradeCost
  ) {
    return [
      ...buildItemsToUnlockSmallCargo,
      {type: 'ship', ship: SmallCargo, quantity: smallCargoQuantity, planet},
    ];
  }

  if (
    largeCargoCost < smallCargoWithHyperspaceUpgradeCost &&
    largeCargoCost < largeCargoWithHyperspaceUpgradeCost
  ) {
    return [
      ...buildItemsToUnlockLargeCargo,
      {type: 'ship', ship: LargeCargo, quantity: largeCargoQuantity, planet},
    ];
  }

  if (smallCargoWithHyperspaceUpgradeCost < largeCargoWithHyperspaceUpgradeCost) {
    return [
      ...buildItemsToUnlockSmallCargo,
      ...buildItemsToUpgradeHyperspaceTechnology,
      {type: 'ship', ship: SmallCargo, quantity: smallCargoWithHyperspaceUpgradeQuantity, planet},
    ];
  }

  return [
    ...buildItemsToUnlockLargeCargo,
    ...buildItemsToUpgradeHyperspaceTechnology,
    {type: 'ship', ship: LargeCargo, quantity: largeCargoWithHyperspaceUpgradeQuantity, planet},
  ];
}
