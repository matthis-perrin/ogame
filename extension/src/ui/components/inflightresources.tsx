import React, {FC, Fragment} from 'react';

import {Account} from '@src/models/account';
import {Resource} from '@src/ui/components/resource';

interface InFlightResourcesProps {
  account: Account;
}

export const InFlightResources: FC<InFlightResourcesProps> = ({account}) => (
  <Fragment>
    <Resource name="M" amount={account.inFlightSum.metal} />
    <Resource name="C" amount={account.inFlightSum.crystal} />
    <Resource name="D" amount={account.inFlightSum.deuterium} />
    <Resource name="Σ" amount={account.inFlightSum.sum} />
  </Fragment>
);
