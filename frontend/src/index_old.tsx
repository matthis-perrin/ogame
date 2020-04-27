import {uniqBy} from 'lodash-es';
import React from 'react';
import ReactDOM from 'react-dom';

import {createNewAccount} from '@shared/lib/account';
import {buildableRequirementToString, buildItemToString} from '@shared/lib/build_items';
import {randomWeightedBuildOrderWithOnlyMines} from '@shared/lib/random_build_order';
import {
  computeRequirementTree,
  getRequirementTreeLeaves,
  isBuildItemAvailable,
} from '@shared/lib/requirement_tree';
import {
  createAccountTimelineInDebugMode,
  createAccountTimelineInPerfMode,
} from '@shared/lib/timeline';
import {Account} from '@shared/models/account';
import {BuildItem} from '@shared/models/build_item';
import {BuildableRequirement} from '@shared/models/buildable';
import {CrystalMine, DeuteriumSynthesizer, MetalMine} from '@shared/models/building';
import {setupRapidFire, setupRequirements} from '@shared/models/dependencies';
import {Planet, PlanetId} from '@shared/models/planet';
import {Destroyer, SmallCargo} from '@shared/models/ships';
import {Milliseconds, NEVER, timeToString} from '@shared/models/time';
import {AccountTimeline} from '@shared/models/timeline';
import {Rosalind} from '@shared/models/universe';
import {min, neverHappens, removeUndefined} from '@shared/utils/type_utils';

import {App} from '@src/lib/app';
import {setAppState} from '@src/lib/store';

setupRapidFire();
setupRequirements();

// setTimeout(() => {
//   const account = createNewAccount(Rosalind);
//   const mainPlanet = Array.from(account.planets.values())[0];
//   const {debugTimeline} = getAccountTimeline(
//     {type: 'ship', buildable: SmallCargo, planetId: mainPlanet.id, quantity: 1},
//     account
//   );
//   setAppState({accountTimeline: debugTimeline, selectedAccount: debugTimeline.start});
// });

// ReactDOM.render(<App></App>, document.getElementById('app'));

// const account = createNewAccount(Rosalind);
// const mainPlanet = Array.from(account.planets.values())[0];

// const sampleSize = 100000;
// const targetsToTest: BuildItem[] = [
//   {type: 'ship', buildable: SmallCargo, planetId: mainPlanet.id, quantity: 1},
//   // {type: 'ship', buildable: Destroyer, planetId: mainPlanet.id, quantity: 1},
// ];

// for (const target of targetsToTest) {
//   let debugTotalTime = 0;
//   let perfTotalTime = 0;
//   let bestTime = NEVER;
//   let failureCount = 0;
//   for (let i = 0; i < sampleSize; i++) {
//     try {
//       const debugTimeline = createAccountTimelineInDebugMode(
//         account,
//         getRandomBuildOrder(target, account)
//       );
//       const perfTimeline = createAccountTimelineInPerfMode(
//         account,
//         getRandomBuildOrder(target, account)
//       );
//       debugTotalTime += debugTimeline.computationTime;
//       perfTotalTime += perfTimeline.computationTime;
//       bestTime = min(bestTime, debugTimeline.end.currentTime, perfTimeline.end.currentTime);
//     } catch {
//       failureCount++;
//     }
//   }
//   console.log('Target:', target);
//   console.log('Failures:', failureCount);
//   console.log('Average computation time in debug mode', debugTotalTime / sampleSize);
//   console.log('Average computation time in perf mode', perfTotalTime / sampleSize);
//   console.log('Best time:', timeToString(bestTime));
// }

// const start = Date.now();
// console.log('Sample size:', sampleSize);
// for (const target of targetsToTest) {
//   let totalTime = 0;
//   let bestTime = NEVER;
//   let bestBuildOrder: BuildItem[] = [];
//   let failureCount = 0;
//   for (let i = 0; i < sampleSize; i++) {
//     try {
//       const buildOrder = randomWeightedBuildOrderWithOnlyMines(target, account);
//       const perfTimeline = createAccountTimelineInPerfMode(account, buildOrder);
//       totalTime += perfTimeline.computationTime;
//       if (perfTimeline.end.currentTime < bestTime) {
//         bestTime = perfTimeline.end.currentTime;
//         bestBuildOrder = buildOrder;
//       }
//     } catch {
//       failureCount++;
//     }
//   }
//   console.log('Target:', target);
//   console.log('Failures:', failureCount);
//   console.log('Average computation time', totalTime / sampleSize);
//   console.log('Best build order time:', timeToString(bestTime));
//   console.log('Best build order:');
//   console.log(
//     JSON.stringify(
//       bestBuildOrder.map(b => buildItemToString(b)),
//       undefined,
//       2
//     )
//   );
// }

// console.log('Total time:', Date.now() - start);

// console.log(randomWeightedBuildOrderWithOnlyMines(targetsToTest[0], account));

// Best build order time: 8h 14m 57s
// [
//   "Mine de métal lvl 1 on P1",
//   "Mine de cristal lvl 1 on P1",
//   "Mine de métal lvl 2 on P1",
//   "Mine de métal lvl 3 on P1",
//   "Mine de cristal lvl 2 on P1",
//   "Mine de métal lvl 4 on P1",
//   "Mine de cristal lvl 3 on P1",
//   "Mine de métal lvl 5 on P1",
//   "Synthétiseur de deutérium lvl 1 on P1",
//   "Mine de cristal lvl 4 on P1",
//   "Synthétiseur de deutérium lvl 2 on P1",
//   "Synthétiseur de deutérium lvl 3 on P1",
//   "Mine de métal lvl 6 on P1",
//   "Usine de robots lvl 1 on P1",
//   "Laboratoire de recherche lvl 1 on P1",
//   "Mine de cristal lvl 5 on P1",
//   "Synthétiseur de deutérium lvl 4 on P1",
//   "Usine de robots lvl 2 on P1",
//   "Technologie énergétique lvl 1 on P1",
//   "Synthétiseur de deutérium lvl 5 on P1",
//   "Réacteur à combustion lvl 1 on P1",
//   "Chantier spatial lvl 1 on P1",
//   "Réacteur à combustion lvl 2 on P1",
//   "Mine de cristal lvl 6 on P1",
//   "Chantier spatial lvl 2 on P1",
//   "Petit transporteur x 1 on P1"
// ]

// function buildItemsAreEqual(bi1: BuildItem, bi2: BuildItem): boolean {
//   if (bi1.type === 'building' && bi2.type === 'building') {
//     return bi1.buildable === bi2.buildable && bi1.level === bi2.level;
//   }
//   if (bi1.type === 'technology' && bi2.type === 'technology') {
//     return bi1.buildable === bi2.buildable && bi1.level === bi2.level;
//   }
//   if (bi1.type === 'ship' && bi2.type === 'ship') {
//     return bi1.buildable === bi2.buildable && bi1.quantity === bi2.quantity;
//   }
//   if (bi1.type === 'defense' && bi2.type === 'defense') {
//     return bi1.buildable === bi2.buildable && bi1.quantity === bi2.quantity;
//   }
//   return false;
// }

// interface ComputedBuildOrder {
//   buildOrder: BuildItem[];
//   timeline: AccountTimeline;
// }

// function buildRequirementToBuildItem(
//   requirement: BuildableRequirement,
//   planetId: PlanetId
// ): BuildItem {
//   if (requirement.entity.type === 'building') {
//     return {
//       type: 'building',
//       buildable: requirement.entity,
//       level: requirement.level,
//       planetId,
//     };
//   }
//   return {
//     type: 'technology',
//     buildable: requirement.entity,
//     level: requirement.level,
//     planetId,
//   };
// }

// function alreadyHasBuildItem(account: Account, planet: Planet, buildItem: BuildItem): boolean {
//   if (buildItem.type === 'technology') {
//     return (account.technologyLevels.get(buildItem.buildable) ?? 0) >= buildItem.level;
//   }
//   if (buildItem.type === 'building') {
//     return (planet.buildingLevels.get(buildItem.buildable) ?? 0) >= buildItem.level;
//   }
//   if (buildItem.type === 'ship') {
//     return (planet.ships.get(buildItem.buildable) ?? 0) >= buildItem.quantity;
//   }
//   if (buildItem.type === 'defense') {
//     return (planet.defenses.get(buildItem.buildable) ?? 0) >= buildItem.quantity;
//   }
//   neverHappens(buildItem, `Unknown build item type ${buildItem['type']}`);
// }

// function alreadyHasRequirement(account: Account, planet: Planet, requirement: BuildableRequirement): boolean {
//   if (requirement.entity.type === 'technology') {
//     return (account.technologyLevels.get(requirement.entity) ?? 0) >= requirement.level;
//   }
//   if (requirement.entity.type === 'building') {
//     return (planet.buildingLevels.get(requirement.entity) ?? 0) >= requirement.level;
//   }
//   neverHappens(requirement.entity, `Unknown build item type ${requirement.entity['type']}`);
// }

// function getEssentialBuildItems(account: Account, planet: Planet, target: BuildItem): BuildItem[] {
//   const buildItems: BuildItem[] = [];
//   if (alreadyHasBuildItem(account, planet, target)) {
//     return buildItems;
//   }
//   if (target.type === 'technology' || target.type === 'building') {
//     if (target.level > 1) {
//       return getEssentialBuildItems(account, planet, {...target, level: 1});
//     }
//   }
//   if (isBuildItemAvailable(account, target).isAvailable) {
//     return [target];
//   }
//   for (const requirement of target.buildable.requirements) {
//     const requirementAsBuildItem = buildRequirementToBuildItem(requirement, planet.id);
//     if (alreadyHasBuildItem(account, planet, requirementAsBuildItem)) {
//       continue;
//     } else if (isBuildItemAvailable(account, requirementAsBuildItem).isAvailable) {
//       buildItems.push(requirementAsBuildItem);
//     } else {
//       buildItems.push(...getEssentialBuildItems(account, planet, requirementAsBuildItem));
//     }
//   }
//   return buildItems;
// }

// function nextIteration(
//   target: BuildItem,
//   currentBuildOrders: ComputedBuildOrder[],
//   bestSoFar: Milliseconds
// ): {unfinished: ComputedBuildOrder[]; best?: ComputedBuildOrder} {
//   // For each possible new build items, and current build orders, create a new one
//   const newBuildOrders: {buildOrder: ComputedBuildOrder; isFinished: boolean}[] = [];
//   for (const {buildOrder, timeline} of currentBuildOrders) {
//     const account = timeline.end;
//     const planet = Array.from(account.planets.values())[0];
//     // Get available mines on the planet
//     const availableMines: BuildItem[] = [
//       {
//         type: 'building',
//         buildable: MetalMine,
//         level: (planet.buildingLevels.get(MetalMine) ?? 0) + 1,
//         planetId: planet.id,
//       },
//       {
//         type: 'building',
//         buildable: CrystalMine,
//         level: (planet.buildingLevels.get(CrystalMine) ?? 0) + 1,
//         planetId: planet.id,
//       },
//       {
//         type: 'building',
//         buildable: DeuteriumSynthesizer,
//         level: (planet.buildingLevels.get(DeuteriumSynthesizer) ?? 0) + 1,
//         planetId: planet.id,
//       },
//     ];

//     // Compute and merge essential build items and remove the duplicates
//     const availableItems = uniqBy(
//       [...availableMines, ...getEssentialBuildItems(account, planet, target)],
//       buildItemToString
//     );

//     for (const buildItem of availableItems) {
//       try {
//         const newTimeline = createAccountTimelineInPerfMode(timeline.end, [buildItem]);
//         newBuildOrders.push({
//           buildOrder: {
//             buildOrder: [...buildOrder, buildItem],
//             timeline: newTimeline,
//           },
//           isFinished: buildItemsAreEqual(buildItem, target),
//         });
//       } catch {
//         //
//       }
//     }
//   }

//   const newBestTime: Milliseconds = bestSoFar;
//   let newBestTimeline: ComputedBuildOrder | undefined;
//   const withoutFinished: ComputedBuildOrder[] = removeUndefined(
//     newBuildOrders.map(({buildOrder, isFinished}) => {
//       if (isFinished) {
//         if (buildOrder.timeline.end.currentTime < newBestTime) {
//           newBestTimeline = buildOrder;
//         }
//         return undefined; // No need to continue with the build order since it is finished
//       }
//       return buildOrder;
//     })
//   );

//   const toKeep = withoutFinished
//     .filter(
//       bo => bo.timeline.end.currentTime < bestSoFar && bo.timeline.end.currentTime < 9 * 3600 * 1000
//     )
//     .sort((bo1, bo2) => bo1.timeline.end.currentTime - bo2.timeline.end.currentTime);
//   // .slice(0, 10000);

//   return {unfinished: toKeep, best: newBestTimeline};
// }

// function start(): void {
//   const target = targetsToTest[0];
//   let bestTime: Milliseconds = NEVER;
//   let best: ComputedBuildOrder = {
//     buildOrder: [],
//     timeline: {start: account, end: account, transitions: [], computationTime: 0},
//   };
//   let res = nextIteration(target, [best], NEVER);
//   while (res.unfinished.length > 0) {
//     debugger;
//     console.log(timeToString(bestTime));
//     res = nextIteration(target, res.unfinished, bestTime);
//     if (res.best !== undefined) {
//       best = res.best;
//       bestTime = best.timeline.end.currentTime;
//     }
//   }
//   console.log(best);
//   console.log(timeToString(bestTime));
// }

// start();
