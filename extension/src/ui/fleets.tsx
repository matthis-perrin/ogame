import React, {FC, Fragment} from 'react';
import styled from 'styled-components';

import {goToFleets, goToGalaxy} from '@src/controllers/navigator';
import {Account} from '@src/models/account';
import {COLOR_GREEN} from '@src/models/constants';
import {Fleet, missionTypeString} from '@src/models/fleets';
import {Title} from '@src/ui/common';
import {time} from '@src/ui/utils';

interface FleetsProps {
  account: Account;
}

export const Fleets: FC<FleetsProps> = ({account}) => {
  const fleets: Fleet[] = [];
  for (const fleetId in account.fleets) {
    if (account.fleets.hasOwnProperty(fleetId)) {
      const fleet = account.fleets[fleetId];
      fleets.push(fleet);
    }
  }

  fleets.sort((a, b) => a.midTime - b.midTime);
  const now = Math.floor(new Date().getTime() / 1000);

  return (
    <Fragment>
      <Container>
        <Title onClick={() => goToFleets()} style={{cursor: 'pointer'}}>
          Flottes
        </Title>
        {fleets.map(fleet => {
          const seconds = fleet.midTime - now;
          return (
            <Element key={fleet.fleetId}>
              <div>{missionTypeString(fleet)}</div>
              <div>
                <span onClick={() => goToGalaxy(fleet.originCoords)} style={{cursor: 'pointer'}}>
                  {fleet.originName}
                </span>{' '}
                =>{' '}
                <span onClick={() => goToGalaxy(fleet.originCoords)} style={{cursor: 'pointer'}}>
                  {fleet.destinationName}
                </span>
              </div>
              <div>
                {seconds > 0 ? time(seconds) : <span style={{color: COLOR_GREEN}}>Arrivée</span>}
              </div>
            </Element>
          );
        })}
      </Container>
    </Fragment>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

const Element = styled.div`
  margin-bottom: 10px;
`;
