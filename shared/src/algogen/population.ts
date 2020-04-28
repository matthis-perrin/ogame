import {Chromosome} from '@shared/algogen/chromosome';
import {crossover} from '@shared/algogen/crossover';
import {mutationByInsert, mutationByRemove, mutationBySwap} from '@shared/algogen/mutation';
import {
  generateBuildOrder,
  randomWeightedNextBuildableRequirement,
} from '@shared/lib/random_build_order';
import {accountTimelineLibInPerfMode} from '@shared/lib/timeline';
import {Account} from '@shared/models/account';
import {BuildItem} from '@shared/models/build_item';

const {createAccountTimeline} = accountTimelineLibInPerfMode;

export interface GeneticOptions {
  // Keep an history of the top `TOP_CHROMOSOME_COUNT` best chromosomes
  topChromosomeCount: number;
  populationSize: number;
  swapMutationRate: number;
  insertMutationRate: number;
  deleteMutationRate: number;
}

interface Population {
  generation: number;
  topChromosomes: Chromosome[];
  chromosomes: Chromosome[];
}

function getTopChromosomes(chromosomes: Chromosome[], topChromosomeCount: number): Chromosome[] {
  return chromosomes
    .sort(
      (c1, c2) =>
        c1.accountTimeline.currentAccount.currentTime -
        c2.accountTimeline.currentAccount.currentTime
    )
    .slice(0, topChromosomeCount);
}

export function nextGeneration(population: Population, options: GeneticOptions): Population {
  let minCurrentTime = Infinity;
  let maxCurrentTime = 0;

  for (const chromosome of population.chromosomes) {
    const time = chromosome.accountTimeline.currentAccount.currentTime;
    if (time < minCurrentTime) {
      minCurrentTime = time;
    }
    if (time > maxCurrentTime) {
      maxCurrentTime = time;
    }
  }

  const chromosomesWithFitness: {chromosome: Chromosome; fitness: number}[] = [];
  let fitnessSum = 0;
  for (const chromosome of population.chromosomes) {
    const time = chromosome.accountTimeline.currentAccount.currentTime;
    const fitness = 1 - (time - minCurrentTime) / (maxCurrentTime - minCurrentTime);
    fitnessSum += fitness;
    chromosomesWithFitness.push({
      chromosome,
      fitness,
    });
  }

  console.log('===== FITNESSES =====');
  console.log(
    chromosomesWithFitness.sort((c1, c2) => c2.fitness - c1.fitness).map(({fitness}) => fitness)
  );
  console.log('=====================');

  function selectChromosome(banned?: Chromosome): Chromosome {
    const r = Math.random() * fitnessSum;
    let current = 0;
    for (const {chromosome, fitness} of chromosomesWithFitness) {
      current += fitness;
      if (r < current) {
        if (banned === chromosome) {
          return selectChromosome(banned);
        }
        return chromosome;
      }
    }
    throw new Error('Invalid fitness calculation');
  }

  const newChromosomes: Chromosome[] = [];
  while (newChromosomes.length < population.chromosomes.length) {
    const parent1 = selectChromosome();
    const parent2 = selectChromosome(parent1);
    const children = crossover(parent1, parent2);
    newChromosomes.push(...children);
  }
  const newTopChromosomes = getTopChromosomes(
    population.topChromosomes.concat(newChromosomes),
    options.topChromosomeCount
  );

  // Mutation phase
  const mutatedChromosome = newChromosomes.map(c => {
    let mutated = c;
    try {
      if (Math.random() < options.swapMutationRate) {
        mutated = mutationBySwap(c);
      }
      if (Math.random() < options.insertMutationRate) {
        mutated = mutationByInsert(c);
      }
      if (Math.random() < options.deleteMutationRate) {
        mutated = mutationByRemove(c);
      }
    } catch {
      // If a mutation creates a chromosome that dies, we'll just return the chromosome
      // before the mutation
    }
    return mutated;
  });
  const topChromosomesAfterMutations = getTopChromosomes(
    newTopChromosomes.concat(mutatedChromosome),
    options.topChromosomeCount
  );

  return {
    generation: population.generation + 1,
    topChromosomes: topChromosomesAfterMutations,
    chromosomes: mutatedChromosome,
  };
}

export function generateInitialPopulation(
  account: Account,
  target: BuildItem,
  options: GeneticOptions
): Population {
  const chromosomes: Chromosome[] = [];
  while (chromosomes.length < options.populationSize) {
    const buildOrder = generateBuildOrder(target, account, randomWeightedNextBuildableRequirement);
    try {
      const chromosome = {
        buildOrder,
        source: {ancestors: [], reason: 'initial population'},
        accountTimeline: createAccountTimeline(account, buildOrder),
      };
      chromosomes.push(chromosome);
    } catch {
      // we're cool with it
    }
  }

  const topChromosomes = getTopChromosomes(chromosomes, options.topChromosomeCount);
  return {generation: 0, chromosomes, topChromosomes};
}
