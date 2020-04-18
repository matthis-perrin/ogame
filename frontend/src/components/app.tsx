import React, {FC} from 'react';
import styled from 'styled-components';

import {createNewAccount} from '@shared/lib/account';
import {BuildOrderItem, getAllPossibleBuildOrderItemForPlanet} from '@shared/lib/build_order';
import {
  computeRequirementTree,
  getRequirementTreeLeaves,
  removeRequirementFromTree,
} from '@shared/lib/requirement_tree';
import {setupRapidFire, setupRequirements} from '@shared/models/dependencies';
import {AstrophysicsTechnology} from '@shared/models/technology';
import {Rosalind} from '@shared/models/universe';
import {arrayJoin} from '@shared/utils/array_utils';
import {rand} from '@shared/utils/rand';

import {BuildOrderItemView} from '@src/components/buildable_order_item_view';

setupRapidFire();
setupRequirements();

const account = createNewAccount(Rosalind);
const mainPlanet = account.planets[0];
const buildTree = computeRequirementTree(AstrophysicsTechnology);

const essentialBuilds: BuildOrderItem[] = [];
while (buildTree.children.length > 0) {
  const leaves = getRequirementTreeLeaves(buildTree);
  const leaf = leaves[rand(0, leaves.length - 1)];
  essentialBuilds.push({...leaf, planet: mainPlanet});
  removeRequirementFromTree(buildTree, leaf);
}
const availableBuilds: BuildOrderItem[] = getAllPossibleBuildOrderItemForPlanet(
  account,
  mainPlanet
);

export const App: FC = () => (
  <Wrapper>
    <Column>
      <ColumnTitle>Essential builds order</ColumnTitle>
      <Separator />
      {arrayJoin(
        essentialBuilds.map(item => (
          <BuildOrderItemView key={`${item.entity.name}-${item.level}`} item={item} />
        )),
        i => (
          <Separator key={i} />
        )
      )}
    </Column>
    <Column>
      <ColumnTitle>Available on main planet</ColumnTitle>
      <Separator />
      {arrayJoin(
        availableBuilds.map(item => (
          <BuildOrderItemView key={`${item.entity.name}-${item.level}`} item={item} />
        )),
        i => (
          <Separator key={i} />
        )
      )}
    </Column>
  </Wrapper>
);
App.displayName = 'App';

const Wrapper = styled.div`
  display: flex;
  justify-content: space-evenly;
`;

const Column = styled.div`
  font-family: Verdana, sans-serif;
  display: flex;
  flex-direction: column;
  width: 300px;
`;
const ColumnTitle = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 600;
  padding: 8px;
  background-color: #dddddd;
`;

const Separator = styled.div`
  height: 8px;
`;
