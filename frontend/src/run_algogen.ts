/* eslint-disable no-console */
import {
  generateInitialPopulation,
  GeneticOptions,
  injectBest,
  nextGeneration,
  Population,
} from '@shared/algogen/population';
import {createNewAccount} from '@shared/lib/account';
import {buildItemToString} from '@shared/lib/build_items';
import {accountTimelineLibInDebugMode} from '@shared/lib/timeline';
import {
  BuildingBuildItem,
  BuildItem,
  DefenseBuildItem,
  ShipBuildItem,
  TechnologyBuildItem,
} from '@shared/models/build_item';
import {SmallCargo} from '@shared/models/ships';
import {timeToString} from '@shared/models/time';
import {AccountTimeline} from '@shared/models/timeline';
import {Rosalind} from '@shared/models/universe';

const {createAccountTimeline} = accountTimelineLibInDebugMode;

export function run(): void {
  function printTopChromosome(population: Population): void {
    const c = population.topChromosomes[0];
    console.log(`=== Best time: ${timeToString(c.accountTimeline.currentAccount.currentTime)} ===`);
    for (let i = 0; i < c.buildOrder.length; i++) {
      const buildItem = c.buildOrder[i];
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

  const options: GeneticOptions = {
    startAccount: account,
    target: smallCargoTarget,
    newRandomPerGeneration: 100,
    populationSize: 300,
    elitismCount: 10,
    topChromosomeCount: 10,
    swapMutationRate: 0.2,
    insertMutationRate: 0.2,
    deleteMutationRate: 0.2,
  };

  const generationCount = 10000;

  const start = Date.now();
  let latestPopulation = generateInitialPopulation(options);
  //   injectGoodChromosomes(latestPopulation, options);
  injectBest(latestPopulation, options);
  const postInitial = Date.now();
  console.log('generateInitialPopulation', `${(postInitial - start).toLocaleString()} ms`);
  for (let i = 0; i < generationCount; i++) {
    if (i % 10 === 0) {
      printTopChromosome(latestPopulation);
    }
    const genStart = Date.now();
    latestPopulation = nextGeneration(latestPopulation, options);
    const topFitness = timeToString(
      latestPopulation.topChromosomes[0].accountTimeline.currentAccount.currentTime
    );
    console.log(
      `Generation took ${(Date.now() - genStart).toLocaleString()} ms - Best fitness ${topFitness}`
    );
    document.title = topFitness;
  }
  console.log(latestPopulation);
  printTopChromosome(latestPopulation);
  console.log('Total', `${(Date.now() - start).toLocaleString()} ms`);
}

export function naiveAccountTimeline(
  target:
    | Omit<ShipBuildItem, 'planetId'>
    | Omit<DefenseBuildItem, 'planetId'>
    | Omit<BuildingBuildItem, 'planetId'>
    | Omit<TechnologyBuildItem, 'planetId'>
): AccountTimeline {
  const account = createNewAccount(Rosalind);
  const mainPlanet = Array.from(account.planets.values())[0];

  const options: GeneticOptions = {
    startAccount: account,
    target: {...target, planetId: mainPlanet.id} as BuildItem,
    newRandomPerGeneration: 0,
    populationSize: 10,
    elitismCount: 0,
    topChromosomeCount: 1,
    swapMutationRate: 0,
    insertMutationRate: 0,
    deleteMutationRate: 0,
  };

  const {topChromosomes} = generateInitialPopulation(options);
  // Regenerate in debug mode
  return createAccountTimeline(account, topChromosomes[0].buildOrder);
}
