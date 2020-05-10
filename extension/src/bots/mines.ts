import $ from 'jquery';

import {
  CrystalMine,
  CrystalStorage,
  DeuteriumSynthesizer,
  DeuteriumTank,
  MetalMine,
  MetalStorage,
  SolarPlant,
} from '@shared/models/building';

import {goToMines} from '@src/controllers/navigator';
import {ResourceAmount, ResourcesWithSum} from '@src/models/resources';
import {getAccount} from '@src/stores/account';
import {sum} from '@src/ui/utils';

const BOT_LOOP_TIME = 1000;
let interval: number | undefined;

const mineTechnologies = [
  MetalMine,
  CrystalMine,
  DeuteriumSynthesizer,
  SolarPlant,
  MetalStorage,
  CrystalStorage,
  DeuteriumTank,
];

function loop(): void {
  const account = getAccount();
  if (account === undefined || !account.bots.mines) {
    return;
  }

  for (const planet of account.planetList) {
    if (!account.planetDetails.hasOwnProperty(planet.id)) {
      continue;
    }
    const planetDetail = account.planetDetails[planet.id];
    let planetIsBuilding = false;
    let nextResources: ResourcesWithSum | undefined;
    let nextTechId: number | undefined;
    for (const techId in planetDetail.technologies) {
      if (planetDetail.technologies.hasOwnProperty(techId)) {
        const technology = planetDetail.technologies[techId];
        if (technology.target !== undefined) {
          planetIsBuilding = true;
          break;
        }
        for (const mineTechnology of mineTechnologies) {
          if (mineTechnology.id === technology.techId) {
            if (account.maxTechnologies.hasOwnProperty(technology.techId)) {
              const max = account.maxTechnologies[technology.techId];
              if (technology.value < max) {
                const cost = mineTechnology.cost(technology.value + 1);
                const resources: ResourcesWithSum = {
                  metal: (cost.metal as number) as ResourceAmount,
                  crystal: (cost.crystal as number) as ResourceAmount,
                  deuterium: (cost.deuterium as number) as ResourceAmount,
                  sum: sum([
                    (cost.metal as number) as ResourceAmount,
                    (cost.crystal as number) as ResourceAmount,
                    (cost.deuterium as number) as ResourceAmount,
                  ]),
                };
                if (
                  nextTechId === undefined ||
                  nextResources === undefined ||
                  resources.sum < nextResources.sum
                ) {
                  nextTechId = technology.techId;
                  nextResources = resources;
                }
              }
              break;
            }
          }
        }
      }
    }

    if (planetIsBuilding || nextResources === undefined || nextTechId === undefined) {
      continue;
    }

    if (
      planetDetail.resources.metal < nextResources.metal ||
      planetDetail.resources.crystal < nextResources.crystal ||
      planetDetail.resources.deuterium < nextResources.deuterium
    ) {
      continue;
    }

    if (
      !document.location.search.includes('component=supplies') ||
      account.currentPlanetId !== planet.id
    ) {
      goToMines(planet.id);
      return;
    }

    $(`#producers li[data-technology="${nextTechId}"] button.upgrade`).click();
  }
}

export function startMinesBot(): void {
  if (interval !== undefined) {
    return;
  }
  interval = setInterval(loop, BOT_LOOP_TIME);
}
