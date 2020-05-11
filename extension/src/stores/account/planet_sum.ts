import {LargeCargo} from '@shared/models/ships';

import {AccountPlanet} from '@src/models/account';
import {PlanetId} from '@src/models/planets';
import {ResourceAmount} from '@src/models/resources';
import {sum} from '@src/ui/utils';

export function calcPlanetSum(planetDetails: {[planetId: string]: AccountPlanet}): AccountPlanet {
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
  let largeCargos = 0;

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
      if (planetDetail.ships.hasOwnProperty(LargeCargo.id)) {
        largeCargos += planetDetail.ships[LargeCargo.id].value;
      }
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
    ships: {
      [LargeCargo.id]: {
        techId: LargeCargo.id,
        value: largeCargos,
      },
    },
  };
}
