import {startEspionageBot} from '@src/bots/espionage';
import {startObjectivesBot} from '@src/bots/objectives';
import {Account} from '@src/models/account';
import {MissionTypeEnum} from '@src/models/fleets';
import {ResourceAmount} from '@src/models/resources';
import {getAccount, setAccount} from '@src/stores/account';
import {updateGhosts} from '@src/stores/account/ghost';
import {calcInFlightResources} from '@src/stores/account/inflight_resources';
import {updateObjectivesTransfers} from '@src/stores/account/objectives';
import {calcPlanetSum} from '@src/stores/account/planet_sum';
import {sum} from '@src/ui/utils';

export function applyProduction(): void {
  const currentAccount = getAccount();
  if (currentAccount === undefined) {
    return;
  }

  // Building next tick account
  const account: Account = {
    currentPlanetId: currentAccount.currentPlanetId,
    planetList: currentAccount.planetList,
    planetDetails: {},
    maxTechnologies: currentAccount.maxTechnologies,
    accountTechnologies: currentAccount.accountTechnologies,
    fleets: {},
    planetSum: undefined,
    constructions: currentAccount.constructions,
    inFlightResources: {},
    inFlightSum: {
      metal: 0 as ResourceAmount,
      crystal: 0 as ResourceAmount,
      deuterium: 0 as ResourceAmount,
      sum: 0 as ResourceAmount,
    },
    messages: currentAccount.messages,
    objectives: currentAccount.objectives,
    bots: currentAccount.bots,
    ghosts: currentAccount.ghosts,
    emptyPlanets: currentAccount.emptyPlanets,
  };

  // Using milliseconds to have below second UI refresh
  const nowMillis = new Date().getTime();
  const nowSeconds = Math.floor(nowMillis / 1000);

  // Calculating next tick resources
  for (const planetId in currentAccount.planetDetails) {
    if (currentAccount.planetDetails.hasOwnProperty(planetId)) {
      const planet = currentAccount.planetDetails[planetId];
      const elaspedSeconds = (nowMillis - planet.truth.serverTimeSeconds * 1000) / 1000;
      const metal = sum([planet.truth.metal, planet.productions.metal * elaspedSeconds]);
      const crystal = sum([planet.truth.crystal, planet.productions.crystal * elaspedSeconds]);
      const deuterium = sum([
        planet.truth.deuterium,
        planet.productions.deuterium * elaspedSeconds,
      ]);
      account.planetDetails[planetId] = {
        planetId: planet.planetId,
        truth: planet.truth,
        resources: {
          metal,
          crystal,
          deuterium,
          energy: planet.resources.energy,
          sum: sum([metal, crystal, deuterium]),
        },
        productions: planet.productions,
        storages: planet.storages,
        technologies: planet.technologies,
        ships: planet.ships,
      };
    }
  }

  // Calculating fleets status (inflight, return, finished)
  for (const fleetId in currentAccount.fleets) {
    if (currentAccount.fleets.hasOwnProperty(fleetId)) {
      const fleet = currentAccount.fleets[fleetId];
      if (nowSeconds >= fleet.arrivalTime) {
        // Auto-removing returning espionage fleets
        if (fleet.missionType === MissionTypeEnum.Espionage && fleet.returnFlight) {
          continue;
        }
      }
      account.fleets[fleetId] = fleet;
    }
  }

  // Calculate inflight resourses
  const [inFlightResources, inFlightSum] = calcInFlightResources(
    account.planetList,
    account.fleets
  );
  account.inFlightResources = inFlightResources;
  account.inFlightSum = inFlightSum;

  // Calculating new planet sum
  account.planetSum = calcPlanetSum(account.planetDetails);

  // Updating objectives start time
  updateObjectivesTransfers(account);

  // Update ghosts
  updateGhosts(account);

  // Start bots
  startObjectivesBot();
  startEspionageBot();

  setAccount(account);
}
