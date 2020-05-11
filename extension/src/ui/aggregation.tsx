import React, {FC, Fragment} from 'react';

import {Account} from '@src/models/account';
import {Table, Title} from '@src/ui/common';
import {Bots} from '@src/ui/components/bots';
import {PlanetSum} from '@src/ui/components/planetsum';
import {PlanetSumProd} from '@src/ui/components/planetsumprod';
import {Research} from '@src/ui/components/research';
import {Resource} from '@src/ui/components/resource';

interface AggregationProps {
  account: Account;
}

export const Aggregation: FC<AggregationProps> = ({account}) => (
  <Fragment>
    <Table>
      <thead>
        <tr>
          <th>
            <Title>Total</Title>
          </th>
          <th>
            <Title>Vol</Title>
          </th>
          <th colSpan={2}>
            <Title>Production</Title>
          </th>
          <th>
            <Title>Technologies</Title>
          </th>
          <th>
            <Title>Bots</Title>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            {account.planetSum === undefined ? (
              ''
            ) : (
              <PlanetSum planetSum={account.planetSum} account={account} />
            )}
          </td>
          <td>
            <Resource name="M" amount={account.inFlightSum.metal} />
            <Resource name="C" amount={account.inFlightSum.crystal} />
            <Resource name="D" amount={account.inFlightSum.deuterium} />
            <Resource name="Σ" amount={account.inFlightSum.sum} />
            <div>GT: {account.inFlightSum.largeCargos}</div>
          </td>
          <td>
            {account.planetSum === undefined ? (
              ''
            ) : (
              <PlanetSumProd planetSum={account.planetSum} hours={1} />
            )}
          </td>
          <td>
            {account.planetSum === undefined ? (
              ''
            ) : (
              <PlanetSumProd planetSum={account.planetSum} hours={24} />
            )}
          </td>
          <td>
            <Research account={account} />
          </td>
          <td>
            <Bots account={account} />
          </td>
        </tr>
      </tbody>
    </Table>
  </Fragment>
);
