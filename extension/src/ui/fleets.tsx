import React, {FC, Fragment} from 'react';
import styled from 'styled-components';

import {goToFleets, goToShips} from '@src/controllers/navigator';
import {Account, findPlanetId} from '@src/models/account';
import {COLOR_GREEN} from '@src/models/constants';
import {Fleet, missionTypeString} from '@src/models/fleets';
import {Table, Title} from '@src/ui/common';
import {PlanetCoordsC} from '@src/ui/components/planetcoords';
import {Resource} from '@src/ui/components/resource';
import {sum, time} from '@src/ui/utils';

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

  fleets.sort((a, b) => a.arrivalTime - b.arrivalTime);
  const now = Math.floor(new Date().getTime() / 1000);

  return (
    <Fragment>
      <Container>
        <Table>
          <thead>
            <tr>
              <th colSpan={4}>
                <Title onClick={() => goToFleets()} style={{cursor: 'pointer'}}>
                  Flottes
                </Title>
              </th>
            </tr>
          </thead>
          <tbody>
            {fleets.map(fleet => {
              const seconds = fleet.arrivalTime - now;
              const resourcesSum = sum([
                fleet.resources.metal,
                fleet.resources.crystal,
                fleet.resources.deuterium,
              ]);
              return (
                <tr key={fleet.fleetId}>
                  <td>
                    {missionTypeString(fleet)}
                    {fleet.returnFlight ? ' (R)' : ''}
                  </td>
                  <td>
                    <PlanetCoordsC coords={fleet.originCoords} name={fleet.originName} /> =>{' '}
                    <PlanetCoordsC coords={fleet.destinationCoords} name={fleet.destinationName} />
                  </td>
                  <td>
                    <Resource name="Σ" amount={resourcesSum} />
                  </td>
                  <Hover
                    onClick={() => {
                      const planetId = findPlanetId(account.planetList, fleet.destinationName);
                      if (planetId === undefined) {
                        return;
                      }
                      goToShips(planetId);
                    }}
                  >
                    {seconds > 0 ? (
                      time(seconds)
                    ) : (
                      <span style={{color: COLOR_GREEN}}>Arrivée</span>
                    )}
                  </Hover>
                </tr>
              );
            })}
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

const Hover = styled.td`
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
`;
