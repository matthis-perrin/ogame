import React, {FC, Fragment} from 'react';

import {AstrophysicsTechnology} from '@shared/models/technology';

import {Account} from '@src/models/account';
import {Tech} from '@src/models/tech';
import {Astrophysics} from '@src/ui/astrophysics';
import {Title} from '@src/ui/common';

interface ResearchProps {
  account: Account;
}

export const Research: FC<ResearchProps> = ({account}) => {
  const atroTechnology = account.accountTechnologies.hasOwnProperty(Tech.AstrophysicsTechnology)
    ? account.accountTechnologies[Tech.AstrophysicsTechnology]
    : undefined;
  const astroLevel =
    atroTechnology !== undefined
      ? ((atroTechnology.target !== undefined
          ? atroTechnology.target
          : atroTechnology.value) as number) + 1
      : 1;
  const astroCost = AstrophysicsTechnology.cost(astroLevel);
  let metalSeconds: number | undefined;
  let crystalSeconds: number | undefined;
  let deuteriumSeconds: number | undefined;
  if (account.planetSum !== undefined) {
    metalSeconds = Math.ceil(
      (astroCost.metal - account.planetSum.resources.metal) / account.planetSum.productions.metal
    );
    crystalSeconds = Math.ceil(
      (astroCost.crystal - account.planetSum.resources.crystal) /
        account.planetSum.productions.crystal
    );
    deuteriumSeconds = Math.ceil(
      (astroCost.deuterium - account.planetSum.resources.deuterium) /
        account.planetSum.productions.deuterium
    );
  }
  return (
    <Fragment>
      <Title>Astrophysique {astroLevel}</Title>
      <Astrophysics name="M" cost={astroCost.metal} seconds={metalSeconds} />
      <Astrophysics name="C" cost={astroCost.crystal} seconds={crystalSeconds} />
      <Astrophysics name="D" cost={astroCost.deuterium} seconds={deuteriumSeconds} />
    </Fragment>
  );
};
