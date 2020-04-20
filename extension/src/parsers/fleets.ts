import $ from 'jquery';

import {Fleet, FleetId, FleetTime, MissionType, ReturnFlight} from '@src/models/fleets';
import {PlanetCoords} from '@src/models/planets';
import {ResourceAmount} from '@src/models/resources';

export function parseFleets(): Fleet[] {
  const res: Fleet[] = [];
  $('html > body #pageContent #fleetdispatchcomponent div.fleetDetails').each((_, element) => {
    const fleetId = element.id;
    if (fleetId.length === 0) {
      return;
    }
    const missionType = element.getAttribute('data-mission-type');
    // eslint-disable-next-line no-null/no-null
    if (missionType === null) {
      return;
    }
    const returnFlight = element.getAttribute('data-return-flight');
    // eslint-disable-next-line no-null/no-null
    if (returnFlight === null) {
      return;
    }
    const arrivalTime = element.getAttribute('data-arrival-time');
    // eslint-disable-next-line no-null/no-null
    if (arrivalTime === null) {
      return;
    }
    const midTime = $(element)
      .find('.openDetails [data-end-time]')
      .attr('data-end-time');
    if (midTime === undefined) {
      return;
    }
    const origin = $(element)
      .find('.originCoords')
      .text()
      .trim();
    if (origin.length === 0) {
      return;
    }
    const destination = $(element)
      .find('.destinationCoords')
      .text()
      .trim();
    if (destination.length === 0) {
      return;
    }
    const fleet: Fleet = {
      fleetId: fleetId as FleetId,
      missionType: parseFloat(missionType) as MissionType,
      returnFlight: (returnFlight === '1') as ReturnFlight,
      arrivalTime: parseFloat(arrivalTime) as FleetTime,
      midTime: parseFloat(midTime) as FleetTime,
      origin: origin as PlanetCoords,
      destination: destination as PlanetCoords,
      resources: {
        metal: 0 as ResourceAmount,
        crystal: 0 as ResourceAmount,
        deuterium: 0 as ResourceAmount,
      },
      ships: {
        transporterLarge: 0,
        transporterSmall: 0,
        recycler: 0,
        espionageProbe: 0,
      },
    };
    $(element)
      .find('.route .fleetinfo tr')
      .each((i, tr) => {
        const value = parseFloat(
          $(tr)
            .find('td.value')
            .text()
            .replace(/\./g, '')
        );
        if (tr.innerText.includes('Grand transporteur')) {
          fleet.ships.transporterLarge = value;
          return;
        }
        if (tr.innerText.includes('Petit transporteur')) {
          fleet.ships.transporterSmall = value;
          return;
        }
        if (tr.innerText.includes('Recycleur')) {
          fleet.ships.recycler = value;
          return;
        }
        if (tr.innerText.includes('Sonde d`espionnage')) {
          fleet.ships.espionageProbe = value;
          return;
        }
        if (tr.innerText.includes('Métal')) {
          fleet.resources.metal = value as ResourceAmount;
          return;
        }
        if (tr.innerText.includes('Cristal')) {
          fleet.resources.crystal = value as ResourceAmount;
          return;
        }
        if (tr.innerText.includes('Deutérium')) {
          fleet.resources.deuterium = value as ResourceAmount;
          return;
        }
      });
    res.push(fleet);
  });
  return res;
}
