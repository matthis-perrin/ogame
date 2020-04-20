import {useEffect, useState} from 'react';

import {CrystalMine, DeuteriumSynthesizer, MetalMine, SolarPlant} from '@shared/models/building';
import {SolarSatellite} from '@shared/models/ships';

import {persist} from '@src/controllers/storage';
import {Account, AccountPlanet, findPlanetId} from '@src/models/account';
import {ACCOUNT_TECHNOLOGIES, MAX_TECHNOLOGIES, UI_REFRESH_RATE} from '@src/models/constants';
import {Fleet, ReturnFlight} from '@src/models/fleets';
import {Planet, PlanetId} from '@src/models/planets';
import {ResourceAmount, Resources} from '@src/models/resources';
import {generateConstructionId, Technology} from '@src/models/technologies';
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
    },
    storages: {
      metal: metalStorages as ResourceAmount,
      crystal: cystalStorages as ResourceAmount,
      deuterium: deuteriumStorages as ResourceAmount,
    },
    productions: {
      metal: metalProductions as ResourceAmount,
      crystal: crystalProductions as ResourceAmount,
      deuterium: deuteriumProductions as ResourceAmount,
    },
    technologies: {},
    ships: {},
  };
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
  fleets: Fleet[]
): void {
  const account: Account = {
    planetList,
    planetDetails: currentAccount?.planetDetails ?? {},
    maxTechnologies: currentAccount?.maxTechnologies ?? {},
    accountTechnologies: currentAccount?.accountTechnologies ?? {},
    fleets: currentAccount?.fleets ?? {},
    planetSum: undefined,
    constructions: currentAccount?.constructions ?? {},
  };

  for (const fleet of fleets) {
    account.fleets[fleet.fleetId] = fleet;
  }

  let shipsObj = currentAccount?.planetDetails[planetId]?.ships ?? {};
  if (ships !== undefined) {
    shipsObj = {};
    for (const ship of ships) {
      if (ship.techId === SolarSatellite.id) {
        technologies.push(ship);
      } else {
        shipsObj[ship.techId] = ship;
      }
    }
  }

  const technologiesObj = currentAccount?.planetDetails[planetId]?.technologies ?? {};
  for (const technology of technologies) {
    if (ACCOUNT_TECHNOLOGIES.includes(technology.techId)) {
      account.accountTechnologies[technology.techId] = technology;
    } else {
      technologiesObj[technology.techId] = technology;
      if (MAX_TECHNOLOGIES.includes(technology.techId)) {
        if (
          !account.maxTechnologies.hasOwnProperty(technology.techId) ||
          technology.value > account.maxTechnologies[technology.techId]
        ) {
          account.maxTechnologies[technology.techId] = technology.value;
        }
      }
    }
    if (technology.target !== undefined && technology.targetEndSeconds !== undefined) {
      const constructionId = generateConstructionId(planetId, technology.techId);
      let constructionPlanetId = planetId;
      if (technology.constructionPlanetName !== undefined) {
        const maybePlanetId = findPlanetId(planetList, technology.constructionPlanetName);
        if (maybePlanetId !== undefined) {
          constructionPlanetId = maybePlanetId;
        }
      }
      account.constructions[constructionId] = {
        constructionId,
        planetId: constructionPlanetId,
        techId: technology.techId,
        value: technology.value,
        target: technology.target,
        targetEndSeconds: technology.targetEndSeconds,
      };
    }
  }

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
    },
    storages: {
      metal: resources.resources.metal.storage,
      crystal: resources.resources.crystal.storage,
      deuterium: resources.resources.deuterium.storage,
    },
    productions: {
      metal: sum([
        resources.resources.metal.baseProduction,
        resources.techs[MetalMine.id].production.metal * productionCoefficient,
      ]),
      crystal: sum([
        resources.resources.crystal.baseProduction,
        resources.techs[CrystalMine.id].production.crystal * productionCoefficient,
      ]),
      deuterium: sum([
        resources.resources.deuterium.baseProduction,
        resources.techs[DeuteriumSynthesizer.id].production.deuterium * productionCoefficient,
      ]),
    },
    technologies: technologiesObj,
    ships: shipsObj,
  };

  account.planetSum = calcPlanetSum(account.planetDetails);

  setAccount(account);
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

  const account: Account = {
    planetList: currentAccount.planetList,
    planetDetails: {},
    maxTechnologies: currentAccount.maxTechnologies,
    accountTechnologies: currentAccount.accountTechnologies,
    fleets: {},
    planetSum: undefined,
    constructions: {},
  };

  const nowMillis = new Date().getTime();
  const nowSeconds = Math.floor(nowMillis / 1000);

  for (const planetId in currentAccount.planetDetails) {
    if (currentAccount.planetDetails.hasOwnProperty(planetId)) {
      const planet = currentAccount.planetDetails[planetId];
      const elaspedSeconds = (nowMillis - planet.truth.serverTimeSeconds * 1000) / 1000;
      account.planetDetails[planetId] = {
        planetId: planet.planetId,
        truth: planet.truth,
        resources: {
          metal: sum([planet.truth.metal, planet.productions.metal * elaspedSeconds]),
          crystal: sum([planet.truth.crystal, planet.productions.crystal * elaspedSeconds]),
          deuterium: sum([planet.truth.deuterium, planet.productions.deuterium * elaspedSeconds]),
          energy: planet.resources.energy,
        },
        productions: planet.productions,
        storages: planet.storages,
        technologies: planet.technologies,
        ships: planet.ships,
      };
    }
  }

  for (const fleetId in currentAccount.fleets) {
    if (currentAccount.fleets.hasOwnProperty(fleetId)) {
      const fleet = currentAccount.fleets[fleetId];
      if (nowSeconds >= fleet.midTime) {
        if (fleet.returnFlight) {
          // TODO: Handle resource drop
          continue;
        }
        fleet.returnFlight = true as ReturnFlight;
        fleet.midTime = fleet.arrivalTime;
      }
      account.fleets[fleetId] = fleet;
    }
  }

  for (const constructionId in currentAccount.constructions) {
    if (currentAccount.constructions.hasOwnProperty(constructionId)) {
      const construction = currentAccount.constructions[constructionId];
      if (nowSeconds >= construction.targetEndSeconds) {
        // TODO: Handle construction end
        continue;
      }
      account.constructions[constructionId] = construction;
    }
  }

  account.planetSum = calcPlanetSum(account.planetDetails);

  setAccount(account);
}

setInterval(applyProduction, UI_REFRESH_RATE);
