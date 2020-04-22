import React, {FC, Fragment} from 'react';

import {Account, AccountPlanet} from '@src/models/account';
import {Resource} from '@src/ui/components/resource';
import {sum} from '@src/ui/utils';

interface PlanetSumProps {
  account: Account;
  planetSum: AccountPlanet;
}

export const PlanetSum: FC<PlanetSumProps> = ({account, planetSum}) => {
  const resourcesSum = sum([
    planetSum.resources.metal,
    planetSum.resources.crystal,
    planetSum.resources.deuterium,
    account.inFlightResources.sum,
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
        amount={sum([planetSum.resources.metal, account.inFlightResources.metal])}
        storage={planetSum.storages.metal}
        production={planetSum.productions.metal}
      />
      <Resource
        name="C"
        amount={sum([planetSum.resources.crystal, account.inFlightResources.crystal])}
        storage={planetSum.storages.crystal}
        production={planetSum.productions.crystal}
      />
      <Resource
        name="D"
        amount={sum([planetSum.resources.deuterium, account.inFlightResources.deuterium])}
        storage={planetSum.storages.deuterium}
        production={planetSum.productions.deuterium}
      />
      <Resource name="Σ" amount={resourcesSum} storage={storagesSum} production={productionsSum} />
    </Fragment>
  );
};
