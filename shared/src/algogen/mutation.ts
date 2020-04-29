import {Chromosome} from '@shared/algogen/chromosome';
import {flattenedRequirements} from '@shared/lib/requirement_tree';
import {accountTimelineLibInPerfMode} from '@shared/lib/timeline';
import {BuildItem} from '@shared/models/build_item';
import {AllBuildings, Building} from '@shared/models/building';
import {PlanetId} from '@shared/models/planet';
import {AllTechnologies, Technology} from '@shared/models/technology';
import {rand} from '@shared/utils/rand';

const {createAccountTimeline} = accountTimelineLibInPerfMode;

function getInsertableBuildItem(chromosome: Chromosome): BuildItem[] {
  const usefulTechno = AllTechnologies.filter(t => t.isUseful);
  const usefulBuildings = AllBuildings.filter(t => t.isBuildOrderBuilding);
  const highestLevelItemsByPlanet = new Map<PlanetId, Map<Technology | Building, number>>();

  for (const buildItem of chromosome.buildOrder) {
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

  const account = chromosome.accountTimeline.currentAccount;
  const possibleInsertableItems: BuildItem[] = [];
  for (const planet of Array.from(account.planets.values())) {
    usefulTechno.forEach(techno => {
      possibleInsertableItems.push({
        type: 'technology',
        buildable: techno,
        level: (highestLevelItemsByPlanet.get(planet.id)?.get(techno) ?? 0) + 1,
        planetId: planet.id,
      });
    });
    usefulBuildings.forEach(building => {
      possibleInsertableItems.push({
        type: 'building',
        buildable: building,
        level: (highestLevelItemsByPlanet.get(planet.id)?.get(building) ?? 0) + 1,
        planetId: planet.id,
      });
    });
  }

  // TODO - Good place to also add Crawler creation (or even production factor adjustements?)

  return possibleInsertableItems.filter(item => {
    for (const requirement of item.buildable.requirements) {
      if (
        (highestLevelItemsByPlanet.get(item.planetId)?.get(requirement.entity) ?? 0) <
        requirement.level
      ) {
        return false;
      }
    }
    return true;
  });
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
  const toInsertRequirements = flattenedRequirements(toInsert.buildable);

  // Figure out the first index it can be inserted at
  const highestLevelItemsByPlanet = new Map<PlanetId, Map<Technology | Building, number>>();
  let firstIndexToInsert = chromosome.accountTimeline.buildItemTimelines.length - 1;
  for (let index = 0; index < chromosome.buildOrder.length; index++) {
    const buildItem = chromosome.buildOrder[index];
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

    if (
      (toInsert.type === 'building' || toInsert.type === 'technology') &&
      (highestLevelItems.get(toInsert.buildable) ?? 0) !== toInsert.level - 1
    ) {
      continue;
    }
    for (const requirement of toInsertRequirements) {
      if ((highestLevelItems.get(requirement.entity) ?? 0) < requirement.level) {
        continue;
      }
    }
    firstIndexToInsert = index + 1;
    break;
  }

  // Choose an index to insert at random
  const indexToInsert = rand(
    firstIndexToInsert,
    chromosome.accountTimeline.buildItemTimelines.length - 1
  );

  // Rebuild a new chromosome with the build item at the index
  const newBuildOrder = [
    ...chromosome.buildOrder.slice(0, indexToInsert),
    toInsert,
    ...chromosome.buildOrder.slice(indexToInsert),
  ];
  const newTimeline = createAccountTimeline(chromosome.accountTimeline.start, newBuildOrder);
  const mutatedChromosome = {
    buildOrder: newBuildOrder,
    source: {
      ancestors: [chromosome],
      reason: `mutation by insert (at index ${indexToInsert})`,
    },
    accountTimeline: newTimeline,
  };
  return mutatedChromosome;

  // // Rebuild a new chromosome with the build item at the index
  // const mutatedChromosome = sliceChromosome(
  //   chromosome,
  //   {ancestors: [chromosome], reason: `mutation by insert (at index ${indexToInsert})`},
  //   indexToInsert
  // );
  // for (const buildItem of [toInsert, ...chromosome.buildOrder.slice(indexToInsert)]) {
  //   if (canBeNextBuildItemAppliedOnAccountTimeline(mutatedChromosome.accountTimeline, buildItem)) {
  //     // OK since we sliced the chromosome, which creates new `buildOrder` and `buildItemTimelines` references
  //     mutatedChromosome.buildOrder.push(buildItem);
  //     mutatedChromosome.accountTimeline.buildItemTimelines.push({
  //       buildItem,
  //       transitions: advanceAccountTowardBuildItem(
  //         getLastAccount(mutatedChromosome.accountTimeline.buildItemTimelines),
  //         buildItem
  //       ),
  //     });
  //   } else {
  //     // eslint-disable-next-line no-debugger
  //     console.log('insertables', insertables);
  //     console.log('toInsert', buildItemToString(toInsert));
  //     console.log('failed at', buildItemToString(buildItem));
  //     console.log('started with', chromosome);
  //     console.log('mutated so far', mutatedChromosome);
  //     debugger;
  //     throw new Error(`Should never happen`);
  //   }
  // }
  // mutatedChromosome.accountTimeline.currentAccount = getLastAccount(
  //   mutatedChromosome.accountTimeline.buildItemTimelines
  // );
  // mutatedChromosome.accountTimeline.buildItemTimelines[
  //   mutatedChromosome.accountTimeline.buildItemTimelines.length - 1
  // ].transitions.push(...finishAllInProgress(mutatedChromosome.accountTimeline.currentAccount));
  // mutatedChromosome.accountTimeline.currentAccount = getLastAccount(
  //   mutatedChromosome.accountTimeline.buildItemTimelines
  // );

  // return mutatedChromosome;
}

export function mutationByRemove(chromosome: Chromosome): Chromosome {
  const removableIndexes = getRemovableIndexes(chromosome);
  const indexToRemove = removableIndexes[rand(0, removableIndexes.length - 1)];

  const newBuildOrder = [
    ...chromosome.buildOrder.slice(0, indexToRemove),
    ...chromosome.buildOrder.slice(indexToRemove + 1),
  ];
  const newTimeline = createAccountTimeline(chromosome.accountTimeline.start, newBuildOrder);
  const mutatedChromosome = {
    buildOrder: newBuildOrder,
    source: {
      ancestors: [chromosome],
      reason: `mutation by remove (at index ${indexToRemove})`,
    },
    accountTimeline: newTimeline,
  };
  return mutatedChromosome;

  // // Rebuild a new chromosome without the build item at the index
  // const mutatedChromosome = sliceChromosome(
  //   chromosome,
  //   {ancestors: [chromosome], reason: `mutation by remove (at index ${indexToRemove})`},
  //   indexToRemove
  // );
  // for (const buildItem of chromosome.buildOrder.slice(indexToRemove + 1)) {
  //   if (canBeNextBuildItemAppliedOnAccountTimeline(mutatedChromosome.accountTimeline, buildItem)) {
  //     // OK since we sliced the chromosome, which creates new `buildOrder` and `buildItemTimelines` references
  //     mutatedChromosome.buildOrder.push(buildItem);
  //     mutatedChromosome.accountTimeline.buildItemTimelines.push({
  //       buildItem,
  //       transitions: advanceAccountTowardBuildItem(
  //         getLastAccount(mutatedChromosome.accountTimeline.buildItemTimelines),
  //         buildItem
  //       ),
  //     });
  //   } else {
  //     // eslint-disable-next-line no-debugger
  //     console.log('removableIndexes', removableIndexes);
  //     console.log('indexToRemove', indexToRemove);
  //     console.log('failed at', buildItemToString(buildItem));
  //     console.log('started with', chromosome);
  //     console.log('mutated so far', mutatedChromosome);
  //     debugger;
  //     throw new Error(`Should never happen`);
  //   }
  // }
  // mutatedChromosome.accountTimeline.currentAccount = getLastAccount(
  //   mutatedChromosome.accountTimeline.buildItemTimelines
  // );
  // mutatedChromosome.accountTimeline.buildItemTimelines[
  //   mutatedChromosome.accountTimeline.buildItemTimelines.length - 1
  // ].transitions.push(...finishAllInProgress(mutatedChromosome.accountTimeline.currentAccount));
  // mutatedChromosome.accountTimeline.currentAccount = getLastAccount(
  //   mutatedChromosome.accountTimeline.buildItemTimelines
  // );

  // return mutatedChromosome;
}

export function mutationBySwap(chromosome: Chromosome): Chromosome {
  //   Not allowed to swap the last since it's the target
  const firstSwapIndex = rand(0, chromosome.buildOrder.length - 2);
  const swapableIndexes = getIndexesSwapableWith(chromosome, firstSwapIndex);
  if (swapableIndexes.length === 0) {
    return mutationBySwap(chromosome);
  }
  const secondSwapIndex = swapableIndexes[rand(0, swapableIndexes.length - 1)];

  const smallestSwapIndex = Math.min(firstSwapIndex, secondSwapIndex);
  const largestSwapIndex = Math.max(firstSwapIndex, secondSwapIndex);

  const newBuildOrder = [...chromosome.buildOrder];
  const temp = newBuildOrder[smallestSwapIndex];
  newBuildOrder[smallestSwapIndex] = newBuildOrder[largestSwapIndex];
  newBuildOrder[largestSwapIndex] = temp;
  const newTimeline = createAccountTimeline(chromosome.accountTimeline.start, newBuildOrder);
  const mutatedChromosome = {
    buildOrder: newBuildOrder,
    source: {
      ancestors: [],
      reason: `mutation by swap (index ${smallestSwapIndex} and ${largestSwapIndex})`,
    },
    accountTimeline: newTimeline,
  };
  return mutatedChromosome;

  // // Rebuild a new chromosome with the build items swaped
  // const mutatedChromosome = sliceChromosome(
  //   chromosome,
  //   {
  //     ancestors: [chromosome],
  //     reason: `mutation by swap (index ${smallestSwapIndex} and ${largestSwapIndex})`,
  //   },
  //   smallestSwapIndex
  // );
  // const accountTimeline = mutatedChromosome.accountTimeline;
  // const remainingBuildItems = chromosome.buildOrder.slice(smallestSwapIndex);
  // const temp = remainingBuildItems[0];
  // remainingBuildItems[0] = remainingBuildItems[largestSwapIndex - smallestSwapIndex];
  // remainingBuildItems[largestSwapIndex - smallestSwapIndex] = temp;
  // for (const buildItem of remainingBuildItems) {
  //   if (canBeNextBuildItemAppliedOnAccountTimeline(mutatedChromosome.accountTimeline, buildItem)) {
  //     // OK since we sliced the chromosome, which creates new `buildOrder` and `buildItemTimelines` references
  //     mutatedChromosome.buildOrder.push(buildItem);
  //     const account =
  //       accountTimeline.buildItemTimelines.length > 0
  //         ? getLastAccount(accountTimeline.buildItemTimelines)
  //         : mutatedChromosome.accountTimeline.start;
  //     accountTimeline.buildItemTimelines.push({
  //       buildItem,
  //       transitions: advanceAccountTowardBuildItem(account, buildItem),
  //     });
  //   } else {
  //     // eslint-disable-next-line no-debugger
  //     console.log('firstSwapIndex', firstSwapIndex);
  //     console.log('swapableIndexes', swapableIndexes);
  //     console.log('secondSwapIndex', secondSwapIndex);
  //     console.log('failed at', buildItemToString(buildItem));
  //     console.log('started with', chromosome);
  //     console.log('mutated so far', mutatedChromosome);
  //     debugger;
  //     throw new Error(`Should never happen`);
  //   }
  // }
  // mutatedChromosome.accountTimeline.currentAccount = getLastAccount(
  //   accountTimeline.buildItemTimelines
  // );
  // accountTimeline.buildItemTimelines[
  //   accountTimeline.buildItemTimelines.length - 1
  // ].transitions.push(...finishAllInProgress(mutatedChromosome.accountTimeline.currentAccount));
  // mutatedChromosome.accountTimeline.currentAccount = getLastAccount(
  //   accountTimeline.buildItemTimelines
  // );

  // return mutatedChromosome;
}
