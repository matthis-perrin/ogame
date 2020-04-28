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
  // The account we start with (starting point before applying build order items)
  startAccount: Account;
  // The target buildable we want at the end of the build order
  target: BuildItem;
  // Keep an history of the top `TOP_CHROMOSOME_COUNT` best chromosomes
  topChromosomeCount: number;
  // How many chromosomes in the population
  populationSize: number;
  // How many of the top chromosomes are always kept in the population
  elitismCount: number;
  // Insert new random chromosome to the generation before computing the next one
  newRandomPerGeneration: number;
  // Probability for a child chromosome to go through a mutation by swap after a crossover
  swapMutationRate: number;
  // Probability for a child chromosome to go through a mutation by insertion after a crossover
  insertMutationRate: number;
  // Probability for a child chromosome to go through a mutation by deletion after a crossover
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

  for (let index = 0; index < options.newRandomPerGeneration; index++) {
    const buildOrder = generateBuildOrder(
      options.target,
      options.startAccount,
      randomWeightedNextBuildableRequirement
    );
    try {
      const chromosome = {
        buildOrder,
        source: {ancestors: [], reason: 'initial population'},
        accountTimeline: createAccountTimeline(options.startAccount, buildOrder),
      };
      population.chromosomes.push(chromosome);
    } catch {
      // we're cool with it
    }
  }

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
  while (newChromosomes.length < options.populationSize - options.elitismCount) {
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
    chromosomes: [
      ...mutatedChromosome,
      ...topChromosomesAfterMutations.slice(0, options.elitismCount),
    ],
  };
}

export function generateInitialPopulation(options: GeneticOptions): Population {
  const chromosomes: Chromosome[] = [];
  while (chromosomes.length < options.populationSize) {
    const buildOrder = generateBuildOrder(
      options.target,
      options.startAccount,
      randomWeightedNextBuildableRequirement
    );
    try {
      const chromosome = {
        buildOrder,
        source: {ancestors: [], reason: 'initial population'},
        accountTimeline: createAccountTimeline(options.startAccount, buildOrder),
      };
      chromosomes.push(chromosome);
    } catch {
      // we're cool with it
    }
  }

  const topChromosomes = getTopChromosomes(chromosomes, options.topChromosomeCount);
  return {generation: 0, chromosomes, topChromosomes};
}
