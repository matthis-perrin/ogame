import React, {FC, Fragment} from 'react';

import {goToFleets} from '@src/controllers/navigator';
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
          <th colSpan={2} onClick={() => goToFleets()} style={{cursor: 'pointer'}}>
            <Title>Flottes ({Object.keys(account.fleets).length})</Title>
          </th>
          <th colSpan={2}>
            <Title>Total</Title>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td onClick={() => goToFleets()} style={{cursor: 'pointer'}}>
            <InFlightResources fleets={account.fleets} />
          </td>
          <td onClick={() => goToFleets()} style={{cursor: 'pointer'}}>
            <InFlightShips fleets={account.fleets} />
          </td>
          <td>
            {account.planetSum === undefined ? (
              ''
            ) : (
              <PlanetSum
                planetSum={account.planetSum}
                fleets={account.fleets}
                planetList={account.planetList}
              />
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
