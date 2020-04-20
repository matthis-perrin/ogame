import React, {FC, Fragment} from 'react';

import {EspionageProbe, LargeCargo, Recycler, SmallCargo} from '@shared/models/ships';

import {Fleet} from '@src/models/fleets';
import {Technology, TechnologyValue} from '@src/models/technologies';
import {TechnologyC} from '@src/ui/components/technology';

interface InFlightShipsProps {
  fleets: {[fleetId: string]: Fleet};
}

export const InFlightShips: FC<InFlightShipsProps> = ({fleets}) => {
  const technologies: {[techId: number]: Technology} = {};
  technologies[SmallCargo.id] = {
    techId: SmallCargo.id,
    value: 0 as TechnologyValue,
  };
  technologies[LargeCargo.id] = {
    techId: LargeCargo.id,
    value: 0 as TechnologyValue,
  };
  technologies[Recycler.id] = {
    techId: Recycler.id,
    value: 0 as TechnologyValue,
  };
  technologies[EspionageProbe.id] = {
    techId: EspionageProbe.id,
    value: 0 as TechnologyValue,
  };
  for (const fleetId in fleets) {
    if (fleets.hasOwnProperty(fleetId)) {
      const fleet = fleets[fleetId];
      technologies[SmallCargo.id].value = ((technologies[SmallCargo.id].value as number) +
        fleet.ships.transporterSmall) as TechnologyValue;
      technologies[LargeCargo.id].value = ((technologies[LargeCargo.id].value as number) +
        fleet.ships.transporterLarge) as TechnologyValue;
      technologies[Recycler.id].value = ((technologies[Recycler.id].value as number) +
        fleet.ships.recycler) as TechnologyValue;
      technologies[EspionageProbe.id].value = ((technologies[EspionageProbe.id].value as number) +
        fleet.ships.espionageProbe) as TechnologyValue;
    }
  }

  return (
    <Fragment>
      <TechnologyC name="PT" technologies={technologies} techId={SmallCargo.id} />
      <TechnologyC name="GT" technologies={technologies} techId={LargeCargo.id} />
      <TechnologyC name="REC" technologies={technologies} techId={Recycler.id} />
      <TechnologyC name="ESP" technologies={technologies} techId={EspionageProbe.id} />
    </Fragment>
  );
};
