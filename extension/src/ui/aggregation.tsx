import React, {FC, Fragment} from 'react';

import {Account} from '@src/models/account';
import {Table, Title} from '@src/ui/common';
import {PlanetSum} from '@src/ui/components/planetsum';
import {PlanetSumProd} from '@src/ui/components/planetsumprod';
import {Research} from '@src/ui/components/research';

interface AggregationProps {
  account: Account;
}

export const Aggregation: FC<AggregationProps> = ({account}) => (
  <Fragment>
    <Table>
      <thead>
        <tr>
          <th colSpan={3}>
            <Title>Total</Title>
          </th>
          <th>
            <Title>Technologies</Title>
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
        </tr>
      </tbody>
    </Table>
  </Fragment>
);
