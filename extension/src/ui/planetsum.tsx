import React, {FC, Fragment} from 'react';

import {AccountPlanet} from '@src/models/account';
import {Fleet} from '@src/models/fleets';
import {ResourceAmount} from '@src/models/resources';
import {Resource} from '@src/ui/resource';
import {sum} from '@src/ui/utils';

interface PlanetSumProps {
  planetSum: AccountPlanet;
  fleets: {[fleetId: string]: Fleet};
}

export const PlanetSum: FC<PlanetSumProps> = ({planetSum, fleets}) => {
  let fleetMetal = 0 as ResourceAmount;
  let fleetCrystal = 0 as ResourceAmount;
  let fleetDeuterium = 0 as ResourceAmount;
  for (const fleetId in fleets) {
    if (fleets.hasOwnProperty(fleetId)) {
      const fleet = fleets[fleetId];
      fleetMetal = sum([fleetMetal, fleet.resources.metal]);
      fleetCrystal = sum([fleetCrystal, fleet.resources.crystal]);
      fleetDeuterium = sum([fleetDeuterium, fleet.resources.deuterium]);
    }
  }

  const resourcesSum = sum([
    planetSum.resources.metal,
    planetSum.resources.crystal,
    planetSum.resources.deuterium,
    fleetMetal,
    fleetCrystal,
    fleetDeuterium,
  ]);
  const storagesSum = sum([
    planetSum.storages.metal,
    planetSum.storages.crystal,
    planetSum.storages.deuterium,
  ]);
  const productionsSum = sum([
    planetSum.productions.metal,
    planetSum.productions.crystal,
    planetSum.productions.deuterium,
  ]);

  return (
    <Fragment>
      <Resource
        name="M"
        amount={sum([planetSum.resources.metal, fleetMetal])}
        storage={planetSum.storages.metal}
        production={planetSum.productions.metal}
      />
      <Resource
        name="C"
        amount={sum([planetSum.resources.crystal, fleetCrystal])}
        storage={planetSum.storages.crystal}
        production={planetSum.productions.crystal}
      />
      <Resource
        name="D"
        amount={sum([planetSum.resources.deuterium, fleetDeuterium])}
        storage={planetSum.storages.deuterium}
        production={planetSum.productions.deuterium}
      />
      <Resource name="Σ" amount={resourcesSum} storage={storagesSum} production={productionsSum} />
    </Fragment>
  );
};
