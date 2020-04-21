import React, {FC, Fragment} from 'react';
import styled from 'styled-components';

import {goToFleets, goToShips} from '@src/controllers/navigator';
import {Account, findPlanetId} from '@src/models/account';
import {COLOR_GREEN} from '@src/models/constants';
import {Fleet, MissionTypeEnum, missionTypeString} from '@src/models/fleets';
import {Title} from '@src/ui/common';
import {PlanetCoordsC} from '@src/ui/components/planetcoords';
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
            <Element
              key={fleet.fleetId}
              onClick={() => {
                let planetName = fleet.destinationName;
                if (fleet.missionType === MissionTypeEnum.Transport) {
                  planetName = fleet.originName;
                }
                const planetId = findPlanetId(account.planetList, planetName);
                if (planetId === undefined) {
                  return;
                }
                goToShips(planetId);
              }}
              style={{cursor: 'pointer'}}
            >
              <div>
                {missionTypeString(fleet)}
                {fleet.returnFlight ? ' (R)' : ''}
              </div>
              <div>
                <PlanetCoordsC coords={fleet.originCoords} name={fleet.originName} /> =>{' '}
                <PlanetCoordsC coords={fleet.destinationCoords} name={fleet.destinationName} />
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
