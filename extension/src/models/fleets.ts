import {PlanetCoords, PlanetName} from '@src/models/planets';
import {ResourceAmount} from '@src/models/resources';

export type FleetId = string & {_: 'FleetId'};
export type MissionType = number & {_: 'MissionType'};
export type ReturnFlight = boolean & {_: 'ReturnFlight'};
export type FleetTime = number & {_: 'FleetTime'};

export enum MissionTypeEnum {
  Transport = 3,
  Deployment = 4,
}

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
    case MissionTypeEnum.Deployment:
      return 'Stationner';
    case MissionTypeEnum.Transport:
      return 'Transporter';
    default:
      return `MISSION_${fleet.missionType}`;
  }
}
