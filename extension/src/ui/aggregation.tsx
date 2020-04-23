import React, {FC, Fragment} from 'react';

import {goToFleets} from '@src/controllers/navigator';
import {Account} from '@src/models/account';
import {Table, Title} from '@src/ui/common';
import {InFlightResources} from '@src/ui/components/inflightresources';
import {PlanetSum} from '@src/ui/components/planetsum';
import {PlanetSumProd} from '@src/ui/components/planetsumprod';

interface AggregationProps {
  account: Account;
}

export const Aggregation: FC<AggregationProps> = ({account}) => (
  <Fragment>
    <Table>
      <thead>
        <tr>
          <th>
            <Title>Flottes</Title>
          </th>
          <th colSpan={3}>
            <Title>Total</Title>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td onClick={() => goToFleets()} style={{cursor: 'pointer'}}>
            <InFlightResources account={account} />
          </td>
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
        </tr>
      </tbody>
    </Table>
  </Fragment>
);
