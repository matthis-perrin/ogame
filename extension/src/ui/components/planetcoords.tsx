import React, {FC, Fragment} from 'react';
import styled from 'styled-components';

import {goToGalaxy} from '@src/controllers/navigator';
import {PlanetCoords, PlanetName} from '@src/models/planets';

interface PlanetCoordsProps {
  coords: PlanetCoords;
  name: PlanetName;
}

export const PlanetCoordsC: FC<PlanetCoordsProps> = ({coords, name}) => (
  <Fragment>
    <PlanetCoordsContainer
      onClick={e => {
        e.stopPropagation();
        goToGalaxy(coords);
      }}
      title={coords}
    >
      {name}
    </PlanetCoordsContainer>
  </Fragment>
);

const PlanetCoordsContainer = styled.span`
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
`;
