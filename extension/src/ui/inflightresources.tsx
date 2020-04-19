import React, {FC, Fragment} from 'react';

import {Fleet} from '@src/models/fleets';
import {ResourceAmount} from '@src/models/resources';
import {Resource} from '@src/ui/resource';
import {sum} from '@src/ui/utils';

interface InFlightResourcesProps {
  fleets: {[fleetId: string]: Fleet};
}

export const InFlightResources: FC<InFlightResourcesProps> = ({fleets}) => {
  let metal = 0 as ResourceAmount;
  let crystal = 0 as ResourceAmount;
  let deuterium = 0 as ResourceAmount;
  for (const fleetId in fleets) {
    if (fleets.hasOwnProperty(fleetId)) {
      const fleet = fleets[fleetId];
      metal = sum([metal, fleet.resources.metal]);
      crystal = sum([crystal, fleet.resources.crystal]);
      deuterium = sum([deuterium, fleet.resources.deuterium]);
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
