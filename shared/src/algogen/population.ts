import {Chromosome} from '@shared/algogen/chromosome';
import {crossover} from '@shared/algogen/crossover';
import {
  generateBuildOrder,
  randomWeightedNextBuildableRequirement,
} from '@shared/lib/random_build_order';
import {accountTimelineLibInPerfMode} from '@shared/lib/timeline';
import {Account} from '@shared/models/account';
import {BuildItem} from '@shared/models/build_item';

const {createAccountTimeline} = accountTimelineLibInPerfMode;

// Keep an history of the top `TOP_CHROMOSOME_COUNT` best chromosomes
const TOP_CHROMOSOME_COUNT = 10;

interface Population {
  generation: number;
  topChromosomes: Chromosome[];
  chromosomes: Chromosome[];
}

function getTopChromosomes(chromosomes: Chromosome[]): Chromosome[] {
  return chromosomes
    .sort(
      (c1, c2) =>
        c1.accountTimeline.currentAccount.currentTime -
        c2.accountTimeline.currentAccount.currentTime
    )
    .slice(0, TOP_CHROMOSOME_COUNT);
}

export function nextGeneration(population: Population): Population {
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

  const newTopChromosomes = getTopChromosomes(population.topChromosomes.concat(newChromosomes));

  return {
    generation: population.generation + 1,
    topChromosomes: newTopChromosomes,
    chromosomes: newChromosomes,
  };
}

export function generateInitialPopulation(
  account: Account,
  target: BuildItem,
  size: number
): Population {
  const chromosomes: Chromosome[] = [];
  while (chromosomes.length < size) {
    const buildOrder = generateBuildOrder(target, account, randomWeightedNextBuildableRequirement);
    try {
      const chromosome = {
        buildOrder,
        parents: ([] as unknown) as [Chromosome, Chromosome],
        accountTimeline: createAccountTimeline(account, buildOrder),
      };
      chromosomes.push(chromosome);
    } catch {
      // we're cool with it
    }
  }

  const topChromosomes = getTopChromosomes(chromosomes);
  return {generation: 0, chromosomes, topChromosomes};
}
