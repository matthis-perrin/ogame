import {Account} from '@shared/models/account';
import {BuildItem} from '@shared/models/build_item';
import {AccountTimeline, BuildItemTimeline} from '@shared/models/timeline';

export interface Chromosome {
  buildOrder: BuildItem[];
  parents: Chromosome[];
  accountTimeline: AccountTimeline;
}

export function getLastAccount(buildItemTimelines: BuildItemTimeline[]): Account {
  for (let i = buildItemTimelines.length - 1; i >= 0; i--) {
    const {transitions} = buildItemTimelines[i];
    if (transitions.length > 0) {
      return transitions[transitions.length - 1].transitionnedAccount;
    }
  }
  throw new Error('Empty chromosome');
}

export function getAccountAtBuildOrderIndex(timeline: AccountTimeline, index: number): Account {
  if (index === -1) {
    return timeline.start;
  }
  const {transitions} = timeline.buildItemTimelines[index];
  if (transitions.length === 0) {
    return getAccountAtBuildOrderIndex(timeline, index - 1);
  }
  return transitions[transitions.length - 1].transitionnedAccount;
}

export function sliceChromosome(
  chromosome: Chromosome,
  parents: Chromosome[],
  index: number
): Chromosome {
  const {buildOrder, accountTimeline} = chromosome;
  const {start, buildItemTimelines} = accountTimeline;
  const newBuildItemTimelines = buildItemTimelines.slice(0, index);
  return {
    buildOrder: buildOrder.slice(0, index),
    parents,
    accountTimeline: {
      start,
      currentAccount: getLastAccount(newBuildItemTimelines),
      buildItemTimelines: newBuildItemTimelines,
    },
  };
}
