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
  let missingAmount: number | undefined;
  let className = '';
  if (required !== undefined && technologies.hasOwnProperty(techId)) {
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    missingAmount = required - technologies[techId].value;
    if (missingAmount > 0) {
      className = 'red';
    }
  }

  return (
    <Fragment>
      <TechnologyContainer className={className}>
        {name}:{' '}
        {technologies.hasOwnProperty(techId)
          ? `${technologies[techId].value}${
              missingAmount === undefined || missingAmount <= 0 ? '' : ` (${missingAmount})`
            }`
          : '-'}
      </TechnologyContainer>
    </Fragment>
  );
};

const TechnologyContainer = styled.div`
  &.red {
    color: #d43635;
  }
`;
