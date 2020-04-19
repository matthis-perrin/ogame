import {PlanetCoords} from '@src/models/planets';
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
  origin: PlanetCoords;
  destination: PlanetCoords;
  resources: {
    metal: ResourceAmount;
    crystal: ResourceAmount;
    deuterium: ResourceAmount;
  };
  ships: {
    transporterLarge: number;
    transporterSmall: number;
    recycler: number;
    espionageProbe: number;
  };
}
