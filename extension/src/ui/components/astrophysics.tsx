import React, {FC, Fragment} from 'react';
import styled from 'styled-components';

import {COLOR_GREEN, COLOR_RED} from '@src/models/constants';
import {snum, time} from '@src/ui/utils';

interface AstrophysicsProps {
  name: string;
  cost: number;
  seconds: number | undefined;
}

export const Astrophysics: FC<AstrophysicsProps> = ({name, cost, seconds}) => {
  let className = '';

  if (seconds === undefined) {
    className = 'red';
  } else if (seconds <= 0) {
    className = 'green';
  }

  return (
    <Fragment>
      <AstrophysicsContainer className={className}>
        {name}: {snum(cost)}
        {seconds === undefined || seconds <= 0 ? '' : ` ${time(seconds)}`}
      </AstrophysicsContainer>
    </Fragment>
  );
};

const AstrophysicsContainer = styled.div`
  &.red {
    color: ${COLOR_RED};
  }
  &.green {
    color: ${COLOR_GREEN};
  }
`;
