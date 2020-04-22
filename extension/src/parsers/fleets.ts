import $ from 'jquery';

import {ColonyShip, EspionageProbe, LargeCargo, Recycler, SmallCargo} from '@shared/models/ships';

import {NAME_CRYSTAL, NAME_DEUTERIUM, NAME_METAL} from '@src/models/constants';
import {Fleet, FleetId, FleetTime, MissionType, ReturnFlight} from '@src/models/fleets';
import {PlanetCoords, PlanetName} from '@src/models/planets';
import {ResourceAmount} from '@src/models/resources';

export function parseFleets(): Fleet[] {
  const res: Fleet[] = [];
  $('#eventboxContent #eventContent tr.eventFleet').each((_, element) => {
    const fleetId = element.id;
    if (fleetId.length === 0) {
      return;
    }
    const missionType = element.getAttribute('data-mission-type');
    // eslint-disable-next-line no-null/no-null
    if (missionType === null) {
      return;
    }
    const returnFlightRaw = element.getAttribute('data-return-flight');
    // eslint-disable-next-line no-null/no-null
    if (returnFlightRaw === null) {
      return;
    }
    const arrivalTime = element.getAttribute('data-arrival-time');
    // eslint-disable-next-line no-null/no-null
    if (arrivalTime === null) {
      return;
    }
    const originCoords = $(element)
      .find('.coordsOrigin')
      .text()
      .trim();
    if (originCoords.length === 0) {
      return;
    }
    const destinationCoords = $(element)
      .find('.destCoords')
      .text()
      .trim();
    if (destinationCoords.length === 0) {
      return;
    }
    const originName = $(element)
      .find('.originFleet')
      .text()
      .trim();
    if (originName.length === 0) {
      return;
    }
    let destinationName = $(element)
      .find('.destFleet > span.tooltip[title]')
      .attr('title');
    if (destinationName === undefined) {
      destinationName = $(element)
        .find('.destFleet')
        .text()
        .trim();
      if (originName.length === 0) {
        return;
      }
    }
    const returnFlight = (returnFlightRaw !== 'false') as ReturnFlight;
    const fleet: Fleet = {
      // eslint-disable-next-line @typescript-eslint/no-magic-numbers
      fleetId: fleetId.substr(9) as FleetId,
      missionType: parseFloat(missionType) as MissionType,
      returnFlight,
      arrivalTime: parseFloat(arrivalTime) as FleetTime,
      originCoords: (returnFlight ? destinationCoords : originCoords) as PlanetCoords,
      destinationCoords: (returnFlight ? originCoords : destinationCoords) as PlanetCoords,
      originName: (returnFlight ? destinationName : originName) as PlanetName,
      destinationName: (returnFlight ? originName : destinationName) as PlanetName,
      resources: {
        metal: 0 as ResourceAmount,
        crystal: 0 as ResourceAmount,
        deuterium: 0 as ResourceAmount,
      },
      ships: {
        transporterLarge: 0,
        transporterSmall: 0,
        recycler: 0,
        colonyShip: 0,
        espionageProbe: 0,
      },
    };
    const title = $(element)
      .find('.icon_movement > span[title], .icon_movement_reserve > span[title]')
      .attr('title');
    if (title === undefined) {
      return;
    }
    $($.parseHTML(title.trim()))
      .find('.fleetinfo tr')
      .each((j, tr) => {
        const value = parseFloat(
          $(tr)
            .find('td.value')
            .text()
            .replace(/\./g, '')
        );
        if (tr.innerText.includes(LargeCargo.name)) {
          fleet.ships.transporterLarge = value;
          return;
        }
        if (tr.innerText.includes(SmallCargo.name)) {
          fleet.ships.transporterSmall = value;
          return;
        }
        if (tr.innerText.includes(Recycler.name)) {
          fleet.ships.recycler = value;
          return;
        }
        if (tr.innerText.includes(ColonyShip.name)) {
          fleet.ships.colonyShip = value;
          return;
        }
        if (tr.innerText.includes(EspionageProbe.name)) {
          fleet.ships.espionageProbe = value;
          return;
        }
        if (tr.innerText.includes(NAME_METAL)) {
          fleet.resources.metal = value as ResourceAmount;
          return;
        }
        if (tr.innerText.includes(NAME_CRYSTAL)) {
          fleet.resources.crystal = value as ResourceAmount;
          return;
        }
        if (tr.innerText.includes(NAME_DEUTERIUM)) {
          fleet.resources.deuterium = value as ResourceAmount;
          return;
        }
      });
    res.push(fleet);
  });
  return res;
}
