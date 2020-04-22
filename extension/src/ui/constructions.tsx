import React, {FC, Fragment} from 'react';
import styled from 'styled-components';

import {goToTechnology} from '@src/controllers/navigator';
import {Account, findPlanetName} from '@src/models/account';
import {COLOR_GREEN} from '@src/models/constants';
import {Construction, techShortName} from '@src/models/technologies';
import {Table, Title} from '@src/ui/common';
import {time} from '@src/ui/utils';

interface ConstructionsProps {
  account: Account;
}

export const Constructions: FC<ConstructionsProps> = ({account}) => {
  const constructions: Construction[] = [];
  for (const constructionId in account.constructions) {
    if (account.constructions.hasOwnProperty(constructionId)) {
      const construction = account.constructions[constructionId];
      constructions.push(construction);
    }
  }

  constructions.sort((a, b) => a.targetEndSeconds - b.targetEndSeconds);
  const now = Math.floor(new Date().getTime() / 1000);

  return (
    <Fragment>
      <Container>
        <Table>
          <thead>
            <tr>
              <th colSpan={3}>
                <Title>Constructions</Title>
              </th>
            </tr>
          </thead>
          <tbody>
            {constructions.map(construction => {
              const seconds = construction.targetEndSeconds - now;
              return (
                <Element
                  key={construction.constructionId}
                  onClick={() => goToTechnology(construction.techId, construction.planetId)}
                >
                  <td>{findPlanetName(account.planetList, construction.planetId)}</td>
                  <td>{techShortName(construction.techId)}</td>
                  <td>
                    {seconds > 0 ? (
                      time(seconds)
                    ) : (
                      <span style={{color: COLOR_GREEN}}>Terminé</span>
                    )}
                  </td>
                </Element>
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

const Element = styled.tr`
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
`;
