import React, {FC} from 'react';
import styled from 'styled-components';

import {getPlanetProductionPerHour} from '@shared/lib/production';
import {Account} from '@shared/models/account';
import {Planet} from '@shared/models/planet';
import {substract} from '@shared/utils/type_utils';

import {ResourcesView} from '@src/components/core/resources_view';

export const PlanetView: FC<{account: Account; planet: Planet}> = ({account, planet}) => {
  const {id} = planet;
  const {energyConsumption, energyProduction} = getPlanetProductionPerHour(account, planet);
  return (
    <Wrapper>
      {`Planet ${id}`}
      <ResourcesView
        resources={planet.resources}
        energy={substract(energyProduction, energyConsumption)}
        showAll
      />
    </Wrapper>
  );
};
PlanetView.displayName = 'PlanetView';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
`;
