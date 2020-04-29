import {Fleet} from '@src/models/fleets';
import {Planet} from '@src/models/planets';
import {ResourceAmount, ResourcesWithSumAndArrivalTime} from '@src/models/resources';
import {sum} from '@src/ui/utils';

export function calcInFlightResources(
  planetList: Planet[],
  fleets: {
    [fleetId: string]: Fleet;
  }
): [{[planetCoords: string]: ResourcesWithSumAndArrivalTime}, ResourcesWithSumAndArrivalTime] {
  const inFlightResources: {[planetCoords: string]: ResourcesWithSumAndArrivalTime} = {};
  const inFlightSum: ResourcesWithSumAndArrivalTime = {
    metal: 0 as ResourceAmount,
    crystal: 0 as ResourceAmount,
    deuterium: 0 as ResourceAmount,
    sum: 0 as ResourceAmount,
    arrivalTimeSeconds: 0,
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
            arrivalTimeSeconds: 0,
          };
      inFlight.metal = sum([inFlight.metal, fleet.resources.metal]);
      inFlight.crystal = sum([inFlight.crystal, fleet.resources.crystal]);
      inFlight.deuterium = sum([inFlight.deuterium, fleet.resources.deuterium]);
      inFlight.sum = sum([inFlight.metal, inFlight.crystal, inFlight.deuterium]);
      if (fleet.arrivalTime > inFlight.arrivalTimeSeconds) {
        inFlight.arrivalTimeSeconds = fleet.arrivalTime;
      }
      inFlightResources[fleet.destinationCoords] = inFlight;
      if (planetIndex.has(fleet.destinationCoords)) {
        inFlightSum.metal = sum([inFlightSum.metal, fleet.resources.metal]);
        inFlightSum.crystal = sum([inFlightSum.crystal, fleet.resources.crystal]);
        inFlightSum.deuterium = sum([inFlightSum.deuterium, fleet.resources.deuterium]);
        inFlightSum.sum = sum([inFlightSum.sum, fleet.resources.sum]);
        if (fleet.arrivalTime > inFlightSum.arrivalTimeSeconds) {
          inFlightSum.arrivalTimeSeconds = fleet.arrivalTime;
        }
      }
    }
  }

  return [inFlightResources, inFlightSum];
}
