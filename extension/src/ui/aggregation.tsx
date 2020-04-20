import React, {FC, Fragment} from 'react';

import {Account} from '@src/models/account';
import {Table, Title} from '@src/ui/common';
import {InFlightResources} from '@src/ui/components/inflightresources';
import {InFlightShips} from '@src/ui/components/inflightships';
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
          <th colSpan={2}>
            <Title>Flottes ({Object.keys(account.fleets).length})</Title>
          </th>
          <th colSpan={2}>
            <Title>Total Compte</Title>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <InFlightResources fleets={account.fleets} />
          </td>
          <td>
            <InFlightShips fleets={account.fleets} />
          </td>
          <td>
            {account.planetSum === undefined ? (
              ''
            ) : (
              <PlanetSum planetSum={account.planetSum} fleets={account.fleets} />
            )}
          </td>
          <td>
            {account.planetSum === undefined ? '' : <PlanetSumProd planetSum={account.planetSum} />}
          </td>
        </tr>
      </tbody>
    </Table>
  </Fragment>
);
