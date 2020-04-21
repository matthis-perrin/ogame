import React, {FC, Fragment} from 'react';
import styled from 'styled-components';

import {COLOR_ORANGE, COLOR_RED} from '@src/models/constants';
import {Technology} from '@src/models/technologies';

interface TechnologyProps {
  name: string;
  technologies: {[techId: number]: Technology};
  techId: number;
  required?: number;
}

export const TechnologyC: FC<TechnologyProps> = ({name, technologies, techId, required}) => {
  let technology: Technology | undefined;
  if (technologies.hasOwnProperty(techId)) {
    technology = technologies[techId];
  }

  let missingAmount: number | undefined;
  let className = '';

  if (required !== undefined && technology !== undefined) {
    const target = technology.target === undefined ? technology.value : technology.target;
    missingAmount = required - target;
    if (missingAmount > 0) {
      className = 'red';
    } else if (technology.target !== undefined) {
      className = 'orange';
    }
  }

  return (
    <Fragment>
      <TechnologyContainer className={className}>
        {name}:{' '}
        {technology !== undefined
          ? `${technology.value}${
              technology.target !== undefined ? `+${technology.target - technology.value}` : ''
            }${missingAmount === undefined || missingAmount <= 0 ? '' : ` (${missingAmount})`}`
          : '0'}
      </TechnologyContainer>
    </Fragment>
  );
};

const TechnologyContainer = styled.div`
  &.red {
    color: ${COLOR_RED};
  }
  &.orange {
    color: ${COLOR_ORANGE};
  }
`;
