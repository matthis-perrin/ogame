import React, {FC, Fragment} from 'react';
import styled from 'styled-components';

import {COLOR_ORANGE, COLOR_RED} from '@src/models/constants';
import {PlanetId} from '@src/models/planets';
import {Technology, TechnologyIndex} from '@src/models/technologies';
import {addObjectives} from '@src/stores/store_account';

interface TechnologyProps {
  name: string;
  technologies: {[techId: number]: Technology};
  techId: number;
  planetId: PlanetId;
  required?: number;
}

const SubTechnology: FC<{
  technology: Technology;
  missingAmount: number | undefined;
  planetId: PlanetId;
}> = ({technology, missingAmount, planetId}) => (
  <Fragment>
    <Value
      onClick={e => {
        e.stopPropagation();
        const smartTech = TechnologyIndex.get(technology.techId);
        if (smartTech?.type !== 'building') {
          return;
        }
        const currentValue = technology.target !== undefined ? technology.target : technology.value;
        addObjectives(planetId, {
          techId: technology.techId,
          value: currentValue,
          target: currentValue + 1,
        });
      }}
    >
      {technology.value}
    </Value>
    {technology.target !== undefined ? <span>+{technology.target - technology.value}</span> : ''}
    {missingAmount === undefined || missingAmount <= 0 ? '' : <span> ({missingAmount})</span>}
  </Fragment>
);

export const TechnologyC: FC<TechnologyProps> = ({
  name,
  technologies,
  techId,
  planetId,
  required,
}) => {
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
        <span>{name}: </span>
        {technology !== undefined ? (
          <SubTechnology
            technology={technology}
            missingAmount={missingAmount}
            planetId={planetId}
          />
        ) : (
          <span>0</span>
        )}
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

const Value = styled.span`
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
`;
