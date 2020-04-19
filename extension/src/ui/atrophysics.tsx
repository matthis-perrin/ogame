import React, {FC, Fragment} from 'react';
import styled from 'styled-components';

import {snum, time} from '@src/ui/utils';

interface AstrophysicsProps {
  name: string;
  cost: number;
  seconds: number;
}

export const Astrophysics: FC<AstrophysicsProps> = ({name, cost, seconds}) => {
  let className = '';

  if (seconds <= 0) {
    className = 'green';
  }

  return (
    <Fragment>
      <AstrophysicsContainer className={className}>
        {name}: {snum(cost)}
        {seconds <= 0 ? '' : ` ${time(seconds)}`}
      </AstrophysicsContainer>
    </Fragment>
  );
};

const AstrophysicsContainer = styled.div`
  &.green {
    color: #9c0;
  }
`;
