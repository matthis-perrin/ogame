import React, {FC, Fragment} from 'react';

import {findPlanetId} from '@src/models/account';
import {Fleet, MissionTypeEnum} from '@src/models/fleets';
import {Planet} from '@src/models/planets';
import {ResourceAmount} from '@src/models/resources';
import {Resource} from '@src/ui/components/resource';
import {sum} from '@src/ui/utils';

interface InFlightResourcesProps {
  fleets: {[fleetId: string]: Fleet};
  planetList: Planet[];
}

export const InFlightResources: FC<InFlightResourcesProps> = ({fleets, planetList}) => {
  let metal = 0 as ResourceAmount;
  let crystal = 0 as ResourceAmount;
  let deuterium = 0 as ResourceAmount;
  for (const fleetId in fleets) {
    if (fleets.hasOwnProperty(fleetId)) {
      const fleet = fleets[fleetId];
      const destinationIsMyPlanet = findPlanetId(planetList, fleet.destinationName) !== undefined;
      const returnFromAttacking =
        fleet.missionType === MissionTypeEnum.Attacking && fleet.returnFlight;
      const deploying = fleet.missionType === MissionTypeEnum.Deployment;
      const transportingToMyPlanet =
        fleet.missionType === MissionTypeEnum.Transport && destinationIsMyPlanet;
      if (returnFromAttacking || deploying || transportingToMyPlanet) {
        metal = sum([metal, fleet.resources.metal]);
        crystal = sum([crystal, fleet.resources.crystal]);
        deuterium = sum([deuterium, fleet.resources.deuterium]);
      }
    }
  }
  const resourcesSum = sum([metal, crystal, deuterium]);

  return (
    <Fragment>
      <Resource name="M" amount={metal} />
      <Resource name="C" amount={crystal} />
      <Resource name="D" amount={deuterium} />
      <Resource name="Σ" amount={resourcesSum} />
    </Fragment>
  );
};
