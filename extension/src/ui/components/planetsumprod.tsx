import React, {FC, Fragment} from 'react';

import {AccountPlanet} from '@src/models/account';
import {ResourceAmount} from '@src/models/resources';
import {Production} from '@src/ui/components/production';
import {sum} from '@src/ui/utils';

interface PlanetSumProdProps {
  planetSum: AccountPlanet;
  hours: number;
}

const twentyFourHours = 24;

export const PlanetSumProd: FC<PlanetSumProdProps> = ({planetSum, hours}) => {
  const productionsSum = sum([
    planetSum.productions.metal,
    planetSum.productions.crystal,
    planetSum.productions.deuterium,
  ]);
  return (
    <Fragment>
      <Production
        name="M"
        production={(planetSum.productions.metal * hours) as ResourceAmount}
        unit={hours === 1 ? 'h' : hours === twentyFourHours ? 'd' : `${hours}h`}
      />
      <Production
        name="C"
        production={(planetSum.productions.crystal * hours) as ResourceAmount}
        unit={hours === 1 ? 'h' : hours === twentyFourHours ? 'd' : `${hours}h`}
      />
      <Production
        name="D"
        production={(planetSum.productions.deuterium * hours) as ResourceAmount}
        unit={hours === 1 ? 'h' : hours === twentyFourHours ? 'd' : `${hours}h`}
      />
      <Production
        name="Σ"
        production={(productionsSum * hours) as ResourceAmount}
        unit={hours === 1 ? 'h' : hours === twentyFourHours ? 'd' : `${hours}h`}
      />
    </Fragment>
  );
};
