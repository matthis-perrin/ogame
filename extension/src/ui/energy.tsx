import React, {FC, Fragment} from 'react';
import styled from 'styled-components';

import {ResourceAmount} from '@src/models/resources';

interface EnergyProps {
  name: string;
  amount: ResourceAmount;
}

export const Energy: FC<EnergyProps> = ({name, amount}) => {
  let className = '';

  if (amount < 0) {
    className = 'red';
  }

  return (
    <Fragment>
      <EnergyContainer className={className}>
        {name}: {amount}
      </EnergyContainer>
    </Fragment>
  );
};

const EnergyContainer = styled.div`
  &.red {
    color: #d43635;
  }
`;
