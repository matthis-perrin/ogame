import {Chromosome, getLastAccount, sliceChromosome} from '@shared/algogen/chromosome';
import {buildItemsAreEqual, buildItemToString} from '@shared/lib/build_items';
import {canBeNextBuildItemAppliedOnAccount} from '@shared/lib/requirement_tree';
import {accountTimelineLibInPerfMode} from '@shared/lib/timeline';
import {Account} from '@shared/models/account';
import {BuildItem} from '@shared/models/build_item';
import {BuildItemTimeline} from '@shared/models/timeline';
import {rand} from '@shared/utils/rand';

const {advanceAccountTowardBuildItem, finishAllInProgress} = accountTimelineLibInPerfMode;

function alreadyInBuildOrder(buildOrder: BuildItem[], buildItem: BuildItem): boolean {
  for (const item of buildOrder) {
    if (buildItemsAreEqual(item, buildItem)) {
      return true;
    }
  }
  return false;
}

export function crossover(parent1: Chromosome, parent2: Chromosome): Chromosome[] {
  const crossPoint = rand(1, Math.min(parent1.buildOrder.length, parent2.buildOrder.length) - 2);

  const child1: Chromosome = sliceChromosome(parent1, [parent1, parent2], crossPoint);
  let child1Died = false;
  for (const buildItem of parent2.buildOrder) {
    if (
      canBeNextBuildItemAppliedOnAccount(
        getLastAccount(child1.accountTimeline.buildItemTimelines),
        buildItem
      ) &&
      !alreadyInBuildOrder(child1.buildOrder, buildItem)
    ) {
      // OK since we sliced the chromosome, which creates new `buildOrder` and `buildItemTimelines` references
      child1.buildOrder.push(buildItem);
      try {
        child1.accountTimeline.buildItemTimelines.push({
          buildItem,
          transitions: advanceAccountTowardBuildItem(
            getLastAccount(child1.accountTimeline.buildItemTimelines),
            buildItem
          ),
        });
      } catch {
        child1Died = true;
        break;
      }
    }
  }
  child1.accountTimeline.currentAccount = getLastAccount(child1.accountTimeline.buildItemTimelines);

  const child2 = sliceChromosome(parent2, [parent1, parent2], crossPoint);
  let child2Died = false;
  for (const buildItem of parent1.buildOrder) {
    if (
      canBeNextBuildItemAppliedOnAccount(
        getLastAccount(child2.accountTimeline.buildItemTimelines),
        buildItem
      ) &&
      !alreadyInBuildOrder(child2.buildOrder, buildItem)
    ) {
      // OK since we sliced the chromosome, which creates new `buildOrder` and `buildItemTimelines` references
      child2.buildOrder.push(buildItem);
      try {
        child2.accountTimeline.buildItemTimelines.push({
          buildItem,
          transitions: advanceAccountTowardBuildItem(
            getLastAccount(child2.accountTimeline.buildItemTimelines),
            buildItem
          ),
        });
      } catch {
        child2Died = true;
        break;
      }
    }
  }
  child2.accountTimeline.currentAccount = getLastAccount(child2.accountTimeline.buildItemTimelines);

  const aliveChildren: Chromosome[] = [];
  if (!child1Died) {
    try {
      const {accountTimeline} = child1;
      accountTimeline.buildItemTimelines[
        accountTimeline.buildItemTimelines.length - 1
      ].transitions.push(...finishAllInProgress(accountTimeline.currentAccount));
      child1.accountTimeline.currentAccount = getLastAccount(
        child1.accountTimeline.buildItemTimelines
      );
      aliveChildren.push(child1);
    } catch {
      // We're cool with it
    }
  }
  if (!child2Died) {
    try {
      const {accountTimeline} = child2;
      accountTimeline.buildItemTimelines[
        accountTimeline.buildItemTimelines.length - 1
      ].transitions.push(...finishAllInProgress(accountTimeline.currentAccount));
      child2.accountTimeline.currentAccount = getLastAccount(
        child2.accountTimeline.buildItemTimelines
      );
    } catch {
      // We're cool with it
    }
  }

  for (const child of aliveChildren) {
    if (child.buildOrder[child.buildOrder.length - 1].type !== 'ship') {
      console.log('Parent 1');
      console.log(parent1.buildOrder.map(bo => buildItemToString(bo)));
      console.log('Parent 2');
      console.log(parent2.buildOrder.map(bo => buildItemToString(bo)));
      console.log('Child 1');
      console.log(child1.buildOrder.map(bo => buildItemToString(bo)));
      console.log('Child 2');
      console.log(child2.buildOrder.map(bo => buildItemToString(bo)));
      debugger;
    }
  }

  return aliveChildren;
}
