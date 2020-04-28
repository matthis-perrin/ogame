import {
  Chromosome,
  getAccountAtBuildOrderIndex,
  getLastAccount,
  sliceChromosome,
} from '@shared/algogen/chromosome';
import {
  canBeNextBuildItemAppliedOnAccount,
  flattenedRequirements,
  isBuildItemAvailable,
} from '@shared/lib/requirement_tree';
import {accountTimelineLibInPerfMode} from '@shared/lib/timeline';
import {BuildItem} from '@shared/models/build_item';
import {AllBuildings, Building} from '@shared/models/building';
import {PlanetId} from '@shared/models/planet';
import {AllTechnologies, Technology} from '@shared/models/technology';
import {NEVER} from '@shared/models/time';
import {rand} from '@shared/utils/rand';

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

function getRemovableIndexes(chromosome: Chromosome): number[] {
  const removableIndexes: number[] = [];

  const highestLevelItemsByPlanet = new Map<PlanetId, Map<Technology | Building, number>>();
  const requiredByOtherItemsByPlanet = new Map<PlanetId, Map<Technology | Building, number>>();

  for (let buildItemIndex = 0; buildItemIndex < chromosome.buildOrder.length; buildItemIndex++) {
    const buildItem = chromosome.buildOrder[buildItemIndex];

    let requiredByOtherItems = requiredByOtherItemsByPlanet.get(buildItem.planetId);
    if (!requiredByOtherItems) {
      requiredByOtherItems = new Map<Technology | Building, number>();
      requiredByOtherItemsByPlanet.set(buildItem.planetId, requiredByOtherItems);
    }
    for (const {entity, level} of flattenedRequirements(buildItem.buildable)) {
      requiredByOtherItems.set(entity, Math.max(requiredByOtherItems.get(entity) ?? 0, level));
    }

    // Can not remove the last item of the build order since it is the targer
    // we are trying to reach
    if (buildItem === chromosome.buildOrder[chromosome.buildOrder.length - 1]) {
      break;
    }

    // We can always remove a ship, defense or stock
    if (buildItem.type === 'defense' || buildItem.type === 'ship' || buildItem.type === 'stock') {
      removableIndexes.push(buildItemIndex);
      continue;
    }

    let highestLevelItems = highestLevelItemsByPlanet.get(buildItem.planetId);
    if (!highestLevelItems) {
      highestLevelItems = new Map<Technology | Building, number>();
      highestLevelItemsByPlanet.set(buildItem.planetId, highestLevelItems);
    }
    if (buildItem.type === 'technology' || buildItem.type === 'building') {
      highestLevelItems.set(
        buildItem.buildable,
        Math.max(highestLevelItems.get(buildItem.buildable) ?? 0, buildItem.level)
      );
    }
  }

  for (let buildItemIndex = 0; buildItemIndex < chromosome.buildOrder.length; buildItemIndex++) {
    const buildItem = chromosome.buildOrder[buildItemIndex];

    // We already took care of them in the previous loop
    if (buildItem.type === 'defense' || buildItem.type === 'ship' || buildItem.type === 'stock') {
      continue;
    }

    if (
      buildItem.level ===
        (highestLevelItemsByPlanet.get(buildItem.planetId)?.get(buildItem.buildable) ?? 0) &&
      buildItem.level >
        (requiredByOtherItemsByPlanet.get(buildItem.planetId)?.get(buildItem.buildable) ?? 0)
    ) {
      removableIndexes.push(buildItemIndex);
    }
  }

  return removableIndexes;
}

function getIndexesSwapableWith(chromosome: Chromosome, firstSwapIndex: number): number[] {
  const validIndexToSwapWith: number[] = [];

  // Same here, last index is not allowed
  for (let index = 0; index < chromosome.buildOrder.length - 1; index++) {
    if (index === firstSwapIndex) {
      continue;
    }

    const firstIndex = Math.min(firstSwapIndex, index);
    const lastIndex = Math.max(firstSwapIndex, index);

    const firstItem = chromosome.buildOrder[firstIndex];
    const lastItem = chromosome.buildOrder[lastIndex];

    // Go through all the items between both indexes (included) we want to swap
    // and check there are no violation
    let canAddIndex = true;
    const lastItemRequirements = lastItem.buildable.requirements;
    gapItemLoop: for (let gapIndex = firstIndex; gapIndex <= lastIndex; gapIndex++) {
      const gapItem = chromosome.buildOrder[gapIndex];
      if (gapItem.type === 'building' || gapItem.type === 'technology') {
        if (
          (firstItem.type === 'building' || firstItem.type === 'technology') &&
          firstItem.buildable === gapItem.buildable &&
          firstItem.planetId === gapItem.planetId &&
          firstItem.level < gapItem.level
        ) {
          canAddIndex = false;
          break;
        }
        if (
          (lastItem.type === 'building' || lastItem.type === 'technology') &&
          lastItem.buildable === gapItem.buildable &&
          lastItem.planetId === gapItem.planetId &&
          lastItem.level > gapItem.level
        ) {
          canAddIndex = false;
          break;
        }
      }
      for (const requirement of flattenedRequirements(gapItem.buildable)) {
        if (
          (firstItem.type === 'building' || firstItem.type === 'technology') &&
          requirement.entity === firstItem.buildable &&
          requirement.level >= firstItem.level
        ) {
          canAddIndex = false;
          break gapItemLoop;
        }
      }
      for (const requirement of lastItemRequirements) {
        if (
          (gapItem.type === 'building' || gapItem.type === 'technology') &&
          requirement.entity === gapItem.buildable &&
          requirement.level >= gapItem.level
        ) {
          canAddIndex = false;
          break gapItemLoop;
        }
      }
    }

    if (canAddIndex) {
      validIndexToSwapWith.push(index);
    }
  }

  return validIndexToSwapWith;
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

export function mutationByRemove(chromosome: Chromosome): Chromosome {
  const removableIndexes = getRemovableIndexes(chromosome);
  const indexToRemove = removableIndexes[rand(0, removableIndexes.length - 1)];

  // Rebuild a new chromosome without the build item at the index
  const mutatedChromosome = sliceChromosome(chromosome, [chromosome], indexToRemove);
  for (const buildItem of chromosome.buildOrder.slice(indexToRemove + 1)) {
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

export function mutationBySwap(chromosome: Chromosome): Chromosome {
  //   Not allowed to swap the last since it's the target
  const firstSwapIndex = rand(0, chromosome.buildOrder.length - 2);
  const swapableIndexes = getIndexesSwapableWith(chromosome, firstSwapIndex);
  const secondSwapIndex = swapableIndexes[rand(0, swapableIndexes.length - 1)];

  const smallestSwapIndex = Math.min(firstSwapIndex, secondSwapIndex);
  const largestSwapIndex = Math.max(firstSwapIndex, secondSwapIndex);

  // Rebuild a new chromosome with the build items swaped
  const mutatedChromosome = sliceChromosome(chromosome, [chromosome], smallestSwapIndex);
  const remainingBuildItems = chromosome.buildOrder.slice(smallestSwapIndex);
  const temp = remainingBuildItems[0];
  remainingBuildItems[0] = remainingBuildItems[largestSwapIndex - smallestSwapIndex];
  remainingBuildItems[largestSwapIndex - smallestSwapIndex] = temp;
  for (const buildItem of remainingBuildItems) {
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
