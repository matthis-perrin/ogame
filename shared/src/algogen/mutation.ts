import {
  Chromosome,
  getAccountAtBuildOrderIndex,
  getLastAccount,
  sliceChromosome,
} from '@shared/algogen/chromosome';
import {buildItemToString} from '@shared/lib/build_items';
import {
  canBeNextBuildItemAppliedOnAccount,
  isBuildItemAvailable,
} from '@shared/lib/requirement_tree';
import {accountTimelineLibInPerfMode} from '@shared/lib/timeline';
import {Account} from '@shared/models/account';
import {BuildItem} from '@shared/models/build_item';
import {AllBuildings} from '@shared/models/building';
import {AllTechnologies} from '@shared/models/technology';
import {NEVER} from '@shared/models/time';
import {AccountTimeline} from '@shared/models/timeline';
import {rand} from '@shared/utils/rand';

// function getBuildItemWithRequirementsFufilled(
//   account: Account,
//   planet: Planet,
//   buildItem: BuildItem
// ): BuildItem[] {
//   const buildItems: BuildItem[] = [];
//   for (const requirement of buildItem.buildable.requirements) {
//     buildItems.push(...buildItemsToMeetRequirementOnPlanet(account, planet, requirement));
//   }
//   return buildItems;
// }

const {advanceAccountTowardBuildItem, finishAllInProgress} = accountTimelineLibInPerfMode;

function getInsertableBuildItem(chromosome: Chromosome): BuildItem[] {
  const account = chromosome.accountTimeline.currentAccount;
  const usefulTechno = AllTechnologies.filter(t => t.isUseful);
  const usefulBuildings = AllBuildings.filter(t => t.isBuildOrderBuilding);

  const buildItems: BuildItem[] = [];

  if (account.inProgressTechnology) {
    throw new Error(`Technology still in progress on account for this chromosome`);
  }

  for (const planet of Array.from(account.planets.values())) {
    usefulTechno.forEach(techno => {
      const item: BuildItem = {
        type: 'technology',
        buildable: techno,
        level: (account.technologyLevels.get(techno) ?? 0) + 1,
        planetId: planet.id,
      };
      if (isBuildItemAvailable(account, item).isAvailable) {
        buildItems.push(item);
      }
    });

    usefulBuildings.forEach(building => {
      const item: BuildItem = {
        type: 'building',
        buildable: building,
        level: (planet.buildingLevels.get(building) ?? 0) + 1,
        planetId: planet.id,
      };
      if (isBuildItemAvailable(account, item).isAvailable) {
        buildItems.push(item);
      }
    });
  }

  // TODO - Good place to also add Crawler creation (or even production factor adjustements?)

  return buildItems;
}

export function mutationByInsert(chromosome: Chromosome): Chromosome {
  // Get a random item to inset
  const insertables = getInsertableBuildItem(chromosome);
  const toInsert = insertables[rand(0, insertables.length - 1)];

  // Figure out the first index it can be inserted at
  let firstIndexToInsert = 0;
  const initialAvailability = isBuildItemAvailable(chromosome.accountTimeline.start, toInsert);
  if (!(initialAvailability.isAvailable || initialAvailability.willBeAvailableAt !== NEVER)) {
    for (let i = 0; i < chromosome.accountTimeline.buildItemTimelines.length - 1; i++) {
      const availabilityAtIndex = isBuildItemAvailable(
        getAccountAtBuildOrderIndex(chromosome.accountTimeline, i),
        toInsert
      );
      if (availabilityAtIndex.isAvailable || availabilityAtIndex.willBeAvailableAt !== NEVER) {
        firstIndexToInsert = i + 1;
        break;
      }
    }
  }

  // Choose an index to insert at random
  const indexToInsert = rand(
    firstIndexToInsert,
    chromosome.accountTimeline.buildItemTimelines.length
  );

  // Rebuild a new chromosome with the build item at the index
  const mutatedChromosome = sliceChromosome(chromosome, [chromosome], indexToInsert);
  for (const buildItem of [toInsert, ...chromosome.buildOrder.slice(indexToInsert)]) {
    if (
      canBeNextBuildItemAppliedOnAccount(
        getLastAccount(mutatedChromosome.accountTimeline.buildItemTimelines),
        buildItem
      )
    ) {
      // OK since we sliced the chromosome, which creates new `buildOrder` and `buildItemTimelines` references
      mutatedChromosome.buildOrder.push(buildItem);
      mutatedChromosome.accountTimeline.buildItemTimelines.push({
        buildItem,
        transitions: advanceAccountTowardBuildItem(
          getLastAccount(mutatedChromosome.accountTimeline.buildItemTimelines),
          buildItem
        ),
      });
    } else {
      throw new Error(`Should never happen`);
    }
  }
  mutatedChromosome.accountTimeline.currentAccount = getLastAccount(
    mutatedChromosome.accountTimeline.buildItemTimelines
  );
  mutatedChromosome.accountTimeline.buildItemTimelines[
    mutatedChromosome.accountTimeline.buildItemTimelines.length - 1
  ].transitions.push(...finishAllInProgress(mutatedChromosome.accountTimeline.currentAccount));
  mutatedChromosome.accountTimeline.currentAccount = getLastAccount(
    mutatedChromosome.accountTimeline.buildItemTimelines
  );

  return mutatedChromosome;
}
