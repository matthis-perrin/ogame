import React, {FC, Fragment} from 'react';

import {AccountPlanet} from '@src/models/account';
import {Production} from '@src/ui/production';
import {sum} from '@src/ui/utils';

interface PlanetSumProdProps {
  planetSum: AccountPlanet;
}

export const PlanetSumProd: FC<PlanetSumProdProps> = ({planetSum}) => {
  const productionsSum = sum([
    planetSum.productions.metal,
    planetSum.productions.crystal,
    planetSum.productions.deuterium,
  ]);
  return (
    <Fragment>
      <Production name="M" production={planetSum.productions.metal} />
      <Production name="C" production={planetSum.productions.crystal} />
      <Production name="D" production={planetSum.productions.deuterium} />
      <Production name="Σ" production={productionsSum} />
    </Fragment>
  );
};
