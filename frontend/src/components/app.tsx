import {uniqBy} from 'lodash-es';
import React, {FC} from 'react';
import styled from 'styled-components';

import {createNewAccount, updateAccountPlanet, updateAccountTechnology} from '@shared/lib/account';
import {
  buildableRequirementToString,
  buildItemCost,
  buildItemToString,
} from '@shared/lib/build_items';
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
import {BuildItem} from '@shared/models/build_item';
import {BuildableRequirement} from '@shared/models/buildable';
import {PlasmaTurret} from '@shared/models/defense';
import {setupRapidFire, setupRequirements} from '@shared/models/dependencies';
import {Planet, PlanetId} from '@shared/models/planet';
import {Destroyer} from '@shared/models/ships';
import {AstrophysicsTechnology} from '@shared/models/technology';
import {timeToString} from '@shared/models/time';
import {Rosalind} from '@shared/models/universe';

import {BuildItemView} from '@src/components/build_item_view';

setupRapidFire();
setupRequirements();

const target = Destroyer;
let account = createNewAccount(Rosalind);
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

console.log('BUILD ORDER');
console.log(JSON.stringify(buildOrder.map(buildItemToString), undefined, 2));
const tStart = performance.now();
const timeline = createAccountTimeline(startPoint, buildOrder);
const tEnd = performance.now();
console.log(timeline);
console.log(
  timeToString(
    timeline.transitions[timeline.transitions.length - 1].transitionnedAccount.currentTime
  )
);
console.log(`Computed in ${tEnd - tStart} ms`);

// while (buildTree.children.length > 0) {
//   const leaves = getRequirementTreeLeaves(buildTree);
//   const leaf = leaves[rand(0, leaves.length - 1)];
//   essentialBuilds.push({...leaf, planet: mainPlanet});
//   removeRequirementFromTree(buildTree, leaf);
// }

export const App: FC = () => (
  <Wrapper>
    {/* <Column>
      <ColumnTitle>Build Order</ColumnTitle>
      <Separator />
      {arrayJoin(
        buildOrder.map(item => <BuildItemView key={buildItemToString(item)} item={item} />),
        i => (
          <Separator key={i} />
        )
      )}
    </Column> */}
    {/* <Column>
      <ColumnTitle>Available buildings on main planet</ColumnTitle>
      <Separator />
      {arrayJoin(
        availableBuildings.map(item => (
          <BuildItemView key={`${item.entity.name}-${item.level}`} item={item} />
        )),
        i => (
          <Separator key={i} />
        )
      )}
    </Column>
    <Column>
      <ColumnTitle>Available technologies</ColumnTitle>
      <Separator />
      {arrayJoin(
        availableTechonologies.map(item => (
          <BuildItemView key={`${item.entity.name}-${item.level}`} item={item} />
        )),
        i => (
          <Separator key={i} />
        )
      )}
    </Column> */}
  </Wrapper>
);
App.displayName = 'App';

const Wrapper = styled.div`
  display: flex;
  justify-content: space-evenly;
  margin-top: 24px;
`;

const Column = styled.div`
  font-family: Verdana, sans-serif;
  display: flex;
  flex-direction: column;
  /* width: 320px; */
`;
const ColumnTitle = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  font-size: 14px;
  font-weight: 600;
  padding: 8px;
  background-color: #dddddd;
`;

const Separator = styled.div`
  height: 8px;
`;
