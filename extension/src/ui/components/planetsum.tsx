import React, {FC, Fragment} from 'react';

import {Account, AccountPlanet} from '@src/models/account';
import {Resource} from '@src/ui/components/resource';
import {sum} from '@src/ui/utils';

interface PlanetSumProps {
  account: Account;
  planetSum: AccountPlanet;
}

export const PlanetSum: FC<PlanetSumProps> = ({account, planetSum}) => {
  const resourcesSum = sum([planetSum.resources.sum, account.inFlightSum.sum]);

  return (
    <Fragment>
      <Resource
        name="M"
        amount={sum([planetSum.resources.metal, account.inFlightSum.metal])}
        storage={planetSum.storages.metal}
        production={planetSum.productions.metal}
      />
      <Resource
        name="C"
        amount={sum([planetSum.resources.crystal, account.inFlightSum.crystal])}
        storage={planetSum.storages.crystal}
        production={planetSum.productions.crystal}
      />
      <Resource
        name="D"
        amount={sum([planetSum.resources.deuterium, account.inFlightSum.deuterium])}
        storage={planetSum.storages.deuterium}
        production={planetSum.productions.deuterium}
      />
      <Resource
        name="Σ"
        amount={resourcesSum}
        storage={planetSum.storages.sum}
        production={planetSum.productions.sum}
      />
    </Fragment>
  );
};
