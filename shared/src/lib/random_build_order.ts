import {updateAccountPlanet, updateAccountTechnology} from '@shared/lib/account';
import {buildableRequirementToString, buildItemCost} from '@shared/lib/build_items';
import {
  getAvailableBuildingsForPlanet,
  getAvailableTechnologiesForAccount,
} from '@shared/lib/build_order';
import {updatePlanetBuilding} from '@shared/lib/planet';
import {
  buildableRequirementAreEqual,
  computeRequirementTree,
  getRequirementTreeLeaves,
  removeRequirementFromTree,
} from '@shared/lib/requirement_tree';
import {toStandardUnits} from '@shared/lib/resources';
import {Account} from '@shared/models/account';
import {BuildItem} from '@shared/models/build_item';
import {BuildableRequirement} from '@shared/models/buildable';
import {CrystalMine, DeuteriumSynthesizer, MetalMine} from '@shared/models/building';
import {Planet, PlanetId} from '@shared/models/planet';

export function generateBuildOrder(
  target: BuildItem,
  account: Account,
  nextBuildableRequirement: (
    account: Account,
    planetId: PlanetId,
    nextEssentialBuilds: BuildableRequirement[]
  ) => BuildableRequirement
): BuildItem[] {
  function getMainPlanet(): Planet {
    return Array.from(account.planets.values())[0];
  }

  const buildOrder: BuildItem[] = [];
  const buildTree = computeRequirementTree(target.buildable);

  while (buildTree.children.length > 0) {
    let leaves = getRequirementTreeLeaves(buildTree);
    while (leaves.length > 0) {
      const next = nextBuildableRequirement(account, getMainPlanet().id, leaves);
      if (next.entity.type === 'building') {
        account = updateAccountPlanet(
          account,
          updatePlanetBuilding(getMainPlanet(), next.entity, next.level)
        );
      } else {
        account = updateAccountTechnology(account, next.entity, next.level);
      }
      const nextAsBuildItem = buildRequirementToBuildItem(next, getMainPlanet().id);
      const newLeaves = leaves.filter(leaf => !buildableRequirementAreEqual(leaf, next));
      if (newLeaves.length !== leaves.length) {
        removeRequirementFromTree(buildTree, next);
        leaves = getRequirementTreeLeaves(buildTree).map(leaf => ({
          ...leaf,
          planetId: getMainPlanet().id,
        }));
      }
      buildOrder.push(nextAsBuildItem);
    }
  }
  buildOrder.push(target);
  return buildOrder;
}

function buildRequirementToBuildItem(
  requirement: BuildableRequirement,
  planetId: PlanetId
): BuildItem {
  if (requirement.entity.type === 'building') {
    return {
      type: 'building',
      buildable: requirement.entity,
      level: requirement.level,
      planetId,
    };
  }
  return {
    type: 'technology',
    buildable: requirement.entity,
    level: requirement.level,
    planetId,
  };
}

function uniqBy<T>(arr: T[], hash: (val: T) => string): T[] {
  const hashSet = new Set<string>();
  const uniqArr: T[] = [];
  for (const val of arr) {
    const hashValue = hash(val);
    if (!hashSet.has(hashValue)) {
      hashSet.add(hashValue);
      uniqArr.push(val);
    }
  }
  return uniqArr;
}

export function randomWeightedNextBuildableRequirement(
  account: Account,
  planetId: PlanetId,
  nextEssentialBuilds: BuildableRequirement[]
): BuildableRequirement {
  const availableBuildings: BuildableRequirement[] = getAvailableBuildingsForPlanet(
    account,
    planetId
  );
  const availableTechonologies: BuildableRequirement[] = getAvailableTechnologiesForAccount(
    account,
    planetId
  );
  const availableItems = uniqBy(
    [...availableBuildings, ...availableTechonologies, ...nextEssentialBuilds],
    buildableRequirementToString
  );

  // // Pure random
  // return availableItems[rand(0, availableItems.length - 1)];

  let totalScore = 0;
  const availableItemsAndScore: [BuildableRequirement, number][] = availableItems.map(item => {
    const score =
      1 / toStandardUnits(account, buildItemCost(buildRequirementToBuildItem(item, planetId)));
    totalScore += score;
    return [item, score];
  });

  // // Cheapest first
  // return availableItemsAndScore.sort((a, b) => b[1] - a[1])[0][0];

  // Weighted Random
  const r = Math.random() * totalScore;
  let current = 0;
  for (const [item, score] of availableItemsAndScore) {
    current += score;
    if (r < current) {
      return item;
    }
  }

  throw new Error(`Failure to pick a build order item`);
}

export function randomWeightedBuildOrderWithOnlyMines(
  target: BuildItem,
  account: Account
): BuildItem[] {
  return generateBuildOrder(target, account, (accountArg, planetId, nextEssentialBuilds) => {
    const planet = accountArg.planets.get(planetId);
    if (!planet) {
      throw new Error('Planet not found');
    }
    const availableMines: BuildableRequirement[] = [
      {entity: MetalMine, level: (planet.buildingLevels.get(MetalMine) ?? 0) + 1},
      {entity: CrystalMine, level: (planet.buildingLevels.get(CrystalMine) ?? 0) + 1},
      {
        entity: DeuteriumSynthesizer,
        level: (planet.buildingLevels.get(DeuteriumSynthesizer) ?? 0) + 1,
      },
    ];
    const availableItems = uniqBy(
      [...availableMines, ...nextEssentialBuilds],
      buildableRequirementToString
    );

    let totalScore = 0;
    const availableItemsAndScore: [BuildableRequirement, number][] = availableItems.map(item => {
      const score =
        1 / toStandardUnits(accountArg, buildItemCost(buildRequirementToBuildItem(item, planetId)));
      totalScore += score;
      return [item, score];
    });

    const r = Math.random() * totalScore;
    let current = 0;
    for (const [item, score] of availableItemsAndScore) {
      current += score;
      if (r < current) {
        return item;
      }
    }

    throw new Error(`Failure to pick a build order item`);
  });
}
