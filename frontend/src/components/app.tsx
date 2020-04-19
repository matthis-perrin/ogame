import React, {FC} from 'react';
import styled from 'styled-components';

import {createNewAccount} from '@shared/lib/account';
import {
  computeRequirementTree,
  getRequirementTreeLeaves,
  removeRequirementFromTree,
} from '@shared/lib/requirement_tree';
import {BuildableRequirement} from '@shared/models/buildable';
import {setupRapidFire, setupRequirements} from '@shared/models/dependencies';
import {Destroyer} from '@shared/models/ships';
import {Rosalind} from '@shared/models/universe';
import {arrayJoin} from '@shared/utils/array_utils';
import {rand} from '@shared/utils/rand';

import {BuildableRequirementView} from '@src/components/buildable_requirement_view';

setupRapidFire();
setupRequirements();

const account = createNewAccount(Rosalind);
const buildTree = computeRequirementTree(Destroyer);

const buildOrder: BuildableRequirement[] = [];
while (buildTree.children.length > 0) {
  const leaves = getRequirementTreeLeaves(buildTree);
  const leaf = leaves[rand(0, leaves.length - 1)];
  buildOrder.push(leaf);
  removeRequirementFromTree(buildTree, leaf);
}

export const App: FC = () => (
  <Column>
    {arrayJoin(
      buildOrder.map(bo => (
        <BuildableRequirementView key={`${bo.entity.name}-${bo.level}`} requirement={bo} />
      )),
      i => (
        <Separator key={i} />
      )
    )}
  </Column>
);
App.displayName = 'App';

const Column = styled.div`
  font-family: Verdana, sans-serif;
  display: flex;
  flex-direction: column;
  width: 300px;
`;

const Separator = styled.div`
  height: 8px;
`;
