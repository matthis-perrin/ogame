import React, {FC, Fragment} from 'react';
import styled from 'styled-components';

import {LargeCargo} from '@shared/models/ships';

import {goToTechnology, sendLargeCargos} from '@src/controllers/navigator';
import {Account} from '@src/models/account';
import {COLOR_GREEN, COLOR_RED} from '@src/models/constants';
import {MissionTypeEnum} from '@src/models/fleets';
import {findPlanetCoords, findPlanetName} from '@src/models/planets';
import {getFretCapacity, techShortName} from '@src/models/technologies';
import {Table, Title} from '@src/ui/common';
import {Resource} from '@src/ui/components/resource';

interface ObjectivesProps {
  account: Account;
}

export const ObjectivesC: FC<ObjectivesProps> = ({account}) => (
  <Fragment>
    <Container>
      <Table>
        <thead>
          <tr>
            <th>
              <Title>Objectifs</Title>
            </th>
          </tr>
        </thead>
        {account.objectives === undefined ? (
          <tbody></tbody>
        ) : (
          <tbody>
            <tr>
              <td>Planète</td>
              <td>{findPlanetName(account.planetList, account.objectives.planetId)}</td>
            </tr>
            <tr>
              <EmptyLine></EmptyLine>
            </tr>
            {account.objectives.technologies.map((technology, index, origin) => (
              <HoverLine
                key={technology.techId}
                onClick={() => {
                  if (account.objectives) {
                    goToTechnology(technology.techId, account.objectives.planetId);
                  }
                }}
              >
                <td>{techShortName(technology.techId)}</td>
                <td>{technology.target}</td>
                <td
                  onClick={e => {
                    e.stopPropagation();
                    if (origin.length > 1) {
                      origin.splice(index, 1);
                    } else {
                      account.objectives = undefined;
                    }
                  }}
                >
                  Del
                </td>
              </HoverLine>
            ))}
            <tr>
              <EmptyLine></EmptyLine>
            </tr>
          </tbody>
        )}
      </Table>
      {account.objectives === undefined ? (
        ''
      ) : (
        <Table>
          <tbody>
            <Status className={account.objectives.enoughResources ? 'green' : 'red'}>
              <td>
                <Resource name="M" amount={account.objectives.neededResources.metal} />
              </td>
              <td>
                <Resource name="C" amount={account.objectives.neededResources.crystal} />
              </td>
              <td>
                <Resource name="D" amount={account.objectives.neededResources.deuterium} />
              </td>
              <td>
                <Resource name="Σ" amount={account.objectives.neededResources.sum} />
              </td>
            </Status>
            <tr>
              <EmptyLine></EmptyLine>
            </tr>
          </tbody>
        </Table>
      )}
      {account.objectives === undefined ? (
        ''
      ) : (
        <Table>
          <tbody>
            {account.objectives.resourceTransfers.map(transfer => {
              const fretGt = getFretCapacity(account.accountTechnologies, LargeCargo);
              const requiredGt = Math.ceil(transfer.resources.sum / fretGt);
              let gtAmount = 0;
              if (account.planetDetails.hasOwnProperty(transfer.from)) {
                const planet = account.planetDetails[transfer.from];
                gtAmount = planet.ships.hasOwnProperty(LargeCargo.id)
                  ? planet.ships[LargeCargo.id].value
                  : 0;
              }
              return (
                <HoverGT
                  key={`${transfer.from}_${transfer.to}`}
                  onClick={() =>
                    sendLargeCargos(
                      transfer.from,
                      findPlanetCoords(account.planetList, transfer.to),
                      MissionTypeEnum.Transport,
                      requiredGt,
                      transfer.resources
                    )
                  }
                >
                  <td>{findPlanetName(account.planetList, transfer.from)}</td>
                  <td>
                    <Resource name="M" amount={transfer.resources.metal} />
                  </td>
                  <td>
                    <Resource name="C" amount={transfer.resources.crystal} />
                  </td>
                  <td>
                    <Resource name="D" amount={transfer.resources.deuterium} />
                  </td>
                  <td className={requiredGt > gtAmount ? 'red' : ''}>GT: {requiredGt}</td>
                </HoverGT>
              );
            })}
          </tbody>
        </Table>
      )}
    </Container>
  </Fragment>
);

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

const EmptyLine = styled.td`
  height: 10px;
`;

const HoverLine = styled.tr`
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
`;

const HoverGT = styled.tr`
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
  td.red {
    color: ${COLOR_RED};
  }
`;

const Status = styled.tr`
  &.green {
    color: ${COLOR_GREEN};
  }
  &.red {
    color: ${COLOR_RED};
  }
`;
