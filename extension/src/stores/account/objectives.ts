import {getDistance, getFlightDuration} from '@shared/lib/formula';
import {getShipDrive} from '@shared/lib/ships';
import {Class} from '@shared/models/account';
import {multiplyResources, Resources} from '@shared/models/resource';
import {LargeCargo} from '@shared/models/ships';
import {CombustionDrive, HyperspaceDrive, ImpulseDrive} from '@shared/models/technology';
import {Rosalind} from '@shared/models/universe';

import {Account} from '@src/models/account';
import {MissionTypeEnum} from '@src/models/fleets';
import {findPlanetCoords, findPlanetName, getCoords, PlanetId} from '@src/models/planets';
import {ResourceAmount} from '@src/models/resources';
import {Technology, TechnologyIndex} from '@src/models/technologies';
import {getAccount, setAccount} from '@src/stores/account';
import {calcInFlightResources} from '@src/stores/account/inflight_resources';
import {sum} from '@src/ui/utils';

type ResourceType = 'metal' | 'crystal' | 'deuterium';

interface ResourceInfo {
  amount: number;
  production: number;
  future: number;
  inflight: number;
}

interface PlanetInfo {
  planetId: PlanetId;
  timeFromOriginSeconds: number;
  resources: Map<ResourceType, ResourceInfo>;
}

function timeBeforeSendingSeconds(
  targetAmount: number,
  longestTimeSeconds: number,
  planetInfos: PlanetInfo[],
  resourceType: ResourceType
): number {
  let resourceSum = 0;
  let productionSum = 0;
  for (const planetInfo of planetInfos) {
    const resourceInfo = planetInfo.resources.get(resourceType);
    if (resourceInfo === undefined) {
      continue;
    }
    resourceSum +=
      (longestTimeSeconds - planetInfo.timeFromOriginSeconds) * resourceInfo.production +
      resourceInfo.amount +
      resourceInfo.inflight;
    productionSum += resourceInfo.production;
  }
  return Math.max(0, Math.ceil((targetAmount - resourceSum) / productionSum));
}

function remainingResourcePerPlanet(
  resourceType: ResourceType,
  planetInfos: PlanetInfo[],
  target: number
): number {
  // Sorting planets by future resource asc
  planetInfos.sort(
    (a, b) =>
      (a.resources.get(resourceType)?.future ?? 0) - (b.resources.get(resourceType)?.future ?? 0)
  );

  // Calculating total resources
  let total = 0;
  for (const planetInfo of planetInfos) {
    total += planetInfo.resources.get(resourceType)?.future ?? 0;
  }

  // Remaining resources = (TOTAL - TARGET) / NUMBEROFPLANETS
  let remaining = Math.floor((total - target) / planetInfos.length);
  for (let i = 0; i < planetInfos.length; i++) {
    const planetInfo = planetInfos[i];
    const resource = planetInfo.resources.get(resourceType);
    // Not enough resource on planet, we remove it from calculation and continue until it works
    if (resource !== undefined && resource.future < remaining) {
      total -= resource.future;
      remaining = Math.floor((total - target) / (planetInfos.length - i - 1));
      continue;
    }
    break;
  }

  return remaining;
}

export function updateObjectives(account: Account): void {
  const objectives = account.objectives;
  if (objectives === undefined) {
    return;
  }
  const nowSeconds = Math.floor(new Date().getTime() / 1000);

  // Calculating total resource cost
  objectives.neededResources = {
    metal: 0 as ResourceAmount,
    crystal: 0 as ResourceAmount,
    deuterium: 0 as ResourceAmount,
    sum: 0 as ResourceAmount,
  };
  for (const technology of objectives.technologies) {
    const smartTech = TechnologyIndex.get(technology.techId);
    if (smartTech === undefined || technology.target === undefined) {
      continue;
    }
    let resources: Resources;
    if (smartTech.type === 'ship' || smartTech.type === 'defense' || smartTech.type === 'stock') {
      resources = multiplyResources(smartTech.cost, technology.target - technology.value);
    } else {
      resources = smartTech.cost(technology.target);
    }
    objectives.neededResources.metal = sum([objectives.neededResources.metal, resources.metal]);
    objectives.neededResources.crystal = sum([
      objectives.neededResources.crystal,
      resources.crystal,
    ]);
    objectives.neededResources.deuterium = sum([
      objectives.neededResources.deuterium,
      resources.deuterium,
    ]);
  }

  // Calculating Large Cargo speed
  const combustionLevel = account.accountTechnologies.hasOwnProperty(CombustionDrive.id)
    ? account.accountTechnologies[CombustionDrive.id].value
    : 0;
  const impulseLevel = account.accountTechnologies.hasOwnProperty(ImpulseDrive.id)
    ? account.accountTechnologies[ImpulseDrive.id].value
    : 0;
  const hyperLevel = account.accountTechnologies.hasOwnProperty(HyperspaceDrive.id)
    ? account.accountTechnologies[HyperspaceDrive.id].value
    : 0;
  const shipDrive = getShipDrive(
    LargeCargo,
    Rosalind,
    combustionLevel,
    impulseLevel,
    hyperLevel,
    Class.Collector
  );

  // Calculating inflight resources
  const [inFlightResources] = calcInFlightResources(account.planetList, account.fleets);

  // Calculating resource transfers
  const planetInfos: PlanetInfo[] = [];
  let longestTimeSeconds = 0;
  const planetCoords = account.planetList.find(p => p.id === objectives?.planetId)?.coords;
  if (planetCoords !== undefined) {
    for (const planet of account.planetList) {
      let timeFromOriginSeconds = 0;
      if (planet.id !== objectives.planetId) {
        const distance = getDistance(getCoords(planetCoords), getCoords(planet.coords), Rosalind);
        timeFromOriginSeconds = Math.floor(
          getFlightDuration(distance, shipDrive.speed, 1, Rosalind) / 1000
        );
      }
      const resources: Map<ResourceType, ResourceInfo> = new Map();
      if (account.planetDetails.hasOwnProperty(planet.id)) {
        const planetDetail = account.planetDetails[planet.id];
        resources.set('metal', {
          amount: planetDetail.resources.metal,
          production: planetDetail.productions.metal,
          future: 0,
          inflight: inFlightResources.hasOwnProperty(planet.coords)
            ? inFlightResources[planet.coords].metal
            : 0,
        });
        resources.set('crystal', {
          amount: planetDetail.resources.crystal,
          production: planetDetail.productions.crystal,
          future: 0,
          inflight: inFlightResources.hasOwnProperty(planet.coords)
            ? inFlightResources[planet.coords].crystal
            : 0,
        });
        resources.set('deuterium', {
          amount: planetDetail.resources.deuterium,
          production: planetDetail.productions.deuterium,
          future: 0,
          inflight: inFlightResources.hasOwnProperty(planet.coords)
            ? inFlightResources[planet.coords].deuterium
            : 0,
        });
      }
      planetInfos.push({
        planetId: planet.id,
        timeFromOriginSeconds,
        resources,
      });
      if (timeFromOriginSeconds > longestTimeSeconds) {
        longestTimeSeconds = timeFromOriginSeconds;
      }
    }
  }

  // Calculating resources timings
  objectives.readyTimeSeconds.metal =
    nowSeconds +
    timeBeforeSendingSeconds(
      objectives.neededResources.metal,
      longestTimeSeconds,
      planetInfos,
      'metal'
    );
  objectives.readyTimeSeconds.crystal =
    nowSeconds +
    timeBeforeSendingSeconds(
      objectives.neededResources.crystal,
      longestTimeSeconds,
      planetInfos,
      'crystal'
    );
  objectives.readyTimeSeconds.deuterium =
    nowSeconds +
    timeBeforeSendingSeconds(
      objectives.neededResources.deuterium,
      longestTimeSeconds,
      planetInfos,
      'deuterium'
    );
  objectives.readyTimeSeconds.max = Math.max(
    objectives.readyTimeSeconds.metal,
    objectives.readyTimeSeconds.crystal,
    objectives.readyTimeSeconds.deuterium
  );

  // Calculating future resources
  for (const planetInfo of planetInfos) {
    for (const resourceInfo of planetInfo.resources.values()) {
      resourceInfo.future =
        resourceInfo.amount +
        resourceInfo.production *
          (objectives.readyTimeSeconds.max -
            nowSeconds +
            longestTimeSeconds -
            planetInfo.timeFromOriginSeconds);
    }
  }

  // Calculating target remaining resource on all planets
  const remainingMetalPerPlanet = remainingResourcePerPlanet(
    'metal',
    planetInfos,
    objectives.neededResources.metal
  );
  const remainingCrystalPerPlanet = remainingResourcePerPlanet(
    'crystal',
    planetInfos,
    objectives.neededResources.crystal
  );
  const remainingDeuteriumPerPlanet = remainingResourcePerPlanet(
    'deuterium',
    planetInfos,
    objectives.neededResources.deuterium
  );

  // Calculating resource transfers
  planetInfos.sort((a, b) => {
    // Ordering by furthest desc then name asc
    if (b.timeFromOriginSeconds !== a.timeFromOriginSeconds) {
      return b.timeFromOriginSeconds - a.timeFromOriginSeconds;
    }
    return findPlanetName(account.planetList, a.planetId) <
      findPlanetName(account.planetList, b.planetId)
      ? -1
      : 1;
  });
  objectives.resourceTransfers = [];
  // We don't iterate on the last planet
  let canChange = true;
  for (let i = 0; i < planetInfos.length - 1; i++) {
    const planetInfo = planetInfos[i];
    const metalToSend = Math.ceil(
      Math.max(0, (planetInfo.resources.get('metal')?.future ?? 0) - remainingMetalPerPlanet)
    );
    const crystalToSend = Math.ceil(
      Math.max(0, (planetInfo.resources.get('crystal')?.future ?? 0) - remainingCrystalPerPlanet)
    );
    const deuteriumToSend = Math.ceil(
      Math.max(
        0,
        (planetInfo.resources.get('deuterium')?.future ?? 0) - remainingDeuteriumPerPlanet
      )
    );
    const sumToSend = sum([metalToSend, crystalToSend, deuteriumToSend]);
    if (
      canChange &&
      sumToSend === 0 &&
      objectives.readyTimeSeconds.max === nowSeconds &&
      i < planetInfos.length
    ) {
      longestTimeSeconds = planetInfos[i + 1].timeFromOriginSeconds;
      continue;
    }
    if (sumToSend === 0) {
      continue;
    }
    canChange = false;
    objectives.resourceTransfers.push({
      from: planetInfo.planetId,
      to: objectives.planetId,
      sendInSeconds: longestTimeSeconds - planetInfo.timeFromOriginSeconds,
      resources: {
        metal: metalToSend as ResourceAmount,
        crystal: crystalToSend as ResourceAmount,
        deuterium: deuteriumToSend as ResourceAmount,
        sum: sum([metalToSend, crystalToSend, deuteriumToSend]),
      },
      timeFromOriginSeconds: planetInfo.timeFromOriginSeconds,
      isTransferring: false,
    });
  }
}

export function addObjectives(planetId: PlanetId, newTechnology: Technology): void {
  const currentAccount = getAccount();
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
      readyTimeSeconds: {
        metal: 0,
        crystal: 0,
        deuterium: 0,
        max: 0,
      },
      startTime: undefined,
      botEnabled: false,
    };
  }

  if (planetId !== objectives.planetId && objectives.technologies.length > 0) {
    return;
  }

  // Handle uniqueness
  if (objectives.technologies.find(_ => _.techId === newTechnology.techId) !== undefined) {
    const smartTech = TechnologyIndex.get(newTechnology.techId);
    if (smartTech === undefined || smartTech.type !== 'stock') {
      return;
    }
  }
  objectives.technologies.push(newTechnology);
  currentAccount.objectives = objectives;
  updateObjectives(currentAccount);
  setAccount(currentAccount);
}

export function updateObjectivesTransfers(account: Account): void {
  if (account.objectives === undefined) {
    return;
  }
  for (const fleetId in account.fleets) {
    if (account.fleets.hasOwnProperty(fleetId)) {
      const fleet = account.fleets[fleetId];
      if (
        (fleet.missionType === MissionTypeEnum.Transport ||
          fleet.missionType === MissionTypeEnum.Deployment) &&
        !fleet.returnFlight
      ) {
        for (const transfer of account.objectives.resourceTransfers) {
          const originCoords = findPlanetCoords(account.planetList, transfer.from);
          const destinationCoords = findPlanetCoords(account.planetList, transfer.to);
          if (
            fleet.originCoords === originCoords &&
            fleet.destinationCoords === destinationCoords &&
            fleet.resources.metal === transfer.resources.metal &&
            fleet.resources.crystal === transfer.resources.crystal &&
            fleet.resources.deuterium === transfer.resources.deuterium
          ) {
            if (account.objectives.startTime === undefined) {
              account.objectives.startTime = fleet.arrivalTime - transfer.timeFromOriginSeconds;
            }
            transfer.isTransferring = true;
          }
        }
      }
    }
  }
}
