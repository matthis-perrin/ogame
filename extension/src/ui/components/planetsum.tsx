import React, {FC, Fragment} from 'react';

import {LargeCargo} from '@shared/models/ships';
import {Crystal, Deuterium, Metal} from '@shared/models/stock';

import {Account, AccountPlanet} from '@src/models/account';
import {addObjectives} from '@src/stores/account/objectives';
import {Stock} from '@src/ui/common';
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
      <Stock
        onClick={() => {
          addObjectives(account.currentPlanetId, {
            techId: Metal.id,
            value: 0,
            target: Math.floor(planetSum.resources.metal),
          });
        }}
      >
        <Resource
          name="M"
          amount={sum([planetSum.resources.metal, account.inFlightSum.metal])}
          production={planetSum.productions.metal}
        />
      </Stock>
      <Stock
        onClick={() => {
          addObjectives(account.currentPlanetId, {
            techId: Crystal.id,
            value: 0,
            target: Math.floor(planetSum.resources.crystal),
          });
        }}
      >
        <Resource
          name="C"
          amount={sum([planetSum.resources.crystal, account.inFlightSum.crystal])}
          production={planetSum.productions.crystal}
        />
      </Stock>
      <Stock
        onClick={() => {
          addObjectives(account.currentPlanetId, {
            techId: Deuterium.id,
            value: 0,
            target: Math.floor(planetSum.resources.deuterium),
          });
        }}
      >
        <Resource
          name="D"
          amount={sum([planetSum.resources.deuterium, account.inFlightSum.deuterium])}
          production={planetSum.productions.deuterium}
        />
      </Stock>
      <Stock
        onClick={() => {
          addObjectives(account.currentPlanetId, {
            techId: Metal.id,
            value: 0,
            target: Math.floor(planetSum.resources.metal),
          });
          addObjectives(account.currentPlanetId, {
            techId: Crystal.id,
            value: 0,
            target: Math.floor(planetSum.resources.crystal),
          });
          addObjectives(account.currentPlanetId, {
            techId: Deuterium.id,
            value: 0,
            target: Math.floor(planetSum.resources.deuterium),
          });
        }}
      >
        <Resource name="Σ" amount={resourcesSum} production={planetSum.productions.sum} />
      </Stock>
      <div>
        GT:{' '}
        {(planetSum.ships.hasOwnProperty(LargeCargo.id)
          ? planetSum.ships[LargeCargo.id].value
          : 0) + account.inFlightSum.largeCargos}
      </div>
    </Fragment>
  );
};
