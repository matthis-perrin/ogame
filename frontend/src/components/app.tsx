import React, {FC} from 'react';

import {createNewAccount} from '@shared/lib/account';
import {
  computeRequirementTree,
  getRequirementTreeLeaves,
  removeRequirementFromTree,
  requirementToDebugString,
} from '@shared/lib/requirement_tree';
import {AstrophysicsTechnology} from '@shared/models/technology';
import {Rosalind} from '@shared/models/universe';
import {rand} from '@shared/utils/rand';

export const App: FC = () => <div>Hello</div>;
App.displayName = 'App';

const account = createNewAccount(Rosalind);
const buildTree = computeRequirementTree({entity: AstrophysicsTechnology, level: 5});

/* eslint-disable no-console */
console.log(account);
console.log(buildTree);
console.log(getRequirementTreeLeaves(buildTree));

while (buildTree.children.length > 0) {
  const leaves = getRequirementTreeLeaves(buildTree);
  const leaf = leaves[rand(0, leaves.length - 1)];
  console.log(requirementToDebugString(leaf));
  removeRequirementFromTree(buildTree, leaf);
}
console.log(buildTree);
