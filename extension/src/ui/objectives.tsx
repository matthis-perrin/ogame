import React, {FC, Fragment} from 'react';
import styled from 'styled-components';

import {goToTechnology} from '@src/controllers/navigator';
import {Account, findPlanetName} from '@src/models/account';
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
                </td>
              </tr>
            </tbody>
          )}
        </Table>
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
