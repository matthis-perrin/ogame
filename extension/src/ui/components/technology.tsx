import React, {FC, Fragment} from 'react';
import styled from 'styled-components';

import {TechId} from '@src/models/resources';
import {Technology} from '@src/models/technologies';

interface TechnologyProps {
  name: string;
  technologies: {[techId: string]: Technology};
  techId: TechId;
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
          : '-'}
      </TechnologyContainer>
    </Fragment>
  );
};

const TechnologyContainer = styled.div`
  &.red {
    color: #d43635;
  }
  &.orange {
    color: #d29d00;
  }
`;
