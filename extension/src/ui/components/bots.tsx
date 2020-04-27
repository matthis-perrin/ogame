import React, {FC, Fragment} from 'react';

import {initEspionageBot, stopEspionageBot} from '@src/bots/espionage';
import {Account} from '@src/models/account';
import {HoverTD, Table} from '@src/ui/common';

interface BotsProps {
  account: Account;
}

export const Bots: FC<BotsProps> = ({account}) => (
  <Fragment>
    <Table>
      <tbody>
        <tr>
          <HoverTD
            onClick={() => {
              if (account.bots.espionage === undefined) {
                initEspionageBot();
              } else {
                stopEspionageBot();
              }
            }}
          >
            Espionage: {account.bots.espionage !== undefined ? 'ON' : 'OFF'}
          </HoverTD>
        </tr>
      </tbody>
    </Table>
  </Fragment>
);
