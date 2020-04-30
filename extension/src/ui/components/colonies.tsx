import React, {FC, Fragment} from 'react';
import styled from 'styled-components';

import {Account} from '@src/models/account';
import {PlanetCoords} from '@src/models/planets';
import {Table, Title} from '@src/ui/common';
import {PlanetCoordsC} from '@src/ui/components/planetcoords';

interface ColoniesProps {
  account: Account;
}

const positionRegex = /\[\d+:\d+:(\d+)\]/;
function position(coords: string): number {
  const positionMatch = positionRegex.exec(coords);
  // eslint-disable-next-line no-null/no-null
  if (positionMatch === null) {
    return 0;
  }
  return parseFloat(positionMatch[1]);
}

export const Colonies: FC<ColoniesProps> = ({account}) => {
  const allowedPositions = ['8', '9', '10'];
  const potentialColonies = Object.keys(account.emptyPlanets).filter(coords => {
    for (const allowedPosition of allowedPositions) {
      if (coords.endsWith(`:${allowedPosition}]`)) {
        return true;
      }
    }
    return false;
  });
  potentialColonies.sort((a, b) => {
    if (position(a) > position(b)) {
      return 1;
    }
    return -1;
  });

  return (
    <Fragment>
      <Container>
        <Table>
          <thead>
            <tr>
              <th>
                <Title>Colonies</Title>
              </th>
            </tr>
          </thead>
          <tbody>
            {potentialColonies.map(coords => (
              <tr key={coords}>
                <td>
                  <PlanetCoordsC name={coords} coords={coords as PlanetCoords} />
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Container>
    </Fragment>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;
