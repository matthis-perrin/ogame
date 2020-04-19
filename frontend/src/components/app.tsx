import {uniqBy} from 'lodash-es';
import React, {FC} from 'react';
import styled from 'styled-components';

import {applyBuildItem, createBenjAccount, createNewAccount} from '@shared/lib/account';
import {
  BuildOrderItem,
  buildOrderItemAreEqual,
  buildOrderItemToString,
  getAvailableBuildingsForPlanet,
  getAvailableTechnologiesForAccount,
} from '@shared/lib/build_order';
import {getAccountProductionPerHour, getPlanetProductionPerHour} from '@shared/lib/production';
import {
  computeRequirementTree,
  getRequirementTreeLeaves,
  removeRequirementFromTree,
} from '@shared/lib/requirement_tree';
import {toStandardUnits} from '@shared/lib/resources';
import {PlasmaTurret} from '@shared/models/defense';
import {setupRapidFire, setupRequirements} from '@shared/models/dependencies';
import {Destroyer} from '@shared/models/ships';
import {Rosalind} from '@shared/models/universe';
import {arrayJoin} from '@shared/utils/array_utils';

import {BuildOrderItemView} from '@src/components/build_order_item_view';

setupRapidFire();
setupRequirements();

const account = createNewAccount(Rosalind);
// console.log(getAccountProductionPerHour(account));

const benjAccount = createBenjAccount();
console.log(getAccountProductionPerHour(benjAccount));
for (const p of benjAccount.planets) {
  console.log(getPlanetProductionPerHour(benjAccount, p));
}

const mainPlanet = account.planets[0];
// mainPlanet.buildingLevels.set(ResearchLab, 2);
function nextBuildOrderItem(nextEssentialBuilds: BuildOrderItem[]): BuildOrderItem {
  const availableBuildings: BuildOrderItem[] = getAvailableBuildingsForPlanet(account, mainPlanet);
  const availableTechonologies: BuildOrderItem[] = getAvailableTechnologiesForAccount(
    account,
    mainPlanet
  );
  const availableItems = uniqBy(
    [...availableBuildings, ...availableTechonologies, ...nextEssentialBuilds],
    buildOrderItemToString
  );
  let totalScore = 0;
  const availableItemsAndScore: [BuildOrderItem, number][] = availableItems.map(item => {
    const score = 1 / toStandardUnits(account, item.entity.cost(item.level));
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
}

const buildOrder: BuildOrderItem[] = [];
const buildTree = computeRequirementTree(PlasmaTurret);

while (buildTree.children.length > 0) {
  let leaves = getRequirementTreeLeaves(buildTree).map(leaf => ({...leaf, planet: mainPlanet}));
  while (leaves.length > 0) {
    const next = nextBuildOrderItem(leaves);
    const newLeaves = leaves.filter(leaf => !buildOrderItemAreEqual(leaf, next));
    applyBuildItem(account, next);
    // console.log(getAccountProductionPerHour(account));
    if (newLeaves.length !== leaves.length) {
      removeRequirementFromTree(buildTree, next);
      leaves = getRequirementTreeLeaves(buildTree).map(leaf => ({...leaf, planet: mainPlanet}));
    }
    buildOrder.push(next);
  }
}

if (buildTree.target.type === 'building' || buildTree.target.type === 'technology') {
  const lastEssential = {entity: buildTree.target, level: 1, planet: mainPlanet};
  while (true) {
    const next = nextBuildOrderItem([lastEssential]);
    buildOrder.push(next);
    if (buildOrderItemAreEqual(next, lastEssential)) {
      break;
    }
  }
}

// while (buildTree.children.length > 0) {
//   const leaves = getRequirementTreeLeaves(buildTree);
//   const leaf = leaves[rand(0, leaves.length - 1)];
//   essentialBuilds.push({...leaf, planet: mainPlanet});
//   removeRequirementFromTree(buildTree, leaf);
// }

export const App: FC = () => (
  <Wrapper>
    <Column>
      <ColumnTitle>Build Order</ColumnTitle>
      <Separator />
      {arrayJoin(
        buildOrder.map(item => (
          <BuildOrderItemView key={`${item.entity.name}-${item.level}`} item={item} />
        )),
        i => (
          <Separator key={i} />
        )
      )}
    </Column>
    {/* <Column>
      <ColumnTitle>Available buildings on main planet</ColumnTitle>
      <Separator />
      {arrayJoin(
        availableBuildings.map(item => (
          <BuildOrderItemView key={`${item.entity.name}-${item.level}`} item={item} />
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
          <BuildOrderItemView key={`${item.entity.name}-${item.level}`} item={item} />
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
