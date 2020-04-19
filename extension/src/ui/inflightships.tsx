import React, {FC, Fragment} from 'react';

import {Fleet} from '@src/models/fleets';
import {Tech} from '@src/models/tech';
import {Technology, TechnologyValue} from '@src/models/technologies';
import {TechnologyC} from '@src/ui/technology';

interface InFlightShipsProps {
  fleets: {[fleetId: string]: Fleet};
}

export const InFlightShips: FC<InFlightShipsProps> = ({fleets}) => {
  const technologies: {[techId: string]: Technology} = {};
  technologies[Tech.TransporterSmall] = {
    techId: Tech.TransporterSmall,
    value: 0 as TechnologyValue,
  };
  technologies[Tech.TransporterLarge] = {
    techId: Tech.TransporterLarge,
    value: 0 as TechnologyValue,
  };
  technologies[Tech.Recycler] = {
    techId: Tech.Recycler,
    value: 0 as TechnologyValue,
  };
  technologies[Tech.EspionageProbe] = {
    techId: Tech.EspionageProbe,
    value: 0 as TechnologyValue,
  };
  for (const fleetId in fleets) {
    if (fleets.hasOwnProperty(fleetId)) {
      const fleet = fleets[fleetId];
      technologies[Tech.TransporterSmall].value = ((technologies[Tech.TransporterSmall]
        .value as number) + fleet.ships.transporterSmall) as TechnologyValue;
      technologies[Tech.TransporterLarge].value = ((technologies[Tech.TransporterLarge]
        .value as number) + fleet.ships.transporterLarge) as TechnologyValue;
      technologies[Tech.Recycler].value = ((technologies[Tech.Recycler].value as number) +
        fleet.ships.recycler) as TechnologyValue;
      technologies[Tech.EspionageProbe].value = ((technologies[Tech.EspionageProbe]
        .value as number) + fleet.ships.espionageProbe) as TechnologyValue;
    }
  }

  return (
    <Fragment>
      <TechnologyC name="PT" technologies={technologies} techId={Tech.TransporterSmall} />
      <TechnologyC name="GT" technologies={technologies} techId={Tech.TransporterLarge} />
      <TechnologyC name="REC" technologies={technologies} techId={Tech.Recycler} />
      <TechnologyC name="ESP" technologies={technologies} techId={Tech.EspionageProbe} />
    </Fragment>
  );
};
