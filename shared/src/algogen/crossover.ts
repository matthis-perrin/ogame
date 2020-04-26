import {Chromosome} from '@shared/algogen/chromosome';
import {canBeNextBuildItemAppliedOnAccount} from '@shared/lib/requirement_tree';
import {accountTimelineLibInPerfMode} from '@shared/lib/timeline';
import {Account} from '@shared/models/account';
import {BuildItemTimeline} from '@shared/models/timeline';
import {rand} from '@shared/utils/rand';

const {advanceAccountTowardBuildItem} = accountTimelineLibInPerfMode;

function getLastAccount(buildItemTimelines: BuildItemTimeline[]): Account {
  for (let i = buildItemTimelines.length - 1; i >= 0; i--) {
    const {transitions} = buildItemTimelines[i];
    if (transitions.length > 0) {
      return transitions[transitions.length - 1].transitionnedAccount;
    }
  }
  throw new Error('Empty chromosome');
}

function sliceChromosome(chromosome: Chromosome, index: number): Chromosome {
  const {buildOrder, accountTimeline} = chromosome;
  const {start, buildItemTimelines} = accountTimeline;
  const newBuildItemTimelines = buildItemTimelines.slice(0, index);
  return {
    buildOrder: buildOrder.slice(0, index),
    accountTimeline: {
      start,
      currentAccount: getLastAccount(newBuildItemTimelines),
      buildItemTimelines: newBuildItemTimelines,
    },
  };
}

export function crossover(parent1: Chromosome, parent2: Chromosome): Chromosome[] {
  const crossPoint = rand(1, Math.min(parent1.buildOrder.length, parent2.buildOrder.length) - 1);
  console.log('crossPoint', crossPoint);

  const child1: Chromosome = sliceChromosome(parent1, crossPoint);
  let child1Died = false;
  for (const buildItem of parent2.buildOrder) {
    if (
      canBeNextBuildItemAppliedOnAccount(
        getLastAccount(child1.accountTimeline.buildItemTimelines),
        buildItem
      )
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

  const child2 = sliceChromosome(parent2, crossPoint);
  let child2Died = false;
  for (const buildItem of parent1.buildOrder) {
    if (
      canBeNextBuildItemAppliedOnAccount(
        getLastAccount(child2.accountTimeline.buildItemTimelines),
        buildItem
      )
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

  const aliveChildren: Chromosome[] = [];
  if (!child1Died) {
    aliveChildren.push(child1);
  }
  if (!child2Died) {
    aliveChildren.push(child2);
  }

  return aliveChildren;
}
