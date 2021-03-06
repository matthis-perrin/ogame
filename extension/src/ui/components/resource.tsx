import React, {FC, Fragment} from 'react';
import styled from 'styled-components';

import {COLOR_ORANGE, COLOR_RED, INACTIVITY_TIME} from '@src/models/constants';
import {ResourceAmount} from '@src/models/resources';
import {snum, sum} from '@src/ui/utils';

interface ResourceProps {
  name: string;
  amount: ResourceAmount;
  storage?: ResourceAmount;
  production?: ResourceAmount;
}

export const Resource: FC<ResourceProps> = ({name, amount, storage, production}) => {
  let className = '';
  const inactivityAmount =
    production === undefined ? undefined : production * 3600 * INACTIVITY_TIME;
  if (storage !== undefined && inactivityAmount !== undefined) {
    if (amount >= storage) {
      className = 'red';
      // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    } else if (sum([amount, inactivityAmount]) >= storage) {
      className = 'orange';
    }
  }

  return (
    <Fragment>
      <ResourceContainer className={className}>
        {name}: {snum(amount)}
        {storage === undefined ? '' : ` / ${snum(storage)}`}
      </ResourceContainer>
    </Fragment>
  );
};

const ResourceContainer = styled.div`
  &.red {
    color: ${COLOR_RED};
  }
  &.orange {
    color: ${COLOR_ORANGE};
  }
`;
