import React, {FC, Fragment} from 'react';
import styled from 'styled-components';

import {getShipCargoCapacity} from '@shared/lib/formula';
import {LargeCargo} from '@shared/models/ships';
import {HyperspaceTechnology} from '@shared/models/technology';

import {goToTechnology} from '@src/controllers/navigator';
import {Account, findPlanetName} from '@src/models/account';
import {COLLECTOR_BONUS_FRET} from '@src/models/constants';
import {techShortName} from '@src/models/technologies';
import {Table, Title} from '@src/ui/common';
import {Resource} from '@src/ui/components/resource';

interface ObjectivesProps {
  account: Account;
}

export const ObjectivesC: FC<ObjectivesProps> = ({account}) => {
  const now = Math.floor(new Date().getTime() / 1000);

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
              <tr>
                <td>
                  <Resource name="M" amount={account.objectives.neededResources.metal} />
                  <Resource name="C" amount={account.objectives.neededResources.crystal} />
                  <Resource name="D" amount={account.objectives.neededResources.deuterium} />
                  <Resource name="Σ" amount={account.objectives.neededResources.sum} />
                </td>
              </tr>
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
              {account.objectives.resourceTransfers.map(transfer => {
                const hyperLevel = account.accountTechnologies.hasOwnProperty(
                  HyperspaceTechnology.id
                )
                  ? account.accountTechnologies[HyperspaceTechnology.id].value
                  : 0;
                const fretGt = getShipCargoCapacity(LargeCargo, hyperLevel, COLLECTOR_BONUS_FRET);
                const requiredGt = Math.ceil(transfer.resources.sum / fretGt);
                return (
                  <tr key={`${transfer.from}_${transfer.to}`}>
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
                    <td>GT: {requiredGt}</td>
                  </tr>
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

const EmptyLine = styled.td`
  height: 10px;
`;

const HoverLine = styled.tr`
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
`;
