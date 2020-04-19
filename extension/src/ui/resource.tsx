import React, {FC, Fragment} from 'react';
import styled from 'styled-components';

import {INACTIVITY_TIME} from '@src/models/constants';
import {ResourceAmount} from '@src/models/resources';
import {snum, sum} from '@src/ui/utils';

interface ResourceProps {
  name: string;
  amount: ResourceAmount;
  storage: ResourceAmount;
  production: ResourceAmount;
}

export const Resource: FC<ResourceProps> = ({name, amount, storage, production}) => {
  let className = '';
  const inactivityAmount = production * 3600 * INACTIVITY_TIME;

  if (amount >= storage) {
    className = 'red';
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
  } else if (sum([amount, inactivityAmount]) >= storage) {
    className = 'orange';
  }

  return (
    <Fragment>
      <ResourceContainer className={className}>
        {name}: {snum(amount)} / {snum(storage)}
      </ResourceContainer>
    </Fragment>
  );
};

const ResourceContainer = styled.div`
  &.red {
    color: #d43635;
  }
  &.orange {
    color: #d29d00;
  }
`;
