import {Account} from '@src/models/account';
import {Objectives} from '@src/models/objectives';
import {PlanetId} from '@src/models/planets';
import {ResourceAmount, ResourcesWithSum} from '@src/models/resources';
import {Technology, TechnologyIndex} from '@src/models/technologies';
import {getAccount, setAccount} from '@src/stores/account';
import {sum} from '@src/ui/utils';

export function addObjectives(planetId: PlanetId, technology: Technology): void {
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
      enoughResources: false,
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

export function calcObjectives(account: Account): Objectives | undefined {
  if (account.objectives === undefined) {
    return undefined;
  }

  const objectives: Objectives = {
    planetId: account.objectives.planetId,
    technologies: account.objectives.technologies,
    neededResources: {
      metal: 0 as ResourceAmount,
      crystal: 0 as ResourceAmount,
      deuterium: 0 as ResourceAmount,
      sum: 0 as ResourceAmount,
    },
    resourceTransfers: [],
    enoughResources: false,
  };

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
    if (smartTech.type === 'ship' || smartTech.type === 'defense') {
      continue;
    }
    const resources = smartTech.cost(technology.target);
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

  // Enough resource
  objectives.enoughResources =
    account.planetSum !== undefined &&
    sum([account.planetSum.resources.metal, account.inFlightSum.metal]) >=
      objectives.neededResources.metal &&
    sum([account.planetSum.resources.crystal, account.inFlightSum.crystal]) >=
      objectives.neededResources.crystal &&
    sum([account.planetSum.resources.deuterium, account.inFlightSum.deuterium]) >=
      objectives.neededResources.deuterium;

  // Calculating inflight resources
  let inflight: ResourcesWithSum = {
    metal: 0 as ResourceAmount,
    crystal: 0 as ResourceAmount,
    deuterium: 0 as ResourceAmount,
    sum: 0 as ResourceAmount,
  };
  const planetCoords = account.planetList.find(p => p.id === objectives?.planetId)?.coords;
  if (planetCoords !== undefined && account.inFlightResources.hasOwnProperty(planetCoords)) {
    inflight = account.inFlightResources[planetCoords];
  }
  objectives.resourceTransfers = [];
  let metalSent = 0;
  let crystalSent = 0;
  let deuteriumSent = 0;
  const planetDetails = Object.keys(account.planetDetails).map(key => account.planetDetails[key]);
  planetDetails.sort((a, b) => b.resources.sum - a.resources.sum);
  for (const planet of planetDetails) {
    if (planet.planetId === objectives.planetId) {
      metalSent += planet.resources.metal;
      crystalSent += planet.resources.crystal;
      deuteriumSent += planet.resources.deuterium;
      continue;
    }
    const metalToSend = Math.min(
      Math.max(0, objectives.neededResources.metal - inflight.metal - metalSent),
      planet.resources.metal
    );
    const crystalToSend = Math.min(
      Math.max(0, objectives.neededResources.crystal - inflight.crystal - crystalSent),
      planet.resources.crystal
    );
    const deuteriumToSend = Math.min(
      Math.max(0, objectives.neededResources.deuterium - inflight.deuterium - deuteriumSent),
      planet.resources.deuterium
    );
    objectives.resourceTransfers.push({
      from: planet.planetId,
      to: objectives.planetId,
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

  return objectives;
}
