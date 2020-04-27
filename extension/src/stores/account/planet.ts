import {CrystalMine, DeuteriumSynthesizer, MetalMine, SolarPlant} from '@shared/models/building';
import {SolarSatellite} from '@shared/models/ships';

import {Account} from '@src/models/account';
import {ACCOUNT_TECHNOLOGIES, MAX_TECHNOLOGIES} from '@src/models/constants';
import {Fleet, MissionTypeEnum} from '@src/models/fleets';
import {Message} from '@src/models/messages';
import {findPlanetId, Planet, PlanetId} from '@src/models/planets';
import {ResourceAmount, Resources} from '@src/models/resources';
import {generateConstructionId, Technology} from '@src/models/technologies';
import {getAccount, setAccount} from '@src/stores/account';
import {calcInFlightResources} from '@src/stores/account/inflight_resources';
import {calcPlanetSum} from '@src/stores/account/planet_sum';
import {sum} from '@src/ui/utils';

export function addPlanet(
  serverTimeSeconds: number,
  planetList: Planet[],
  planetId: PlanetId,
  resources: Resources,
  technologies: Technology[],
  ships: Technology[] | undefined,
  fleets: Fleet[],
  messages: Message[] | undefined
): void {
  const currentAccount = getAccount();

  const account: Account = {
    currentPlanetId: planetId,
    planetList,
    planetDetails: currentAccount?.planetDetails ?? {},
    maxTechnologies: currentAccount?.maxTechnologies ?? {},
    accountTechnologies: currentAccount?.accountTechnologies ?? {},
    fleets: {},
    constructions: currentAccount?.constructions ?? {},
    planetSum: undefined,
    inFlightResources: {},
    inFlightSum: {
      metal: 0 as ResourceAmount,
      crystal: 0 as ResourceAmount,
      deuterium: 0 as ResourceAmount,
      sum: 0 as ResourceAmount,
    },
    messages: {},
    objectives: currentAccount?.objectives,
    bots: currentAccount?.bots ?? {objectives: undefined, espionage: undefined},
  };

  // Retrieve messages or replace with new ones
  let messagesObj = currentAccount?.messages ?? {};
  if (messages !== undefined) {
    messagesObj = {};
    for (const message of messages) {
      messagesObj[message.messageId] = message;
    }
  }
  account.messages = messagesObj;

  // Clean old fleets
  const oldFleets = currentAccount?.fleets ?? {};
  const nowSeconds = Math.floor(new Date().getTime() / 1000);
  for (const fleetId in oldFleets) {
    if (oldFleets.hasOwnProperty(fleetId)) {
      const fleet = oldFleets[fleetId];
      if (nowSeconds >= fleet.arrivalTime) {
        const destPlanetId = findPlanetId(planetList, fleet.destinationName);
        // Auto-removing returning attacking/transporting fleets when on fleet page of destination planet
        if (
          (fleet.missionType === MissionTypeEnum.Attacking ||
            fleet.missionType === MissionTypeEnum.Transport ||
            fleet.missionType === MissionTypeEnum.Expedition) &&
          fleet.returnFlight &&
          document.location.search.includes('component=fleetdispatch') &&
          destPlanetId === planetId
        ) {
          continue;
        }
        // Auto-removing deploying fleets when on fleet page of destination planet
        if (
          fleet.missionType === MissionTypeEnum.Deployment &&
          document.location.search.includes('component=fleetdispatch') &&
          destPlanetId === planetId
        ) {
          continue;
        }
        // Auto-removing non-returning transport fleets when on any page of destination planet
        if (
          fleet.missionType === MissionTypeEnum.Transport &&
          !fleet.returnFlight &&
          destPlanetId === planetId
        ) {
          continue;
        }
        // Auto-removing non-returning attacking/expedition/espionage/transporting-to-external fleets when on messages page
        if (
          (fleet.missionType === MissionTypeEnum.Attacking ||
            fleet.missionType === MissionTypeEnum.Expedition ||
            fleet.missionType === MissionTypeEnum.Espionage ||
            (fleet.missionType === MissionTypeEnum.Transport && destPlanetId === undefined)) &&
          !fleet.returnFlight &&
          document.location.search.includes('page=messages')
        ) {
          continue;
        }
      } else {
        // Check fleet cancellation and removing if needed
        let fleetStillAvailable = false;
        for (const newFleet of fleets) {
          if (newFleet.fleetId === fleetId) {
            fleetStillAvailable = true;
            break;
          }
        }
        if (!fleetStillAvailable) {
          continue;
        }
      }
      account.fleets[fleetId] = fleet;
    }
  }

  // Add all fleets
  for (const fleet of fleets) {
    account.fleets[fleet.fleetId] = fleet;
  }

  // Handling resources for transport return
  for (const fleetId in account.fleets) {
    if (account.fleets.hasOwnProperty(fleetId)) {
      const fleet = account.fleets[fleetId];
      if (fleet.missionType === MissionTypeEnum.Transport && fleet.returnFlight) {
        // IDs are incremental
        const notReturningFleetId = parseFloat(fleetId) - 1;
        if (account.fleets.hasOwnProperty(notReturningFleetId)) {
          const notReturningFleet = account.fleets[notReturningFleetId];
          if (
            notReturningFleet.missionType === MissionTypeEnum.Transport &&
            !notReturningFleet.returnFlight &&
            notReturningFleet.destinationCoords === fleet.originCoords &&
            notReturningFleet.originCoords === fleet.destinationCoords
          ) {
            fleet.resources = {
              metal: 0 as ResourceAmount,
              crystal: 0 as ResourceAmount,
              deuterium: 0 as ResourceAmount,
              sum: 0 as ResourceAmount,
            };
          }
        }
      }
    }
  }

  // Calculate inflight resourses
  const [inFlightResources, inFlightSum] = calcInFlightResources(
    account.planetList,
    account.fleets
  );
  account.inFlightResources = inFlightResources;
  account.inFlightSum = inFlightSum;

  // Handle new constructions
  const handleConstruction = (t: Technology): void => {
    if (t.target !== undefined && t.targetEndSeconds !== undefined) {
      // Override planetId for researches
      let constructionPlanetId = planetId;
      if (t.constructionPlanetName !== undefined) {
        const maybePlanetId = findPlanetId(planetList, t.constructionPlanetName);
        if (maybePlanetId !== undefined) {
          constructionPlanetId = maybePlanetId;
        }
      }
      // Generate unique ID
      const constructionId = generateConstructionId(constructionPlanetId, t.techId);
      // Overriding existing constructions
      // Info: this doesn't remove finished constructions
      account.constructions[constructionId] = {
        constructionId,
        planetId: constructionPlanetId,
        techId: t.techId,
        value: t.value,
        target: t.target,
        targetEndSeconds: t.targetEndSeconds,
      };
      // Exception: don't update constructions on fleet page
    } else if (!document.location.search.includes('component=fleetdispatch')) {
      // Removing finished constructions because it is getting updating with new technology info
      const constructionId = generateConstructionId(planetId, t.techId);
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete account.constructions[constructionId];
    }
  };

  // Retrieve ships or replace with new ones
  let shipsObj = currentAccount?.planetDetails[planetId]?.ships ?? {};
  // ships === undefined => no ships parsed
  // ships === [] => no more ships (destroyed or inflight)
  if (ships !== undefined) {
    shipsObj = {};
    for (const ship of ships) {
      // Exception: solar satellites cannot move, adding them to all other technologies
      if (ship.techId === SolarSatellite.id) {
        technologies.push(ship);
      } else {
        shipsObj[ship.techId] = ship;
        handleConstruction(ship);
      }
    }
  }

  // Retrieve technologies and add new ones
  const technologiesObj = currentAccount?.planetDetails[planetId]?.technologies ?? {};
  for (const technology of technologies) {
    // Account level technologies => researches
    if (ACCOUNT_TECHNOLOGIES.includes(technology.techId)) {
      account.accountTechnologies[technology.techId] = technology;
    } else {
      technologiesObj[technology.techId] = technology;
      // MAX_TECHNOLOGIES => list of technologies to match on all planets (mines, storages, factories...)
      if (MAX_TECHNOLOGIES.includes(technology.techId)) {
        if (
          !account.maxTechnologies.hasOwnProperty(technology.techId) ||
          technology.value > account.maxTechnologies[technology.techId]
        ) {
          account.maxTechnologies[technology.techId] = technology.value;
        }
      }
    }
    handleConstruction(technology);
  }

  // Calculating production coefficient to handle missing energy
  const productionCoefficient =
    resources.resources.energy.amount >= 0
      ? 1
      : sum([
          resources.techs[SolarPlant.id].production.energy,
          resources.techs[SolarSatellite.id].production.energy,
        ]) /
        sum([
          resources.techs[MetalMine.id].consumption.energy,
          resources.techs[CrystalMine.id].consumption.energy,
          resources.techs[DeuteriumSynthesizer.id].consumption.energy,
        ]);

  // Saving planet data
  const metalProd = sum([
    resources.resources.metal.baseProduction,
    resources.techs[MetalMine.id].production.metal * productionCoefficient,
  ]);
  const crystalProd = sum([
    resources.resources.crystal.baseProduction,
    resources.techs[CrystalMine.id].production.crystal * productionCoefficient,
  ]);
  const deuteriumProd = sum([
    resources.resources.deuterium.baseProduction,
    resources.techs[DeuteriumSynthesizer.id].production.deuterium * productionCoefficient,
  ]);
  account.planetDetails[planetId] = {
    planetId,
    truth: {
      serverTimeSeconds,
      metal: resources.resources.metal.amount,
      crystal: resources.resources.crystal.amount,
      deuterium: resources.resources.deuterium.amount,
    },
    resources: {
      metal: resources.resources.metal.amount,
      crystal: resources.resources.crystal.amount,
      deuterium: resources.resources.deuterium.amount,
      energy: resources.resources.energy.amount,
      sum: sum([
        resources.resources.metal.amount,
        resources.resources.crystal.amount,
        resources.resources.deuterium.amount,
      ]),
    },
    storages: {
      metal: resources.resources.metal.storage,
      crystal: resources.resources.crystal.storage,
      deuterium: resources.resources.deuterium.storage,
      sum: sum([
        resources.resources.metal.storage,
        resources.resources.crystal.storage,
        resources.resources.deuterium.storage,
      ]),
    },
    productions: {
      metal: metalProd,
      crystal: crystalProd,
      deuterium: deuteriumProd,
      sum: sum([metalProd, crystalProd, deuteriumProd]),
    },
    technologies: technologiesObj,
    ships: shipsObj,
  };

  // Calculating planet sum of everything (resources, storages, productions...)
  account.planetSum = calcPlanetSum(account.planetDetails);

  // Saving to local storage + refreshing UI
  setAccount(account);
}
