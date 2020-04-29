/* eslint-disable no-console */
import {Chromosome} from '@shared/algogen/chromosome';
import {getGoodBuildOrders} from '@shared/algogen/good_build_orders';
import {mutationByInsert, mutationByRemove, mutationBySwap} from '@shared/algogen/mutation';
import {createNewAccount} from '@shared/lib/account';
import {buildItemToString} from '@shared/lib/build_items';
import {accountTimelineLibInPerfMode} from '@shared/lib/timeline';
import {BuildItem} from '@shared/models/build_item';
import {
  CrystalMine,
  DeuteriumSynthesizer,
  MetalMine,
  ResearchLab,
  RoboticsFactory,
  Shipyard,
} from '@shared/models/building';
import {SmallCargo} from '@shared/models/ships';
import {CombustionDrive, EnergyTechnology} from '@shared/models/technology';
import {timeToString} from '@shared/models/time';
import {Rosalind} from '@shared/models/universe';

const {createAccountTimeline} = accountTimelineLibInPerfMode;

export function localOptim(): void {
  const account = createNewAccount(Rosalind);
  const mainPlanet = Array.from(account.planets.values())[0];

  let chromosomes: Chromosome[] = [];

  for (const buildOrder of getGoodBuildOrders(mainPlanet.id)) {
    const accountTimeline = createAccountTimeline(account, buildOrder);
    const chromosome = {
      buildOrder,
      source: {ancestors: [], reason: 'from hardcoded build order'},
      accountTimeline,
    };
    chromosomes.push(chromosome);
  }

  let i = 0;

  while (true) {
    chromosomes = chromosomes.map(c => {
      let mutated = c;
      let mutationApplied = true;
      const mutationProba = 0.2;
      try {
        while (mutationApplied) {
          mutationApplied = false;
          if (Math.random() < mutationProba) {
            mutated = mutationBySwap(c);
            mutationApplied = true;
          }
          if (Math.random() < mutationProba) {
            mutated = mutationByInsert(c);
            mutationApplied = true;
          }
          if (Math.random() < mutationProba) {
            mutated = mutationByRemove(c);
            mutationApplied = true;
          }
        }
      } catch {
        // Ok
      }

      if (
        mutated.accountTimeline.currentAccount.currentTime <
        c.accountTimeline.currentAccount.currentTime
      ) {
        console.log('Better!');
        return mutated;
      }
      return c;
    });

    if (i % (1 * 100) === 0) {
      console.log(chromosomes.map(c => timeToString(c.accountTimeline.currentAccount.currentTime)));
      const best = chromosomes.reduce(
        (currentBest, curr) =>
          curr.accountTimeline.currentAccount.currentTime <
          currentBest.accountTimeline.currentAccount.currentTime
            ? curr
            : currentBest,
        chromosomes[0]
      );
      console.log(
        i.toLocaleString(),
        timeToString(best.accountTimeline.currentAccount.currentTime)
      );
      console.log(best.buildOrder.map(bi => buildItemToString(bi)));
    }
    i++;
  }
}

export function test(): void {
  const account = createNewAccount(Rosalind);
  const mainPlanet = Array.from(account.planets.values())[0];
  const planetId = mainPlanet.id;

  const buildOrders: BuildItem[][] = [
    [
      {type: 'building', buildable: MetalMine, level: 1, planetId},
      {type: 'building', buildable: MetalMine, level: 2, planetId},
      {type: 'building', buildable: MetalMine, level: 3, planetId},
      {type: 'building', buildable: MetalMine, level: 4, planetId},
      {type: 'building', buildable: CrystalMine, level: 1, planetId},
      {type: 'building', buildable: MetalMine, level: 5, planetId},
      {type: 'building', buildable: CrystalMine, level: 2, planetId},
      {type: 'building', buildable: DeuteriumSynthesizer, level: 1, planetId},
      {type: 'building', buildable: CrystalMine, level: 3, planetId},
      {type: 'building', buildable: DeuteriumSynthesizer, level: 2, planetId},
      {type: 'building', buildable: MetalMine, level: 6, planetId},
      {type: 'building', buildable: CrystalMine, level: 4, planetId},
      {type: 'building', buildable: DeuteriumSynthesizer, level: 3, planetId},
      {type: 'building', buildable: DeuteriumSynthesizer, level: 4, planetId},
      {type: 'building', buildable: CrystalMine, level: 5, planetId},
      {type: 'building', buildable: DeuteriumSynthesizer, level: 5, planetId},
      {type: 'building', buildable: ResearchLab, level: 1, planetId},
      {type: 'building', buildable: CrystalMine, level: 6, planetId},
      {type: 'building', buildable: RoboticsFactory, level: 1, planetId},
      {type: 'building', buildable: RoboticsFactory, level: 2, planetId},
      {type: 'technology', buildable: EnergyTechnology, level: 1, planetId},
      {type: 'technology', buildable: CombustionDrive, level: 1, planetId},
      {type: 'building', buildable: Shipyard, level: 1, planetId},
      {type: 'technology', buildable: CombustionDrive, level: 2, planetId},
      {type: 'building', buildable: Shipyard, level: 2, planetId},
      {type: 'ship', buildable: SmallCargo, quantity: 1, planetId},
    ],
    [
      {type: 'building', buildable: MetalMine, level: 1, planetId},
      {type: 'building', buildable: MetalMine, level: 2, planetId},
      {type: 'building', buildable: MetalMine, level: 3, planetId},
      {type: 'building', buildable: MetalMine, level: 4, planetId},
      {type: 'building', buildable: CrystalMine, level: 1, planetId},
      {type: 'building', buildable: MetalMine, level: 5, planetId},
      {type: 'building', buildable: CrystalMine, level: 2, planetId},
      {type: 'building', buildable: DeuteriumSynthesizer, level: 1, planetId},
      {type: 'building', buildable: CrystalMine, level: 3, planetId},
      {type: 'building', buildable: DeuteriumSynthesizer, level: 2, planetId},
      {type: 'building', buildable: MetalMine, level: 6, planetId},
      {type: 'building', buildable: CrystalMine, level: 4, planetId},
      {type: 'building', buildable: DeuteriumSynthesizer, level: 3, planetId},
      {type: 'building', buildable: DeuteriumSynthesizer, level: 4, planetId},
      {type: 'building', buildable: CrystalMine, level: 5, planetId},
      {type: 'building', buildable: DeuteriumSynthesizer, level: 5, planetId},
      {type: 'building', buildable: CrystalMine, level: 6, planetId},
      {type: 'building', buildable: MetalMine, level: 7, planetId},
      {type: 'building', buildable: ResearchLab, level: 1, planetId},
      {type: 'building', buildable: RoboticsFactory, level: 1, planetId},
      {type: 'building', buildable: RoboticsFactory, level: 2, planetId},
      {type: 'technology', buildable: EnergyTechnology, level: 1, planetId},
      {type: 'technology', buildable: CombustionDrive, level: 1, planetId},
      {type: 'building', buildable: Shipyard, level: 1, planetId},
      {type: 'technology', buildable: CombustionDrive, level: 2, planetId},
      {type: 'building', buildable: Shipyard, level: 2, planetId},
      {type: 'ship', buildable: SmallCargo, quantity: 1, planetId},
    ],
    // [
    //   {type: 'building', buildable: MetalMine, level: 1, planetId},
    //   // {type: 'building', buildable: 'CES', level: 1, planetId},
    //   {type: 'building', buildable: MetalMine, level: 2, planetId},
    //   // {type: 'building', buildable: 'CES', level: 2, planetId},
    //   {type: 'building', buildable: MetalMine, level: 3, planetId},
    //   {type: 'building', buildable: MetalMine, level: 4, planetId},
    //   // {type: 'building', buildable: 'CES', level: 3, planetId},
    //   {type: 'building', buildable: MetalMine, level: 5, planetId},
    //   // {type: 'building', buildable: 'CES', level: 4, planetId},
    //   {type: 'building', buildable: CrystalMine, level: 1, planetId},
    //   {type: 'building', buildable: CrystalMine, level: 2, planetId},
    //   {type: 'building', buildable: CrystalMine, level: 3, planetId},
    //   // {type: 'building', buildable: 'CES', level: 5, planetId},
    //   {type: 'building', buildable: MetalMine, level: 6, planetId},
    //   {type: 'building', buildable: CrystalMine, level: 4, planetId},
    //   // {type: 'building', buildable: 'CES', level: 6, planetId},
    //   {type: 'building', buildable: DeuteriumSynthesizer, level: 1, planetId},
    //   {type: 'building', buildable: DeuteriumSynthesizer, level: 2, planetId},
    //   {type: 'building', buildable: DeuteriumSynthesizer, level: 3, planetId},
    //   // {type: 'building', buildable: 'CES', level: 7, planetId},
    //   {type: 'building', buildable: DeuteriumSynthesizer, level: 4, planetId},
    //   // {type: 'building', buildable: 'CES', level: 8, planetId},
    //   {type: 'building', buildable: DeuteriumSynthesizer, level: 5, planetId},
    //   {type: 'building', buildable: CrystalMine, level: 5, planetId},
    //   // CHPROD 90/1/0/100
    //   {type: 'building', buildable: ResearchLab, level: 1, planetId},
    //   {type: 'technology', buildable: EnergyTechnology, level: 1, planetId},
    //   {type: 'technology', buildable: CombustionDrive, level: 1, planetId},
    //   {type: 'technology', buildable: CombustionDrive, level: 2, planetId},
    //   {type: 'building', buildable: RoboticsFactory, level: 1, planetId},
    //   {type: 'building', buildable: RoboticsFactory, level: 2, planetId},
    //   {type: 'building', buildable: Shipyard, level: 1, planetId},
    //   {type: 'building', buildable: Shipyard, level: 2, planetId},
    //   {type: 'ship', buildable: SmallCargo, quantity: 1, planetId},
    // ],
    // [
    //   {type: 'building', buildable: MetalMine, level: 1, planetId},
    //   {type: 'building', buildable: MetalMine, level: 2, planetId},
    //   {type: 'building', buildable: MetalMine, level: 3, planetId},
    //   {type: 'building', buildable: MetalMine, level: 4, planetId},
    //   {type: 'building', buildable: CrystalMine, level: 1, planetId},
    //   {type: 'building', buildable: MetalMine, level: 5, planetId},
    //   {type: 'building', buildable: CrystalMine, level: 2, planetId},
    //   {type: 'building', buildable: CrystalMine, level: 3, planetId},
    //   {type: 'building', buildable: DeuteriumSynthesizer, level: 1, planetId},
    //   {type: 'building', buildable: CrystalMine, level: 4, planetId},
    //   {type: 'building', buildable: MetalMine, level: 6, planetId},
    //   {type: 'building', buildable: MetalMine, level: 7, planetId},
    //   {type: 'building', buildable: CrystalMine, level: 5, planetId},
    //   {type: 'building', buildable: DeuteriumSynthesizer, level: 2, planetId},
    //   {type: 'building', buildable: DeuteriumSynthesizer, level: 3, planetId},
    //   {type: 'building', buildable: DeuteriumSynthesizer, level: 4, planetId},
    //   {type: 'building', buildable: DeuteriumSynthesizer, level: 5, planetId},
    //   {type: 'building', buildable: RoboticsFactory, level: 1, planetId},
    //   {type: 'building', buildable: RoboticsFactory, level: 2, planetId},
    //   {type: 'building', buildable: ResearchLab, level: 1, planetId},
    //   {type: 'building', buildable: Shipyard, level: 1, planetId},
    //   {type: 'building', buildable: CrystalMine, level: 6, planetId},
    //   {type: 'building', buildable: Shipyard, level: 2, planetId},
    //   {type: 'building', buildable: DeuteriumSynthesizer, level: 6, planetId},
    //   {type: 'building', buildable: MetalMine, level: 8, planetId},
    //   {type: 'technology', buildable: EnergyTechnology, level: 1, planetId},
    //   {type: 'technology', buildable: CombustionDrive, level: 1, planetId},
    //   {type: 'building', buildable: CrystalMine, level: 7, planetId},
    //   {type: 'building', buildable: MetalMine, level: 9, planetId},
    //   {type: 'technology', buildable: CombustionDrive, level: 2, planetId},
    //   {type: 'ship', buildable: SmallCargo, quantity: 1, planetId},
    // ],
  ];

  for (const buildOrder of buildOrders) {
    const accountTimeline = createAccountTimeline(account, buildOrder);
    console.log(accountTimeline, timeToString(accountTimeline.currentAccount.currentTime));
  }
}
