import React, {FC, Fragment} from 'react';

import {Account} from '@src/models/account';
import {Resource} from '@src/ui/components/resource';

interface InFlightResourcesProps {
  account: Account;
}

export const InFlightResources: FC<InFlightResourcesProps> = ({account}) => (
  <Fragment>
    <Resource name="M" amount={account.inFlightResources.metal} />
    <Resource name="C" amount={account.inFlightResources.crystal} />
    <Resource name="D" amount={account.inFlightResources.deuterium} />
    <Resource name="Σ" amount={account.inFlightResources.sum} />
  </Fragment>
);
