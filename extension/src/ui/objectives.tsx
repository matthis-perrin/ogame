import React, {FC, Fragment} from 'react';
import styled from 'styled-components';

import {LargeCargo} from '@shared/models/ships';

import {goToTechnology, goToUrl, sendLargeCargosUrl} from '@src/controllers/navigator';
import {Account} from '@src/models/account';
import {COLOR_GREEN, COLOR_RED} from '@src/models/constants';
import {MissionTypeEnum} from '@src/models/fleets';
import {findPlanetCoords, findPlanetName} from '@src/models/planets';
import {getFretCapacity, TechnologyIndex, techShortName} from '@src/models/technologies';
import {setAccount} from '@src/stores/account';
import {updateObjectives} from '@src/stores/account/objectives';
import {EmptyLine, HoverTD, Table, Title} from '@src/ui/common';
import {Resource} from '@src/ui/components/resource';
import {time} from '@src/ui/utils';

interface ObjectivesProps {
  account: Account;
}

export const ObjectivesC: FC<ObjectivesProps> = ({account}) => {
  const nowSeconds = Math.floor(new Date().getTime() / 1000);

  return (
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
                <HoverTD onClick={() => updateObjectives(account)}>Refresh</HoverTD>
                <HoverTD
                  onClick={() => {
                    if (account.objectives !== undefined) {
                      account.objectives.botEnabled = !account.objectives.botEnabled;
                      setAccount(account);
                    }
                  }}
                >
                  Bot: {account.objectives.botEnabled ? 'ON' : 'OFF'}
                </HoverTD>
              </tr>
              <tr>
                <EmptyLine></EmptyLine>
              </tr>
              {account.objectives.technologies.map((technology, index, origin) => {
                const smartTech = TechnologyIndex.get(technology.techId);
                return (
                  <HoverLine
                    key={index}
                    onClick={() => {
                      if (account.objectives) {
                        goToTechnology(technology.techId, account.objectives.planetId);
                      }
                    }}
                  >
                    <td>{techShortName(technology.techId)}</td>
                    <td>
                      {smartTech?.type === 'ship' || smartTech?.type === 'defense'
                        ? (technology.target ?? 0) - technology.value
                        : technology.target ?? 0}
                    </td>
                    <td
                      onClick={e => {
                        e.stopPropagation();
                        if (origin.length > 1) {
                          origin.splice(index, 1);
                          updateObjectives(account);
                        } else {
                          account.objectives = undefined;
                        }
                      }}
                    >
                      Del
                    </td>
                  </HoverLine>
                );
              })}
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
              <Status
                className={
                  account.objectives.readyTimeSeconds.metal - nowSeconds <= 0 ? 'green' : 'red'
                }
              >
                <td>
                  <Resource name="M" amount={account.objectives.neededResources.metal} />
                </td>
                <td>
                  {account.objectives.readyTimeSeconds.metal - nowSeconds > 0
                    ? time(account.objectives.readyTimeSeconds.metal - nowSeconds)
                    : 'Disponible'}
                </td>
              </Status>
              <Status
                className={
                  account.objectives.readyTimeSeconds.crystal - nowSeconds <= 0 ? 'green' : 'red'
                }
              >
                <td>
                  <Resource name="C" amount={account.objectives.neededResources.crystal} />
                </td>
                <td>
                  {account.objectives.readyTimeSeconds.crystal - nowSeconds > 0
                    ? time(account.objectives.readyTimeSeconds.crystal - nowSeconds)
                    : 'Disponible'}
                </td>
              </Status>
              <Status
                className={
                  account.objectives.readyTimeSeconds.deuterium - nowSeconds <= 0 ? 'green' : 'red'
                }
              >
                <td>
                  <Resource name="D" amount={account.objectives.neededResources.deuterium} />
                </td>
                <td>
                  {account.objectives.readyTimeSeconds.deuterium - nowSeconds > 0
                    ? time(account.objectives.readyTimeSeconds.deuterium - nowSeconds)
                    : 'Disponible'}
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
                const sendInSeconds =
                  Math.max(0, (account.objectives?.readyTimeSeconds.max ?? 0) - nowSeconds) +
                  Math.max(
                    0,
                    (account.objectives?.startTime !== undefined
                      ? account.objectives.startTime - nowSeconds
                      : 0) + transfer.sendInSeconds
                  );
                return (
                  <HoverGT
                    key={`${transfer.from}_${transfer.to}`}
                    onClick={() => {
                      if (sendInSeconds !== 0 && !transfer.isTransferring) {
                        return;
                      }
                      const url = sendLargeCargosUrl(
                        transfer.from,
                        findPlanetCoords(account.planetList, transfer.to),
                        MissionTypeEnum.Deployment,
                        requiredGt,
                        transfer.resources
                      );
                      goToUrl(url);
                    }}
                    className={
                      sendInSeconds === 0 && !transfer.isTransferring
                        ? 'hoverable'
                        : transfer.isTransferring
                        ? 'green'
                        : ''
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
                    <td className={requiredGt > gtAmount && !transfer.isTransferring ? 'red' : ''}>
                      GT: {requiredGt}
                    </td>
                    <td>{sendInSeconds === 0 ? 'Prêt' : time(sendInSeconds)}</td>
                  </HoverGT>
                );
              })}
            </tbody>
          </Table>
        )}
      </Container>
    </Fragment>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

const HoverLine = styled.tr`
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
`;

const HoverGT = styled.tr`
  &.hoverable {
    cursor: pointer;
    &:hover {
      text-decoration: underline;
    }
  }
  &.green {
    color: ${COLOR_GREEN};
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
