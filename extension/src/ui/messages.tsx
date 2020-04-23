import React, {FC, Fragment, useState} from 'react';
import styled from 'styled-components';

import {getShipCargoCapacity} from '@shared/lib/formula';
import {LargeCargo} from '@shared/models/ships';
import {HyperspaceTechnology} from '@shared/models/technology';

import {deleteMessage, sendProbes} from '@src/controllers/function';
import {goToMessages, sendLargeCargos} from '@src/controllers/navigator';
import {Account} from '@src/models/account';
import {COLLECTOR_BONUS_FRET, COLOR_ORANGE, COLOR_RED} from '@src/models/constants';
import {MissionTypeEnum} from '@src/models/fleets';
import {Message} from '@src/models/messages';
import {PlanetCoords} from '@src/models/planets';
import {Table, Title} from '@src/ui/common';
import {Resource} from '@src/ui/components/resource';
import {sum, time} from '@src/ui/utils';

interface MessagesProps {
  account: Account;
}

export const Messages: FC<MessagesProps> = ({account}) => {
  const [, refreshComponent] = useState();

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

  messages.sort((a, b) => b.resources.sum - a.resources.sum);
  const now = Math.floor(new Date().getTime() / 1000);

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

  const lootMargin = 10000;

  return (
    <Fragment>
      <Container>
        <Table>
          <thead>
            <tr>
              <th colSpan={5}>
                <Title onClick={() => goToMessages()} style={{cursor: 'pointer'}}>
                  Rapports
                </Title>
              </th>
            </tr>
          </thead>
          <tbody>
            {messages.map(message => {
              const isDuplicate = duplicatesList.has(message.messageId);
              return (
                <Line
                  key={message.messageId}
                  className={!message.noUnits || isDuplicate ? 'red' : ''}
                >
                  <td>{message.planetCoords}</td>
                  <td>
                    <Resource name="Σ" amount={message.resources.sum} />
                  </td>
                  <td>{time(now - message.timeSeconds)}</td>
                  <td>{!message.noUnits ? 'KO' : isDuplicate ? 'DUP' : 'OK'}</td>
                  <td>
                    <Hover onClick={() => sendProbes(message.planetCoords)}>Esp</Hover>{' '}
                    <Hover
                      onClick={() => {
                        deleteMessage(message.messageId);
                        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
                        delete account.messages[message.messageId];
                        refreshComponent({});
                      }}
                    >
                      Del
                    </Hover>{' '}
                    <Hover
                      onClick={() => {
                        const hyperLevel = account.accountTechnologies.hasOwnProperty(
                          HyperspaceTechnology.id
                        )
                          ? account.accountTechnologies[HyperspaceTechnology.id].value
                          : 0;
                        const fretGt = getShipCargoCapacity(
                          LargeCargo,
                          hyperLevel,
                          COLLECTOR_BONUS_FRET
                        );
                        sendLargeCargos(
                          message.planetCoords,
                          Math.ceil(sum([message.resources.sum, lootMargin]) / fretGt)
                        );
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
