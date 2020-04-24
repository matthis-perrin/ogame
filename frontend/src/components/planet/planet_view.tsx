import React, {FC} from 'react';
import styled from 'styled-components';

import {Planet} from '@shared/models/planet';

import {ResourcesView} from '@src/components/core/resources_view';

export const PlanetView: FC<{planet: Planet}> = ({planet}) => {
  const {id} = planet;
  return (
    <Wrapper>
      {`Planet ${id}`}
      <ResourcesView resources={planet.resources} showAll />
    </Wrapper>
  );
};
PlanetView.displayName = 'PlanetView';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
`;
