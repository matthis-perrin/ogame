/* eslint-disable @typescript-eslint/no-magic-numbers */
import React, {FC, Fragment} from 'react';
import styled from 'styled-components';

import {LargeCargo} from '@shared/models/ships';

import {goToTechnology, goToUrl, sendLargeCargosUrl} from '@src/controllers/navigator';
import {Account, AccountPlanet} from '@src/models/account';
import {COLOR_GREEN, COLOR_RED} from '@src/models/constants';
import {MissionTypeEnum} from '@src/models/fleets';
import {findPlanetCoords, findPlanetName} from '@src/models/planets';
import {getFretCapacity, TechnologyIndex, techShortName} from '@src/models/technologies';
import {setAccount} from '@src/stores/account';
import {updateObjectives} from '@src/stores/account/objectives';
import {EmptyLine, HoverTD, Table, Title} from '@src/ui/common';
import {Resource} from '@src/ui/components/resource';
import {sum, timeEl} from '@src/ui/utils';

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
                  className={account.objectives.speedModifier === 0.1 ? 'green' : ''}
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
            </tbody>
          )}
        </Table>
        <Table>
          {account.objectives === undefined ? (
            <tbody></tbody>
          ) : (
            <tbody>
              <tr>
                <td>Vitesse</td>
                <HoverTD
                  className={account.objectives.speedModifier === 0.1 ? 'green' : ''}
                  onClick={() => {
                    if (account.objectives !== undefined) {
                      account.objectives.speedModifier = 0.1;
                      updateObjectives(account);
                    }
                  }}
                >
                  10
                </HoverTD>
                <HoverTD
                  className={account.objectives.speedModifier === 0.2 ? 'green' : ''}
                  onClick={() => {
                    if (account.objectives !== undefined) {
                      account.objectives.speedModifier = 0.2;
                      updateObjectives(account);
                    }
                  }}
                >
                  20
                </HoverTD>
                <HoverTD
                  className={account.objectives.speedModifier === 0.3 ? 'green' : ''}
                  onClick={() => {
                    if (account.objectives !== undefined) {
                      account.objectives.speedModifier = 0.3;
                      updateObjectives(account);
                    }
                  }}
                >
                  30
                </HoverTD>
                <HoverTD
                  className={account.objectives.speedModifier === 0.4 ? 'green' : ''}
                  onClick={() => {
                    if (account.objectives !== undefined) {
                      account.objectives.speedModifier = 0.4;
                      updateObjectives(account);
                    }
                  }}
                >
                  40
                </HoverTD>
                <HoverTD
                  className={account.objectives.speedModifier === 0.5 ? 'green' : ''}
                  onClick={() => {
                    if (account.objectives !== undefined) {
                      account.objectives.speedModifier = 0.5;
                      updateObjectives(account);
                    }
                  }}
                >
                  50
                </HoverTD>
                <HoverTD
                  className={account.objectives.speedModifier === 0.6 ? 'green' : ''}
                  onClick={() => {
                    if (account.objectives !== undefined) {
                      account.objectives.speedModifier = 0.6;
                      updateObjectives(account);
                    }
                  }}
                >
                  60
                </HoverTD>
                <HoverTD
                  className={account.objectives.speedModifier === 0.7 ? 'green' : ''}
                  onClick={() => {
                    if (account.objectives !== undefined) {
                      account.objectives.speedModifier = 0.7;
                      updateObjectives(account);
                    }
                  }}
                >
                  70
                </HoverTD>
                <HoverTD
                  className={account.objectives.speedModifier === 0.8 ? 'green' : ''}
                  onClick={() => {
                    if (account.objectives !== undefined) {
                      account.objectives.speedModifier = 0.8;
                      updateObjectives(account);
                    }
                  }}
                >
                  80
                </HoverTD>
                <HoverTD
                  className={account.objectives.speedModifier === 0.9 ? 'green' : ''}
                  onClick={() => {
                    if (account.objectives !== undefined) {
                      account.objectives.speedModifier = 0.9;
                      updateObjectives(account);
                    }
                  }}
                >
                  90
                </HoverTD>
                <HoverTD
                  className={account.objectives.speedModifier === 1 ? 'green' : ''}
                  onClick={() => {
                    if (account.objectives !== undefined) {
                      account.objectives.speedModifier = 1;
                      updateObjectives(account);
                    }
                  }}
                >
                  100
                </HoverTD>
              </tr>
              <tr>
                <EmptyLine></EmptyLine>
              </tr>
            </tbody>
          )}
        </Table>
        <Table>
          {account.objectives === undefined ? (
            <tbody></tbody>
          ) : (
            <tbody>
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
                      Delete
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
                    ? timeEl(account.objectives.readyTimeSeconds.metal - nowSeconds)
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
                    ? timeEl(account.objectives.readyTimeSeconds.crystal - nowSeconds)
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
                    ? timeEl(account.objectives.readyTimeSeconds.deuterium - nowSeconds)
                    : 'Disponible'}
                </td>
              </Status>
              <Status>
                <td colSpan={2}>
                  <Resource name="F" amount={account.objectives.neededResources.fuel} />
                </td>
              </Status>
              <Status>
                <td colSpan={2}>
                  <div>T: {timeEl(account.objectives.longestTimeSeconds)}</div>
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
                const destinationCoords = findPlanetCoords(account.planetList, transfer.to);
                const fretLargeCargo = getFretCapacity(account.accountTechnologies, LargeCargo);
                const requiredLargeCargos = Math.ceil(transfer.resources.sum / fretLargeCargo);
                let largeCargoAmount = 0;
                let planet: AccountPlanet | undefined;
                if (account.planetDetails.hasOwnProperty(transfer.from)) {
                  planet = account.planetDetails[transfer.from];
                  largeCargoAmount = planet.ships.hasOwnProperty(LargeCargo.id)
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
                        destinationCoords,
                        MissionTypeEnum.Deployment,
                        requiredLargeCargos,
                        false,
                        transfer.resources,
                        account.objectives?.speedModifier ?? 1
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
                    <HoverTD
                      onClick={e => {
                        e.stopPropagation();
                        if (account.objectives !== undefined) {
                          account.objectives.bannedPlanets.push(transfer.from);
                          updateObjectives(account);
                        }
                      }}
                    >
                      {findPlanetName(account.planetList, transfer.from)}
                    </HoverTD>
                    <td
                      className={
                        planet !== undefined && planet.resources.metal < transfer.resources.metal
                          ? 'red'
                          : ''
                      }
                    >
                      <Resource name="M" amount={transfer.resources.metal} />
                    </td>
                    <td
                      className={
                        planet !== undefined &&
                        planet.resources.crystal < transfer.resources.crystal
                          ? 'red'
                          : ''
                      }
                    >
                      <Resource name="C" amount={transfer.resources.crystal} />
                    </td>
                    <td
                      className={
                        planet !== undefined &&
                        planet.resources.deuterium <
                          sum([transfer.resources.deuterium, transfer.resources.fuel])
                          ? 'red'
                          : ''
                      }
                    >
                      <Resource name="D" amount={transfer.resources.deuterium} />
                    </td>
                    <td
                      className={
                        requiredLargeCargos > largeCargoAmount && !transfer.isTransferring
                          ? 'red'
                          : ''
                      }
                    >
                      GT: {requiredLargeCargos}
                    </td>
                    <td>{sendInSeconds === 0 ? 'Prêt' : timeEl(sendInSeconds)}</td>
                  </HoverGT>
                );
              })}
              <tr>
                <EmptyLine />
              </tr>
            </tbody>
          </Table>
        )}
        {account.objectives === undefined || account.objectives.bannedPlanets.length === 0 ? (
          ''
        ) : (
          <Table>
            <tbody>
              <tr>
                <td>Planètes ignorées :</td>
              </tr>
              <tr>
                <EmptyLine />
              </tr>
              {account.objectives.bannedPlanets.map((bannedPlanet, index) => (
                <tr>
                  <HoverTD
                    onClick={e => {
                      e.stopPropagation();
                      if (account.objectives !== undefined) {
                        account.objectives.bannedPlanets.splice(index, 1);
                        updateObjectives(account);
                      }
                    }}
                  >
                    {findPlanetName(account.planetList, bannedPlanet)}
                  </HoverTD>
                </tr>
              ))}
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
