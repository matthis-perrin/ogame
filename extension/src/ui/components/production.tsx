import React, {FC, Fragment} from 'react';

import {ResourceAmount} from '@src/models/resources';
import {snum} from '@src/ui/utils';

interface ResourceProps {
  name: string;
  production: ResourceAmount;
  unit: string;
}

export const Production: FC<ResourceProps> = ({name, production, unit}) => (
  <Fragment>
    <div>
      {name}: +{snum(production * 3600)}/{unit}
    </div>
  </Fragment>
);
