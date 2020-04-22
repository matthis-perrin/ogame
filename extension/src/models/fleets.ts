import {PlanetCoords, PlanetName} from '@src/models/planets';
import {ResourceAmount} from '@src/models/resources';

export type FleetId = string & {_: 'FleetId'};
export type MissionType = number & {_: 'MissionType'};
export type ReturnFlight = boolean & {_: 'ReturnFlight'};
export type FleetTime = number & {_: 'FleetTime'};

export enum MissionTypeEnum {
  Attacking = 1,
  Transport = 3,
  Deployment = 4,
  Espionage = 6,
  Expedition = 15,
}

// Attacking : to raid another player or to crash any fleet stationed at the target.
// Deployment: to station the fleet at another planet.
// Espionage: to spy another player's planet, only Espionage Probes can go on this mission.
// Transport: to send resources from one planet to another.
// Colonization: to send a colony ship to an empty planet and establish a colony.
// Harvesting: to collect resources from a debris field using recyclers.
// Destroy: to send Death Stars to destroy a moon.
// Expedition: to send a fleet to explore Outer Space.
// ACS Defend: to send a fleet in orbit of a friendly planet an help defend it.
// ACS Attack: to join a friendly fleet in an attack.

export interface Fleet {
  fleetId: FleetId;
  missionType: MissionType;
  returnFlight: ReturnFlight;
  arrivalTime: FleetTime;
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
    case MissionTypeEnum.Attacking:
      return 'Attaquer';
    case MissionTypeEnum.Deployment:
      return 'Stationner';
    case MissionTypeEnum.Transport:
      return 'Transporter';
    case MissionTypeEnum.Espionage:
      return 'Espionner';
    case MissionTypeEnum.Expedition:
      return 'Expédition';
    default:
      return `MISSION_${fleet.missionType}`;
  }
}
