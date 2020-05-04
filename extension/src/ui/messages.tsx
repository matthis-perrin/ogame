import React, {FC, Fragment, useState} from 'react';
import styled from 'styled-components';

import {LargeCargo} from '@shared/models/ships';

import {deleteMessage, sendProbes} from '@src/controllers/function';
import {goToMessages, goToUrl, sendLargeCargosUrl} from '@src/controllers/navigator';
import {Account} from '@src/models/account';
import {COLOR_ORANGE, COLOR_RED} from '@src/models/constants';
import {MissionTypeEnum} from '@src/models/fleets';
import {Message, MessageSort} from '@src/models/messages';
import {PlanetCoords} from '@src/models/planets';
import {getFretCapacity} from '@src/models/technologies';
import {EmptyLine, HoverTD, Table, Title} from '@src/ui/common';
import {Resource} from '@src/ui/components/resource';
import {sum, thousands} from '@src/ui/utils';

interface MessagesProps {
  account: Account;
}

const deleteMessageAsyncTimeout = 200;
async function deleteMessageAsync(
  account: Account,
  message: Message,
  withTimeout: boolean
): Promise<void> {
  return new Promise(resolve => {
    deleteMessage(message.messageId);
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete account.messages[message.messageId];
    setTimeout(resolve, withTimeout ? deleteMessageAsyncTimeout : 0);
  });
}

export const Messages: FC<MessagesProps> = ({account}) => {
  const [sort, refreshComponent] = useState<MessageSort>(account.messageSort);
  account.messageSort = sort;

  const messages: Message[] = [];
  const duplicatesByCoords: Map<PlanetCoords, Message[]> = new Map();

  for (const messageId in account.messages) {
    if (account.messages.hasOwnProperty(messageId)) {
      const message = account.messages[messageId];
      messages.push(message);
      const dups = duplicatesByCoords.get(message.planetCoords) ?? [];
      dups.push(message);
      duplicatesByCoords.set(message.planetCoords, dups);
    }
  }

  messages.sort((a, b) => {
    switch (sort) {
      case 'metal':
        return b.resources.metal - a.resources.metal;
      case 'crystal':
        return b.resources.crystal - a.resources.crystal;
      case 'deuterium':
        return b.resources.deuterium - a.resources.deuterium;
      case 'sum':
        return b.resources.sum - a.resources.sum;
      default:
        return -1;
    }
  });

  const duplicatesList: Set<string> = new Set();
  duplicatesByCoords.forEach(messageList => {
    if (messageList.length < 2) {
      return;
    }
    let oldest: Message | undefined;
    for (const message of messageList) {
      if (oldest === undefined || message.timeSeconds < oldest.timeSeconds) {
        oldest = message;
      }
    }
    if (oldest !== undefined) {
      duplicatesList.add(oldest.messageId);
    }
  });

  const attackingFleets: Set<PlanetCoords> = new Set();
  for (const fleetId in account.fleets) {
    if (account.fleets.hasOwnProperty(fleetId)) {
      const fleet = account.fleets[fleetId];
      if (fleet.missionType === MissionTypeEnum.Attacking && !fleet.returnFlight) {
        attackingFleets.add(fleet.destinationCoords);
      } else if (fleet.missionType === MissionTypeEnum.Attacking && fleet.returnFlight) {
        attackingFleets.add(fleet.originCoords);
      }
    }
  }

  const lootMargin = 20000;
  const sumLimit = 100000;
  const cristalLimit = 50000;
  const deuteriumLimit = 20000;

  return (
    <Fragment>
      <Container>
        <Table>
          <thead>
            <tr>
              <th colSpan={5}>
                <Title onClick={() => goToMessages()} style={{cursor: 'pointer'}}>
                  Rapports ({messages.length})
                </Title>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <HoverTD
                onClick={async () => {
                  for (const message of messages) {
                    const isDuplicate = duplicatesList.has(message.messageId);
                    if (message.resources.sum < sumLimit || !message.noUnits || isDuplicate) {
                      await deleteMessageAsync(account, message, true);
                      refreshComponent(sort);
                    }
                  }
                }}
              >
                Σ {thousands(sumLimit)}
              </HoverTD>
              <HoverTD
                onClick={async () => {
                  for (const message of messages) {
                    const isDuplicate = duplicatesList.has(message.messageId);
                    if (
                      message.resources.crystal < cristalLimit ||
                      !message.noUnits ||
                      isDuplicate
                    ) {
                      await deleteMessageAsync(account, message, true);
                      refreshComponent(sort);
                    }
                  }
                }}
              >
                C {thousands(cristalLimit)}
              </HoverTD>
              <HoverTD
                onClick={async () => {
                  for (const message of messages) {
                    const isDuplicate = duplicatesList.has(message.messageId);
                    if (
                      message.resources.crystal < deuteriumLimit ||
                      !message.noUnits ||
                      isDuplicate
                    ) {
                      await deleteMessageAsync(account, message, true);
                      refreshComponent(sort);
                    }
                  }
                }}
              >
                D {thousands(deuteriumLimit)}
              </HoverTD>
            </tr>
            <tr>
              <EmptyLine></EmptyLine>
            </tr>
          </tbody>
        </Table>
        <Table>
          <tbody>
            {messages.map(message => {
              const isDuplicate = duplicatesList.has(message.messageId);
              return (
                <Line
                  key={message.messageId}
                  className={!message.noUnits || isDuplicate ? 'red' : ''}
                >
                  <td onClick={() => refreshComponent('metal')}>
                    <Resource name="M" amount={message.resources.metal} />
                  </td>
                  <td onClick={() => refreshComponent('crystal')}>
                    <Resource name="C" amount={message.resources.crystal} />
                  </td>
                  <td onClick={() => refreshComponent('deuterium')}>
                    <Resource name="D" amount={message.resources.deuterium} />
                  </td>
                  <td onClick={() => refreshComponent('sum')}>
                    <Resource name="Σ" amount={message.resources.sum} />
                  </td>
                  <td>{!message.noUnits ? 'KO' : isDuplicate ? 'DUP' : 'OK'}</td>
                  <td>
                    <Hover onClick={() => sendProbes(message.planetCoords)}>Esp</Hover>{' '}
                    <Hover
                      onClick={async () => {
                        await deleteMessageAsync(account, message, false);
                        refreshComponent(sort);
                      }}
                    >
                      Del
                    </Hover>{' '}
                    <Hover
                      onClick={() => {
                        const fretGt = getFretCapacity(account.accountTechnologies, LargeCargo);
                        const url = sendLargeCargosUrl(
                          account.currentPlanetId,
                          message.planetCoords,
                          MissionTypeEnum.Attacking,
                          Math.ceil(sum([message.resources.sum, lootMargin]) / fretGt)
                        );
                        goToUrl(url);
                      }}
                      className={attackingFleets.has(message.planetCoords) ? 'orange' : ''}
                    >
                      Att
                    </Hover>
                  </td>
                </Line>
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

const Line = styled.tr`
  &.red {
    color: ${COLOR_RED};
  }
`;

const Hover = styled.span`
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
  &.orange {
    color: ${COLOR_ORANGE};
  }
`;
