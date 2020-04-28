/* eslint-disable no-console */
import {Chromosome} from '@shared/algogen/chromosome';
import {
  generateInitialPopulation,
  GeneticOptions,
  nextGeneration,
} from '@shared/algogen/population';
import {createNewAccount} from '@shared/lib/account';
import {buildItemToString} from '@shared/lib/build_items';
import {BuildItem} from '@shared/models/build_item';
import {setupRapidFire, setupRequirements} from '@shared/models/dependencies';
import {SmallCargo} from '@shared/models/ships';
import {timeToString} from '@shared/models/time';
import {Rosalind} from '@shared/models/universe';

setupRapidFire();
setupRequirements();

function printChromosome(chromosome: Chromosome): void {
  console.log(
    `=== Time: ${timeToString(chromosome.accountTimeline.currentAccount.currentTime)} ===`
  );
  for (let i = 0; i < chromosome.buildOrder.length; i++) {
    const buildItem = chromosome.buildOrder[i];
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
  populationSize: 1000,
  topChromosomeCount: 10,
  swapMutationRate: 0.2,
  insertMutationRate: 0.2,
  deleteMutationRate: 0.2,
};

const generationCount = 30;

const start = Date.now();
let latestPopulation = generateInitialPopulation(account, smallCargoTarget, options);
const postInitial = Date.now();
console.log('generateInitialPopulation', `${(postInitial - start).toLocaleString()} ms`);
for (let i = 0; i < generationCount; i++) {
  // if (i % 10 === 0) {
  //   printChromosome(latestPopulation.topChromosomes[0]);
  // }
  const genStart = Date.now();
  latestPopulation = nextGeneration(latestPopulation, options);
  console.log(
    'nextGeneration',
    `${(Date.now() - genStart).toLocaleString()} ms`,
    'Best',
    timeToString(latestPopulation.topChromosomes[0].accountTimeline.currentAccount.currentTime)
  );
}
console.log(latestPopulation);
printChromosome(latestPopulation.topChromosomes[0]);
console.log('Total', `${(Date.now() - start).toLocaleString()} ms`);
