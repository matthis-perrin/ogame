/* eslint-disable no-console */
import {Chromosome} from '@shared/algogen/chromosome';
import {mutationByInsert, mutationByRemove} from '@shared/algogen/mutation';
import {generateInitialPopulation, nextGeneration} from '@shared/algogen/population';
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

let latestPopulation = generateInitialPopulation(account, smallCargoTarget, 10);
for (let i = 0; i < 2; i++) {
  console.log(
    `=== Time: ${timeToString(
      latestPopulation.topChromosomes[0].accountTimeline.currentAccount.currentTime
    )} ===`
  );
  // if (i % 10 === 0) {
  //   printChromosome(latestPopulation.topChromosomes[0]);
  // }
  latestPopulation = nextGeneration(latestPopulation);
}
console.log(latestPopulation);
printChromosome(latestPopulation.topChromosomes[0]);
console.log('mutationByInsert');
console.log(mutationByInsert(latestPopulation.topChromosomes[0]));
console.log('mutationByRemove');
console.log(mutationByRemove(latestPopulation.topChromosomes[0]));
