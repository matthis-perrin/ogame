import {useEffect, useState} from 'react';

import {CrystalMine, DeuteriumSynthesizer, MetalMine, SolarPlant} from '@shared/models/building';
import {SolarSatellite} from '@shared/models/ships';

import {persist} from '@src/controllers/storage';
import {Account, AccountPlanet} from '@src/models/account';
import {ACCOUNT_TECHNOLOGIES, MAX_TECHNOLOGIES, UI_REFRESH_RATE} from '@src/models/constants';
import {Fleet, MissionTypeEnum} from '@src/models/fleets';
import {Message} from '@src/models/messages';
import {findPlanetId, Planet, PlanetId} from '@src/models/planets';
import {ResourceAmount, Resources, ResourcesWithSum} from '@src/models/resources';
import {generateConstructionId, Technology, TechnologyIndex} from '@src/models/technologies';
import {sum} from '@src/ui/utils';

let currentAccount: Account | undefined;
const accountListeners: ((account: Account) => void)[] = [];

function calcPlanetSum(planetDetails: {[planetId: string]: AccountPlanet}): AccountPlanet {
  let metalResources = 0;
  let cystalResources = 0;
  let deuteriumResources = 0;
  let energyResources = 0;
  let metalStorages = 0;
  let cystalStorages = 0;
  let deuteriumStorages = 0;
  let metalProductions = 0;
  let crystalProductions = 0;
  let deuteriumProductions = 0;

  for (const planetId in planetDetails) {
    if (planetDetails.hasOwnProperty(planetId)) {
      const planetDetail = planetDetails[planetId];
      metalResources += planetDetail.resources.metal;
      cystalResources += planetDetail.resources.crystal;
      deuteriumResources += planetDetail.resources.deuterium;
      energyResources += planetDetail.resources.energy;
      metalStorages += planetDetail.storages.metal;
      cystalStorages += planetDetail.storages.crystal;
      deuteriumStorages += planetDetail.storages.deuterium;
      metalProductions += planetDetail.productions.metal;
      crystalProductions += planetDetail.productions.crystal;
      deuteriumProductions += planetDetail.productions.deuterium;
    }
  }

  return {
    planetId: 'SUM' as PlanetId,
    truth: {
      serverTimeSeconds: 0,
      metal: 0 as ResourceAmount,
      crystal: 0 as ResourceAmount,
      deuterium: 0 as ResourceAmount,
    },
    resources: {
      metal: metalResources as ResourceAmount,
      crystal: cystalResources as ResourceAmount,
      deuterium: deuteriumResources as ResourceAmount,
      energy: energyResources as ResourceAmount,
      sum: sum([metalResources, cystalResources, deuteriumResources]),
    },
    storages: {
      metal: metalStorages as ResourceAmount,
      crystal: cystalStorages as ResourceAmount,
      deuterium: deuteriumStorages as ResourceAmount,
      sum: sum([metalStorages, cystalStorages, deuteriumStorages]),
    },
    productions: {
      metal: metalProductions as ResourceAmount,
      crystal: crystalProductions as ResourceAmount,
      deuterium: deuteriumProductions as ResourceAmount,
      sum: sum([metalProductions, crystalProductions, deuteriumProductions]),
    },
    technologies: {},
    ships: {},
  };
}

function calcInFlightResources(
  planetList: Planet[],
  fleets: {
    [fleetId: string]: Fleet;
  }
): [{[planetCoords: string]: ResourcesWithSum}, ResourcesWithSum] {
  const inFlightResources: {[planetCoords: string]: ResourcesWithSum} = {};
  const inFlightSum: ResourcesWithSum = {
    metal: 0 as ResourceAmount,
    crystal: 0 as ResourceAmount,
    deuterium: 0 as ResourceAmount,
    sum: 0 as ResourceAmount,
  };

  const planetIndex: Set<string> = new Set();
  planetList.forEach(planet => planetIndex.add(planet.coords));

  for (const fleetId in fleets) {
    if (fleets.hasOwnProperty(fleetId)) {
      const fleet = fleets[fleetId];
      const inFlight = inFlightResources.hasOwnProperty(fleet.destinationCoords)
        ? inFlightResources[fleet.destinationCoords]
        : {
            metal: 0 as ResourceAmount,
            crystal: 0 as ResourceAmount,
            deuterium: 0 as ResourceAmount,
            sum: 0 as ResourceAmount,
          };
      inFlight.metal = sum([inFlight.metal, fleet.resources.metal]);
      inFlight.crystal = sum([inFlight.crystal, fleet.resources.crystal]);
      inFlight.deuterium = sum([inFlight.deuterium, fleet.resources.deuterium]);
      inFlight.sum = sum([inFlight.metal, inFlight.crystal, inFlight.deuterium]);
      inFlightResources[fleet.destinationCoords] = inFlight;
      if (planetIndex.has(fleet.destinationCoords)) {
        inFlightSum.metal = sum([inFlightSum.metal, fleet.resources.metal]);
        inFlightSum.crystal = sum([inFlightSum.crystal, fleet.resources.crystal]);
        inFlightSum.deuterium = sum([inFlightSum.deuterium, fleet.resources.deuterium]);
        inFlightSum.sum = sum([inFlightSum.sum, fleet.resources.sum]);
      }
    }
  }

  return [inFlightResources, inFlightSum];
}

export function setAccount(account: Account, persistent = true): void {
  currentAccount = account;
  if (persistent) {
    persist(account);
  }
  for (const listener of accountListeners) {
    listener(currentAccount);
  }
}

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

export function addObjectives(planetId: PlanetId, technology: Technology): void {
  if (currentAccount === undefined) {
    return;
  }
  let objectives = currentAccount.objectives;
  if (objectives === undefined) {
    objectives = {
      planetId,
      technologies: [],
      neededResources: {
        metal: 0 as ResourceAmount,
        crystal: 0 as ResourceAmount,
        deuterium: 0 as ResourceAmount,
        sum: 0 as ResourceAmount,
      },
      resourceTransfers: [],
    };
  }
  if (planetId !== objectives.planetId && objectives.technologies.length > 0) {
    return;
  }
  // Handle uniqueness
  if (objectives.technologies.find(_ => _.techId === technology.techId) !== undefined) {
    return;
  }
  objectives.technologies.push(technology);
  currentAccount.objectives = objectives;
  setAccount(currentAccount);
}

export function useAccount(): [Account | undefined] {
  const [account, setInternalAccount] = useState(currentAccount);
  useEffect(() => {
    if (account !== currentAccount) {
      setInternalAccount(currentAccount);
    }
    accountListeners.push(setInternalAccount);
    return () => {
      accountListeners.splice(accountListeners.indexOf(setInternalAccount), 1);
    };
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */
  return [account];
}

function applyProduction(): void {
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
    constructions: {},
    inFlightResources: {},
    inFlightSum: {
      metal: 0 as ResourceAmount,
      crystal: 0 as ResourceAmount,
      deuterium: 0 as ResourceAmount,
      sum: 0 as ResourceAmount,
    },
    messages: currentAccount.messages,
    objectives: currentAccount.objectives,
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
      // Handling resources for transport return
      if (fleet.missionType === MissionTypeEnum.Transport && fleet.returnFlight) {
        // IDs are incremental
        const notReturningFleetId = parseFloat(fleetId) - 1;
        if (currentAccount.fleets.hasOwnProperty(notReturningFleetId)) {
          const notReturningFleet = currentAccount.fleets[notReturningFleetId];
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

  // Calculating constructions
  for (const constructionId in currentAccount.constructions) {
    if (currentAccount.constructions.hasOwnProperty(constructionId)) {
      const construction = currentAccount.constructions[constructionId];
      if (nowSeconds >= construction.targetEndSeconds) {
        // TODO: Handle construction end
      }
      account.constructions[constructionId] = construction;
    }
  }

  // Calculating new planet sum
  account.planetSum = calcPlanetSum(account.planetDetails);

  // Calculating objectives
  if (account.objectives !== undefined) {
    account.objectives.neededResources = {
      metal: 0 as ResourceAmount,
      crystal: 0 as ResourceAmount,
      deuterium: 0 as ResourceAmount,
      sum: 0 as ResourceAmount,
    };
    for (const technology of account.objectives.technologies) {
      const smartTech = TechnologyIndex.get(technology.techId);
      if (smartTech === undefined || technology.target === undefined) {
        continue;
      }
      if (smartTech.type === 'ship' || smartTech.type === 'defense') {
        continue;
      }
      const resources = smartTech.cost(technology.target);
      account.objectives.neededResources.metal = sum([
        account.objectives.neededResources.metal,
        resources.metal,
      ]);
      account.objectives.neededResources.crystal = sum([
        account.objectives.neededResources.crystal,
        resources.crystal,
      ]);
      account.objectives.neededResources.deuterium = sum([
        account.objectives.neededResources.deuterium,
        resources.deuterium,
      ]);
    }
    let inflight: ResourcesWithSum = {
      metal: 0 as ResourceAmount,
      crystal: 0 as ResourceAmount,
      deuterium: 0 as ResourceAmount,
      sum: 0 as ResourceAmount,
    };
    const planetCoords = account.planetList.find(p => p.id === account.objectives?.planetId)
      ?.coords;
    if (planetCoords !== undefined && account.inFlightResources.hasOwnProperty(planetCoords)) {
      inflight = account.inFlightResources[planetCoords];
    }
    account.objectives.resourceTransfers = [];
    let metalSent = 0;
    let crystalSent = 0;
    let deuteriumSent = 0;
    const planetDetails = Object.keys(account.planetDetails).map(key => account.planetDetails[key]);
    planetDetails.sort((a, b) => b.resources.sum - a.resources.sum);
    for (const planet of planetDetails) {
      if (planet.planetId === account.objectives.planetId) {
        metalSent += planet.resources.metal;
        crystalSent += planet.resources.crystal;
        deuteriumSent += planet.resources.deuterium;
        continue;
      }
      const metalToSend = Math.min(
        Math.max(0, account.objectives.neededResources.metal - inflight.metal - metalSent),
        planet.resources.metal
      );
      const crystalToSend = Math.min(
        Math.max(0, account.objectives.neededResources.crystal - inflight.crystal - crystalSent),
        planet.resources.crystal
      );
      const deuteriumToSend = Math.min(
        Math.max(
          0,
          account.objectives.neededResources.deuterium - inflight.deuterium - deuteriumSent
        ),
        planet.resources.deuterium
      );
      account.objectives.resourceTransfers.push({
        from: planet.planetId,
        to: account.objectives.planetId,
        resources: {
          metal: metalToSend as ResourceAmount,
          crystal: crystalToSend as ResourceAmount,
          deuterium: deuteriumToSend as ResourceAmount,
          sum: sum([metalToSend, crystalToSend, deuteriumToSend]),
        },
      });
      metalSent += metalToSend;
      crystalSent += crystalToSend;
      deuteriumSent += deuteriumToSend;
    }
  }

  setAccount(account);
}

setInterval(applyProduction, UI_REFRESH_RATE);
