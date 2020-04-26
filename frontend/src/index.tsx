import {crossover} from '@shared/algogen/crossover';
import {createNewAccount} from '@shared/lib/account';
import {buildItemToString} from '@shared/lib/build_items';
import {accountTimelineLibInPerfMode} from '@shared/lib/timeline';
import {BuildItem} from '@shared/models/build_item';
import {setupRapidFire, setupRequirements} from '@shared/models/dependencies';
import {SmallCargo} from '@shared/models/ships';
import {Rosalind} from '@shared/models/universe';

import {generateBuildOrder, randomWeightedNextBuildableRequirement} from '@src/lib/timeline';

const {createAccountTimeline} = accountTimelineLibInPerfMode;

setupRapidFire();
setupRequirements();

function printBuildOrder(buildOrder: BuildItem[]): void {
  for (let i = 0; i < buildOrder.length; i++) {
    const buildItem = buildOrder[i];
    console.log(i, buildItemToString(buildItem));
  }
}

const account = createNewAccount(Rosalind);
const mainPlanet = Array.from(account.planets.values())[0];
const smallCargoTarget: BuildItem = {
  type: 'ship',
  buildable: SmallCargo,
  planetId: mainPlanet.id,
  quantity: 1,
};

const buildOrder1 = generateBuildOrder(
  smallCargoTarget,
  account,
  randomWeightedNextBuildableRequirement
);
const buildOrder2 = generateBuildOrder(
  smallCargoTarget,
  account,
  randomWeightedNextBuildableRequirement
);
const parent1 = {
  buildOrder: buildOrder1,
  accountTimeline: createAccountTimeline(account, buildOrder1),
};
const parent2 = {
  buildOrder: buildOrder2,
  accountTimeline: createAccountTimeline(account, buildOrder2),
};

console.log('-- Parents --');
printBuildOrder(buildOrder1);
printBuildOrder(buildOrder2);

const children = crossover(parent1, parent2);

console.log('-- Children --');
for (const child of children) {
  printBuildOrder(child.buildOrder);
}
