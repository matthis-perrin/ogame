import {PlanetCoords, PlanetName} from '@src/models/planets';
import {ResourceAmount} from '@src/models/resources';

export type FleetId = string & {_: 'FleetId'};
export type MissionType = number & {_: 'MissionType'};
export type ReturnFlight = boolean & {_: 'ReturnFlight'};
export type FleetTime = number & {_: 'FleetTime'};

export interface Fleet {
  fleetId: FleetId;
  missionType: MissionType;
  returnFlight: ReturnFlight;
  arrivalTime: FleetTime;
  midTime: FleetTime;
  originCoords: PlanetCoords;
  destinationCoords: PlanetCoords;
  originName: PlanetName;
  destinationName: PlanetName;
  resources: {
    metal: ResourceAmount;
    crystal: ResourceAmount;
    deuterium: ResourceAmount;
  };
  ships: {
    transporterLarge: number;
    transporterSmall: number;
    recycler: number;
    colonyShip: number;
    espionageProbe: number;
  };
}

export function missionTypeString(fleet: Fleet): string {
  switch (fleet.missionType) {
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    case 4:
      return 'Stationner';
    default:
      return `MISSION_${fleet.missionType}`;
  }
}
