import React, {FC, Fragment} from 'react';
import styled from 'styled-components';

import {COLOR_ORANGE, COLOR_RED} from '@src/models/constants';
import {PlanetId} from '@src/models/planets';
import {Technology, TechnologyIndex} from '@src/models/technologies';
import {addObjectives} from '@src/stores/account/objectives';

interface TechnologyProps {
  name: string;
  technologies: {[techId: number]: Technology};
  techId: number;
  planetId: PlanetId;
  required?: number;
  additional?: number;
}

const SubTechnology: FC<{
  technology: Technology;
  missingAmount: number | undefined;
  planetId: PlanetId;
  additionalAmount: number;
}> = ({technology, missingAmount, planetId, additionalAmount}) => {
  const smartTech = TechnologyIndex.get(technology.techId);
  return (
    <Fragment>
      <Value
        onClick={e => {
          if (smartTech?.type !== 'building' && smartTech?.type !== 'technology') {
            return;
          }
          e.stopPropagation();
          const currentValue =
            technology.target !== undefined ? technology.target : technology.value;
          addObjectives(planetId, {
            techId: technology.techId,
            value: currentValue,
            target: currentValue + 1,
          });
        }}
        className={
          smartTech?.type === 'building' || smartTech?.type === 'technology' ? 'hoverable' : ''
        }
      >
        {technology.value + additionalAmount}
      </Value>
      {technology.target !== undefined ? <span>+{technology.target - technology.value}</span> : ''}

      {missingAmount === undefined || missingAmount <= 0 ? (
        ''
      ) : (
        <span>
          {' '}
          (
          <Value
            onClick={e => {
              if (smartTech?.type !== 'ship' && smartTech?.type !== 'defense') {
                return;
              }
              e.stopPropagation();
              addObjectives(planetId, {
                techId: technology.techId,
                value: technology.value + additionalAmount,
                target: technology.value + additionalAmount + missingAmount,
              });
            }}
            className={
              smartTech?.type === 'ship' || smartTech?.type === 'defense' ? 'hoverable' : ''
            }
          >
            {missingAmount}
          </Value>
          )
        </span>
      )}
    </Fragment>
  );
};

export const TechnologyC: FC<TechnologyProps> = ({
  name,
  technologies,
  techId,
  planetId,
  required,
  additional,
}) => {
  let technology: Technology | undefined;
  if (technologies.hasOwnProperty(techId)) {
    technology = technologies[techId];
  }

  let missingAmount: number | undefined;
  let className = '';
  const additionalAmount = additional ?? 0;

  if (required !== undefined && technology !== undefined) {
    const target = technology.target === undefined ? technology.value : technology.target;
    missingAmount = required - target - additionalAmount;
    if (missingAmount > 0) {
      className = 'red';
    } else if (technology.target !== undefined && target === required) {
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
            additionalAmount={additionalAmount}
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
  &.hoverable {
    cursor: pointer;
    &:hover {
      text-decoration: underline;
    }
  }
`;
