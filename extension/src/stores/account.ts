import {useEffect, useState} from 'react';

import {persist} from '@src/controllers/storage';
import {Account} from '@src/models/account';
import {ACCOUNT_TECHNOLOGIES, MAX_TECHNOLOGIES, SUM_PLANET} from '@src/models/constants';
import {Fleet, ReturnFlight} from '@src/models/fleets';
import {Planet, PlanetCoords, PlanetId, PlanetName} from '@src/models/planets';
import {ResourceAmount, Resources} from '@src/models/resources';
import {Tech} from '@src/models/tech';
import {Technology} from '@src/models/technologies';
import {sum} from '@src/ui/utils';

let currentAccount: Account | undefined;
const accountListeners: ((account: Account) => void)[] = [];

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
  planetList: Planet[],
  id: PlanetId,
  resources: Resources,
  technologies: Technology[],
  fleets: Fleet[]
): void {
  const account: Account = {
    planetList,
    planetDetails: currentAccount?.planetDetails ?? {},
    maxTechnologies: currentAccount?.maxTechnologies ?? {},
    accountTechnologies: currentAccount?.accountTechnologies ?? {},
    fleets: currentAccount?.fleets ?? {},
  };

  for (const fleet of fleets) {
    account.fleets[fleet.fleetId] = fleet;
  }

  const technologiesObj = currentAccount?.planetDetails[id]?.technologies ?? {};
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
  }

  const productionCoefficient =
    resources.resources.energy.amount >= 0
      ? 1
      : sum([
          resources.techs[Tech.SolarPlant].production.energy,
          resources.techs[Tech.SolarSatellite].production.energy,
        ]) /
        sum([
          resources.techs[Tech.MetalMine].consumption.energy,
          resources.techs[Tech.CrystalMine].consumption.energy,
          resources.techs[Tech.DeuteriumSynthesizer].consumption.energy,
        ]);

  account.planetDetails[id] = {
    id,
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
        resources.techs[Tech.MetalMine].production.metal * productionCoefficient,
      ]),
      crystal: sum([
        resources.resources.crystal.baseProduction,
        resources.techs[Tech.CrystalMine].production.crystal * productionCoefficient,
      ]),
      deuterium: sum([
        resources.resources.deuterium.baseProduction,
        resources.techs[Tech.DeuteriumSynthesizer].production.deuterium * productionCoefficient,
      ]),
    },
    technologies: technologiesObj,
  };

  account.planetList.push({
    id: SUM_PLANET as PlanetId,
    name: SUM_PLANET as PlanetName,
    coords: '[0:0:0]' as PlanetCoords,
  });

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

  for (const planetId in account.planetDetails) {
    if (account.planetDetails.hasOwnProperty(planetId) && planetId !== SUM_PLANET) {
      const planetDetails = account.planetDetails[planetId];
      metalResources += planetDetails.resources.metal;
      cystalResources += planetDetails.resources.crystal;
      deuteriumResources += planetDetails.resources.deuterium;
      energyResources += planetDetails.resources.energy;
      metalStorages += planetDetails.storages.metal;
      cystalStorages += planetDetails.storages.crystal;
      deuteriumStorages += planetDetails.storages.deuterium;
      metalProductions += planetDetails.productions.metal;
      crystalProductions += planetDetails.productions.crystal;
      deuteriumProductions += planetDetails.productions.deuterium;
    }
  }

  account.planetDetails[SUM_PLANET] = {
    id: SUM_PLANET as PlanetId,
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
  };

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
  };

  for (const planetId in currentAccount.planetDetails) {
    if (currentAccount.planetDetails.hasOwnProperty(planetId)) {
      const planet = currentAccount.planetDetails[planetId];
      account.planetDetails[planetId] = {
        id: planet.id,
        resources: {
          metal: sum([planet.resources.metal, planet.productions.metal]),
          crystal: sum([planet.resources.crystal, planet.productions.crystal]),
          deuterium: sum([planet.resources.deuterium, planet.productions.deuterium]),
          energy: planet.resources.energy,
        },
        productions: planet.productions,
        storages: planet.storages,
        technologies: planet.technologies,
      };
    }
  }

  const now = Math.floor(new Date().getTime() / 1000);
  for (const fleetId in currentAccount.fleets) {
    if (currentAccount.fleets.hasOwnProperty(fleetId)) {
      const fleet = currentAccount.fleets[fleetId];
      if (now >= fleet.midTime) {
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

  setAccount(account);
}

setInterval(applyProduction, 1000);
