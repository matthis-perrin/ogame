import React, {FC, Fragment} from 'react';

import {ResourceAmount} from '@src/models/resources';
import {snum} from '@src/ui/utils';

interface ResourceProps {
  name: string;
  production: ResourceAmount;
}

export const Production: FC<ResourceProps> = ({name, production}) => (
  <Fragment>
    <div>
      {name}: +{snum(production * 3600)}/h
      {/* {name}: +{production * 3600}/h */}
    </div>
  </Fragment>
);
