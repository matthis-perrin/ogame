import {uniqBy} from 'lodash-es';

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
import {createAccountTimeline} from '@shared/lib/timeline';
import {Account} from '@shared/models/account';
import {BuildItem} from '@shared/models/build_item';
import {Buildable, BuildableRequirement} from '@shared/models/buildable';
import {Planet, PlanetId} from '@shared/models/planet';
import {AccountTimeline} from '@shared/models/timeline';

export function getAccountTimeline(target: Buildable, account: Account): AccountTimeline {
  function getMainPlanet(): Planet {
    return Array.from(account.planets.values())[0];
  }
  const startPoint = {...account};

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

  function nextBuildableRequirement(
    nextEssentialBuilds: BuildableRequirement[]
  ): BuildableRequirement {
    const availableBuildings: BuildableRequirement[] = getAvailableBuildingsForPlanet(
      account,
      getMainPlanet().id
    );
    const availableTechonologies: BuildableRequirement[] = getAvailableTechnologiesForAccount(
      account,
      getMainPlanet().id
    );
    const availableItems = uniqBy(
      [...availableBuildings, ...availableTechonologies, ...nextEssentialBuilds],
      buildableRequirementToString
    );
    let totalScore = 0;
    const availableItemsAndScore: [BuildableRequirement, number][] = availableItems.map(item => {
      const score =
        1 /
        toStandardUnits(
          account,
          buildItemCost(buildRequirementToBuildItem(item, getMainPlanet().id))
        );
      totalScore += score;
      return [item, score];
    });

    // Cheapest first
    return availableItemsAndScore.sort((a, b) => b[1] - a[1])[0][0];

    // // Weighted Random
    // const r = Math.random() * totalScore;
    // let current = 0;
    // for (const [item, score] of availableItemsAndScore) {
    //   current += score;
    //   if (r < current) {
    //     return item;
    //   }
    // }

    throw new Error(`Failure to pick a build order item`);
  }

  const buildOrder: BuildItem[] = [];
  const buildTree = computeRequirementTree(target);

  while (buildTree.children.length > 0) {
    let leaves = getRequirementTreeLeaves(buildTree);
    while (leaves.length > 0) {
      const next = nextBuildableRequirement(leaves);
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

  if (buildTree.target.type === 'building' || buildTree.target.type === 'technology') {
    const lastEssential = {entity: buildTree.target, level: 1, planetId: getMainPlanet().id};
    while (true) {
      const next = nextBuildableRequirement([lastEssential]);
      const nextAsBuildItem = buildRequirementToBuildItem(next, getMainPlanet().id);
      buildOrder.push(nextAsBuildItem);
      if (buildableRequirementAreEqual(next, lastEssential)) {
        break;
      }
    }
  }

  // const tStart = performance.now();
  const timeline = createAccountTimeline(startPoint, buildOrder);
  // const tEnd = performance.now();
  // console.log(`Computed in ${tEnd - tStart} ms`);
  return timeline;
}
