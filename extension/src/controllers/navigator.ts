import {SpeedModifier} from '@shared/models/coordinates';

import {MissionTypeEnum} from '@src/models/fleets';
import {getCoords, PlanetCoords, PlanetId} from '@src/models/planets';
import {BaseResources} from '@src/models/resources';
import {TechnologyIndex} from '@src/models/technologies';

export function goToTechnology(techId: number, planetId: PlanetId): void {
  const buildable = TechnologyIndex.get(techId);
  if (buildable === undefined) {
    return;
  }
  window.location.href = `${document.location.origin}${document.location.pathname}?page=ingame&component=${buildable.component}&cp=${planetId}`;
}

export function goToResources(planetId: PlanetId): void {
  window.location.href = `${document.location.origin}${document.location.pathname}?page=resourceSettings&cp=${planetId}`;
}

export function goToOverview(planetId: PlanetId): void {
  window.location.href = `${document.location.origin}${document.location.pathname}?page=ingame&component=overview&cp=${planetId}`;
}

export function goToFleets(): void {
  window.location.href = `${document.location.origin}${document.location.pathname}?page=ingame&component=movement`;
}

export function goToResearch(): void {
  window.location.href = `${document.location.origin}${document.location.pathname}?page=ingame&component=research`;
}

export function goToMines(planetId: PlanetId): void {
  window.location.href = `${document.location.origin}${document.location.pathname}?page=ingame&component=supplies&cp=${planetId}`;
}

export function goToFactories(planetId: PlanetId): void {
  window.location.href = `${document.location.origin}${document.location.pathname}?page=ingame&component=facilities&cp=${planetId}`;
}

export function goToDefenses(planetId: PlanetId): void {
  window.location.href = `${document.location.origin}${document.location.pathname}?page=ingame&component=defenses&cp=${planetId}`;
}

export function goToShips(planetId: PlanetId): void {
  window.location.href = `${document.location.origin}${document.location.pathname}?page=ingame&component=fleetdispatch&cp=${planetId}`;
}

export function goToGalaxy(planetCoords: PlanetCoords): void {
  const coords = getCoords(planetCoords);
  window.location.href = `${document.location.origin}${document.location.pathname}?page=ingame&component=galaxy&galaxy=${coords.galaxy}&system=${coords.solarSystem}&position=${coords.position}`;
}

export function goToMessages(planetId?: PlanetId): void {
  window.location.href = `${document.location.origin}${document.location.pathname}?page=messages${
    planetId !== undefined ? `&cp=${planetId}` : ''
  }`;
}

export function sendLargeCargosUrl(
  from: PlanetId,
  planetCoords: PlanetCoords,
  missionType: MissionTypeEnum,
  amount: number,
  auto: boolean,
  resources: BaseResources | undefined,
  speedModifier: SpeedModifier
): string {
  const coords = getCoords(planetCoords);
  const url = `${document.location.origin}${
    document.location.pathname
  }?page=ingame&component=fleetdispatch&galaxy=${coords.galaxy}&system=${
    coords.solarSystem
  }&position=${
    coords.position
  }&type=1&mission=${missionType}&am203=${amount}&cp=${from}&speed=${speedModifier *
    10}&auto=${auto}${
    resources !== undefined
      ? `&metal=${Math.ceil(resources.metal)}&crystal=${Math.ceil(
          resources.crystal
        )}&deuterium=${Math.ceil(resources.deuterium)}`
      : ''
  }`;
  return url;
}

export function sendGhostUrl(
  from: PlanetId,
  planetCoords: PlanetCoords,
  slowTechId: number,
  speedModifier: SpeedModifier,
  auto: boolean
): string {
  const coords = getCoords(planetCoords);
  const url =
    `${document.location.origin}${document.location.pathname}?page=ingame&component=fleetdispatch` +
    `&galaxy=${coords.galaxy}&system=${coords.solarSystem}&position=${coords.position}&type=1` +
    `&mission=${MissionTypeEnum.Deployment}&am203=999999&am210=999999&am${slowTechId}=999999&cp=${from}` +
    `&resources=all&speed=${speedModifier * 10}&auto=${auto}`;
  return url;
}

export function goToUrl(url: string): void {
  window.location.href = url;
}
